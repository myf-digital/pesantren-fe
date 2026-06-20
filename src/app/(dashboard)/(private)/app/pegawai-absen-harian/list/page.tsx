'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import {
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
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'

import { toast } from 'react-toastify'

import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteAbsenHarian,
  fetchAbsenHarianPage,
  fetchAttendanceToday,
  postAbsenHarianExport,
  postAbsenClockIn,
  postAbsenClockOut,
  resetRedux
} from '../slice/index'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import CopyTooltip from '@/components/CopyTooltip'
import { useSession } from 'next-auth/react'

/* -------------------------------------------------------------
   KOMPONEN MODAL POPUP JAWABAN API (SUKSES / GAGAL)
------------------------------------------------------------- */
interface StatusModalProps {
  open: boolean
  isSuccess: boolean
  message: string
  onClose: () => void
}

const StatusAbsenModal = ({ open, isSuccess, message, onClose }: StatusModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogContent sx={{ textCenter: 'center', textAlign: 'center', pt: 6, pb: 4 }}>
        <Box sx={{ mb: 4 }}>
          {isSuccess ? (
            <Box
              sx={{
                width: 70,
                height: 70,
                bgcolor: 'success.lighter',
                color: 'success.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto'
              }}
            >
              <i className='tabler-circle-check' style={{ fontSize: 42 }} />
            </Box>
          ) : (
            <Box
              sx={{
                width: 70,
                height: 70,
                bgcolor: 'error.lighter',
                color: 'error.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto'
              }}
            >
              <i className='tabler-circle-x' style={{ fontSize: 42 }} />
            </Box>
          )}
        </Box>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
          {isSuccess ? 'Absensi Berhasil Dicatat' : 'Gagal Mencatat Absen'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {message ||
            (isSuccess
              ? 'Data log kehadiran Anda telah diperbarui ke sistem pusat.'
              : 'Sistem mengalami kendala komunikasi data.')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 6 }}>
        <Button variant='contained' color={isSuccess ? 'success' : 'error'} onClick={onClose} sx={{ minWidth: 120 }}>
          Selesai
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* -------------------------------------------------------------
   KOMPONEN ROW ACTION (RIWAYAT TAB)
------------------------------------------------------------- */
const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = true
  const canDelete = true

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} href={`/app/pegawai/form?id=${row.id_pegawai}&view=true`}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/pegawai/form?id=${row.id_pegawai}`}>
            <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
            <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        id={row.nama_lengkap}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_pegawai)
          setOpenConfirm(false)
        }}
        handleClose={() => setOpenConfirm(false)}
      />
    </>
  )

  if (isMobile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>{content}</Box>
  }

  return (
    <TableCell
      size='small'
      align='center'
      sx={{
        borderBottom: 0,
        verticalAlign: 'middle',
        padding: 'inherit'
      }}
    >
      <Box sx={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', verticalAlign: 'middle' }}>
        {content}
      </Box>
    </TableCell>
  )
}

/* -------------------------------------------------------------
   KOMPONEN TAB 1: PRESENSI PEGAWAI (REALTIME & QUICK ACTION)
------------------------------------------------------------- */
interface PresensiPegawaiProps {
  store: any
  onClockIn: () => void
  onClockOut: () => void
  isLocating: boolean
}

const PresensiPegawai = ({ store, onClockIn, onClockOut, isLocating }: PresensiPegawaiProps) => {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Mengambil data real-time hari ini langsung dari store.data hasil fetchAttendanceToday
  const absenHariIni = store.data

  const openGoogleMaps = (lat: any, long: any) => {
    if (!lat || !long) return '#'
    return `https://www.google.com/maps?q=${lat},${long}`
  }

  const formatTimeSafe = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm:ss')
    } catch {
      return '--:--:--'
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={6} justifyContent='center'>
        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
          <Card variant='outlined' sx={{ p: 5, bgcolor: 'background.default' }}>
            <Typography variant='h5' color='primary' sx={{ fontWeight: 600, mb: 1 }}>
              {format(new Date(), 'eeee, dd MMMM yyyy', { locale: id })}
            </Typography>
            <Typography variant='h2' sx={{ fontWeight: 700, letterSpacing: '2px', my: 2 }}>
              {currentTime || '--:--:--'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Waktu Berjalan Server Berbasis Zona Waktu Lokal (WIB)
            </Typography>
          </Card>
        </Grid>

        <Grid size={12}>
          <Grid container spacing={4}>
            {/* KARTU CLOCK IN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' sx={{ p: 4, height: '100%' }}>
                <Typography variant='h6' sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-door-enter text-success' /> Data Clock In (Masuk)
                </Typography>

                {absenHariIni && absenHariIni.waktu_masuk ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: 'success.lighter',
                        p: 3,
                        borderRadius: 1,
                        borderLeft: 4,
                        borderColor: 'success.main'
                      }}
                    >
                      <Typography variant='caption' color='success.main' sx={{ fontWeight: 600 }}>
                        STATUS: SUDAH CLOCK IN
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.disabled'>
                        WAKTU MASUK
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatTimeSafe(absenHariIni.waktu_masuk)} WIB
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.disabled'>
                        KOORDINAT LOKASI
                      </Typography>
                      <Typography variant='body2'>
                        {absenHariIni.lat_masuk || '-'}, {absenHariIni.long_masuk || '-'}
                      </Typography>
                    </Box>
                    {absenHariIni.lat_masuk && (
                      <Button
                        size='small'
                        variant='text'
                        color='primary'
                        startIcon={<i className='tabler-map-pin' />}
                        href={openGoogleMaps(absenHariIni.lat_masuk, absenHariIni.long_masuk)}
                        target='_blank'
                        sx={{ alignSelf: 'flex-start', p: 0 }}
                      >
                        Buka di Google Maps
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                      Anda belum mencatat absensi masuk untuk hari ini.
                    </Typography>
                    <Button
                      variant='contained'
                      color='success'
                      disabled={isLocating}
                      startIcon={
                        isLocating ? (
                          <CircularProgress size={18} color='inherit' />
                        ) : (
                          <i className='tabler-player-play-capsule' />
                        )
                      }
                      onClick={onClockIn}
                    >
                      {isLocating ? 'Mencari Lokasi...' : 'Clock In Masuk Kerja'}
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* KARTU CLOCK OUT */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' sx={{ p: 4, height: '100%' }}>
                <Typography variant='h6' sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-logout text-danger' /> Data Clock Out (Pulang)
                </Typography>

                {absenHariIni && absenHariIni.waktu_keluar ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{ bgcolor: 'error.lighter', p: 3, borderRadius: 1, borderLeft: 4, borderColor: 'error.main' }}
                    >
                      <Typography variant='caption' color='error.main' sx={{ fontWeight: 600 }}>
                        STATUS: SUDAH CLOCK OUT (SELESAI)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.disabled'>
                        WAKTU KELUAR
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatTimeSafe(absenHariIni.waktu_keluar)} WIB
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.disabled'>
                        KOORDINAT LOKASI
                      </Typography>
                      <Typography variant='body2'>
                        {absenHariIni.lat_keluar || '-'}, {absenHariIni.long_keluar || '-'}
                      </Typography>
                    </Box>
                    {absenHariIni.lat_keluar && (
                      <Button
                        size='small'
                        variant='text'
                        color='primary'
                        startIcon={<i className='tabler-map-pin' />}
                        href={openGoogleMaps(absenHariIni.lat_keluar, absenHariIni.long_keluar)}
                        target='_blank'
                        sx={{ alignSelf: 'flex-start', p: 0 }}
                      >
                        Buka di Google Maps
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                      {absenHariIni && absenHariIni.waktu_masuk
                        ? 'Anda siap untuk melakukan absensi keluar setelah jam kerja berakhir.'
                        : 'Tombol pulang aktif sesudah Anda melakukan registrasi Clock In.'}
                    </Typography>
                    <Button
                      variant='contained'
                      color='error'
                      disabled={!absenHariIni || !absenHariIni.waktu_masuk || isLocating}
                      startIcon={
                        isLocating ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-logout' />
                      }
                      onClick={onClockOut}
                    >
                      {isLocating ? 'Mencari Lokasi...' : 'Clock Out Pulang'}
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

/* -------------------------------------------------------------
   KOMPONEN UTAMA: MODUL ABSEN HARIAN PEGAWAI (DENGAN TAB TABS)
------------------------------------------------------------- */
const AbsenHarianPegawaiList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { data: session } = useSession()
  const authUser: any = session?.userdata
  const store = useAppSelector(state => state.absen_harian_pegawai)

  const canExport = useCan('export')

  // State Manajemen Internal
  const [activeTab, setActiveTab] = useState(0)
  const [filter, setFilter] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // State untuk manajemen Modal Hasil Mutasi Absensi
  const [modalStatus, setModalStatus] = useState({ open: false, isSuccess: true, message: '' })

  // Ambil Data Absensi Hari Ini secara spesifik
  const fetchTodayData = useCallback(() => {
    if (authUser?.pegawai?.id_pegawai) {
      dispatch(fetchAttendanceToday({ id_pegawai: authUser.pegawai.id_pegawai }))
    }
  }, [dispatch, authUser?.pegawai?.id_pegawai])

  // Ambil Data List Riwayat (Tab 2)
  const fetchData = useCallback(() => {
    if (authUser?.pegawai?.id_pegawai) {
      dispatch(
        fetchAbsenHarianPage({
          page,
          perPage,
          keyword: filter,
          tanggal: filterDate || undefined,
          id_pegawai: authUser?.pegawai?.id_pegawai
        })
      )
    }
  }, [dispatch, page, perPage, filter, filterDate, authUser?.pegawai?.id_pegawai])

  // Lifecycle pertama untuk deteksi absensi hari ini & riwayat tab
  useEffect(() => {
    fetchTodayData()
  }, [fetchTodayData])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Log riwayat absensi pegawai berhasil dihapus')
      fetchData()
      fetchTodayData() // Refresh status hari ini
      dispatch(resetRedux())
    }

    if (store.crud !== null) {
      setModalStatus({
        open: true,
        isSuccess: store.crud.status,
        message: store.crud.message || ''
      })
      fetchData()
      fetchTodayData() // Refresh status hari ini agar tombol langsung berganti/ter-hide
      dispatch(resetRedux())
    }
  }, [store.delete, store.crud, dispatch, fetchData, fetchTodayData])

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postAbsenHarianExport({
          q: filter,
          template: '0',
          tanggal: filterDate,
          id_pegawai: authUser?.pegawai?.id_pegawai
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch {
      toast.error('Gagal export data excel log absensi')
    } finally {
      setLoadingExport(false)
    }
  }

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Browser Anda tidak mendukung fitur pelacakan lokasi (Geolocation).'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          let errorMsg = 'Gagal mendapatkan data lokasi.'
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Akses lokasi ditolak. Mohon aktifkan izin GPS pada peramban perangkat Anda.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Informasi lokasi perangkat tidak tersedia.'
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Waktu permintaan mendapatkan lokasi habis (Timeout).'
          }
          reject(new Error(errorMsg))
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    })
  }

  const handleQuickClockIn = async () => {
    if (!authUser?.pegawai?.id_pegawai) {
      toast.error('Sesi pegawai tidak terbaca. Gagal melakukan absen.')
      return
    }

    try {
      setIsLocating(true)
      const position = await getCurrentLocation()
      const { latitude, longitude } = position.coords

      dispatch(
        postAbsenClockIn({
          id_pegawai: authUser?.pegawai?.id_pegawai,
          latitude: latitude,
          longitude: longitude,
          catatan: 'Presensi Mandiri via Web Apps'
        })
      )
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengambil koordinat device.')
    } finally {
      setIsLocating(false)
    }
  }

  const handleQuickClockOut = async () => {
    if (!authUser?.pegawai?.id_pegawai) {
      toast.error('Sesi pegawai tidak terbaca. Gagal melakukan absen.')
      return
    }

    try {
      setIsLocating(true)
      const position = await getCurrentLocation()
      const { latitude, longitude } = position.coords

      dispatch(
        postAbsenClockOut({
          id_pegawai: authUser?.pegawai?.id_pegawai,
          latitude: latitude,
          longitude: longitude,
          catatan: 'Pekerjaan hari ini selesai'
        })
      )
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengambil koordinat device.')
    } finally {
      setIsLocating(false)
    }
  }

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue)
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteAbsenHarian(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    const badgeStatusColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
      Hadir: 'success',
      Izin: 'warning',
      Sakit: 'info',
      Alfa: 'error'
    }

    const formatDateSafe = (dateStr: string, pattern: string) => {
      try {
        if (!dateStr) return '-'
        return format(parseISO(dateStr), pattern, { locale: id })
      } catch {
        return dateStr || '-'
      }
    }

    return {
      page: page,
      fields: [
        tableColumn('TANGGAL', 'tanggal_display'),
        tableColumn('STATUS', 'status_display'),
        tableColumn('LOG MASUK', 'masuk_display'),
        tableColumn('LOG KELUAR', 'keluar_display')
      ],
      values: (dataPage?.values || []).map((row: any) => ({
        ...row,
        tanggal_display: (
          // <CopyTooltip
          //   textToCopy={row.id_absen}
          //   title={
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {row.tanggal ? formatDateSafe(row.tanggal, 'dd MMMM yyyy') : '-'}
          </Typography>
          //   }
          // />
        ),
        status_display: (
          <Chip
            label={row.status_kehadiran || 'Hadir'}
            size='small'
            color={badgeStatusColors[row.status_kehadiran] || 'secondary'}
            variant='tonal'
          />
        ),
        masuk_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {row.waktu_masuk ? formatDateSafe(row.waktu_masuk, 'HH:mm:ss') : '--:--'}
            </Typography>
            <Tooltip title={row.keterangan_masuk || '-'} placement='top' arrow>
              {/* Ganti <> menjadi <Box> agar event hover bisa ditangkap oleh Tooltip */}
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                  sx={{ maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  title={row.keterangan_masuk}
                >
                  {row.keterangan_masuk || '-'}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.lat_masuk ? `${row.lat_masuk}, ${row.long_masuk}` : 'Tanpa Koordinat'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        ),
        keluar_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {row.waktu_keluar ? formatDateSafe(row.waktu_keluar, 'HH:mm:ss') : '--:--'}
            </Typography>
            <Tooltip title={row.keterangan_keluar || '-'} placement='top' arrow>
              {/* Ganti <> menjadi <Box> juga di sini */}
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                  sx={{ maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  title={row.keterangan_keluar}
                >
                  {row.keterangan_keluar || '-'}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.lat_keluar ? `${row.lat_keluar}, ${row.long_keluar}` : 'Tanpa Koordinat'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )
      })),
      count: dataPage?.total || 0,
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
        <Card>
          <CardHeader
            title='Monitoring Absensi Mandiri Pegawai'
            subheader={authUser?.pegawai?.nama_lengkap ? `Pegawai Aktif: ${authUser?.pegawai?.nama_lengkap}` : ''}
            sx={{ paddingBottom: 2 }}
          />

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 5 }}>
            <Tab label='Presensi Pegawai' icon={<i className='tabler-fingerprint' />} iconPosition='start' />
            <Tab label='Riwayat Presensi Saya' icon={<i className='tabler-history' />} iconPosition='start' />
          </Tabs>

          {activeTab === 0 ? (
            <PresensiPegawai
              store={store}
              onClockIn={handleQuickClockIn}
              onClockOut={handleQuickClockOut}
              isLocating={isLocating}
            />
          ) : (
            <>
              <Toolbar
                sx={{
                  px: '1.5rem !important',
                  minHeight: 'auto',
                  gap: 2,
                  flexWrap: 'wrap',
                  mt: '15px',
                  mb: '10px',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' }
                }}
              >
                {canExport && (
                  <Tooltip title='Export Log Excel'>
                    <Button
                      size='small'
                      color='warning'
                      variant='outlined'
                      sx={{
                        height: 32,
                        fontSize: '0.75rem',
                        px: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                      onClick={onExport}
                      startIcon={<i className='tabler-file-export' />}
                    >
                      {loadingExport ? 'Proses...' : 'Export Excel'}
                    </Button>
                  </Tooltip>
                )}

                <Typography sx={{ flex: '1 1 auto', display: { xs: 'none', sm: 'block' } }} />

                {/* FILTER TANGGAL */}
                <Tooltip
                  title='Filter Berdasarkan Tanggal Spesifik'
                  slotProps={{ popper: { style: { width: '100%' } } }}
                >
                  <TextField
                    id='filter-tanggal-absen'
                    label='Pilih Tanggal'
                    type='date'
                    size='small'
                    value={filterDate}
                    onChange={e => {
                      setFilterDate(e.target.value)
                      setPage(1)
                    }}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                    sx={{ width: { xs: '100%', sm: 170 } }} // Full width di mobile, 170px di desktop
                  />
                </Tooltip>

                {/* SEARCH ABSEN (YANG KAMU TANYAKAN) */}
                <Tooltip title='Cari Berdasarkan Status Kehadiran...'>
                  <TextField
                    id='search-absen'
                    label='Cari Riwayat...'
                    size='small'
                    onChange={e => setFilter(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 220 } }} // Full width di mobile, atau auto/lebar spesifik di desktop
                  />
                </Tooltip>
              </Toolbar>

              <TableView changeSort={() => {}} model={buildTable()} />
            </>
          )}
        </Card>
      </Grid>

      <StatusAbsenModal
        open={modalStatus.open}
        isSuccess={modalStatus.isSuccess}
        message={modalStatus.message}
        onClose={() => setModalStatus(prev => ({ ...prev, open: false }))}
      />
    </Grid>
  )
}

export default AbsenHarianPegawaiList
