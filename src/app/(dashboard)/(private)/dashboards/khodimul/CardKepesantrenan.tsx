import { useEffect, useState } from 'react'

import { Box, Button, Card, CardContent, Grid2 as Grid, Typography } from '@mui/material'

import { format } from 'date-fns'

import classnames from 'classnames'

import CustomAvatar from '@/@core/components/mui/Avatar'

import { fetchSummaryKepesantrenan } from './slice'

import { useAppDispatch } from '@/redux-store/hook'

const CardKepesantrenan = ({ ...res }) => {
  const dispatch = useAppDispatch()

  const [summaryData, setSummaryData] = useState<any>({
    total_santri: { aktif: 0, keseluruhan: 0, persentase: 0 },
    total_guru_aktif: 0,
    total_pegawai_aktif: 0,
    total_absensi: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_absensi_kelas: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_temuan: 0,
    temuan_kotor: 0,
    temuan_rusak: 0,
    total_perizinan: 0,
    perizinan_menunggu: 0,
    perizinan_disetujui: 0,
    perizinan_overdue: 0,
    total_absensi_pegawai: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_sesi_guru: 0,
    total_petugas_inspeksi: 0,
    petugas_inspeksi_progress: { target: 0, actual: 0 },
    total_perizinan_pegawai: {
      total: 0,
      menunggu: 0,
      disetujui: 0,
      overdue: 0
    }
  })

  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  useEffect(() => {
    const getSummaryKepesantrenan = async () => {
      const result = await dispatch(
        fetchSummaryKepesantrenan({
          tanggal_mulai: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
          id_cabang: res.id_cabang,
          id_lokasi: ''
        })
      ).unwrap()

      const { data } = result

      if (data) {
        setSummaryData(data)
      }
    }

    getSummaryKepesantrenan()
  }, [startDate, endDate])

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ minHeight: 150 }}>
        <CardContent>
          <Typography variant='h5' sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            {res.nama_cabang}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 40 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'success'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-users', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Santri</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.total_santri.aktif}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'error'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-user-plus', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Guru</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.total_guru_aktif}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant='h6' sx={{ marginBottom: 2, marginTop: 2, fontWeight: 'bold' }}>
            Perizinan Santri
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Button
              variant='contained'
              size='small'
              color='warning'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.perizinan_menunggu}
                </Box>
              }
            >
              Menunggu
            </Button>
            <Button
              variant='contained'
              size='small'
              color='success'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.perizinan_disetujui}
                </Box>
              }
            >
              Disetujui
            </Button>
            <Button
              variant='contained'
              size='small'
              color='error'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.perizinan_overdue}
                </Box>
              }
            >
              Overdue
            </Button>
          </Box>
          <Typography variant='h6' sx={{ marginBottom: 2, marginTop: 2, fontWeight: 'bold' }}>
            Absensi Kamar Santri
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.total_absensi.hadir}
                </Box>
              }
            >
              Hadir
            </Button>
            <Button
              variant='contained'
              size='small'
              color='info'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.total_absensi.izin}
                </Box>
              }
            >
              Izin
            </Button>
            <Button
              variant='contained'
              size='small'
              color='warning'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.total_absensi.sakit}
                </Box>
              }
            >
              Sakit
            </Button>
            <Button
              variant='contained'
              size='small'
              color='error'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Box
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center'
                  }}
                >
                  {summaryData.total_absensi.alfa}
                </Box>
              }
            >
              Alfa
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default CardKepesantrenan
