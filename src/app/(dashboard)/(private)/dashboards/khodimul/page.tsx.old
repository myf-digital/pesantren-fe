'use client'

import { useState, forwardRef, useEffect } from 'react'

import { Box, Card, Grid2 as Grid, TextField, Typography } from '@mui/material'

import { format } from 'date-fns'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CardKhodimul from './CardKhodimul'
import { fetchSummaryKhodimul } from './slice'

import { useAppDispatch } from '@/redux-store/hook'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const Dashboard = () => {
  const dispatch = useAppDispatch()

  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const [summaryData, setSummaryData] = useState<any>([])

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }

  useEffect(() => {
    const getSummaryKhodimul = async () => {
      const result = await dispatch(
        fetchSummaryKhodimul({
          tanggal_mulai: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          tanggal_selesai: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
        })
      ).unwrap()

      const { data } = result

      if (data.length > 0) {
        setSummaryData(data)
      }
    }

    endDate && getSummaryKhodimul()
  }, [endDate])

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5, overflow: 'visible' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                Dashboard Khodimul
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
      <Grid size={12}>
        {summaryData.map((r: any, index: number) => {
          return <CardKhodimul key={index} {...r} tanggal_mulai={startDate} tanggal_selesai={endDate} />
        })}
      </Grid>
    </Grid>
  )
}

export default Dashboard
