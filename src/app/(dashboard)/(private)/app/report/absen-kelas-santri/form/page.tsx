'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Divider
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchAbsenKelasSantriPage } from '../../../absen-kelas-santri/slice'
import { format, parse } from 'date-fns'

interface AbsenItemInput {
  id_santri: string
  fullname: string
  nis: string
  status_kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'
  keterangan: string
  lokasi: {
    nama_lokasi: string
  }
}

const PresensiFormPage = () => {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const tanggal = searchParams.get('tanggal') || ''
  const idLokasi = searchParams.get('id_lokasi') || ''
  const idJamPelajaran = searchParams.get('id_jam_pelajaran') || ''

  const namaJamPelParam = searchParams.get('nama_jampel') || '-'
  const namaLokasiParam = searchParams.get('nama_lokasi') || '-'

  const store = useAppSelector(state => state.absen_kelas_santri)

  const [listSantriAbsen, setListSantriAbsen] = useState<AbsenItemInput[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        setLoadingData(true)

        const formattedTanggal = tanggal ? format(parse(tanggal, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : ''

        const res = await dispatch(
          fetchAbsenKelasSantriPage({
            tanggal: formattedTanggal,
            id_lokasi: idLokasi,
            id_jam_pelajaran: idJamPelajaran,
            perPage: 200
          })
        ).unwrap()

        const dataValues = res?.data?.values || res?.values || []
        const formatted = dataValues.map((s: any) => ({
          id_santri: s.id_santri,
          fullname: s.santri?.fullname || s.fullname || '-',
          nis: s.santri?.nis || s.nis || '-',
          status_kehadiran: s.status_kehadiran || 'Hadir',
          keterangan: s.keterangan || ''
        }))
        setListSantriAbsen(formatted)
      } catch (err: any) {
        toast.error(err?.message || 'Gagal mengambil data presensi')
      } finally {
        setLoadingData(false)
      }
    }

    if (idLokasi && idJamPelajaran && tanggal) {
      fetchSavedData()
    }
  }, [dispatch, idLokasi, idJamPelajaran, tanggal])

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        {/* HEADER TOP BAR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Detail Riwayat Presensi Kelas
          </Typography>
          <Button
            variant='outlined'
            color='secondary'
            component={Link}
            href='/app/report/absen-kelas-santri/list'
            startIcon={<i className='tabler-arrow-left' />}
          >
            Kembali
          </Button>
        </Box>

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
                  Lokasi Terpilih
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {namaLokasiParam}
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
                  Status Halaman
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 600, color: 'info.main' }}>
                  READ-ONLY VIEW
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* VIEW KONDISIONAL: TABEL DETAIL LOG PRESENSI */}
        <Card>
          <CardHeader title={`Daftar Anak (${listSantriAbsen.length} Santri)`} />
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
                    Lokasi
                  </TableCell>
                  <TableCell width={170} sx={{ fontWeight: 600 }}>
                    Status Kehadiran
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Keterangan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {store.loading || loadingData ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                      <CircularProgress size={32} sx={{ mb: 2 }} />
                      <Typography>Sedang memuat data riwayat presensi...</Typography>
                    </TableCell>
                  </TableRow>
                ) : listSantriAbsen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 10, color: 'text.secondary' }}>
                      Tidak ditemukan riwayat presensi pada parameter ini.
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
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {namaLokasiParam || santri?.lokasi?.nama_lokasi}
                      </TableCell>

                      {/* 5. Kolom Status Kehadiran Dropdown (Disabled) */}
                      <TableCell>
                        <FormControl fullWidth size='small'>
                          <Select
                            value={santri.status_kehadiran}
                            readOnly
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

                      {/* 6. Kolom Keterangan Input Text (Disabled) */}
                      <TableCell>
                        <TextField fullWidth size='small' value={santri.keterangan} disabled />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ACTION FOOTER */}
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
            <Button
              variant='outlined'
              color='secondary'
              component={Link}
              href='/app/report/absen-kelas-santri/list'
              startIcon={<i className='tabler-arrow-left' />}
            >
              Kembali
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PresensiFormPage
