'use client'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  TextField,
  Toolbar,
  Button,
  Chip,
  Autocomplete,
  CircularProgress,
  Box,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchJurnalKelasPage,
  fetchKelasList,
  fetchMatchingJamPelajaran,
  postJurnalKelasExport
} from '../../../absen-kelas-santri/slice/index'
import { fetchLembagaFormalAll } from '../../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../../lembaga-kepesantrenan/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import { useCan } from '@/hooks/useCan'
import { format, startOfWeek } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify'

interface LembagaOption {
  label: string
  value: string
  type?: string
}

interface JamPelajaranOption {
  id_jampel: string
  nama_jampel: string
}

interface LokasiOption {
  id_lokasi: string
  nama_lokasi: string
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const calculateDuration = (mulai: string, selesai: string | null) => {
  if (!selesai) return 'Aktif (Sedang Berjalan)'

  const [hStart, mStart, sStart] = mulai.split(':').map(Number)
  const [hEnd, mEnd, sEnd] = selesai.split(':').map(Number)

  const startSeconds = hStart * 3600 + mStart * 60 + (sStart || 0)
  let endSeconds = hEnd * 3600 + mEnd * 60 + (sEnd || 0)

  if (endSeconds < startSeconds) {
    endSeconds += 24 * 3600
  }

  const diffSeconds = endSeconds - startSeconds
  const hours = Math.floor(diffSeconds / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0) parts.push(`${minutes} menit`)
  if (seconds > 0 && hours === 0 && minutes === 0) parts.push(`${seconds} detik`)

  return parts.join(' ') || '0 menit'
}

const JurnalKelasReportList = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_kelas_santri)

  // Permission Hooks
  const canExport = useCan('export')

  // State Loading Export
  const [loadingExport, setLoadingExport] = useState(false)

  // Opsi Data Dropdown Master
  const [listLembaga, setListLembaga] = useState<LembagaOption[]>([{ label: 'Semua', value: '' }])
  const [listJamPel, setListJamPel] = useState<JamPelajaranOption[]>([])
  const [listLokasi, setListLokasi] = useState<LokasiOption[]>([])
  const [loadingLembaga, setLoadingLembaga] = useState(false)
  const [loadingJamPel, setLoadingJamPel] = useState(false)
  const [loadingLokasi, setLoadingLokasi] = useState(false)

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(new Date())
  const [selectedLembaga, setSelectedLembaga] = useState<LembagaOption | null>({
    label: 'Semua',
    value: ''
  })
  const [selectedJamPel, setSelectedJamPel] = useState<JamPelajaranOption | null>({
    id_jampel: '',
    nama_jampel: 'Semua'
  })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [searchTyped, setSearchTyped] = useState('')

  // State Snapshot Filter Sah
  const [currentFilters, setCurrentFilters] = useState<any>(null)
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [isInitialLoaded, setIsInitialLoaded] = useState(false)

  // State Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Ambil Master Data Lembaga (Formal & Kepesantrenan)
  useEffect(() => {
    const getLembagaMaster = async () => {
      try {
        setLoadingLembaga(true)
        const [resFormal, resPesantren] = await Promise.all([
          dispatch(fetchLembagaFormalAll({}))
            .unwrap()
            .catch(() => []),
          dispatch(fetchLembagaKepesantrenanAll({}))
            .unwrap()
            .catch(() => [])
        ])

        const formalData = resFormal?.data || (Array.isArray(resFormal) ? resFormal : [])
        const pesantrenData = resPesantren?.data || (Array.isArray(resPesantren) ? resPesantren : [])

        const formalOptions = formalData.map((item: any) => ({
          label: `[Formal] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'FORMAL'
        }))

        const pesantrenOptions = pesantrenData.map((item: any) => ({
          label: `[Pesantren] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'PESANTREN'
        }))

        setListLembaga([{ label: 'Semua', value: '' }, ...formalOptions, ...pesantrenOptions])
      } catch {
        setListLembaga([{ label: 'Semua', value: '' }])
      } finally {
        setLoadingLembaga(false)
      }
    }
    getLembagaMaster()
  }, [dispatch])

  // Ambil Master Data Jam Pelajaran
  useEffect(() => {
    const getJamPelMaster = async () => {
      try {
        setLoadingJamPel(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const res = await dispatch(fetchMatchingJamPelajaran({ waktu_absen: waktuSekarang })).unwrap()

        if (res?.status && res?.data) {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...res])
        }
      } catch {
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
      } finally {
        setLoadingJamPel(false)
      }
    }
    getJamPelMaster()
  }, [dispatch])

  // Ambil Master Data Kelas (Lokasi) - Disesuaikan dengan pilihan Lembaga jika ada
  const getLokasiMaster = useCallback(
    async (idLembaga?: string) => {
      try {
        setLoadingLokasi(true)
        const res = await dispatch(fetchKelasList(idLembaga ? { id_lembaga: idLembaga } : {})).unwrap()
        const valuesData = res?.data || (Array.isArray(res) ? res : [])
        const formatted = valuesData.map((c: any) => ({
          id_lokasi: c.id_kelas,
          nama_lokasi: c.nama_kelas
        }))
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...formatted])
      } catch {
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingLokasi(false)
      }
    },
    [dispatch]
  )

  useEffect(() => {
    getLokasiMaster(selectedLembaga?.value)
  }, [selectedLembaga?.value, getLokasiMaster])

  const handleLembagaChange = (_: any, newValue: LembagaOption | null) => {
    setSelectedLembaga(newValue)
    setSelectedLokasi({ id_lokasi: '', nama_lokasi: 'Semua' })
  }

  // Fungsi Fetch Data Jurnal
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      dispatch(
        fetchJurnalKelasPage({
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
          id_lembaga: filters.id_lembaga || undefined,
          id_jam_pelajaran: filters.id_jam_pelajaran || undefined,
          id_lokasi: filters.id_lokasi || undefined,
          keyword: filters.searchTyped || undefined
        })
      )
    },
    [dispatch, tanggalAwal, tanggalAkhir]
  )

  // Auto-load data pertama kali
  useEffect(() => {
    if (
      !loadingJamPel &&
      !loadingLokasi &&
      !loadingLembaga &&
      listJamPel.length > 0 &&
      listLokasi.length > 0 &&
      listLembaga.length > 0 &&
      !isInitialLoaded
    ) {
      setIsInitialLoaded(true)
      const filters = {
        tanggal_awal: tanggalAwal || '',
        tanggal_akhir: tanggalAkhir || '',
        id_lembaga: selectedLembaga?.value || '',
        id_jam_pelajaran: selectedJamPel?.id_jampel || '',
        id_lokasi: selectedLokasi?.id_lokasi || '',
        searchTyped
      }
      setIsFilterApplied(true)
      setCurrentFilters(filters)
      executeFetchData(1, perPage, filters)
    }
  }, [
    loadingJamPel,
    loadingLokasi,
    loadingLembaga,
    listJamPel,
    listLokasi,
    listLembaga,
    isInitialLoaded,
    selectedLembaga,
    selectedJamPel,
    selectedLokasi,
    tanggalAwal,
    tanggalAkhir,
    searchTyped,
    perPage,
    executeFetchData
  ])

  // Pagination handler
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters)
    }
  }, [page, perPage, isFilterApplied, currentFilters, executeFetchData])

  const handleSearchSubmit = () => {
    const filters = {
      tanggal_awal: tanggalAwal || '',
      tanggal_akhir: tanggalAkhir || '',
      id_lembaga: selectedLembaga?.value || '',
      id_jam_pelajaran: selectedJamPel?.id_jampel || '',
      id_lokasi: selectedLokasi?.id_lokasi || '',
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
      id_lembaga: '',
      id_jam_pelajaran: '',
      id_lokasi: '',
      searchTyped: ''
    }

    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setSelectedLembaga(listLembaga.find(l => l.value === '') || { label: 'Semua', value: '' })
    setSelectedJamPel(listJamPel.find(s => s.id_jampel === '') || null)
    setSelectedLokasi(listLokasi.find(k => k.id_lokasi === '') || null)
    setSearchTyped('')

    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data terlebih dahulu sebelum export')
      return
    }
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postJurnalKelasExport({
          tanggal_awal: currentFilters.tanggal_awal,
          tanggal_akhir: currentFilters.tanggal_akhir,
          id_lembaga: currentFilters.id_lembaga || undefined,
          id_jam_pelajaran: currentFilters.id_jam_pelajaran || undefined,
          id_lokasi: currentFilters.id_lokasi || undefined,
          keyword: currentFilters.searchTyped || undefined
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const buildTable = () => {
    const { jurnalPage } = store
    const tableValues = isFilterApplied ? jurnalPage?.values || [] : []
    const tableCount = isFilterApplied ? jurnalPage?.total || 0 : 0

    return {
      page: page,
      fields: [
        tableColumn('TANGGAL', 'tanggal'),
        tableColumn('LEMBAGA', 'lembaga'),
        tableColumn('JAM PELAJARAN', 'jam_pelajaran'),
        tableColumn('KELAS', 'kelas'),
        tableColumn('GURU / PETUGAS', 'petugas'),
        tableColumn('JAM MULAI', 'jam_mulai'),
        tableColumn('JAM SELESAI', 'jam_selesai'),
        tableColumn('DURASI SESI', 'durasi'),
        tableColumn(
          'MATERI',
          'materi',
          'left',
          ((row: any) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {row.materi || '-'}
              </Typography>
              {row.catatan && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: '11px', whiteSpace: 'normal', wordBreak: 'break-word', display: 'block' }}
                >
                  Catatan: {row.catatan}
                </Typography>
              )}
            </Box>
          )) as any,
          { width: 250, minWidth: 250 } as any
        )
      ],
      values: tableValues.map((row: any) => ({
        ...row,
        tanggal: row.tanggal ? format(new Date(row.tanggal), 'dd/MM/yyyy') : '-',
        lembaga: row.kelasFormal?.lembaga?.nama_lembaga || row.kelasMda?.lembaga?.nama_lembaga || '-',
        jam_pelajaran: row.jamPelajaran?.nama_jampel || '-',
        kelas: row.lokasi?.nama_lokasi || row.kelasFormal?.nama_kelas || row.kelasMda?.nama_kelas_mda || '-',
        petugas: row.petugas?.full_name || row.petugas?.username || '-',
        jam_mulai: row.jam_mulai || '-',
        jam_selesai: row.jam_selesai || '-',
        durasi: (
          <Chip
            label={calculateDuration(row.jam_mulai, row.jam_selesai)}
            size='small'
            color={row.jam_selesai ? 'success' : 'primary'}
            variant='tonal'
          />
        ),
        materi: row.materi || '-',
        catatan: row.catatan || '-'
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <Autocomplete
                size='small'
                options={listJamPel}
                loading={loadingJamPel}
                value={selectedJamPel}
                onChange={(_, newValue) => setSelectedJamPel(newValue)}
                getOptionLabel={option => option.nama_jampel || ''}
                isOptionEqualToValue={(option, value) => option.id_jampel === value?.id_jampel}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Jam Pelajaran'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingJamPel ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <Autocomplete
                size='small'
                options={listLembaga}
                loading={loadingLembaga}
                value={selectedLembaga}
                onChange={handleLembagaChange}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lembaga'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingLembaga ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                fullWidth
                label='Cari Guru / Materi'
                size='small'
                placeholder='Ketik guru / materi / catatan...'
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
          <CardHeader title='Laporan Jurnal Kelas (Sesi Belajar Guru)' />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default JurnalKelasReportList
