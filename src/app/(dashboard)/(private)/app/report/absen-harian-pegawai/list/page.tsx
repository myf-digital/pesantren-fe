'use client'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  Card,
  CardHeader,
  TextField,
  Toolbar,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchAbsenHarianPage,
  postAbsenHarianExport,
  resetRedux
} from '../../../pegawai-absen-harian/slice/index'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import { useCan } from '@/hooks/useCan'
import { format, startOfWeek } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const calculateDuration = (masukStr: any, keluarStr: any) => {
  if (!masukStr || !keluarStr) return '-'
  try {
    const masuk = new Date(masukStr)
    const keluar = new Date(keluarStr)
    const diffMs = keluar.getTime() - masuk.getTime()
    if (diffMs <= 0) return '-'
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours > 0) {
      return `${hours} jam ${mins} menit`
    }
    return `${mins} menit`
  } catch {
    return '-'
  }
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const AbsenHarianPegawaiReportList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_harian_pegawai)

  // Read initial filters from URL params if any
  const initialStatus = searchParams.get('status') || 'Semua'
  const initialTanggalMulai = searchParams.get('tanggal_mulai')
  const initialTanggalSelesai = searchParams.get('tanggal_selesai')

  const canExport = useCan('export')

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(
    initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(
    initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date()
  )
  const [status, setStatus] = useState(initialStatus)
  const [searchTyped, setSearchTyped] = useState('')

  // State Snapshot Filter Sah
  const [currentFilters, setCurrentFilters] = useState<any>({
    tanggal_awal: initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 }),
    tanggal_akhir: initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date(),
    status: initialStatus,
    searchTyped: ''
  })
  const [isFilterApplied, setIsFilterApplied] = useState(true)

  // State Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Fungsi Fetch Data
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      dispatch(
        fetchAbsenHarianPage({
          page: currentPage,
          perPage: currentPerPage,
          tanggal_awal: filters.tanggal_awal
            ? format(new Date(filters.tanggal_awal), 'yyyy-MM-dd')
            : '',
          tanggal_akhir: filters.tanggal_akhir
            ? format(new Date(filters.tanggal_akhir), 'yyyy-MM-dd')
            : '',
          status: filters.status !== 'Semua' ? filters.status : undefined,
          keyword: filters.searchTyped || undefined
        })
      )
    },
    [dispatch]
  )

  // Efek pagination
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters)
    }
  }, [page, perPage, isFilterApplied, currentFilters, executeFetchData])

  const handleSearchSubmit = () => {
    const filters = {
      tanggal_awal: tanggalAwal || '',
      tanggal_akhir: tanggalAkhir || '',
      status,
      searchTyped
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  const handleResetFilter = () => {
    const defaultTanggalAwal = startOfWeek(new Date(), { weekStartsOn: 1 })
    const defaultTanggalAkhir = new Date()
    const filters = {
      tanggal_awal: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      tanggal_akhir: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      status: 'Semua',
      searchTyped: ''
    }

    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setStatus('Semua')
    setSearchTyped('')

    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data terlebih dahulu sebelum export')
      return
    }
    try {
      setLoadingExport(true)
      const res = await dispatch(
          postAbsenHarianExport({
            tanggal_awal: currentFilters.tanggal_awal
              ? format(new Date(currentFilters.tanggal_awal), 'yyyy-MM-dd')
              : undefined,
            tanggal_akhir: currentFilters.tanggal_akhir
              ? format(new Date(currentFilters.tanggal_akhir), 'yyyy-MM-dd')
              : undefined,
            status: currentFilters.status !== 'Semua' ? currentFilters.status : undefined,
            q: currentFilters.searchTyped || undefined
          })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.click()
      }
    } catch {
      toast.error('Gagal export data excel')
    } finally {
      setLoadingExport(false)
    }
  }

  const buildTable = () => {
    const { dataPage } = store
    const tableValues = isFilterApplied ? dataPage?.values || [] : []
    const tableCount = isFilterApplied ? dataPage?.total || 0 : 0

    return {
      page: page,
      fields: [
        tableColumn('TANGGAL', 'tanggal_display'),
        tableColumn('NAMA PEGAWAI', 'nama_pegawai'),
        tableColumn('LOG MASUK', 'masuk_display'),
        tableColumn('LOG KELUAR', 'keluar_display'),
        tableColumn('DURASI', 'durasi_display'),
        tableColumn('STATUS', 'status_display'),
        tableColumn('KETERANGAN', 'keterangan_display')
      ],
      values: tableValues.map((row: any) => ({
        ...row,
        tanggal_display: row.tanggal ? format(new Date(row.tanggal), 'dd/MM/yyyy') : '-',
        nama_pegawai: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {row.pegawai?.nama_lengkap || '-'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              <Typography variant='caption' color='text.secondary'>
                NIP: {row.pegawai?.nip || '-'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                NIK: {row.pegawai?.nik || '-'}
              </Typography>
            </Box>
          </Box>
        ),
        masuk_display: row.waktu_masuk ? format(new Date(row.waktu_masuk), 'HH:mm:ss') : '-',
        keluar_display: row.waktu_keluar ? format(new Date(row.waktu_keluar), 'HH:mm:ss') : '-',
        durasi_display: calculateDuration(row.waktu_masuk, row.waktu_keluar),
        keterangan_display: (
          <Box sx={{ width: 250, minWidth: 250, whiteSpace: 'normal', wordBreak: 'break-word' }}>
            <Typography variant='caption' display='block'>
              Masuk: {row.keterangan_masuk || '-'}
            </Typography>
            <Typography variant='caption' display='block'>
              Keluar: {row.keterangan_keluar || '-'}
            </Typography>
          </Box>
        ),
        status_display: (
          <Chip
            label={row.status_kehadiran}
            size='small'
            color={
              row.status_kehadiran === 'Hadir'
                ? 'success'
                : row.status_kehadiran === 'Izin'
                  ? 'info'
                  : row.status_kehadiran === 'Sakit'
                    ? 'warning'
                    : 'error'
            }
            variant='tonal'
          />
        )
      })),
      count: tableCount,
      perPage: perPage,
      changePage: (_: any, n: number) => setPage(n + 1),
      changePerPage: (e: any) => {
        setPerPage(parseInt(e.target.value, 10))
        setPage(1)
      }
    }
  }

  return (
    <Grid container spacing={6}>
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select label='Status' value={status} onChange={e => setStatus(e.target.value)}>
                  <MenuItem value='Semua'>Semua</MenuItem>
                  <MenuItem value='Hadir'>Hadir</MenuItem>
                  <MenuItem value='Izin'>Izin</MenuItem>
                  <MenuItem value='Sakit'>Sakit</MenuItem>
                  <MenuItem value='Alfa'>Alfa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label='Cari Nama / NIP'
                size='small'
                placeholder='Ketik nama / NIP...'
                value={searchTyped}
                onChange={e => setSearchTyped(e.target.value)}
                onKeyDown={handleKeyPress}
              />
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

        <Card>
          <CardHeader title='Laporan Absensi Harian Pegawai' />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default AbsenHarianPegawaiReportList
