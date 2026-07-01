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
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Box,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchAbsenSantriPage,
  deleteAbsenSantri,
  postAbsenExport,
  fetchMatchingShiftAsrama,
  resetRedux
} from '../../../absen-harian-santri/slice'

import { fetchLocationPage } from '../../../location/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import { format, startOfWeek } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface ShiftOption {
  id_shift: string
  nama_shift: string
}

interface KamarOption {
  id_lokasi: string
  nama_lokasi: string
}

// Komponen Aksi Baris Tabel
const RowAction = ({ row }: { row: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
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
          href={`/app/report/absen-harian-santri/form?id=${row.id_absen}&view=true&mode=kolektif&tanggal=${row.tanggal}&id_lokasi_kamar=${row.id_lokasi_kamar}&id_shift_presensi=${row.id_shift_presensi}&nama_shift=${row.shiftPresensi?.nama_shift || ''}&nama_lokasi=${row.lokasiKamar?.nama_lokasi || ''}`}
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

const AbsenHarianSantriList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_harian_santri)

  // Read initial filters from URL params
  const initialStatus = searchParams.get('status') || 'Semua'
  const initialTanggalMulai = searchParams.get('tanggal_mulai')
  const initialTanggalSelesai = searchParams.get('tanggal_selesai')

  // Permission Hooks
  const canExport = useCan('export')

  // Opsi Data Dropdown Master
  const [listShift, setListShift] = useState<ShiftOption[]>([])
  const [listKamar, setListKamar] = useState<KamarOption[]>([])
  const [loadingShift, setLoadingShift] = useState(false)
  const [loadingKamar, setLoadingKamar] = useState(false)

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(
    initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(
    initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date()
  )
  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>({ id_shift: '', nama_shift: 'Semua' })
  const [selectedKamar, setSelectedKamar] = useState<KamarOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [status, setStatus] = useState(initialStatus)
  const [searchTyped, setSearchTyped] = useState('')

  // State Snapshot Filter Sah (Mencegah Auto Fetch)
  const [currentFilters, setCurrentFilters] = useState<any>({
    tanggal_awal: initialTanggalMulai ? new Date(initialTanggalMulai) : startOfWeek(new Date(), { weekStartsOn: 1 }),
    tanggal_akhir: initialTanggalSelesai ? new Date(initialTanggalSelesai) : new Date(),
    idShift: '',
    idLokasi: '',
    status: initialStatus,
    searchTyped: ''
  })
  const [isFilterApplied, setIsFilterApplied] = useState(true)

  // State Pagination & Loading Utama
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Ambil Master Data Shift via fetchMatchingShiftAsrama
  useEffect(() => {
    const getShiftMaster = async () => {
      try {
        setLoadingShift(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const res = await dispatch(fetchMatchingShiftAsrama({ waktu_absen: waktuSekarang })).unwrap()

        if (res?.status && res?.data) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res])
        }
      } catch {
        setListShift([{ id_shift: '', nama_shift: 'Semua' }])
      } finally {
        setLoadingShift(false)
      }
    }
    getShiftMaster()
  }, [dispatch])

  // Ambil Master Data Lokasi Kamar via fetchLocationPage
  useEffect(() => {
    const getKamarMaster = async () => {
      try {
        setLoadingKamar(true)
        const res = await dispatch(fetchLocationPage({ page: 1, perPage: 50, keyword: 'kamar' })).unwrap()

        const valuesData = res?.data?.values || res?.values || []
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...valuesData])
      } catch {
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingKamar(false)
      }
    }
    getKamarMaster()
  }, [dispatch])

  // Fungsi Fetch Data Utama Log Tabel
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      dispatch(
        fetchAbsenSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          tanggal_awal: filters.tanggal_awal
            ? filters.tanggal_awal instanceof Date
              ? format(filters.tanggal_awal, 'yyyy-MM-dd')
              : filters.tanggal_awal
            : tanggalAwal
              ? format(tanggalAwal, 'yyyy-MM-dd')
              : '',
          tanggal_akhir: filters.tanggal_akhir
            ? filters.tanggal_akhir instanceof Date
              ? format(filters.tanggal_akhir, 'yyyy-MM-dd')
              : filters.tanggal_akhir
            : tanggalAkhir
              ? format(tanggalAkhir, 'yyyy-MM-dd')
              : '',
          id_shift_presensi: filters.idShift || undefined,
          id_lokasi_kamar: filters.idLokasi || undefined,
          status: filters.status !== 'Semua' ? filters.status : undefined,
          q: filters.searchTyped || undefined
        })
      )
    },
    [dispatch, tanggalAwal, tanggalAkhir]
  )

  // Efek pagination halaman
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters)
    }
  }, [page, perPage, isFilterApplied, currentFilters, executeFetchData])

  // Handler Kirim Filter Utama via Tombol Cari / Enter
  const handleSearchSubmit = () => {
    const filters = {
      tanggal_awal: tanggalAwal || '',
      tanggal_akhir: tanggalAkhir || '',
      idShift: selectedShift?.id_shift || '',
      idLokasi: selectedKamar?.id_lokasi || '',
      status,
      searchTyped
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  // Handler Reset Filter
  const handleResetFilter = () => {
    const defaultTanggalAwal = startOfWeek(new Date(), { weekStartsOn: 1 })
    const defaultTanggalAkhir = new Date()
    const filters = {
      tanggal_awal: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      tanggal_akhir: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      idShift: '',
      idLokasi: '',
      status: 'Semua',
      searchTyped: ''
    }

    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setSelectedShift(listShift.find(s => s.id_shift === '') || null)
    setSelectedKamar(listKamar.find(k => k.id_lokasi === '') || null)
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
        postAbsenExport({
          tanggal_awal: currentFilters.tanggal_awal,
          tanggal_akhir: currentFilters.tanggal_akhir,
          id_shift_presensi: currentFilters.idShift || undefined,
          id_lokasi_kamar: currentFilters.idLokasi || undefined,
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

  const renderOption = (row: any) => {
    return <RowAction row={row} />
  }

  const buildTable = () => {
    const { dataPage } = store
    const tableValues = isFilterApplied ? dataPage?.values || [] : []
    const tableCount = isFilterApplied ? dataPage?.total || 0 : 0

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('LOKASI', 'lokasi'),
        tableColumn('PETUGAS', 'petugas'),
        tableColumn('PRESENSI', 'presensi'),
        tableColumn('NAMA SANTRI', 'santri'),
        tableColumn('TANGGAL', 'tanggal'),
        tableColumn('WAKTU', 'waktu_absen'),
        tableColumn('STATUS', 'status_display')
      ],
      values: tableValues.map((row: any) => ({
        ...row,
        lokasi: row.lokasiKamar?.nama_lokasi || '-',
        presensi: row.shiftPresensi?.nama_shift || '-',
        petugas: row.petugas?.nama_lengkap || row.resource?.full_name || '-',
        tanggal: row.tanggal ? format(new Date(row.tanggal), 'dd/MM/yyyy') : '-',
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
        ),
        santri: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              minWidth: 0,
              width: '100%'
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={row?.santri?.fullname}
              >
                {row?.santri?.fullname}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start', mt: 0.5 }}>
                <Typography
                  variant='caption'
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    color: 'text.secondary',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  NIS: {row?.santri?.nis || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
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
          {/* PANEL FILTER DENGAN SELECTABLE SEARCH AUTOCOMPLETE */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 2.4 }}>
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

            <Grid size={{ xs: 12, sm: 2.4 }}>
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

            {/* SELECTABLE SEARCH: SHIFT PRESENSI */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Autocomplete
                size='small'
                options={listShift}
                loading={loadingShift}
                value={selectedShift}
                onChange={(_, newValue) => setSelectedShift(newValue)}
                getOptionLabel={option => option.nama_shift || ''}
                isOptionEqualToValue={(option, value) => option.id_shift === value?.id_shift}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Shift'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingShift ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* SELECTABLE SEARCH: LOKASI KAMAR */}
            <Grid size={{ xs: 12, sm: 2.4 }}>
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

            <Grid size={{ xs: 12, sm: 2.4 }}>
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

            <Grid size={{ xs: 12, sm: 2.4 }}>
              <TextField
                fullWidth
                label='Cari Nama / NIS'
                size='small'
                placeholder='Ketik nama / NIS...'
                value={searchTyped}
                onChange={e => setSearchTyped(e.target.value)}
                onKeyDown={handleKeyPress}
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
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
          </Toolbar>
        </Card>

        {/* LOG DATA UTAMA RENDERING */}
        <Card>
          <CardHeader title='Daftar Absensi Harian Santri' />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default AbsenHarianSantriList
