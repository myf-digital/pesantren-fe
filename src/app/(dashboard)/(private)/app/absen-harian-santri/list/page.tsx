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
  fetchAbsenSantriPage,
  deleteAbsenSantri,
  postAbsenExport,
  fetchSantriKamarReady,
  fetchMatchingShiftAsrama,
  resetRedux
} from '../slice'

import { fetchLocationPage } from '../../location/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import { format } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface ShiftOption {
  id_shift: string
  nama_shift: string
}

interface KamarOption {
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
          href={`/app/absen-harian-santri/form?id=${row.id_absen}&view=true&mode=kolektif&tanggal=${row.tanggal}&id_lokasi_kamar=${row.id_lokasi_kamar}&id_shift_presensi=${row.id_shift_presensi}&nama_shift=${row.shiftPresensi?.nama_shift || ''}&nama_lokasi=${row.lokasiKamar?.nama_lokasi || ''}`}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/app/absen-harian-santri/form?id=${row.id_absen}&mode=kolektif&tanggal=${row.tanggal}&id_lokasi_kamar=${row.id_lokasi_kamar}&id_shift_presensi=${row.id_shift_presensi}&nama_shift=${row.shiftPresensi?.nama_shift || ''}&nama_lokasi=${row.lokasiKamar?.nama_lokasi || ''}`}
        >
          <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
          <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

      <DialogDelete
        id={row.santri?.fullname || 'Data Absen'}
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

const AbsenHarianSantriList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_harian_santri)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Opsi Data Dropdown Master
  const [listShift, setListShift] = useState<ShiftOption[]>([])
  const [listKamar, setListKamar] = useState<KamarOption[]>([])
  const [loadingShift, setLoadingShift] = useState(false)
  const [loadingKamar, setLoadingKamar] = useState(false)

  // State Filter Utama UI
  const [tanggal, setTanggal] = useState<Date | null>(new Date())
  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>({ id_shift: '', nama_shift: 'Semua' })
  const [selectedKamar, setSelectedKamar] = useState<KamarOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [status, setStatus] = useState('Semua')
  const [searchTyped, setSearchTyped] = useState('')

  // State Snapshot Filter Sah (Mencegah Auto Fetch)
  const [currentFilters, setCurrentFilters] = useState<any>(null)
  const [isFilterApplied, setIsFilterApplied] = useState(false)

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
        setLoadingShift(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const res = await dispatch(fetchMatchingShiftAsrama({ waktu_absen: waktuSekarang })).unwrap()

        if (res?.status && res?.data) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res])
        }
      } catch {
        setListShift([{ id_shift: '', nama_shift: 'Semua' }])
      } finally {
        setLoadingShift(false)
      }
    }
    getShiftMaster()
  }, [dispatch])

  // Ambil Master Data Lokasi Kamar via fetchLocationPage
  useEffect(() => {
    const getKamarMaster = async () => {
      try {
        setLoadingKamar(true)
        const res = await dispatch(fetchLocationPage({ page: 1, perPage: 1000, keyword: 'kamar' })).unwrap()

        const valuesData = res?.data?.values || res?.values || []
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...valuesData])
      } catch {
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingKamar(false)
      }
    }
    getKamarMaster()
  }, [dispatch])

  // Fungsi Fetch Data Utama Log Tabel
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      if (!filters) return
      dispatch(
        fetchAbsenSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          tanggal: filters.tanggal,
          id_shift_presensi: filters.idShift || undefined,
          id_lokasi_kamar: filters.idLokasi || undefined,
          status: filters.status !== 'Semua' ? filters.status : undefined,
          q: filters.searchTyped || undefined
        })
      )
    },
    [dispatch]
  )

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
      idShift: selectedShift?.id_shift || '',
      idLokasi: selectedKamar?.id_lokasi || '',
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
    setSelectedShift(listShift.find(s => s.id_shift === '') || null)
    setSelectedKamar(listKamar.find(k => k.id_lokasi === '') || null)
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
    if (!selectedShift || !selectedShift.id_shift || selectedShift.nama_shift === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Shift presensi harus dipilih secara spesifik')
      return false
    }
    if (!selectedKamar || !selectedKamar.id_lokasi || selectedKamar.nama_lokasi === 'Semua') {
      toast.warning('Silakan lengkapi data terlebih dahulu: Lokasi / Kamar harus dipilih secara spesifik')
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

    const idKmr = selectedKamar?.id_lokasi
    const idSft = selectedShift?.id_shift
    const tgl = format(tanggal!, 'yyyy-MM-dd')
    const namaKmr = selectedKamar?.nama_lokasi || ''
    const namaSft = selectedShift?.nama_shift || ''
    router.push(
      `/app/absen-harian-santri/form?mode=scan_qr&tanggal=${tgl}&id_lokasi_kamar=${idKmr}&id_shift_presensi=${idSft}&nama_shift=${namaSft}&nama_lokasi=${namaKmr}`
    )
  }

  // Handle Mulai Presensi -> Manual Form Popup Confirm
  const handleOpsiFormPresensi = async () => {
    setAnchorPresensi(null)
    if (!validatePresensiInput()) return

    const idKmr = selectedKamar?.id_lokasi as string
    const waktuSekarang = format(new Date(), 'HH:mm')

    await dispatch(fetchMatchingShiftAsrama({ waktu_absen: waktuSekarang }))
    await dispatch(fetchSantriKamarReady({ id_lokasi_kamar: idKmr }))

    setOpenModalKonfirmasi(true)
  }

  const handleLanjutkanPresensi = () => {
    setOpenModalKonfirmasi(false)
    const idKmr = selectedKamar?.id_lokasi
    const activeShift = store.currentShift?.id_shift || selectedShift?.id_shift
    router.push(
      `/app/absen-harian-santri/form?mode=kolektif&tanggal=${tanggal ? format(tanggal, 'yyyy-MM-dd') : ''}&id_lokasi_kamar=${idKmr}&id_shift_presensi=${activeShift}&nama_shift=${selectedShift?.nama_shift}&nama_lokasi=${selectedKamar?.nama_lokasi}`
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
        postAbsenExport({
          tanggal: currentFilters.tanggal,
          id_shift_presensi: currentFilters.idShift || undefined,
          id_lokasi_kamar: currentFilters.idLokasi || undefined,
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
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteAbsenSantri(id))} />
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
        tableColumn('KAMAR', 'lokasiKamar.nama_lokasi'),
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
                options={listShift}
                loading={loadingShift}
                value={selectedShift}
                onChange={(_, newValue) => setSelectedShift(newValue)}
                getOptionLabel={option => option.nama_shift || ''}
                isOptionEqualToValue={(option, value) => option.id_shift === value?.id_shift}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Shift'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingShift ? <CircularProgress color='inherit' size={20} /> : null}
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
                options={listKamar}
                loading={loadingKamar}
                value={selectedKamar}
                onChange={(_, newValue) => setSelectedKamar(newValue)}
                getOptionLabel={option => option.nama_lokasi || ''}
                isOptionEqualToValue={(option, value) => option.id_lokasi === value?.id_lokasi}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lokasi / Kamar'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingKamar ? <CircularProgress color='inherit' size={20} /> : null}
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
                href='/app/absen-harian-santri/import'
              >
                Import CSV
              </Button>
            )}
          </Toolbar>
        </Card>

        {/* LOG DATA UTAMA RENDERING */}
        <Card>
          <CardHeader title='Log Presensi Harian Santri' />

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
                Silakan tentukan filter di atas kemudian klik tombol <b>Cari</b> untuk memuat data log presensi santri.
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
              Shift
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {store.currentShift?.nama_shift || selectedShift?.nama_shift || ''} (otomatis)
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Lokasi
            </Typography>
            <Typography variant='body2'>:</Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {selectedKamar?.nama_lokasi || '-'} (otomatis)
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(79, 129, 189, 0.08)', p: 3, borderRadius: 1, borderLeft: '4px solid #4F81BD' }}>
            <Typography variant='body2' color='primary.main' sx={{ fontWeight: 600 }}>
              Santri terdeteksi: <span style={{ fontWeight: 800 }}>{store.santriKamar?.length || 0} orang</span>
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

export default AbsenHarianSantriList
