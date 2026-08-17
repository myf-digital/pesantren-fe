'use client'

import { useState, useEffect } from 'react'

import { Grid2 as Grid } from '@mui/material'

import { useAppDispatch } from '@/redux-store/hook'
import { fetchCabangAll } from '../../../app/cabang/slice'
import CardKepesantrenan from '../CardKepesantrenan'

const Dashboard = () => {
  const dispatch = useAppDispatch()

  const [cabang, setCabang] = useState<any>([])

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

  return (
    <Grid container spacing={6}>
      {cabang.map((r: any, index: number) => {
        return <CardKepesantrenan key={r.id_cabang} id_cabang={r.id_cabang} nama_cabang={r.nama_cabang} />
      })}
    </Grid>
  )
}

export default Dashboard
