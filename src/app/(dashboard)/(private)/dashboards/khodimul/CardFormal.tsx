import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Button, Card, CardContent, Grid2 as Grid, Typography } from '@mui/material'

import { format } from 'date-fns'

import classnames from 'classnames'

import CustomAvatar from '@/@core/components/mui/Avatar'

import { fetchSummaryLembagaFormal } from './slice'

import { useAppDispatch } from '@/redux-store/hook'

const CardFormal = ({ ...res }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()

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

  useEffect(() => {
    const getSummaryLembagaFormal = async () => {
      const result = await dispatch(
        fetchSummaryLembagaFormal({
          tanggal_mulai: res.tanggal_mulai ? format(res.tanggal_mulai, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: res.tanggal_selesai ? format(res.tanggal_selesai, 'yyyy-MM-dd') : undefined,
          id_cabang: res.id_cabang,
          id_lokasi: ''
        })
      ).unwrap()

      const { data } = result

      if (data) {
        setSummaryData((prevState: any) => {
          return {
            ...prevState,
            ...data
          }
        })
      }
    }

    res.tanggal_selesai && getSummaryLembagaFormal()
  }, [res.tanggal_selesai])

  const navigate = (url: string) => router.push(url)

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ minHeight: 150 }}>
        <CardContent>
          <Typography variant='h5' sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            {res.nama_cabang}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 10, overflow: 'hidden', overflowX: 'auto' }}>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
              onClick={() =>
                navigate(`/app/santri/list?status=1&id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}`)
              }
            >
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'success'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-users', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Santri</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.total_santri?.aktif}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
              onClick={() =>
                navigate(
                  `/app/pegawai/list?status_pegawai=pegawai&id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}`
                )
              }
            >
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
            Absensi Kelas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_kelas?.hadir}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_kelas?.izin}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_kelas?.sakit}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_kelas?.alfa}
                </Typography>
              }
            >
              Alfa
            </Button>
          </Box>
          <Typography variant='h6' sx={{ marginBottom: 2, marginTop: 2, fontWeight: 'bold' }}>
            Absensi Guru
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              sx={{ borderRadius: 10 }}
              endIcon={
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_pegawai?.hadir}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_pegawai?.izin}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_pegawai?.sakit}
                </Typography>
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
                <Typography
                  sx={{
                    backgroundColor: '#ffffff94',
                    color: 'black',
                    borderRadius: 10,
                    minWidth: 25,
                    textAlign: 'center',
                    paddingLeft: 2,
                    paddingRight: 2
                  }}
                >
                  {summaryData.total_absensi_pegawai?.alfa}
                </Typography>
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

export default CardFormal
