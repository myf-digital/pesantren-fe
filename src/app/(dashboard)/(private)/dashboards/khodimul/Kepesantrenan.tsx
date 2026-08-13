import React, { useEffect, useState, forwardRef } from 'react'

import { Autocomplete, CircularProgress, Grid2 as Grid, TextField, Typography } from '@mui/material'

import { format } from 'date-fns'

import CRMCard from './Card'
import ScrollRow from './Scroll'

import { fetchLocationPage } from '../../app/location/slice'

import { useAppDispatch } from '@/redux-store/hook'

import { fetchSummaryKepesantrenan } from './slice'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface KamarOption {
  id_lokasi: string
  nama_lokasi: string
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const Component = ({ ...res }) => {
  const dispatch = useAppDispatch()

  const [summaryData, setSummaryData] = React.useState<any>({
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

  const [selectedKamar, setSelectedKamar] = useState<KamarOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [listKamar, setListKamar] = useState<KamarOption[]>([])
  const [loadingKamar, setLoadingKamar] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  useEffect(() => {
    const getKamarMaster = async () => {
      try {
        setLoadingKamar(true)
        const result = await dispatch(fetchLocationPage({ page: 1, perPage: 1000, keyword: 'kamar' })).unwrap()

        const valuesData = result?.data?.values || result?.values || []

        setListKamar([
          { id_lokasi: '', nama_lokasi: 'Semua' },
          ...valuesData.filter((c: any) => c.id_cabang == res.id_cabang)
        ])
      } catch {
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingKamar(false)
      }
    }

    res.isMounted && getKamarMaster()
  }, [dispatch, res.isMounted])

  useEffect(() => {
    const getSummaryKepesantrenan = async () => {
      const result = await dispatch(
        fetchSummaryKepesantrenan({
          tanggal_mulai: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
          id_cabang: res.id_cabang,
          id_lokasi: selectedKamar?.id_lokasi || ''
        })
      ).unwrap()

      const { data } = result

      if (data) {
        setSummaryData(data)
      }
    }

    res.isMounted && getSummaryKepesantrenan()
  }, [selectedKamar, startDate, endDate, res.isMounted])

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <AppReactDatepicker
          selectsRange
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          selected={startDate || undefined}
          onChange={handleDateChange}
          placeholderText='Pilih Rentang Tanggal'
          dateFormat='dd/MM/yyyy'
          customInput={<PickersComponent label='Rentang Tanggal' />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
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
      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Absensi Kamar Santri
        </Typography>
      </Grid>
      <ScrollRow>
        <CRMCard
          title='Total Absensi'
          subtitle='Kehadiran'
          stats={`${summaryData.total_absensi.persentase}%`}
          avatarColor='success'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.hadir.toLocaleString('id-ID')} Hadir`}
          chipColor='success'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Hadir&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Izin'
          subtitle='Santri Izin'
          stats={summaryData.total_absensi.izin.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_izin}%`}
          chipColor='info'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Izin&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Sakit'
          subtitle='Santri Sakit'
          stats={summaryData.total_absensi.sakit.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-user-exclamation'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_sakit}%`}
          chipColor='warning'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Sakit&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Alfa'
          subtitle='Santri Alfa'
          stats={summaryData.total_absensi.alfa.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi.persentase_alfa}%`}
          chipColor='error'
          chipVariant='tonal'
          href={`/app/report/absen-harian-santri/list?status=Alfa&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
      </ScrollRow>
      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Perizinan Santri
        </Typography>
      </Grid>
      <ScrollRow>
        <CRMCard
          title='Perizinan Menunggu'
          subtitle='Menunggu Approval'
          stats={summaryData.perizinan_menunggu.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-hourglass'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?status=Menunggu&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Perizinan Disetujui'
          subtitle='Telah Disetujui'
          stats={summaryData.perizinan_disetujui.toLocaleString('id-ID')}
          avatarColor='success'
          avatarIcon='tabler-circle-check'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?status=Disetujui&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Perizinan Overdue'
          subtitle='Terlambat Kembali'
          stats={summaryData.perizinan_overdue.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-clock'
          avatarSkin='light'
          avatarSize={44}
          href={`/app/report/perizinan-santri/list?kondisi=Overdue&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
      </ScrollRow>
    </Grid>
  )
}

export default Component
