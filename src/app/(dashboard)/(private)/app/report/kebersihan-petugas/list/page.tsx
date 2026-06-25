'use client'

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { TextField, Toolbar } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { format, startOfWeek } from 'date-fns'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchKebersihanPetugasPage, postExportPetugas } from '../../../kebersihan-inspeksi/slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const TableKebersihanPetugas = () => {
  // ** Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kebersihan_inspeksi)

  const canExport = useCan('export')

  // Read initial filters from URL params
  const initialQ = searchParams.get('q') || ''
  const initialTanggalMulai = searchParams.get('tanggal_mulai')
  const initialTanggalSelesai = searchParams.get('tanggal_selesai')

  const [filter, setFilter] = useState(initialQ)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Opsi Data Dropdown Master

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(
    initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(
    initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date()
  )

  const [searchTyped, setSearchTyped] = useState(initialQ)

  const executeFetchData = useCallback(
    (overrides?: any) => {
      dispatch(
        fetchKebersihanPetugasPage({
          page: overrides?.page !== undefined ? overrides.page : page,
          perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
          tanggal_awal: overrides?.tanggal_awal !== undefined ? overrides.tanggal_awal : tanggalAwal || '',
          tanggal_akhir: overrides?.tanggal_akhir !== undefined ? overrides.tanggal_akhir : tanggalAkhir || '',
          q: overrides?.q !== undefined ? overrides.q : searchTyped
        })
      )
    },
    [dispatch, page, perPage, tanggalAwal, tanggalAkhir, searchTyped]
  )

  const executeFetchRef = useRef(executeFetchData)

  useEffect(() => {
    executeFetchRef.current = executeFetchData
  }, [executeFetchData])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      executeFetchRef.current({ page: 1, q: filter })
    }, 500)

    return () => clearTimeout(timer)
  }, [filter, perPage])

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage)
    executeFetchRef.current({ page: newPage })
  }, [])

  const onExport = async () => {
    try {
      setLoadingExport(true)

      const res = await dispatch(
        postExportPetugas({
          q: searchTyped,
          tanggal_awal: tanggalAwal || '',
          tanggal_akhir: tanggalAkhir || ''
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')

        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        toast.error(res?.message || 'Gagal export data')
      }
    } catch {
      toast.error('Terjadi kesalahan saat export data')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    executeFetchData({ page: 1, perPage: newPerPage })
  }

  const handleSearchSubmit = () => {
    setPage(1)
    executeFetchData({ page: 1 })
  }

  const handleResetFilter = () => {
    const defaultTanggalAwal = startOfWeek(new Date(), { weekStartsOn: 1 })
    const defaultTanggalAkhir = new Date()

    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setSearchTyped('')
    setPage(1)

    executeFetchData({
      page: 1,
      id_cabang: '',
      id_lokasi: '',
      id_petugas: '',
      tanggal_awal: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      tanggal_akhir: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      status: '',
      status_kondisi: '',
      q: ''
    })
  }

  const buildTable = () => {
    const { dataPagePetugas } = store

    if (dataPagePetugas) {
      const { values, total } = dataPagePetugas

      return {
        page: page,
        fields: [
          tableColumn('PETUGAS', 'nama_lengkap'),
          tableColumn('JADWAL', 'total_jadwal'),
          tableColumn('INSPEKSI', 'inspeksi'),
          tableColumn('TIDAK INSPEKSI', 'tidak_inspeksi'),
          tableColumn('TEMUAN', 'total_temuan')
        ],
        values: values?.map((row: any) => {
          return {
            ...row
          }
        }),
        count: total,
        perPage: perPage,
        changePage: (_: any, newPage: number) => {
          handleChangePage(newPage + 1)
        },
        changePerPage: (event: any, o: any) => {
          handleChangePerPage(event)
        }
      }
    }
  }

  return (
    <Grid container spacing={6} sx={{ width: '100%' }}>
      <Grid size={12}>
        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppReactDatepicker
                selected={tanggalAwal}
                onChange={(date: Date | null) => setTanggalAwal(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent label='Tanggal Awal' />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <AppReactDatepicker
                selected={tanggalAkhir}
                onChange={(date: Date | null) => setTanggalAkhir(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent label='Tanggal Akhir' />}
              />
            </Grid>
          </Grid>

          {/* BARIS UTILITY BUTTONS */}
          <Toolbar sx={{ px: '0px !important', gap: 2, flexWrap: 'wrap', minHeight: 'auto' }}>
            <Button
              variant='contained'
              color='info'
              startIcon={<i className='tabler-search' />}
              onClick={handleSearchSubmit}
            >
              Cari
            </Button>

            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='tabler-refresh' />}
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>

            {canExport && (
              <Button
                color='success'
                variant='contained'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
              >
                {loadingExport ? 'Proses...' : 'Export CSV'}
              </Button>
            )}
          </Toolbar>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardHeader title='Petugas Kebersihan' sx={{ paddingBottom: 0 }} />
          <Toolbar
            sx={{
              px: '1.5rem !important',
              minHeight: 'auto',
              gap: 2,
              flexWrap: 'wrap',
              mb: '10px'
            }}
          >
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' label='Cari...' size='small' value={filter} onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default TableKebersihanPetugas
