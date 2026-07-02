'use client'

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Chip,
  TableCell,
  IconButton,
  Menu,
  Button
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchPerizinanSantriPage, postPerizinanExport } from '../../../perizinan-santri/slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'

import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import { format, startOfWeek } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

function RowAction({ row }: { row: any }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/app/perizinan-pegawai/detail?id=${row.id_izin}&view=true`}
          onClick={() => setAnchorEl(null)}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
      </Menu>
    </>
  )

  if (isMobile) {
    return <Box sx={{ display: 'inline-block' }}>{content}</Box>
  }

  return (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      {content}
    </TableCell>
  )
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const PerizinanPegawaiReportList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  const canExport = useCan('export')

  // Read initial filter from URL params if any (e.g. crm dashboard link)
  const initialStatus = searchParams.get('status') || 'Semua'
  const initialKondisi = searchParams.get('kondisi') || 'Semua'
  const initialTanggalMulai = searchParams.get('tanggal_mulai')
  const initialTanggalSelesai = searchParams.get('tanggal_selesai')

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filterText, setFilterText] = useState('')
  const [loadingExport, setLoadingExport] = useState(false)

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(
    initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(
    initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date()
  )
  const [statusApproval, setStatusApproval] = useState(initialStatus)
  const [jenisIzin, setJenisIzin] = useState('Semua')
  const [kondisi, setKondisi] = useState(initialKondisi)
  const [searchTyped, setSearchTyped] = useState('')

  const executeFetchData = useCallback(
    (overrides?: any) => {
      const activeStatus = overrides?.status_approval !== undefined ? overrides.status_approval : statusApproval
      const activeJenis = overrides?.jenis_izin !== undefined ? overrides.jenis_izin : jenisIzin
      const activeKondisi = overrides?.kondisi !== undefined ? overrides.kondisi : kondisi

      dispatch(
        fetchPerizinanSantriPage({
          page: overrides?.page !== undefined ? overrides.page : page,
          perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
          start_date:
            overrides?.start_date !== undefined
              ? overrides.start_date
              : tanggalAwal
                ? format(tanggalAwal, 'yyyy-MM-dd')
                : '',
          end_date:
            overrides?.end_date !== undefined
              ? overrides.end_date
              : tanggalAkhir
                ? format(tanggalAkhir, 'yyyy-MM-dd')
                : '',
          status_approval: activeStatus !== 'Semua' ? activeStatus : undefined,
          jenis_izin: activeJenis !== 'Semua' ? activeJenis : undefined,
          kondisi: activeKondisi !== 'Semua' ? activeKondisi : undefined,
          keyword: overrides?.keyword !== undefined ? overrides.keyword : searchTyped,
          is_pegawai: true
        })
      )
    },
    [dispatch, page, perPage, tanggalAwal, tanggalAkhir, statusApproval, jenisIzin, kondisi, searchTyped]
  )

  const executeFetchRef = useRef(executeFetchData)
  useEffect(() => {
    executeFetchRef.current = executeFetchData
  }, [executeFetchData])

  useEffect(() => {
    executeFetchRef.current({ page: 1, keyword: filterText })
  }, [filterText, perPage])

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage)
    executeFetchRef.current({ page: newPage })
  }, [])

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
    setStatusApproval('Semua')
    setJenisIzin('Semua')
    setKondisi('Semua')
    setSearchTyped('')
    setPage(1)

    executeFetchData({
      page: 1,
      start_date: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      end_date: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      status_approval: 'Semua',
      jenis_izin: 'Semua',
      kondisi: 'Semua',
      keyword: ''
    })
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postPerizinanExport({
          keyword: searchTyped || undefined,
          status_approval: statusApproval !== 'Semua' ? statusApproval : undefined,
          jenis_izin: jenisIzin !== 'Semua' ? jenisIzin : undefined,
          start_date: tanggalAwal ? format(tanggalAwal, 'yyyy-MM-dd') : undefined,
          end_date: tanggalAkhir ? format(tanggalAkhir, 'yyyy-MM-dd') : undefined,
          is_pegawai: true
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

  const renderOption = (row: any) => {
    return <RowAction row={row} />
  }

  const buildTable = () => {
    const { dataPage } = store
    const values = dataPage?.values || []
    const total = dataPage?.total || 0

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('NAMA PEGAWAI', 'nama_pegawai'),
        tableColumn('NIP', 'nip'),
        tableColumn('JENIS IZIN', 'jenis_izin'),
        tableColumn('TANGGAL MULAI', 'tanggal_mulai_display'),
        tableColumn('TANGGAL SELESAI', 'tanggal_selesai_display'),
        tableColumn('KONDISI', 'kondisi_display'),
        tableColumn('STATUS APPROVAL', 'status_display')
      ],
      values: values.map((row: any) => ({
        ...row,
        nama_pegawai: row.pegawai?.nama_lengkap || '-',
        nip: row.pegawai?.nip || '-',
        tanggal_mulai_display: row.tanggal_mulai ? format(new Date(row.tanggal_mulai), 'dd/MM/yyyy') : '-',
        tanggal_selesai_display: row.tanggal_selesai ? format(new Date(row.tanggal_selesai), 'dd/MM/yyyy') : '-',
        kondisi_display: (
          <Chip
            label={row.kondisi || 'Normal'}
            size='small'
            color={row.kondisi === 'Overdue' ? 'error' : row.kondisi === 'Closed' ? 'success' : 'secondary'}
            variant='tonal'
          />
        ),
        status_display: (
          <Chip
            label={row.status_approval}
            size='small'
            color={
              row.status_approval === 'Disetujui' ? 'success' : row.status_approval === 'Menunggu' ? 'warning' : 'error'
            }
            variant='tonal'
          />
        )
      })),
      count: total,
      perPage: perPage,
      changePage: (_: any, newPage: number) => {
        handleChangePage(newPage + 1)
      },
      changePerPage: (event: any) => {
        handleChangePerPage(event)
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

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select label='Status' value={statusApproval} onChange={e => setStatusApproval(e.target.value)}>
                  <MenuItem value='Semua'>Semua</MenuItem>
                  <MenuItem value='Menunggu'>Menunggu</MenuItem>
                  <MenuItem value='Disetujui'>Disetujui</MenuItem>
                  <MenuItem value='Ditolak'>Ditolak</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Jenis Izin</InputLabel>
                <Select label='Jenis Izin' value={jenisIzin} onChange={e => setJenisIzin(e.target.value)}>
                  <MenuItem value='Semua'>Semua</MenuItem>
                  <MenuItem value='Izin'>Izin</MenuItem>
                  <MenuItem value='Sakit'>Sakit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Kondisi</InputLabel>
                <Select label='Kondisi' value={kondisi} onChange={e => setKondisi(e.target.value)}>
                  <MenuItem value='Semua'>Semua</MenuItem>
                  <MenuItem value='Normal'>Normal</MenuItem>
                  <MenuItem value='Closed'>Closed</MenuItem>
                  <MenuItem value='Overdue'>Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

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
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
          </Toolbar>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardHeader title='Laporan Perizinan Pegawai' sx={{ paddingBottom: 0 }} />
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
              <TextField
                label='Cari...'
                size='small'
                value={searchTyped}
                onChange={e => setSearchTyped(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default PerizinanPegawaiReportList
