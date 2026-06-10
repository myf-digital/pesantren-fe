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
  fetchSantriCabangReady
} from '../slice'

import { fetchLocationPage } from '../../location/slice'

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

interface LokasiOption {
  id_lokasi: string
  nama_lokasi: string
}

// Komponen Aksi Baris Tabel
const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/app/absen-kelas-santri/form?id=${row.id_absen}&view=true&mode=kolektif&tanggal=${row.tanggal}&id_lokasi=${row.id_lokasi}&id_jam_pelajaran=${row.id_jam_pelajaran}&nama_jampel=${row.jamPelajaran?.nama_jampel || ''}&nama_lokasi=${row.lokasi?.nama_lokasi || ''}`}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/app/absen-kelas-santri/form?id=${row.id_absen}&mode=kolektif&tanggal=${row.tanggal}&id_lokasi=${row.id_lokasi}&id_jam_pelajaran=${row.id_jam_pelajaran}&nama_jampel=${row.jamPelajaran?.nama_jampel || ''}&nama_lokasi=${row.lokasi?.nama_lokasi || ''}`}
        >
          <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
          <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
        </MenuItem>
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
  const [listLokasi, setListLokasi] = useState<LokasiOption[]>([])
  const [loadingJampel, setLoadingJampel] = useState(false)
  const [loadingLokasi, setLoadingLokasi] = useState(false)

  // State Filter Utama UI
  const [tanggal, setTanggal] = useState<Date | null>(new Date())
  const [selectedJampel, setSelectedJampel] = useState<JamPelOption | null>({ id_jampel: '', nama_jampel: 'Semua' })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
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

  // Ambil Master Data Shift via fetchMatchingShiftAsrama
  useEffect(() => {
    const getShiftMaster = async () => {
      try {
        setLoadingJampel(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const res = await dispatch(fetchMatchingJamPelajaran({ waktu_absen: waktuSekarang })).unwrap()

        if (res?.status && res?.data) {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...res.data])
          if (res?.message.includes('jam pelajaran yang cocok')) {
            setSelectedJampel(res?.data[0] || null)
          }
        } else if (Array.isArray(res)) {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...res])
        }
      } catch {
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
      } finally {
        setLoadingJampel(false)
      }
    }
    getShiftMaster()
  }, [dispatch])

  // Ambil Master Data Lokasi Kamar via fetchLocationPage
  useEffect(() => {
    const getLokasiMaster = async () => {
      try {
        setLoadingLokasi(true)
        const res = await dispatch(fetchLocationPage({ page: 1, perPage: 50, keyword: 'kelas' })).unwrap()

        const valuesData = res?.data?.values || res?.values || []
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...valuesData])
      } catch {
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingLokasi(false)
      }
    }
    getLokasiMaster()
  }, [dispatch])

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
          id_lokasi: filters.id_lokasi || undefined,
          status: filters.status !== 'Semua' ? filters.status : undefined,
          q: filters.searchTyped || undefined
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (!loadingJampel && !loadingLokasi && listJampel.length > 0 && listLokasi.length > 0 && !isInitialLoaded) {
      setIsInitialLoaded(true)
      const filters = {
        tanggal: formatTanggal(tanggal),
        id_jam_pelajaran: selectedJampel?.id_jampel || '',
        id_lokasi: selectedLokasi?.id_lokasi || '',
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
      id_lokasi: selectedLokasi?.id_lokasi || '',
      status,
      searchTyped
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  // Handler Reset Filter
  const handleResetFilter = () => {
    setTanggal(new Date())
    setSelectedJampel(listJampel.find(s => s.id_jampel === '') || null)
    setSelectedLokasi(listLokasi.find(k => k.id_lokasi === '') || null)
    setStatus('Semua')
    setSearchTyped('')
    setPage(1)
    setIsFilterApplied(false)
    setCurrentFilters(null)
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
    if (!selectedJampel || !selectedJampel.id_jampel || selectedJampel.nama_jampel === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Jam Pelajaran harus dipilih secara spesifik')
      return false
    }
    if (!selectedLokasi || !selectedLokasi.id_lokasi || selectedLokasi.nama_lokasi === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Lokasi harus dipilih secara spesifik')
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

    const idLokasi = selectedLokasi?.id_lokasi
    const idJamPelajaran = selectedJampel?.id_jampel
    const tgl = format(tanggal!, 'yyyy-MM-dd')
    const namaLokasi = selectedLokasi?.nama_lokasi || ''
    const namaJampel = selectedJampel?.nama_jampel || ''
    router.push(
      `/app/absen-kelas-santri/form?mode=scan_qr&tanggal=${tgl}&id_lokasi=${idLokasi}&id_jam_pelajaran=${idJamPelajaran}&nama_jampel=${namaJampel}&nama_lokasi=${namaLokasi}`
    )
  }

  // Handle Mulai Presensi -> Manual Form Popup Confirm
  const handleOpsiFormPresensi = async () => {
    setAnchorPresensi(null)
    if (!validatePresensiInput()) return

    await dispatch(fetchSantriCabangReady({ id_lokasi: selectedLokasi?.id_lokasi || '' }))

    setOpenModalKonfirmasi(true)
  }

  const handleLanjutkanPresensi = () => {
    setOpenModalKonfirmasi(false)
    const idLokasi = selectedLokasi?.id_lokasi
    const idJamPelajaran = selectedJampel?.id_jampel
    router.push(
      `/app/absen-kelas-santri/form?mode=kolektif&tanggal=${tanggal ? format(tanggal, 'yyyy-MM-dd') : ''}&id_lokasi=${idLokasi}&id_jam_pelajaran=${idJamPelajaran}&nama_jampel=${selectedJampel?.nama_jampel}&nama_lokasi=${selectedLokasi?.nama_lokasi}`
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
          id_lokasi: currentFilters.id_lokasi || undefined,
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
        tableColumn('LOKASI', 'lokasi.nama_lokasi'),
        tableColumn('JAM PELAJARAN', 'jamPelajaran.nama_jampel'),
        tableColumn('WAKTU', 'waktu_absen'),
        tableColumn('STATUS', 'status_display')
      ],
      values: tableValues.map((row: any) => ({
        ...row,
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
        <Card sx={{ p: 5, mb: 4 }}>
          {/* PANEL FILTER DENGAN SELECTABLE SEARCH AUTOCOMPLETE */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <AppReactDatepicker
                selected={tanggal}
                onChange={(date: Date | null) => setTanggal(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent />}
              />
            </Grid>

            {/* SELECTABLE SEARCH: SHIFT PRESENSI */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Autocomplete
                size='small'
                options={listJampel}
                loading={loadingJampel}
                value={selectedJampel}
                onChange={(_, newValue) => setSelectedJampel(newValue)}
                getOptionLabel={option => option.nama_jampel || ''}
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

            {/* SELECTABLE SEARCH: LOKASI KAMAR */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Autocomplete
                size='small'
                options={listLokasi}
                loading={loadingLokasi}
                value={selectedLokasi}
                onChange={(_, newValue) => setSelectedLokasi(newValue)}
                getOptionLabel={option => option.nama_lokasi || ''}
                isOptionEqualToValue={(option, value) => option.id_lokasi === value?.id_lokasi}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lokasi'
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
                {loadingExport ? 'Proses...' : 'Export CSV'}
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
                Import CSV
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
              Jam Pelajaran
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {store.jamPel?.nama_jampel || selectedJampel?.nama_jampel || ''} (otomatis)
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Lokasi
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {selectedLokasi?.nama_lokasi || '-'} (otomatis)
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(79, 129, 189, 0.08)', p: 3, borderRadius: 1, borderLeft: '4px solid #4F81BD' }}>
            <Typography variant='body2' color='primary.main' sx={{ fontWeight: 600 }}>
              Santri terdeteksi: <span style={{ fontWeight: 800 }}>{store.santriCabang?.length || 0} orang</span>
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
