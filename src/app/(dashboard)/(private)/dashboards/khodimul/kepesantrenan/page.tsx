'use client'

import { useState, useEffect, forwardRef } from 'react'

import { useSearchParams } from 'next/navigation'

import { Box, Card, Grid2 as Grid, TextField, Typography } from '@mui/material'

import { useAppDispatch } from '@/redux-store/hook'
import { fetchCabangAll } from '../../../app/cabang/slice'
import CardKepesantrenan from '../CardKepesantrenan'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const Dashboard = () => {
  const dispatch = useAppDispatch()

  const searchParams = useSearchParams()

  const initialTanggalMulai = searchParams.get('tanggal_mulai')
  const initialTanggalSelesai = searchParams.get('tanggal_selesai')

  const [cabang, setCabang] = useState<any>([])

  const [startDate, setStartDate] = useState<Date | null>(
    initialTanggalMulai ? new Date(initialTanggalMulai) : new Date()
  )

  const [endDate, setEndDate] = useState<Date | null>(
    initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date()
  )

  const getDataCabang = async () => {
    const res = await dispatch(fetchCabangAll({})).unwrap()
    const { data } = res

    if (data) {
      setCabang(data)
    }
  }

  useEffect(() => {
    getDataCabang()
  }, [])

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5, overflow: 'visible' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                Dashboard Kepesantrenan
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Data per rentang tanggal terpilih
              </Typography>
            </Box>
            <Box sx={{ width: 300 }}>
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
            </Box>
          </Box>
        </Card>
      </Grid>
      {cabang.map((r: any, index: number) => {
        return (
          <CardKepesantrenan
            key={r.id_cabang}
            id_cabang={r.id_cabang}
            nama_cabang={r.nama_cabang}
            tanggal_mulai={startDate}
            tanggal_selesai={endDate}
          />
        )
      })}
    </Grid>
  )
}

export default Dashboard
