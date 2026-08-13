import React, { useEffect, useState, forwardRef } from 'react'

import { Autocomplete, CircularProgress, Grid2 as Grid, TextField, Typography } from '@mui/material'

import { format } from 'date-fns'

import CRMCard from './Card'
import ScrollRow from './Scroll'

import { useAppDispatch } from '@/redux-store/hook'

import { fetchSummaryLembagaNonFormal } from './slice'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { fetchKelasList } from '../../app/absen-kelas-santri/slice'

interface LokasiOption {
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

  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [listLokasi, setListLokasi] = useState<LokasiOption[]>([])
  const [loadingLokasi, setLoadingLokasi] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  useEffect(() => {
    const getLokasiMaster = async () => {
      try {
        setLoadingLokasi(true)
        const result = await dispatch(fetchKelasList({})).unwrap()

        const valuesData = result?.data || result || []

        const formatted = valuesData
          .filter((c: any) => c.id_lembaga == res.id_lembaga && c.type == 'MDA')
          .map((c: any) => ({
            id_lokasi: c.id_kelas,
            nama_lokasi: c.nama_kelas
          }))

        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...formatted])
      } catch {
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingLokasi(false)
      }
    }

    res.isMounted && getLokasiMaster()
  }, [dispatch, res.isMounted])

  useEffect(() => {
    const getSummaryLembagaNonFormal = async () => {
      const result = await dispatch(
        fetchSummaryLembagaNonFormal({
          tanggal_mulai: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
          id_cabang: res.id_cabang,
          id_lembaga: res.id_lembaga,
          id_lokasi: selectedLokasi?.id_lokasi || ''
        })
      ).unwrap()

      const { data } = result

      if (data) {
        setSummaryData(data)
      }
    }

    res.isMounted && getSummaryLembagaNonFormal()
  }, [selectedLokasi, startDate, endDate, res.isMounted])

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
          options={listLokasi}
          loading={loadingLokasi}
          value={selectedLokasi}
          onChange={(_, newValue) => setSelectedLokasi(newValue)}
          getOptionLabel={option => option.nama_lokasi || ''}
          isOptionEqualToValue={(option, value) => option.id_lokasi === value?.id_lokasi}
          renderInput={params => (
            <TextField
              {...params}
              label='Kelas'
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
      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Absensi Kelas Santri
        </Typography>
      </Grid>
      <ScrollRow>
        <CRMCard
          title='Total Absensi'
          subtitle='Kehadiran'
          stats={`${summaryData.total_absensi_kelas.persentase}%`}
          avatarColor='success'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.hadir.toLocaleString('id-ID')} Hadir`}
          chipColor='success'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Hadir&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Izin'
          subtitle='Santri Izin'
          stats={summaryData.total_absensi_kelas.izin.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_izin}%`}
          chipColor='info'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Izin&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Sakit'
          subtitle='Santri Sakit'
          stats={summaryData.total_absensi_kelas.sakit.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-user-exclamation'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_sakit}%`}
          chipColor='warning'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Sakit&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Alfa'
          subtitle='Santri Alfa'
          stats={summaryData.total_absensi_kelas.alfa.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_kelas.persentase_alfa}%`}
          chipColor='error'
          chipVariant='tonal'
          href={`/app/report/absen-kelas-santri/list?status=Alfa&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
      </ScrollRow>
      <Grid size={12}>
        <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
          Absensi Pegawai
        </Typography>
      </Grid>
      <ScrollRow>
        <CRMCard
          title='Total Absensi'
          subtitle='Kehadiran'
          stats={`${summaryData.total_absensi_pegawai.persentase}%`}
          avatarColor='success'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_pegawai.hadir.toLocaleString('id-ID')} Hadir`}
          chipColor='success'
          chipVariant='tonal'
          href={`/app/report/absen-harian-pegawai/list?status=Hadir&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Izin'
          subtitle='Pegawai Izin'
          stats={summaryData.total_absensi_pegawai.izin.toLocaleString('id-ID')}
          avatarColor='info'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_pegawai.persentase_izin}%`}
          chipColor='info'
          chipVariant='tonal'
          href={`/app/report/absen-harian-pegawai/list?status=Izin&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Sakit'
          subtitle='Pegawai Sakit'
          stats={summaryData.total_absensi_pegawai.sakit.toLocaleString('id-ID')}
          avatarColor='warning'
          avatarIcon='tabler-user-exclamation'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_pegawai.persentase_sakit}%`}
          chipColor='warning'
          chipVariant='tonal'
          href={`/app/report/absen-harian-pegawai/list?status=Sakit&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
        <CRMCard
          title='Absensi Alfa'
          subtitle='Pegawai Alfa'
          stats={summaryData.total_absensi_pegawai.alfa.toLocaleString('id-ID')}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
          chipText={`${summaryData.total_absensi_pegawai.persentase_alfa}%`}
          chipColor='error'
          chipVariant='tonal'
          href={`/app/report/absen-harian-pegawai/list?status=Alfa&tanggal_mulai=${format(startDate || '', 'yyyy-MM-dd')}&tanggal_selesai=${format(startDate || endDate || '', 'yyyy-MM-dd')}`}
        />
      </ScrollRow>
    </Grid>
  )
}

export default Component
