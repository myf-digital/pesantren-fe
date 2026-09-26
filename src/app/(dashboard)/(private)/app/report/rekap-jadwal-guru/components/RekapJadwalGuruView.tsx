'use strict'

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
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchRekapGuruPage, postRekapGuruExport } from '../../../absen-kelas-santri/slice/index'
import { fetchLembagaFormalAll } from '../../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../../lembaga-kepesantrenan/slice'
import { fetchTahunAjaranAll } from '../../../tahun-ajaran/slice'
import { fetchSemesterAll } from '../../../semester/slice'

import { useCan } from '@/hooks/useCan'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify'
import DetailJurnalGuruDialog from './DetailJurnalGuruDialog'

interface OptionType {
  label: string
  value: string
  status?: string
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const RekapJadwalGuruView: React.FC<{ isStandalone?: boolean }> = ({ isStandalone = true }) => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_kelas_santri)

  // Permissions
  const canExport = useCan('export')

  // Loading States
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingFilter, setLoadingFilter] = useState(false)

  // Master Dropdown States
  const [listLembaga, setListLembaga] = useState<OptionType[]>([{ label: 'Semua Departemen', value: '' }])
  const [listTahunAjaran, setListTahunAjaran] = useState<OptionType[]>([{ label: 'Semua Tahun Ajaran', value: '' }])
  const [listSemester, setListSemester] = useState<OptionType[]>([{ label: 'Semua Info Jadwal', value: '' }])

  // Selected Filters
  const [selectedLembaga, setSelectedLembaga] = useState<OptionType | null>({
    label: 'Semua Departemen',
    value: ''
  })
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<OptionType | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<OptionType | null>(null)

  // Date Range (default: Current Month)
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfMonth(new Date()))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(endOfMonth(new Date()))

  // Search & Pagination State
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null)

  // 1. Fetch Master Departemen (Lembaga)
  useEffect(() => {
    const loadLembaga = async () => {
      try {
        const [resFormal, resPesantren] = await Promise.all([
          dispatch(fetchLembagaFormalAll({ status: 'Aktif' })).unwrap(),
          dispatch(fetchLembagaKepesantrenanAll({ status: 'Aktif' })).unwrap()
        ])

        const formalOptions: OptionType[] = (resFormal?.data || (Array.isArray(resFormal) ? resFormal : [])).map(
          (item: any) => ({
            label: `${item.nama_lembaga || item.nama} (Formal)`,
            value: item.id_lembaga
          })
        )

        const pesantrenOptions: OptionType[] = (
          resPesantren?.data || (Array.isArray(resPesantren) ? resPesantren : [])
        ).map((item: any) => ({
          label: `${item.nama_lembaga || item.nama} (Kepesantrenan)`,
          value: item.id_lembaga
        }))

        setListLembaga([{ label: 'Semua Departemen', value: '' }, ...formalOptions, ...pesantrenOptions])
      } catch {
        setListLembaga([{ label: 'Semua Departemen', value: '' }])
      }
    }

    loadLembaga()
  }, [dispatch])

  // 2. Fetch Master Tahun Ajaran
  useEffect(() => {
    const loadTahunAjaran = async () => {
      try {
        const res = await dispatch(fetchTahunAjaranAll({})).unwrap()
        const dataArr = res?.data || (Array.isArray(res) ? res : [])
        const options: OptionType[] = dataArr.map((ta: any) => ({
          label: `${ta.tahun_ajaran || ta.nama} ${ta.status === 'Aktif' ? '(Aktif)' : ''}`.trim(),
          value: ta.id_tahunajaran,
          status: ta.status
        }))

        setListTahunAjaran([{ label: 'Semua Tahun Ajaran', value: '' }, ...options])

        // Auto select active tahun ajaran if available
        const activeTa = options.find(o => o.status === 'Aktif')
        if (activeTa) {
          setSelectedTahunAjaran(activeTa)
        }
      } catch {
        setListTahunAjaran([{ label: 'Semua Tahun Ajaran', value: '' }])
      }
    }

    loadTahunAjaran()
  }, [dispatch])

  // 3. Fetch Master Semester (dependent on selected Tahun Ajaran)
  useEffect(() => {
    const loadSemester = async () => {
      try {
        const params: any = {}
        if (selectedTahunAjaran?.value) {
          params.id_tahunajaran = selectedTahunAjaran.value
        }
        const res = await dispatch(fetchSemesterAll(params)).unwrap()
        const dataArr = res?.data || (Array.isArray(res) ? res : [])
        const options: OptionType[] = dataArr.map((sem: any) => ({
          label: `${sem.nama_semester || sem.semester || 'Semester'} ${sem.status === 'Aktif' ? '(Aktif)' : ''}`.trim(),
          value: sem.id_semester,
          status: sem.status
        }))

        setListSemester([{ label: 'Semua Info Jadwal', value: '' }, ...options])

        // Auto select active semester if available
        const activeSem = options.find(o => o.status === 'Aktif')
        if (activeSem) {
          setSelectedSemester(activeSem)
        }
      } catch {
        setListSemester([{ label: 'Semua Info Jadwal', value: '' }])
      }
    }

    loadSemester()
  }, [dispatch, selectedTahunAjaran?.value])

  // 4. Fetch Report Data
  const executeFetch = useCallback(
    (currentPage: number, currentPerPage: number) => {
      const params: any = {
        page: currentPage,
        perPage: currentPerPage,
        keyword: searchKeyword || undefined
      }

      if (selectedLembaga?.value) {
        params.id_lembaga = selectedLembaga.value
      }
      if (selectedTahunAjaran?.value) {
        params.id_tahunajaran = selectedTahunAjaran.value
      }
      if (selectedSemester?.value) {
        params.id_semester = selectedSemester.value
      }
      if (tanggalAwal) {
        params.tanggal_awal = format(tanggalAwal, 'yyyy-MM-dd')
      }
      if (tanggalAkhir) {
        params.tanggal_akhir = format(tanggalAkhir, 'yyyy-MM-dd')
      }

      dispatch(fetchRekapGuruPage(params))
    },
    [
      dispatch,
      searchKeyword,
      selectedLembaga?.value,
      selectedTahunAjaran?.value,
      selectedSemester?.value,
      tanggalAwal,
      tanggalAkhir
    ]
  )

  useEffect(() => {
    executeFetch(page, perPage)
  }, [page, perPage, executeFetch])

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    executeFetch(1, perPage)
  }

  const handleRefresh = () => {
    executeFetch(page, perPage)
    toast.info('Data rekap guru diperbarui')
  }

  const handleExportExcel = async () => {
    try {
      setLoadingExport(true)
      const payload: any = {
        keyword: searchKeyword || undefined,
        id_lembaga: selectedLembaga?.value || undefined,
        id_tahunajaran: selectedTahunAjaran?.value || undefined,
        id_semester: selectedSemester?.value || undefined,
        tanggal_awal: tanggalAwal ? format(tanggalAwal, 'yyyy-MM-dd') : undefined,
        tanggal_akhir: tanggalAkhir ? format(tanggalAkhir, 'yyyy-MM-dd') : undefined
      }

      const res = await dispatch(postRekapGuruExport(payload)).unwrap()
      if (res?.data) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const fileUrl = res.data.startsWith('http') ? res.data : `${baseUrl}${res.data}`
        const link = document.createElement('a')
        link.href = fileUrl
        link.setAttribute('download', '')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Laporan berhasil diexport ke Excel')
      } else {
        toast.error('Gagal mengunduh file export')
      }
    } catch {
      toast.error('Terjadi kesalahan saat export data')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleOpenDetail = (teacher: any) => {
    setSelectedTeacher(teacher)
    setDetailModalOpen(true)
  }

  const summary = store.rekapGuruPage?.summary || {
    total_guru: store.rekapGuruPage?.total || 0,
    total_sesi: 0,
    total_jam: 0
  }

  const tableData = store.rekapGuruPage?.values || []
  const totalCount = store.rekapGuruPage?.total || 0
  const isLoading = store.loading

  // Periode Label Text
  const periodeText = `Periode ${tanggalAwal ? format(tanggalAwal, 'dd MMMM yyyy') : '-'} s/d ${tanggalAkhir ? format(tanggalAkhir, 'dd MMMM yyyy') : '-'}`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Filter Card (Matching JIBAS Screenshot Design) */}
      <Card
        sx={{
          p: 3,
          boxShadow: '0 4px 18px 0 rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
        className='no-print'
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant='h5'
              sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-file-analytics text-primary text-2xl' />
              Rekap Jadwal Guru / Laporan Bulanan Guru
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Rekapitulasi aktivitas mengajar guru bersumber dari data jurnal kelas
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant='caption'
              sx={{ color: 'warning.dark', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              Rekap Jadwal Guru
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
              Jadwal &gt; Rekap Jadwal Guru
            </Typography>
          </Box>
        </Box>

        {/* Filter Controls Grid */}
        <Grid container spacing={3} alignItems='center'>
          {/* Departemen / Lembaga */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Departemen / Lembaga
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={listLembaga}
              value={selectedLembaga}
              onChange={(_, val) => {
                setSelectedLembaga(val)
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Departemen' />}
            />
          </Grid>

          {/* Tahun Ajaran */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Tahun Ajaran
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={listTahunAjaran}
              value={selectedTahunAjaran}
              onChange={(_, val) => {
                setSelectedTahunAjaran(val)
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Tahun Ajaran' />}
            />
          </Grid>

          {/* Info Jadwal / Semester */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Info Jadwal / Semester
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={listSemester}
              value={selectedSemester}
              onChange={(_, val) => {
                setSelectedSemester(val)
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Semester' />}
            />
          </Grid>

          {/* Search Box */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Pencarian Guru
            </Typography>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size='small'
                placeholder='Cari NIP / Nama Guru...'
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton size='small' type='submit'>
                      <i className='tabler-search text-lg text-primary' />
                    </IconButton>
                  )
                }}
              />
            </form>
          </Grid>

          {/* Tanggal Range Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Tanggal Mulai
            </Typography>
            <AppReactDatepicker
              selected={tanggalAwal}
              id='tanggal-awal'
              onChange={(date: Date | null) => {
                setTanggalAwal(date)
                setPage(1)
              }}
              placeholderText='dd/MM/yyyy'
              dateFormat='dd/MM/yyyy'
              popperPlacement='bottom-start'
              popperProps={{ strategy: 'fixed' }}
              customInput={<PickersComponent />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Tanggal Selesai
            </Typography>
            <AppReactDatepicker
              selected={tanggalAkhir}
              id='tanggal-akhir'
              onChange={(date: Date | null) => {
                setTanggalAkhir(date)
                setPage(1)
              }}
              placeholderText='dd/MM/yyyy'
              dateFormat='dd/MM/yyyy'
              popperPlacement='bottom-start'
              popperProps={{ strategy: 'fixed' }}
              customInput={<PickersComponent />}
            />
          </Grid>

          {/* Quick Presets */}
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Preset Periode Cepat
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size='small'
                variant='outlined'
                onClick={() => {
                  setTanggalAwal(startOfMonth(new Date()))
                  setTanggalAkhir(endOfMonth(new Date()))
                  setPage(1)
                }}
              >
                Bulan Ini
              </Button>
              <Button
                size='small'
                variant='outlined'
                onClick={() => {
                  const now = new Date()
                  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                  setTanggalAwal(startOfMonth(prevMonth))
                  setTanggalAkhir(endOfMonth(prevMonth))
                  setPage(1)
                }}
              >
                Bulan Lalu
              </Button>
              <Button
                size='small'
                variant='outlined'
                onClick={() => {
                  const now = new Date()
                  setTanggalAwal(new Date(now.getFullYear(), 0, 1))
                  setTanggalAkhir(new Date(now.getFullYear(), 11, 31))
                  setPage(1)
                }}
              >
                1 Tahun Penuh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* 2. Main Report Table Card */}
      <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.06)', borderRadius: 2 }}>
        {/* Periode Banner & Action Buttons */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: 'action.hover'
          }}
        >
          {/* Left: Periode Text & Badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {periodeText}
            </Typography>

            <Chip
              size='small'
              color='primary'
              variant='tonal'
              label={`Total Guru: ${totalCount}`}
              icon={<i className='tabler-users' />}
            />
            <Chip
              size='small'
              color='info'
              variant='tonal'
              label={`Total Sesi: ${summary.total_sesi} sesi`}
              icon={<i className='tabler-book' />}
            />
            <Chip
              size='small'
              color='success'
              variant='tonal'
              label={`Total Jam: ${Number(summary.total_jam || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jam`}
              icon={<i className='tabler-clock' />}
            />
          </Box>

          {/* Right: Actions (Refresh, Cetak, Export) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} className='no-print'>
            <Button
              variant='tonal'
              color='secondary'
              size='small'
              startIcon={<i className='tabler-refresh' />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>

            <Button
              variant='contained'
              color='success'
              size='small'
              startIcon={
                loadingExport ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <i className='tabler-file-spreadsheet' />
                )
              }
              disabled={loadingExport || tableData.length === 0}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        {/* Report Table */}
        <TableContainer sx={{ minHeight: 300, position: 'relative' }}>
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.7)',
                zIndex: 2
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Table size='medium' sx={{ borderCollapse: 'collapse' }}>
            {/* Table Header Structure */}
            <TableHead sx={{ bgcolor: '#374151' }}>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    width: 60,
                    borderRight: '1px solid #4b5563'
                  }}
                >
                  No
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{ color: '#fff', fontWeight: 700, minWidth: 220, borderRight: '1px solid #4b5563' }}
                >
                  Nama Guru
                </TableCell>
                <TableCell
                  colSpan={6}
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    bgcolor: '#1f2937',
                    borderBottom: '1px solid #4b5563',
                    borderRight: '1px solid #4b5563'
                  }}
                >
                  Jumlah
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', width: 90 }}
                  className='no-print'
                >
                  Aksi
                </TableCell>
              </TableRow>

              <TableRow sx={{ bgcolor: '#4b5563' }}>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 90,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Mengajar
                </TableCell>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 90,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Asistensi
                </TableCell>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 90,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Tambahan
                </TableCell>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 80,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Jam
                </TableCell>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 80,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Kelas
                </TableCell>
                <TableCell
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    width: 80,
                    borderRight: '1px solid #6b7280'
                  }}
                >
                  Hari
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                    <i className='tabler-database-off text-5xl text-secondary mb-2' />
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Data tidak ditemukan
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Tidak ada catatan jurnal mengajar pada filter / periode yang dipilih
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row: any, idx: number) => {
                  const rowNumber = (page - 1) * perPage + idx + 1
                  const isEven = idx % 2 === 0

                  return (
                    <TableRow
                      key={row.id_petugas || idx}
                      sx={{
                        bgcolor: isEven ? '#f0f9ff' : '#ffffff',
                        '&:hover': { bgcolor: '#e0f2fe' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {rowNumber}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e2e8f0' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.nama || row.nama_guru}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            mt: 0.3
                          }}
                        >
                          NIP: {row.nip && row.nip !== '-' ? row.nip : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {row.mengajar ?? 0}
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', color: 'text.secondary', borderRight: '1px solid #e2e8f0' }}
                      >
                        {row.asistensi ?? 0}
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', color: 'text.secondary', borderRight: '1px solid #e2e8f0' }}
                      >
                        {row.tambahan ?? 0}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          fontWeight: 700,
                          color: 'primary.main',
                          borderRight: '1px solid #e2e8f0'
                        }}
                      >
                        {Number(row.jam ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {row.kelas ?? 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {row.hari ?? 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }} className='no-print'>
                        <Tooltip title='Lihat Rincian Sesi Jurnal'>
                          <IconButton size='small' color='primary' onClick={() => handleOpenDetail(row)}>
                            <i className='tabler-list-details' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Standard Table Pagination */}
        <Box
          className='no-print'
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            {`Menampilkan ${totalCount === 0 ? 0 : (page - 1) * perPage + 1} sampai ${Math.min(page * perPage, totalCount)} dari ${totalCount} entri`}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                Baris per halaman:
              </Typography>
              <TextField
                select
                size='small'
                value={perPage}
                onChange={e => {
                  setPerPage(parseInt(e.target.value, 10))
                  setPage(1)
                }}
                SelectProps={{ native: true }}
                sx={{ width: 75 }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </TextField>
            </Box>

            <Pagination
              shape='rounded'
              color='primary'
              variant='tonal'
              count={Math.ceil(totalCount / perPage) || 1}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Card>

      {/* Detail Jurnal Modal */}
      <DetailJurnalGuruDialog
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedTeacher(null)
        }}
        teacherData={selectedTeacher}
      />

      {/* Print CSS Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .MuiCard-root {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </Box>
  )
}

export default RekapJadwalGuruView
