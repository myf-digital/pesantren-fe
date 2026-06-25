'use client'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'

import {
  Card,
  CardHeader,
  TextField,
  Toolbar,
  Button,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchLogGateSantriPage,
  postLogGateSantriExport,
  postScanQrGate,
  resetRedux
} from '../../perizinan-santri/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import { useCan } from '@/hooks/useCan'

import QRScanner from '@/views/onevour/components/qr-scanner'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const LogGateSantriList = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)
  const { dataPage, scanResult, loading, crud } = store

  // Hooks Otorisasi Aksi Konten Vuexy
  const canExport = useCan('export')

  // Deteksi Breakpoint Media Screen untuk layouting Responsif
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // State Utama Filter Log Gate (Berdasarkan Waktu Keluar / Masuk)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [tanggalLog, setTanggalLog] = useState<Date | null>(new Date())
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  // Snapshot filter ter-submit untuk sinkronisasi pagination & export data
  const [currentFilters, setCurrentFilters] = useState<any>({
    date: todayStr,
    status: 'Semua',
    keyword: ''
  })

  // State Pagination Tabel Utama Log Gate
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // State Modals Controller
  const [openModalScanQrCode, setOpenModalScanQrCode] = useState(false)
  const [openModalResult, setOpenModalResult] = useState(false)

  // Core API Caller Page Fetcher untuk Log Gate Santri
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      dispatch(
        fetchLogGateSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          date: filters.date || undefined,
          status: filters.status !== 'Semua' ? filters.status : undefined,
          keyword: filters.keyword || undefined
        })
      )
    },
    [dispatch]
  )

  // Fetching Data Initial Load & Setiap Perubahan Page / PerPage
  useEffect(() => {
    executeFetchData(page, perPage, currentFilters)
  }, [page, perPage, currentFilters, executeFetchData])

  // Monitor Notification Toast dari response CRUD / Scan Thunk slice Redux
  useEffect(() => {
    if (crud) {
      if (crud.status) {
        toast.success(crud.message || 'Operasi berhasil diproses.')
      } else {
        toast.error(crud.message || 'Terjadi kesalahan sistem.')
      }
      // Bersihkan flag message agar tidak mentrigger toast berulang
      dispatch(resetRedux())
    }
  }, [crud, dispatch])

  // Handler Kirim Form Pencarian Filter
  const handleSearchSubmit = () => {
    const filters = {
      date: tanggalLog ? format(tanggalLog, 'yyyy-MM-dd') : '',
      status: filterStatus,
      keyword: searchQuery
    }
    setPage(1)
    setCurrentFilters(filters)
  }

  // Handler Reset Form Pencarian
  const handleResetFilter = () => {
    setTanggalLog(new Date())
    setFilterStatus('Semua')
    setSearchQuery('')
    setPage(1)

    const baseFilters = {
      date: todayStr,
      status: 'Semua',
      keyword: ''
    }
    setCurrentFilters(baseFilters)
  }

  // Action Handler Pemindaian QR Code (Post API)
  const handleScanQrCode = async (token: string) => {
    if (!token) return

    // Tutup jendela camera view scanner agar resource camera mati sementara waktu
    setOpenModalScanQrCode(false)

    try {
      // Eksekusi API Scan Gate
      await dispatch(postScanQrGate({ nomor_kartu_santri: token })).unwrap()
      // Tampilkan popup resume status profil hasil scan keluar/masuk
      setOpenModalResult(true)
      // Refresh list data tabel & summary metrics ter-update hari ini
      executeFetchData(page, perPage, currentFilters)
    } catch (err: any) {
      // Jika token palsu / expired ditangkap rejected reducer, paksa buka modal result untuk render error state
      setOpenModalResult(true)
    }
  }

  // Handler Trigger Tombol Akses "Scan Berikutnya"
  const handleScanNext = () => {
    setOpenModalResult(false)
    dispatch(resetRedux())
    // Berikan delay timeout singkat agar siklus penutupan modal result selesai dengan smooth sebelum membuka camera
    setTimeout(() => {
      setOpenModalScanQrCode(true)
    }, 300)
  }

  // Core Excel Exporter Feature Client Log Gate
  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postLogGateSantriExport({
          date: currentFilters.date,
          status: currentFilters.status !== 'Semua' ? currentFilters.status : undefined,
          q: currentFilters.keyword || undefined
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.click()
        toast.success('Log riwayat gate keeper pondok berhasil diexport.')
      }
    } catch {
      toast.error('Gagal mengeksport berkas log gate.')
    } finally {
      setLoadingExport(false)
    }
  }

  /* ----------------------------------------------------
     Renderers Formatters Kolom TableView
  ---------------------------------------------------- */
  const renderWaktuFormat = (dateValue: string | null) => {
    if (!dateValue)
      return (
        <Typography variant='body2' color='text.disabled'>
          -
        </Typography>
      )
    return (
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {format(new Date(dateValue), 'dd MMM yyyy HH:mm:ss')}
      </Typography>
    )
  }

  const renderKondisi = (row: any) => {
    // Jika santri belum masuk kembali (waktu_masuk null), kondisi belum dihitung (-)
    if (!row.waktu_masuk || !row.kondisi) {
      return <Chip label='Di Luar Komplek' size='small' color='warning' variant='tonal' />
    }

    const label = row.kondisi
    const color = label === 'Overdue' ? 'error' : label === 'Closed' ? 'secondary' : 'success'

    return (
      <Chip
        label={label}
        size='small'
        color={color}
        variant='tonal'
        sx={{ fontWeight: 600, borderRadius: 'var(--mui-shape-borderRadius)' }}
      />
    )
  }

  // Fungsi Komparasi Pembuatan Struktur Bidang Kolom Tabel Utama
  const buildTable = () => {
    const tableValues = (dataPage?.values || []).map((item: any, index: number) => ({
      ...item,
      no: (page - 1) * perPage + index + 1
    }))
    const tableCount = dataPage?.total || 0

    return {
      page: page,
      fields: [
        tableColumn('NO', 'no', 'center'),
        tableColumn('NAMA SANTRI', 'perizinanSantri.santri.fullname'),
        tableColumn('JENIS IZIN', 'perizinanSantri.jenis_izin', 'center'),
        tableColumn('WAKTU KELUAR', 'waktu_keluar', 'left', ((row: any) => renderWaktuFormat(row.waktu_keluar)) as any),
        tableColumn('WAKTU MASUK', 'waktu_masuk', 'left', ((row: any) => renderWaktuFormat(row.waktu_masuk)) as any),
        tableColumn('KONDISI', 'kondisi', 'center', renderKondisi as any)
      ],
      values: tableValues,
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
      {/* 1. SEKSI SUB-HEADER WIDGET DASHBOARD SUMMARY DATA LOG */}
      <Grid size={12}>
        <Grid container spacing={4}>
          {/* Card Total Keluar */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, bgcolor: 'background.paper' }}
            >
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'primary.lightOpacity', display: 'flex' }}>
                <i className='tabler-logout text-primary' style={{ fontSize: '1.75rem' }} />
              </Box>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                  Total Keluar
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {dataPage?.summary?.totalKeluar || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Card Total Masuk */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, bgcolor: 'background.paper' }}
            >
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'success.lightOpacity', display: 'flex' }}>
                <i className='tabler-login text-success' style={{ fontSize: '1.75rem' }} />
              </Box>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                  Total Masuk
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {dataPage?.summary?.totalMasuk || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Card Total Overdue Keterlambatan */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, bgcolor: 'background.paper' }}
            >
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'error.lightOpacity', display: 'flex' }}>
                <i className='tabler-clock-alert text-error' style={{ fontSize: '1.75rem' }} />
              </Box>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                  Total Overdue
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 700 }} color='error.main'>
                  {dataPage?.summary?.overdue || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {/* 2. SEKSI FILTER PANEL BAR */}
      <Grid size={12}>
        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Filter Tanggal Sirkulasi Gerbang */}
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <AppReactDatepicker
                selected={tanggalLog}
                onChange={(date: Date | null) => setTanggalLog(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent label='Tanggal Log' />}
              />
            </Grid>

            {/* Filter Kategori Status Ketepatan Waktu */}
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Kondisi Ketepatan</InputLabel>
                <Select label='Kondisi Ketepatan' value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <MenuItem value='Semua'>Semua Kondisi</MenuItem>
                  <MenuItem value='Normal'>Normal</MenuItem>
                  <MenuItem value='Closed'>Closed</MenuItem>
                  <MenuItem value='Overdue'>Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Keyword Universal Pencarian Free Text */}
            <Grid size={{ xs: 12, sm: 4, md: 6 }}>
              <TextField
                fullWidth
                label='Cari Nama Santri / NIS'
                size='small'
                placeholder='Ketik nama lengkap atau NIS santri...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              />
            </Grid>
          </Grid>

          {/* BAR UTILITY CONTROL BUTTONS */}
          <Toolbar
            sx={{
              px: '0px !important',
              gap: 2,
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              minHeight: 'auto'
            }}
          >
            <Button
              variant='contained'
              color='info'
              fullWidth={isMobile}
              startIcon={<i className='tabler-search' />}
              onClick={handleSearchSubmit}
            >
              Cari Log
            </Button>

            <Button
              variant='outlined'
              color='secondary'
              fullWidth={isMobile}
              startIcon={<i className='tabler-refresh' />}
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>

            <Button
              variant='contained'
              color='primary'
              fullWidth={isMobile}
              startIcon={<i className='tabler-qrcode' />}
              onClick={() => setOpenModalScanQrCode(true)}
              sx={{ fontWeight: 600 }}
            >
              Scan QR Gate Keeper
            </Button>

            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {canExport && (
              <Button
                color='success'
                variant='contained'
                fullWidth={isMobile}
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
                disabled={loadingExport}
              >
                {loadingExport ? 'Memproses...' : 'Export Logs Excel'}
              </Button>
            )}
          </Toolbar>
        </Card>

        {/* 3. MAIN DATA TABLE RENDERING */}
        <Card sx={{ overflowX: 'auto' }}>
          <CardHeader title='Daftar Riwayat Keluar Masuk Santri (Log Gate)' />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      {/* ========================================================
          4. POPUP COMPONENT A: SCANNER VIEW (DIALANGUANGE LAUNCHER)
          ======================================================== */}
      <Dialog open={openModalScanQrCode} onClose={() => setOpenModalScanQrCode(false)} maxWidth='xs' fullWidth>
        <DialogTitle
          component='div'
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Scan QR Code Kartu Santri
          </Typography>
          <IconButton onClick={() => setOpenModalScanQrCode(false)} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 4 }}>
          <QRScanner result={handleScanQrCode} active={openModalScanQrCode} />
        </DialogContent>
      </Dialog>

      {/* ========================================================
          5. POPUP COMPONENT B: RESUME DISPLAY HASIL SCANNING QR CODE
          ======================================================== */}
      <Dialog open={openModalResult} onClose={() => setOpenModalResult(false)} maxWidth='sm' fullWidth>
        <DialogTitle
          component='div'
          sx={{ m: 0, p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Informasi Hasil Autentikasi Gerbang
          </Typography>
          <IconButton onClick={() => setOpenModalResult(false)} size='small' disabled={loading}>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 5 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
              <i className='tabler-loader animate-spin text-primary' style={{ fontSize: '2.5rem' }} />
              <Typography variant='body2' color='text.secondary'>
                Memvalidasi keabsahan token santri...
              </Typography>
            </Box>
          ) : scanResult ? (
            // --- STATE SUCCESS (DATA TERCATAT KELUAR / KEMBALI) ---
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: scanResult.status_gate === 'Keluar' ? 'primary.lightOpacity' : 'success.lightOpacity',
                    display: 'flex'
                  }}
                >
                  <i
                    className={
                      scanResult.status_gate === 'Keluar' ? 'tabler-logout text-primary' : 'tabler-login text-success'
                    }
                    style={{ fontSize: '2rem' }}
                  />
                </Box>
                <Box>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    STATUS: TERCATAT {scanResult.status_gate?.toUpperCase()}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Gerbang Pondok Pesantren Terverifikasi Otomatis
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Nama Santri
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    : {scanResult.nama_santri}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    NIS
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant='body2'>: {scanResult.nis}</Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Kamar
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant='body2'>: {scanResult.kamar}</Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Jenis Perizinan
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      :
                    </Typography>
                    <Chip label={scanResult.jenis_izin || '-'} size='small' variant='outlined' sx={{ height: 20 }} />
                  </Box>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Waktu Keluar
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant='body2' color='primary.main'>
                    : {scanResult.waktu_keluar || '-'}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Waktu Kembali
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant='body2' color='success.main'>
                    : {scanResult.waktu_masuk || '-'}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant='body2' color='text.secondary'>
                    Kondisi Disiplin
                  </Typography>
                </Grid>
                <Grid size={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1 }}>
                      :
                    </Typography>
                    <Chip
                      label={scanResult.kondisi === '-' ? 'Aktif di Luar' : scanResult.kondisi}
                      size='small'
                      color={
                        scanResult.kondisi === 'Overdue'
                          ? 'error'
                          : scanResult.kondisi === 'Closed'
                            ? 'secondary'
                            : 'success'
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // --- STATE ERROR / DATA KOSONG (TOKEN MALFORMED ATAU SUDAH PERNAH KEMBALI) ---
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ p: 3, bgcolor: 'error.lightOpacity', borderRadius: '50%', display: 'inline-flex', mb: 3 }}>
                <i className='tabler-alert-triangle text-error' style={{ fontSize: '2.5rem' }} />
              </Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1 }}>
                Akses Ditolak
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Token QR Code tidak memenuhi validasi administrasi pondok atau santri telah tercatat berada di dalam
                komplek.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button onClick={() => setOpenModalResult(false)} variant='outlined' color='secondary' disabled={loading}>
            Tutup Dialog
          </Button>
          <Button
            onClick={handleScanNext}
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-scan' />}
            disabled={loading}
          >
            Scan Berikutnya
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default LogGateSantriList
