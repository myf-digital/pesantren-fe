'use client'

import React, { useCallback, useEffect, useState, forwardRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Card,
  CardHeader,
  TextField,
  Toolbar,
  Button,
  Typography,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchAbsenKelasSantriPage,
  deleteAbsenKelasSantri,
  postAbsenKelasExport,
  resetRedux,
  fetchMatchingJamPelajaran,
  fetchKelasSantri,
  fetchKelasList
} from '../slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import { format } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface JamPelOption {
  id_jampel: string
  nama_jampel: string
}

interface KelasOption {
  id_kelas: string
  nama_kelas: string
}

// Komponen Aksi Baris Tabel
const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const rowDateStr = row.tanggal ? format(new Date(row.tanggal), 'yyyy-MM-dd') : ''
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isRowToday = rowDateStr === todayStr

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/app/absen-kelas-santri/form?id=${row.id_absen}&view=true&mode=kolektif&tanggal=${row.tanggal}&id_kelas=${row.id_lokasi}&id_jam_pelajaran=${row.id_jam_pelajaran}&nama_jampel=${row.jamPelajaran?.nama_jampel || ''}&nama_kelas=${row.lokasi || ''}`}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {isRowToday && (
          <MenuItem
            component={Link}
            href={`/app/absen-kelas-santri/form?id=${row.id_absen}&mode=kolektif&tanggal=${row.tanggal}&id_kelas=${row.id_lokasi}&id_jam_pelajaran=${row.id_jam_pelajaran}&nama_jampel=${row.jamPelajaran?.nama_jampel || ''}&nama_kelas=${row.lokasi || ''}`}
          >
            <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
          </MenuItem>
        )}
        {isRowToday && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
            <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        id={row.santri?.fullname || 'Data AbsenKelas'}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_absen)
          setOpenConfirm(false)
        }}
        handleClose={() => setOpenConfirm(false)}
      />
    </>
  )

  if (isMobile) {
    return <Box sx={{ display: 'inline-block' }}>{content}</Box>
  }

  return (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      {content}
    </TableCell>
  )
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} label='Tanggal' />
})

const AbsenKelasHarianSantriList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_kelas_santri)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Opsi Data Dropdown Master
  const [listJampel, setListJamPel] = useState<JamPelOption[]>([])
  const [listLokasi, setListLokasi] = useState<KelasOption[]>([])
  const [loadingJampel, setLoadingJampel] = useState(false)
  const [loadingLokasi, setLoadingLokasi] = useState(false)

  // State Filter Utama UI
  const [tanggal, setTanggal] = useState<Date | null>(new Date())
  const [selectedJampel, setSelectedJampel] = useState<JamPelOption | null>({ id_jampel: '', nama_jampel: 'Semua' })
  const [selectedLokasi, setSelectedLokasi] = useState<KelasOption | null>({ id_kelas: '', nama_kelas: 'Semua' })
  const [status, setStatus] = useState('Semua')
  const [searchTyped, setSearchTyped] = useState('')

  // State Snapshot Filter Sah (Mencegah Auto Fetch)
  const [currentFilters, setCurrentFilters] = useState<any>(null)
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [isInitialLoaded, setIsInitialLoaded] = useState(false)

  // State Pagination & Loading Utama
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // State Modals Control
  const [anchorPresensi, setAnchorPresensi] = useState<null | HTMLElement>(null)
  const [openModalKonfirmasi, setOpenModalKonfirmasi] = useState(false)

  // Ambil Master Data Kelas & Jam Pelajaran Awal
  useEffect(() => {
    const initMaster = async () => {
      try {
        setLoadingLokasi(true)
        setLoadingJampel(true)

        const waktuSekarang = format(new Date(), 'HH:mm')
        const tglStr = tanggal ? format(tanggal, 'yyyy-MM-dd') : undefined

        const [resKelas, resJam] = await Promise.all([
          dispatch(fetchKelasList({})).unwrap(),
          dispatch(fetchMatchingJamPelajaran({ waktu_absen: waktuSekarang, tanggal: tglStr })).unwrap()
        ])

        const valuesKelas = resKelas?.data || resKelas || []
        const formattedKelas = Array.isArray(valuesKelas)
          ? valuesKelas.map((c: any) => ({
              id_kelas: c.id_kelas,
              nama_kelas: c.nama_kelas
            }))
          : []
        const uniqueLokasi = formattedKelas.filter((item: KelasOption, index: number, self: KelasOption[]) =>
          item && item.id_kelas ? index === self.findIndex(t => t.id_kelas === item.id_kelas) : true
        )
        setListLokasi([{ id_kelas: '', nama_kelas: 'Semua' }, ...uniqueLokasi])

        const rawJam = resJam?.data || (Array.isArray(resJam) ? resJam : [])
        if (Array.isArray(rawJam)) {
          const uniqueJam = rawJam.filter((item: JamPelOption, index: number, self: JamPelOption[]) =>
            item && item.id_jampel ? index === self.findIndex(t => t.id_jampel === item.id_jampel) : true
          )
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...uniqueJam])
          if (resJam?.message?.includes('jam pelajaran yang cocok') && uniqueJam.length > 0) {
            setSelectedJampel(uniqueJam[0] || null)
          }
        } else {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
        }
      } catch {
        setListLokasi([{ id_kelas: '', nama_kelas: 'Semua' }])
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
      } finally {
        setLoadingLokasi(false)
        setLoadingJampel(false)
      }
    }
    initMaster()
  }, [dispatch])

  // Handler Perubahan Kelas -> Update List Jam Pelajaran
  const handleLokasiChange = async (newLokasi: KelasOption | null) => {
    setSelectedLokasi(newLokasi)
    try {
      setLoadingJampel(true)
      const params: any = {}
      if (newLokasi?.id_kelas) {
        params.id_kelas = newLokasi.id_kelas
      }
      if (tanggal) {
        params.tanggal = format(tanggal, 'yyyy-MM-dd')
      } else {
        params.waktu_absen = format(new Date(), 'HH:mm')
      }

      const res = await dispatch(fetchMatchingJamPelajaran(params)).unwrap()
      const rawData = res?.data || (Array.isArray(res) ? res : [])
      if (Array.isArray(rawData)) {
        const uniqueData = rawData.filter((item: JamPelOption, index: number, self: JamPelOption[]) =>
          item && item.id_jampel ? index === self.findIndex(t => t.id_jampel === item.id_jampel) : true
        )
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...uniqueData])

        // Reset atau pertahankan selectedJampel jika cocok
        setSelectedJampel(prev => {
          if (!prev || !prev.id_jampel) return { id_jampel: '', nama_jampel: 'Semua' }
          const exists = uniqueData.find((item: JamPelOption) => item.id_jampel === prev.id_jampel)
          return exists || { id_jampel: '', nama_jampel: 'Semua' }
        })
      } else {
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
        setSelectedJampel({ id_jampel: '', nama_jampel: 'Semua' })
      }
    } catch {
      setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
      setSelectedJampel({ id_jampel: '', nama_jampel: 'Semua' })
    } finally {
      setLoadingJampel(false)
    }
  }

  // Handler Perubahan Jam Pelajaran -> Auto Pilih Kelas & Filter List Kelas
  const handleJampelChange = async (newJampel: JamPelOption | null) => {
    setSelectedJampel(newJampel)
    try {
      setLoadingLokasi(true)
      const params: any = {}
      if (newJampel?.id_jampel) {
        params.id_jam_pelajaran = newJampel.id_jampel
      }
      if (tanggal) {
        params.tanggal = format(tanggal, 'yyyy-MM-dd')
      }

      const res = await dispatch(fetchKelasList(params)).unwrap()
      const valuesData = res?.data || res || []
      const formatted = Array.isArray(valuesData)
        ? valuesData.map((c: any) => ({
            id_kelas: c.id_kelas,
            nama_kelas: c.nama_kelas
          }))
        : []
      const uniqueLokasi = formatted.filter((item: KelasOption, index: number, self: KelasOption[]) =>
        item && item.id_kelas ? index === self.findIndex(t => t.id_kelas === item.id_kelas) : true
      )
      setListLokasi([{ id_kelas: '', nama_kelas: 'Semua' }, ...uniqueLokasi])

      // Auto terpilih kelas dari jam pelajaran jika kelas dipilih
      if (newJampel?.id_jampel && uniqueLokasi.length > 0) {
        setSelectedLokasi(prev => {
          if (prev && prev.id_kelas && uniqueLokasi.some((k: KelasOption) => k.id_kelas === prev.id_kelas)) {
            return prev
          }
          return uniqueLokasi[0]
        })
      }
    } catch {
      // ignore
    } finally {
      setLoadingLokasi(false)
    }
  }

  const handleTanggalChange = (date: Date | null) => {
    setTanggal(date)
    if (selectedLokasi?.id_kelas) {
      handleLokasiChange(selectedLokasi)
    } else if (selectedJampel?.id_jampel) {
      handleJampelChange(selectedJampel)
    }
  }

  // Fungsi Fetch Data Utama Log Tabel
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      if (!filters) return
      dispatch(
        fetchAbsenKelasSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          tanggal: filters.tanggal,
          id_jam_pelajaran: filters.id_jam_pelajaran || undefined,
          id_kelas: filters.id_kelas || undefined,
          status: filters.status !== 'Semua' ? filters.status : undefined,
          q: filters.searchTyped || undefined
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (!loadingJampel && !loadingLokasi && listLokasi.length > 0 && !isInitialLoaded) {
      setIsInitialLoaded(true)
      const filters = {
        tanggal: formatTanggal(tanggal),
        id_jam_pelajaran: selectedJampel?.id_jampel || '',
        id_kelas: selectedLokasi?.id_kelas || '',
        status,
        searchTyped
      }
      setIsFilterApplied(true)
      setCurrentFilters(filters)
      executeFetchData(1, perPage, filters)
    }
  }, [
    loadingJampel,
    loadingLokasi,
    listJampel,
    listLokasi,
    isInitialLoaded,
    selectedJampel,
    selectedLokasi,
    tanggal,
    status,
    searchTyped,
    perPage,
    executeFetchData
  ])

  // Efek pagination halaman
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters)
    }
  }, [page, perPage, isFilterApplied, currentFilters, executeFetchData])

  // Efek refresh setelah delete data
  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Data absensi santri berhasil dihapus')
      if (isFilterApplied && currentFilters) executeFetchData(page, perPage, currentFilters)
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, page, perPage, isFilterApplied, currentFilters, executeFetchData])

  // Handler Kirim Filter Utama via Tombol Cari / Enter
  const handleSearchSubmit = () => {
    const filters = {
      tanggal: formatTanggal(tanggal),
      id_jam_pelajaran: selectedJampel?.id_jampel || '',
      id_kelas: selectedLokasi?.id_kelas || '',
      status,
      searchTyped
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  // Handler Reset Filter
  const handleResetFilter = async () => {
    setTanggal(new Date())
    setSelectedJampel({ id_jampel: '', nama_jampel: 'Semua' })
    setSelectedLokasi({ id_kelas: '', nama_kelas: 'Semua' })
    setStatus('Semua')
    setSearchTyped('')
    setPage(1)
    setIsFilterApplied(false)
    setCurrentFilters(null)

    try {
      setLoadingLokasi(true)
      setLoadingJampel(true)
      const [resKelas, resJam] = await Promise.all([
        dispatch(fetchKelasList({})).unwrap(),
        dispatch(fetchMatchingJamPelajaran({ waktu_absen: format(new Date(), 'HH:mm') })).unwrap()
      ])

      const valuesKelas = resKelas?.data || resKelas || []
      const formattedKelas = Array.isArray(valuesKelas)
        ? valuesKelas.map((c: any) => ({ id_kelas: c.id_kelas, nama_kelas: c.nama_kelas }))
        : []
      const uniqueKelas = formattedKelas.filter((item: KelasOption, index: number, self: KelasOption[]) =>
        item && item.id_kelas ? index === self.findIndex(t => t.id_kelas === item.id_kelas) : true
      )
      setListLokasi([{ id_kelas: '', nama_kelas: 'Semua' }, ...uniqueKelas])

      const rawJam = resJam?.data || (Array.isArray(resJam) ? resJam : [])
      if (Array.isArray(rawJam)) {
        const uniqueJam = rawJam.filter((item: JamPelOption, index: number, self: JamPelOption[]) =>
          item && item.id_jampel ? index === self.findIndex(t => t.id_jampel === item.id_jampel) : true
        )
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...uniqueJam])
      }
    } catch {
      // ignore
    } finally {
      setLoadingLokasi(false)
      setLoadingJampel(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  // ==========================================
  // LOGIK VALIDASI KETAT MULAI PRESENSI
  // ==========================================
  const validatePresensiInput = (): boolean => {
    if (!tanggal) {
      toast.warning('Silakan lengkapi data terlebih dahulu: Tanggal belum diisi')
      return false
    }
    if (!selectedLokasi || !selectedLokasi.id_kelas || selectedLokasi.nama_kelas === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Kelas harus dipilih secara spesifik')
      return false
    }
    if (!selectedJampel || !selectedJampel.id_jampel || selectedJampel.nama_jampel === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Jam Pelajaran harus dipilih secara spesifik')
      return false
    }
    return true
  }

  // Klik Utama Tombol Mulai Presensi
  const handleMulaiPresensiClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (validatePresensiInput()) {
      setAnchorPresensi(e.currentTarget)
    }
  }

  // Handle Mulai Presensi -> QR Scan Route
  const handleOpsiScanQR = () => {
    setAnchorPresensi(null)
    if (!validatePresensiInput()) return

    const idLokasi = selectedLokasi?.id_kelas
    const idJamPelajaran = selectedJampel?.id_jampel
    const tgl = format(tanggal!, 'yyyy-MM-dd')
    const namaLokasi = selectedLokasi?.nama_kelas || ''
    const namaJampel = selectedJampel?.nama_jampel || ''
    router.push(
      `/app/absen-kelas-santri/form?mode=scan_qr&tanggal=${tgl}&id_kelas=${idLokasi}&id_jam_pelajaran=${idJamPelajaran}&nama_jampel=${namaJampel}&nama_kelas=${namaLokasi}`
    )
  }

  // Handle Mulai Presensi -> Manual Form Popup Confirm
  const handleOpsiFormPresensi = async () => {
    setAnchorPresensi(null)
    if (!validatePresensiInput()) return

    await dispatch(fetchKelasSantri({ id_kelas: selectedLokasi?.id_kelas || '' }))

    setOpenModalKonfirmasi(true)
  }

  const handleLanjutkanPresensi = () => {
    setOpenModalKonfirmasi(false)
    const idLokasi = selectedLokasi?.id_kelas
    const idJamPelajaran = selectedJampel?.id_jampel
    router.push(
      `/app/absen-kelas-santri/form?mode=kolektif&tanggal=${tanggal ? format(tanggal, 'yyyy-MM-dd') : ''}&id_kelas=${idLokasi}&id_jam_pelajaran=${idJamPelajaran}&nama_jampel=${selectedJampel?.nama_jampel}&nama_kelas=${selectedLokasi?.nama_kelas}`
    )
  }

  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data terlebih dahulu sebelum export')
      return
    }
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postAbsenKelasExport({
          tanggal: currentFilters.tanggal,
          id_jam_pelajaran: currentFilters.id_jam_pelajaran || undefined,
          id_kelas: currentFilters.id_kelas || undefined,
          status: currentFilters.status !== 'Semua' ? currentFilters.status : undefined,
          q: currentFilters.searchTyped || undefined
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.click()
      }
    } catch {
      toast.error('Gagal export data excel')
    } finally {
      setLoadingExport(false)
    }
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteAbsenKelasSantri(id))} />
  }

  const formatTanggal = (tanggal: Date | null, formatStr: string = 'yyyy-MM-dd') => {
    return tanggal ? format(new Date(tanggal), formatStr) : ''
  }

  const buildTable = () => {
    const { dataPage } = store
    const tableValues = isFilterApplied ? dataPage?.values || [] : []
    const tableCount = isFilterApplied ? dataPage?.total || 0 : 0

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('NAMA SANTRI', 'santri.fullname'),
        tableColumn('NIS', 'santri.nis'),
        tableColumn('PETUGAS', 'petugas'),
        tableColumn('KELAS', 'lokasi'),
        tableColumn('JAM PELAJARAN', 'jamPelajaran.nama_jampel'),
        tableColumn('WAKTU', 'waktu_absen'),
        tableColumn('STATUS', 'status_display')
      ],
      values: tableValues.map((row: any) => ({
        ...row,
        lokasi: row?.lokasi?.nama_kelas || row?.kelasFormal?.nama_kelas || row?.kelasMda?.nama_kelas_mda || '-',
        petugas: row.petugas?.nama_lengkap || row.resource?.full_name || '-',
        status_display: (
          <Chip
            label={row.status_kehadiran}
            size='small'
            color={
              row.status_kehadiran === 'Hadir'
                ? 'success'
                : row.status_kehadiran === 'Izin'
                  ? 'info'
                  : row.status_kehadiran === 'Sakit'
                    ? 'warning'
                    : 'error'
            }
            variant='tonal'
          />
        )
      })),
      count: tableCount,
      perPage: perPage,
      changePage: (_: any, n: number) => setPage(n + 1),
      changePerPage: (e: any) => {
        setPerPage(parseInt(e.target.value, 10))
        setPage(1)
      }
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
          {/* PANEL FILTER DENGAN SELECTABLE SEARCH AUTOCOMPLETE */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <AppReactDatepicker
                selected={tanggal}
                onChange={handleTanggalChange}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent />}
              />
            </Grid>

            {/* SELECTABLE SEARCH: KELAS */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Autocomplete
                size='small'
                options={listLokasi}
                loading={loadingLokasi}
                value={selectedLokasi}
                onChange={(_, newValue) => handleLokasiChange(newValue)}
                getOptionLabel={option => option.nama_kelas || ''}
                getOptionKey={option => option.id_kelas || option.nama_kelas || 'kelas-semua'}
                isOptionEqualToValue={(option, value) => option.id_kelas === value?.id_kelas}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Kelas'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingLokasi ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* SELECTABLE SEARCH: JAM PELAJARAN */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Autocomplete
                size='small'
                options={listJampel}
                loading={loadingJampel}
                value={selectedJampel}
                onChange={(_, newValue) => handleJampelChange(newValue)}
                getOptionLabel={option => option.nama_jampel || ''}
                getOptionKey={option => option.id_jampel || option.nama_jampel || 'jampel-semua'}
                isOptionEqualToValue={(option, value) => option.id_jampel === value?.id_jampel}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Jam Pelajaran'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingJampel ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2.4 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select label='Status' value={status} onChange={e => setStatus(e.target.value)}>
                  <MenuItem value='Semua'>Semua</MenuItem>
                  <MenuItem value='Hadir'>Hadir</MenuItem>
                  <MenuItem value='Izin'>Izin</MenuItem>
                  <MenuItem value='Sakit'>Sakit</MenuItem>
                  <MenuItem value='Alfa'>Alfa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2.4 }}>
              <TextField
                fullWidth
                label='Cari Nama / NIS'
                size='small'
                placeholder='Ketik nama / NIS...'
                value={searchTyped}
                onChange={e => setSearchTyped(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </Grid>
          </Grid>

          {/* BARIS UTILITY BUTTONS */}
          <Toolbar sx={{ px: '0px !important', gap: 2, flexWrap: 'wrap', minHeight: 'auto' }}>
            <Button
              variant='contained'
              color='info'
              startIcon={<i className='tabler-search' />}
              onClick={handleSearchSubmit}
            >
              Cari
            </Button>

            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='tabler-refresh' />}
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>

            {canCreate && (
              <>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='tabler-plus' />}
                  onClick={handleMulaiPresensiClick}
                >
                  Mulai Presensi
                </Button>
                <Menu anchorEl={anchorPresensi} open={Boolean(anchorPresensi)} onClose={() => setAnchorPresensi(null)}>
                  <MenuItem onClick={handleOpsiScanQR}>
                    <i className='tabler-qrcode' style={{ marginRight: 8 }} /> Scan QR Kartu Santri
                  </MenuItem>
                  <MenuItem onClick={handleOpsiFormPresensi}>
                    <i className='tabler-forms' style={{ marginRight: 8 }} /> Form Presensi
                  </MenuItem>
                </Menu>
              </>
            )}

            {canExport && (
              <Button
                color='success'
                variant='contained'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
              >
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}

            {canImport && (
              <Button
                color='secondary'
                variant='contained'
                startIcon={<i className='tabler-file-import' />}
                component={Link}
                href='/app/absen-kelas-santri/import'
              >
                Import Excel
              </Button>
            )}
          </Toolbar>
        </Card>

        {/* LOG DATA UTAMA RENDERING */}
        <Card>
          <CardHeader title='Log Presensi Kelas Santri' />

          {!isFilterApplied ? (
            <Box sx={{ p: 10, textAlign: 'center', color: 'text.secondary' }}>
              <i
                className='tabler-filter-off'
                style={{ fontSize: '48px', marginBottom: '16px', display: 'block', color: '#9e9e9e' }}
              />
              <Typography variant='h6' sx={{ fontWeight: 500, mb: 1 }}>
                Belum Ada Data Ditampilkan
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Silakan tentukan filter di atas kemudian klik tombol <b>Cari</b> untuk memuat data log presensi kelas
                santri.
              </Typography>
            </Box>
          ) : (
            <TableView changeSort={() => {}} model={buildTable()} />
          )}
        </Card>
      </Grid>

      {/* POPUP MODAL KONFIRMASI OTOMATIS */}
      <Dialog open={openModalKonfirmasi} onClose={() => setOpenModalKonfirmasi(false)} maxWidth='xs' fullWidth>
        <DialogTitle
          component='div'
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Konfirmasi Presensi Hari Ini
          </Typography>
          <IconButton onClick={() => setOpenModalKonfirmasi(false)} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 4 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Presensi Harian Santri
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr', gap: 1.5, mb: 4 }}>
            <Typography variant='body2' color='text.secondary'>
              Tanggal
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {formatTanggal(tanggal, 'dd/MM/yyyy')} (otomatis)
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Waktu
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {format(new Date(), 'HH:mm')} (otomatis)
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Kelas
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {selectedLokasi?.nama_kelas || '-'} (otomatis)
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Jam Pelajaran
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {store.jamPel?.nama_jampel || selectedJampel?.nama_jampel || ''} (otomatis)
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(79, 129, 189, 0.08)', p: 3, borderRadius: 1, borderLeft: '4px solid #4F81BD' }}>
            <Typography variant='body2' color='primary.main' sx={{ fontWeight: 600 }}>
              Santri terdeteksi: <span style={{ fontWeight: 800 }}>{store.santriList?.length || 0} orang</span>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenModalKonfirmasi(false)} variant='outlined' color='secondary'>
            Batal
          </Button>
          <Button onClick={handleLanjutkanPresensi} variant='contained' color='primary'>
            Lanjutkan Presensi
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AbsenKelasHarianSantriList
