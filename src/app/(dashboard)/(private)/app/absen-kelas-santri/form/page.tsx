'use client'

import React, { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { format } from 'date-fns'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchKelasSantri,
  postAbsenKelasSantri,
  postAbsenKelasScanQR,
  fetchActiveJurnalKelas,
  endJurnalKelas,
  fetchAbsenKelasSantriPage
} from '../slice/index'
import QRScanner from '@/views/onevour/components/qr-scanner'

// Interface untuk baris data di Form Kolektif
interface AbsenItemInput {
  id_santri: string
  fullname: string
  nis: string
  status_kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'
  keterangan: string
}

// Interface untuk log data hasil Response API Scan QR
interface ScanQrResponseData {
  nis: string
  nama_lengkap: string
  waktu_scan: string
  shift: string
  status_kehadiran: string
  keterangan: string
}

const PresensiFormPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  // 1. Ambil data query param dari URL navigasi halaman sebelumnya
  const mode = searchParams.get('mode') // 'scan_qr' atau 'kolektif'
  const tanggal = searchParams.get('tanggal') || format(new Date(), 'yyyy-MM-dd')
  const idKelas = searchParams.get('id_kelas') || ''
  const idJamPelajaran = searchParams.get('id_jam_pelajaran') || ''
  const qrCodeParam = searchParams.get('qrcode') || ''
  const idAbsen = searchParams.get('id') || ''

  const isViewOnlyParam = searchParams.get('view') === 'true'
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isToday = tanggal === todayStr
  const isViewOnly = isViewOnlyParam || (Boolean(idAbsen) && !isToday)

  // Label readable untuk header komponen UI
  const namaJamPelParam = searchParams.get('nama_jampel') || '-'
  const namaKelasParam = searchParams.get('nama_kelas') || '-'

  const store = useAppSelector(state => state.absen_kelas_santri)

  // State internal untuk Skenario 1: Form Kolektif / Massal
  const [listSantriAbsen, setListSantriAbsen] = useState<AbsenItemInput[]>([])
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  // Jurnal Kelas States
  const [openEndClassModal, setOpenEndClassModal] = useState(false)
  const [materiInput, setMateriInput] = useState('')
  const [catatanInput, setCatatanInput] = useState('')
  const [submittingEndClass, setSubmittingEndClass] = useState(false)

  // Fetch active jurnal kelas
  useEffect(() => {
    if (idKelas && idJamPelajaran) {
      dispatch(
        fetchActiveJurnalKelas({
          tanggal,
          id_lokasi: idKelas,
          id_jam_pelajaran: idJamPelajaran
        })
      )
    }
  }, [dispatch, tanggal, idKelas, idJamPelajaran])

  // Set initial materi & catatan if already exist in store.activeJurnal
  useEffect(() => {
    if (store.activeJurnal) {
      setMateriInput(store.activeJurnal.materi || '')
      setCatatanInput(store.activeJurnal.catatan || '')
    }
  }, [store.activeJurnal])

  const handleConfirmEndClass = async () => {
    if (!store.activeJurnal?.id_jurnal) {
      toast.error('Tidak ada kelas aktif yang dapat diakhiri.')
      return
    }

    try {
      setSubmittingEndClass(true)
      await dispatch(
        endJurnalKelas({
          id_jurnal: store.activeJurnal.id_jurnal,
          materi: materiInput,
          catatan: catatanInput
        })
      ).unwrap()

      toast.success('Kelas berhasil diakhiri dan jurnal disimpan!')
      setOpenEndClassModal(false)
      router.push('/app/absen-kelas-santri/list')
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengakhiri kelas')
    } finally {
      setSubmittingEndClass(false)
    }
  }

  // State internal untuk Skenario 2: Scan QR Kartu
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [scannedLogs, setScannedLogs] = useState<ScanQrResponseData[]>([])

  const [openModalScanQrCode, setOpenModalScanQrCode] = useState(false)
  const qrCode = useRef(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Fetch data antrean santri siap absen jika memilih mode kolektif
  useEffect(() => {
    if (mode === 'kolektif' && idKelas) {
      if (idAbsen) {
        dispatch(
          fetchAbsenKelasSantriPage({
            tanggal,
            id_kelas: idKelas,
            id_jam_pelajaran: idJamPelajaran,
            perPage: 1000
          })
        )
      } else {
        dispatch(fetchKelasSantri({ id_kelas: idKelas }))
      }
    }
  }, [dispatch, mode, idKelas, idAbsen, tanggal, idJamPelajaran])

  // Menyalin data dari Redux Store ke Local State agar form input bisa diubah secara interaktif
  useEffect(() => {
    if (mode === 'kolektif') {
      if (idAbsen && store.dataPage?.values && store.dataPage.values.length > 0) {
        const formatted = store.dataPage.values.map((s: any) => ({
          id_santri: s.santri?.id_santri || s.id_santri,
          fullname: s.santri?.fullname || s.fullname || '',
          nis: s.santri?.nis || s.nis || '',
          status_kehadiran: s.status_kehadiran || 'Hadir',
          keterangan: s.keterangan || ''
        }))
        setListSantriAbsen(formatted as AbsenItemInput[])
      } else if (!idAbsen && store.santriList) {
        const formatted = store.santriList.map((s: any) => ({
          id_santri: s.id_santri,
          fullname: s.fullname,
          nis: s.nis,
          status_kehadiran: 'Hadir', // Default awal diset Hadir semua
          keterangan: '' // Default keterangan kosong
        }))
        setListSantriAbsen(formatted as AbsenItemInput[])
      }
    }
  }, [store.santriList, store.dataPage?.values, mode, idAbsen])

  // Handler ubah status kehadiran via Select Dropdown per baris santri
  const handleStatusChange = (idSantri: string, value: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa') => {
    setListSantriAbsen(prev =>
      prev.map(item => (item.id_santri === idSantri ? { ...item, status_kehadiran: value } : item))
    )
  }

  // Handler ubah teks keterangan tambahan per baris santri
  const handleKeteranganChange = (idSantri: string, text: string) => {
    setListSantriAbsen(prev => prev.map(item => (item.id_santri === idSantri ? { ...item, keterangan: text } : item)))
  }

  // Shortcut tombol aksi massal di bagian header kardus tabel kolektif
  const handleSetAllStatus = (value: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa') => {
    setListSantriAbsen(prev => prev.map(item => ({ ...item, status_kehadiran: value })))
    toast.info(`Semua status kehadiran santri diatur ke: ${value}`)
  }

  // ========================================================
  // SUBMIT HANDLER SKENARIO 1: FORM PRESENSI MASAL / KOLEKTIF
  // ========================================================
  const handleSubmitKolektif = async () => {
    try {
      setLoadingSubmit(true)

      const payload = {
        tanggal: tanggal,
        waktu_absen: format(new Date(), 'HH:mm'),
        id_lokasi: idKelas,
        id_jam_pelajaran: idJamPelajaran,
        data_absen: listSantriAbsen.map(s => ({
          id_santri: s.id_santri,
          status_kehadiran: s.status_kehadiran,
          keterangan: s.keterangan
        }))
      }

      await dispatch(postAbsenKelasSantri(payload)).unwrap()

      toast.success('Data presensi massal kelas berhasil disimpan!')
      router.push('/app/absen-kelas-santri/list')
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan data presensi kolektif')
    } finally {
      setLoadingSubmit(false)
    }
  }

  // ========================================================
  // SUBMIT HANDLER SKENARIO 2: REAL-TIME SCAN QR KARTU
  // ========================================================
  const submitQrData = async (nis: string) => {
    if (!nis.trim()) return

    try {
      const payload = {
        nis: nis.trim(),
        tanggal_custom: tanggal,
        waktu_custom: format(new Date(), 'HH:mm:ss'),
        id_lokasi: idKelas,
        id_jam_pelajaran: idJamPelajaran
      }

      const res = await dispatch(postAbsenKelasScanQR(payload)).unwrap()

      const serverData = res.data

      const newLogItem: ScanQrResponseData = {
        nis: serverData.nis,
        nama_lengkap: serverData.nama_lengkap,
        waktu_scan: serverData.waktu_scan,
        shift: serverData.shift,
        status_kehadiran: serverData.status_kehadiran,
        keterangan: serverData.keterangan || 'Hadir via Pindai QR Code'
      }

      // Masukkan data riil server ke urutan paling atas di monitor table log
      setScannedLogs(prev => [newLogItem, ...prev])

      // Tampilkan pesan sukses dinamis bawaan dari server
      toast.success(res.message || `Presensi ${newLogItem.nama_lengkap} berhasil dicatat!`)
      setQrCodeInput('')
    } catch (error: any) {
      toast.error(error?.message || 'Gagal memproses kartu scan santri')
    }
  }

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitQrData(qrCodeInput)
  }

  const handleOpenScanQrCode = () => {
    qrCode.current = null
    setOpenModalScanQrCode(!openModalScanQrCode)
  }

  const handleScanQrCode = async (qrcode: any) => {
    if (qrCode.current === qrcode) return
    qrCode.current = qrcode
    setQrCodeInput(qrcode)
    setOpenModalScanQrCode(false)

    await submitQrData(qrcode)
  }

  useEffect(() => {
    if (qrCodeParam) {
      handleScanQrCode(qrCodeParam)
    }
  }, [qrCodeParam])

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        {/* HEADER TOP BAR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {mode === 'scan_qr' ? 'Presensi Elektrik Via Scan QR Kartu' : 'Form Input Kehadiran Massal'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='outlined'
              color='secondary'
              component={Link}
              href='/app/absen-kelas-santri/list'
              startIcon={<i className='tabler-arrow-left' />}
            >
              Kembali
            </Button>
            {store.activeJurnal && !store.activeJurnal.jam_selesai && !isViewOnly && (
              <Button
                variant='contained'
                color='error'
                startIcon={<i className='tabler-square-x' />}
                onClick={() => setOpenEndClassModal(true)}
              >
                Akhiri Kelas
              </Button>
            )}
          </Box>
        </Box>

        {store.activeJurnal && store.activeJurnal.jam_selesai && (
          <Alert severity='warning' sx={{ mb: 4 }}>
            Kelas ini sudah diakhiri pada pukul {store.activeJurnal.jam_selesai}.
          </Alert>
        )}

        {/* TOP INFORMATION CARD */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Nama Shift Presensi
                </Typography>
                <Typography variant='h6' color='primary.main' sx={{ fontWeight: 700 }}>
                  {store.jamPel?.nama_jampel || namaJamPelParam}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Kelas Terpilih
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {namaKelasParam}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Tanggal Presensi
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 600 }}>
                  {tanggal}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Metode Input Jurnal
                </Typography>
                <Typography
                  variant='body1'
                  sx={{ fontWeight: 600, color: mode === 'scan_qr' ? 'info.main' : 'warning.main' }}
                >
                  {mode === 'scan_qr' ? '⚡ AUTOMATIC QR SCANNER' : '📝 COLLECTIVE MANUAL'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ======================================================== */}
        {/* VIEW KONDISIONAL 1: MODE QR CODE SCANNER                 */}
        {/* ======================================================== */}
        {mode === 'scan_qr' && (
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardHeader title='Mesin Pemindai QR' />
                <CardContent>
                  <form onSubmit={handleQrSubmit} ref={formRef}>
                    <Alert severity='info' sx={{ mb: 4 }}>
                      Pastikan kolom input aktif, arahkan alat scanner/tembak barcode fisik langsung pada kartu santri.
                    </Alert>
                    <TextField
                      fullWidth
                      autoFocus
                      disabled={isViewOnly || Boolean(store.activeJurnal && store.activeJurnal.jam_selesai)}
                      label='Input Scan ID Kartu / NIS'
                      placeholder={
                        isViewOnly
                          ? 'Mode Lihat Saja'
                          : store.activeJurnal && store.activeJurnal.jam_selesai
                            ? 'Kelas sudah diakhiri'
                            : 'Tembak scanner kartu disini...'
                      }
                      value={qrCodeInput}
                      onChange={e => setQrCodeInput(e.target.value)}
                      onClick={() => {
                        if (!isViewOnly && !(store.activeJurnal && store.activeJurnal.jam_selesai)) {
                          handleOpenScanQrCode()
                        }
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <IconButton type='submit' color='primary' disabled={isViewOnly}>
                              <i className='tabler-scan' />
                            </IconButton>
                          )
                        }
                      }}
                    />
                  </form>
                  <Dialog
                    open={openModalScanQrCode}
                    onClose={() => setOpenModalScanQrCode(false)}
                    maxWidth='xs'
                    fullWidth
                  >
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
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardHeader
                  title='Aktivitas Pindai Berhasil'
                  subheader='Data tersimpan real-time ke sistem awan pusat'
                />
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Waktu Scan</TableCell>
                        <TableCell>NIS</TableCell>
                        <TableCell>Nama Lengkap</TableCell>
                        <TableCell>Status Kehadiran</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scannedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align='center' sx={{ py: 6, color: 'text.secondary' }}>
                            Menunggu pembacaan barcode kartu santri...
                          </TableCell>
                        </TableRow>
                      ) : (
                        scannedLogs.map((log, index) => (
                          <TableRow key={index} sx={{ bgcolor: index === 0 ? 'rgba(40, 199, 111, 0.05)' : 'inherit' }}>
                            <TableCell>{log.waktu_scan}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{log.nis}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{log.nama_lengkap}</TableCell>
                            <TableCell>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 700,
                                  color: log.status_kehadiran === 'Hadir' ? 'success.main' : 'error.main'
                                }}
                              >
                                {log.status_kehadiran === 'Hadir' ? '✓ HADIR' : '✗ ALFA'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ======================================================== */}
        {/* VIEW KONDISIONAL 2: FORM PRESENSI MASSAL / KOLEKTIF     */}
        {/* ======================================================== */}
        {mode === 'kolektif' && (
          <Card>
            <CardHeader
              title={`Daftar Anak (${listSantriAbsen.length} Santri)`}
              action={
                !isViewOnly && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size='small' variant='tonal' color='success' onClick={() => handleSetAllStatus('Hadir')}>
                      Semua Hadir
                    </Button>
                    <Button size='small' variant='tonal' color='info' onClick={() => handleSetAllStatus('Izin')}>
                      Semua Izin
                    </Button>
                    <Button size='small' variant='tonal' color='warning' onClick={() => handleSetAllStatus('Sakit')}>
                      Semua Sakit
                    </Button>
                    <Button size='small' variant='tonal' color='error' onClick={() => handleSetAllStatus('Alfa')}>
                      Semua Alfa
                    </Button>
                  </Box>
                )
              }
            />
            <Divider />

            <TableContainer component={Paper}>
              <Table size='small'>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell width={50} align='center' sx={{ fontWeight: 600 }}>
                      No
                    </TableCell>
                    <TableCell width={240} sx={{ fontWeight: 600 }}>
                      Nama Santri
                    </TableCell>
                    <TableCell width={130} sx={{ fontWeight: 600 }}>
                      NIS
                    </TableCell>
                    <TableCell width={150} sx={{ fontWeight: 600 }}>
                      Kelas
                    </TableCell>
                    <TableCell width={170} sx={{ fontWeight: 600 }}>
                      Status Kehadiran
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Keterangan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {store.loading || loadingSubmit ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                        <CircularProgress size={32} sx={{ mb: 2 }} />
                        <Typography>Sedang memproses data antrean santri...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : listSantriAbsen.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' sx={{ py: 10, color: 'text.secondary' }}>
                        Tidak ditemukan santri terdaftar aktif di kelas ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    listSantriAbsen.map((santri, index) => (
                      <TableRow key={santri.id_santri} hover>
                        {/* 1. Kolom No */}
                        <TableCell align='center'>{index + 1}</TableCell>

                        {/* 2. Kolom Nama Santri */}
                        <TableCell sx={{ fontWeight: 600 }}>{santri.fullname}</TableCell>

                        {/* 3. Kolom NIS */}
                        <TableCell sx={{ fontWeight: 500 }}>{santri.nis}</TableCell>

                        {/* 4. Kolom Lokasi */}
                        <TableCell sx={{ color: 'text.secondary' }}>{namaKelasParam}</TableCell>

                        {/* 5. Kolom Status Kehadiran Dropdown */}
                        <TableCell>
                          <FormControl fullWidth size='small'>
                            <Select
                              value={santri.status_kehadiran}
                              onChange={e => handleStatusChange(santri.id_santri, e.target.value as any)}
                              disabled={isViewOnly}
                              sx={{
                                fontWeight: 600,
                                color:
                                  santri.status_kehadiran === 'Hadir'
                                    ? 'success.main'
                                    : santri.status_kehadiran === 'Izin'
                                      ? 'info.main'
                                      : santri.status_kehadiran === 'Sakit'
                                        ? 'warning.main'
                                        : 'error.main'
                              }}
                            >
                              <MenuItem value='Hadir'>Hadir</MenuItem>
                              <MenuItem value='Izin'>Izin</MenuItem>
                              <MenuItem value='Sakit'>Sakit</MenuItem>
                              <MenuItem value='Alfa'>Alfa</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 6. Kolom Keterangan Input Text */}
                        <TableCell>
                          <TextField
                            fullWidth
                            size='small'
                            disabled={isViewOnly}
                            placeholder={isViewOnly ? '' : 'Contoh: Sakit demam, Izin jenguk...'}
                            value={santri.keterangan}
                            onChange={e => handleKeteranganChange(santri.id_santri, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ACTION FOOTER ACCORDION */}
            <Box sx={{ p: 5, display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
              <Button
                variant='outlined'
                color='secondary'
                component={Link}
                href='/app/absen-kelas-santri/list'
                disabled={loadingSubmit}
              >
                {isViewOnly ? 'Kembali' : 'Batal'}
              </Button>
              {!isViewOnly && (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmitKolektif}
                  disabled={
                    loadingSubmit ||
                    listSantriAbsen.length === 0 ||
                    Boolean(store.activeJurnal && store.activeJurnal.jam_selesai)
                  }
                  startIcon={
                    loadingSubmit ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <i className='tabler-device-floppy' />
                    )
                  }
                >
                  Simpan Presensi Massal
                </Button>
              )}
              {store.activeJurnal && !store.activeJurnal.jam_selesai && !isViewOnly && (
                <Button
                  variant='contained'
                  color='error'
                  startIcon={<i className='tabler-square-x' />}
                  onClick={() => setOpenEndClassModal(true)}
                >
                  Akhiri Kelas
                </Button>
              )}
            </Box>
          </Card>
        )}

        <Dialog open={openEndClassModal} onClose={() => setOpenEndClassModal(false)} maxWidth='sm' fullWidth>
          <DialogTitle
            component='div'
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
          >
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              Akhiri Kelas & Isi Jurnal Pembelajaran
            </Typography>
            <IconButton onClick={() => setOpenEndClassModal(false)} size='small'>
              <i className='tabler-x' />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 4 }}>
            <Typography variant='body2' sx={{ mb: 4 }} color='text.secondary'>
              Silakan masukkan materi yang diajarkan dan catatan kelas sebelum mengakhiri sesi pembelajaran ini.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                fullWidth
                label='Materi Pembelajaran'
                placeholder='Contoh: Bab 1 - Sejarah Islam'
                multiline
                rows={3}
                value={materiInput}
                onChange={e => setMateriInput(e.target.value)}
              />
              <TextField
                fullWidth
                label='Catatan Kelas'
                placeholder='Contoh: Santri sangat kondusif, 2 santri terlambat.'
                multiline
                rows={3}
                value={catatanInput}
                onChange={e => setCatatanInput(e.target.value)}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setOpenEndClassModal(false)}
              variant='outlined'
              color='secondary'
              disabled={submittingEndClass}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmEndClass}
              variant='contained'
              color='error'
              disabled={submittingEndClass}
              startIcon={
                submittingEndClass ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-square-x' />
              }
            >
              Akhiri & Simpan Jurnal
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default PresensiFormPage
