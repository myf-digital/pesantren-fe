import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Button, Card, CardContent, Grid2 as Grid, Typography } from '@mui/material'

import { format } from 'date-fns'

import classnames from 'classnames'

import CustomAvatar from '@/@core/components/mui/Avatar'

import { fetchSummaryRumahTangga } from './slice'

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
    total_inspeksi: 0,
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
    },
    total_belum_diproses: 0,
    total_sedang_diproses: 0,
    total_sudah_diproses: 0,
    total_tidak_dapat_diproses: 0
  })

  useEffect(() => {
    const getSummaryRumahTangga = async () => {
      const result = await dispatch(
        fetchSummaryRumahTangga({
          tanggal_mulai: res.tanggal_mulai ? format(res.tanggal_mulai, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: res.tanggal_selesai ? format(res.tanggal_selesai, 'yyyy-MM-dd') : undefined,
          id_cabang: res.id_cabang,
          id_lokasi: ''
        })
      ).unwrap()

      const { data } = result

      if (data) {
        setSummaryData(data)
      }
    }

    res.tanggal_selesai && getSummaryRumahTangga()
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
              sx={{ display: 'flex', flexDirection: 'row', gap: 2, cursor: 'pointer' }}
              onClick={() =>
                navigate(
                  `/app/report/kebersihan-petugas/list?id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}&tanggal_mulai=${format(res.tanggal_mulai, 'yyyy-MM-dd')}&tanggal_selesai=${format(res.tanggal_selesai, 'yyyy-MM-dd')}`
                )
              }
            >
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'success'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-users', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Petugas</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.total_petugas_inspeksi}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: 2, cursor: 'pointer' }}
              onClick={() =>
                navigate(
                  `/app/kebersihan-inspeksi/list?id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}&tanggal_mulai=${format(res.tanggal_mulai, 'yyyy-MM-dd')}&tanggal_selesai=${format(res.tanggal_selesai, 'yyyy-MM-dd')}`
                )
              }
            >
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'success'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-check', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Inspeksi</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.total_inspeksi}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: 2, cursor: 'pointer' }}
              onClick={() =>
                navigate(
                  `/app/report/kebersihan-temuan/list?id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}&status_kondisi=KOTOR&tanggal_mulai=${format(res.tanggal_mulai, 'yyyy-MM-dd')}&tanggal_selesai=${format(res.tanggal_selesai, 'yyyy-MM-dd')}`
                )
              }
            >
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'error'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-x', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Kotor</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.temuan_kotor}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: 2, cursor: 'pointer' }}
              onClick={() =>
                navigate(
                  `/app/report/kebersihan-temuan/list?id_cabang=${res.id_cabang}&nama_cabang=${res.nama_cabang}&status_kondisi=RUSAK&tanggal_mulai=${format(res.tanggal_mulai, 'yyyy-MM-dd')}&tanggal_selesai=${format(res.tanggal_selesai, 'yyyy-MM-dd')}`
                )
              }
            >
              <CustomAvatar variant='rounded' skin={'light'} size={44} color={'error'} sx={{ flexShrink: 0 }}>
                <i className={classnames('tabler-x', 'text-[18px]')} />
              </CustomAvatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6'>Total Rusak</Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {summaryData.temuan_rusak}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant='h6' sx={{ marginBottom: 2, marginTop: 2, fontWeight: 'bold' }}>
            Temuan
          </Typography>
          <Box sx={{ display: 'flexWrap', flexDirection: 'row', gap: 2 }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              sx={{ borderRadius: 10, marginBottom: 2, marginRight: 2 }}
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
                  {summaryData.total_belum_diproses}
                </Typography>
              }
            >
              Belum Diproses
            </Button>
            <Button
              variant='contained'
              size='small'
              color='info'
              sx={{ borderRadius: 10, marginBottom: 2, marginRight: 2 }}
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
                  {summaryData.total_sedang_diproses}
                </Typography>
              }
            >
              Sedang Diproses
            </Button>
            <Button
              variant='contained'
              size='small'
              color='warning'
              sx={{ borderRadius: 10, marginBottom: 2, marginRight: 2 }}
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
                  {summaryData.total_sudah_diproses}
                </Typography>
              }
            >
              Sudah Diproses
            </Button>
            <Button
              variant='contained'
              size='small'
              color='error'
              sx={{ borderRadius: 10, marginBottom: 2, marginRight: 2 }}
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
                  {summaryData.total_tidak_dapat_diproses}
                </Typography>
              }
            >
              Tidak Dapat Diproses
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default CardFormal
