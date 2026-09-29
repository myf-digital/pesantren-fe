'use strict'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import {
  Card,
  TextField,
  Button,
  Chip,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Pagination,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchRekapSantriPage, postRekapSantriExport, fetchKelasList } from '../../../absen-kelas-santri/slice/index'
import { fetchLembagaFormalAll } from '../../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../../lembaga-kepesantrenan/slice'

import { useCan } from '@/hooks/useCan'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify'

interface OptionType {
  label: string
  value: string
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const formatNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'number' ? val : Number(val)
  if (isNaN(num)) return String(val)
  return num.toLocaleString('id-ID')
}

const RekapKehadiranSantriView: React.FC<{ isStandalone?: boolean }> = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_kelas_santri)

  const canExport = useCan('export')

  const [loadingExport, setLoadingExport] = useState(false)

  const [listLembaga, setListLembaga] = useState<OptionType[]>([{ label: 'Semua Lembaga', value: '' }])
  const [selectedLembaga, setSelectedLembaga] = useState<OptionType | null>({
    label: 'Semua Lembaga',
    value: ''
  })

  const [listKelas, setListKelas] = useState<OptionType[]>([{ label: 'Semua Kelas', value: '' }])
  const [selectedKelas, setSelectedKelas] = useState<OptionType | null>({
    label: 'Semua Kelas',
    value: ''
  })

  const [viewMode, setViewMode] = useState<'kelas' | 'santri'>('kelas')
  const [selectedBulan, setSelectedBulan] = useState<Date>(new Date())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Load Lembaga options
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

        setListLembaga([{ label: 'Semua Lembaga', value: '' }, ...formalOptions, ...pesantrenOptions])
      } catch {
        setListLembaga([{ label: 'Semua Lembaga', value: '' }])
      }
    }

    loadLembaga()
  }, [dispatch])

  // Load Kelas options when Lembaga changes
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const params: any = {}
        if (selectedLembaga?.value) {
          params.id_lembaga = selectedLembaga.value
        }
        const res = await dispatch(fetchKelasList(params)).unwrap()
        const rawList = res?.data || (Array.isArray(res) ? res : [])
        const options: OptionType[] = rawList.map((item: any) => ({
          label: item.nama_kelas || item.nama,
          value: item.id_kelas
        }))

        setListKelas([{ label: 'Semua Kelas', value: '' }, ...options])
      } catch {
        setListKelas([{ label: 'Semua Kelas', value: '' }])
      }
    }

    loadKelas()
  }, [dispatch, selectedLembaga?.value])

  const executeFetch = useCallback(
    (currentPage: number, currentPerPage: number) => {
      const start = startOfMonth(selectedBulan)
      const end = endOfMonth(selectedBulan)

      const params: any = {
        page: currentPage,
        perPage: currentPerPage,
        keyword: searchKeyword.trim() || undefined,
        id_lembaga: selectedLembaga?.value || undefined,
        id_kelas: selectedKelas?.value || undefined,
        mode: viewMode,
        bulan: format(selectedBulan, 'yyyy-MM'),
        tanggal_awal: format(start, 'yyyy-MM-dd'),
        tanggal_akhir: format(end, 'yyyy-MM-dd')
      }

      dispatch(fetchRekapSantriPage(params))
    },
    [dispatch, searchKeyword, selectedLembaga?.value, selectedKelas?.value, viewMode, selectedBulan]
  )

  useEffect(() => {
    executeFetch(page, perPage)
  }, [page, perPage, executeFetch])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    executeFetch(1, perPage)
  }

  const handleRefresh = () => {
    executeFetch(page, perPage)
    toast.info('Data kehadiran santri diperbarui')
  }

  const handleExportExcel = async () => {
    try {
      setLoadingExport(true)
      const start = startOfMonth(selectedBulan)
      const end = endOfMonth(selectedBulan)

      const payload: any = {
        keyword: searchKeyword.trim() || undefined,
        id_lembaga: selectedLembaga?.value || undefined,
        id_kelas: selectedKelas?.value || undefined,
        mode: viewMode,
        nama_lembaga: selectedLembaga?.label || 'Semua Lembaga',
        bulan: format(selectedBulan, 'yyyy-MM'),
        tanggal_awal: format(start, 'yyyy-MM-dd'),
        tanggal_akhir: format(end, 'yyyy-MM-dd')
      }

      const res = await dispatch(postRekapSantriExport(payload)).unwrap()
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

  const tableData = store.rekapSantriPage?.values || []
  const totalCount = store.rekapSantriPage?.total || 0
  const summary = store.rekapSantriPage?.summary
  const isLoading = store.loading

  const bulanFormatted = format(selectedBulan, 'MMMM yyyy')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter Section */}
      <Card sx={{ p: 4, borderRadius: 2 }} className='no-print'>
        <Grid container spacing={4} alignItems='center'>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Bulan (Periode)
            </Typography>
            <AppReactDatepicker
              selected={selectedBulan}
              id='filter-bulan-santri'
              onChange={(date: Date | null) => {
                if (date) {
                  setSelectedBulan(date)
                  setPage(1)
                }
              }}
              showMonthYearPicker
              dateFormat='MMMM yyyy'
              popperPlacement='bottom-start'
              popperProps={{ strategy: 'fixed' }}
              customInput={<PickersComponent placeholder='Pilih Bulan' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Lembaga
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={listLembaga}
              value={selectedLembaga}
              onChange={(_, val) => {
                setSelectedLembaga(val || { label: 'Semua Lembaga', value: '' })
                setSelectedKelas({ label: 'Semua Kelas', value: '' })
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Lembaga' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Kelas
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={listKelas}
              value={selectedKelas}
              onChange={(_, val) => {
                setSelectedKelas(val || { label: 'Semua Kelas', value: '' })
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Kelas' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Pencarian {viewMode === 'santri' ? 'NIS / Nama' : 'Kelas'}
            </Typography>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size='small'
                placeholder={viewMode === 'santri' ? 'Cari NIS / Nama Santri...' : 'Cari Nama Kelas...'}
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
        </Grid>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} className='no-print'>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                {viewMode === 'santri' ? 'Total Siswa' : 'Total Kelas'}
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                {formatNumber(viewMode === 'santri' ? summary.total_siswa : summary.total_kelas)}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Total Hadir
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
                {formatNumber(summary.total_hadir)}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'info.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Sakit (S)
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
                {formatNumber(summary.total_sakit)}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Izin (I)
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
                {formatNumber(summary.total_izin)}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'error.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Alfa (A)
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
                {formatNumber(summary.total_alfa)}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'secondary.lightOpacity', borderRadius: 2 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Rata-rata Hadir
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                {summary.avg_kehadiran}%
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Table Card */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
        {/* Banner matching user template */}
        <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: 'text.primary',
                  fontSize: '1.15rem'
                }}
              >
                PRESENTASE KEHADIRAN SANTRI
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, minWidth: 90, color: 'text.primary' }}>
                    LEMBAGA :
                  </Typography>
                  <Typography variant='body2' color='text.primary'>
                    {selectedLembaga?.label || 'Semua Lembaga'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, minWidth: 90, color: 'text.primary' }}>
                    BULAN :
                  </Typography>
                  <Typography variant='body2' color='text.primary'>
                    {bulanFormatted}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 700,
                  mt: 2,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  color: 'text.secondary'
                }}
              >
                {viewMode === 'santri' ? 'REKAP KEHADIRAN SISWA' : 'REKAP KEHADIRAN PERKELAS'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }} className='no-print'>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                size='small'
                onChange={(_, val) => {
                  if (val) {
                    setViewMode(val)
                    setPage(1)
                  }
                }}
                aria-label='view mode'
              >
                <ToggleButton value='kelas' sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}>
                  <i className='tabler-chalkboard text-base mr-1' /> Per Kelas
                </ToggleButton>
                <ToggleButton value='santri' sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}>
                  <i className='tabler-users text-base mr-1' /> Per Santri
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='tabler-refresh' />}
                onClick={handleRefresh}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Segarkan
              </Button>

              {canExport && (
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
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Export Excel
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Table Content */}
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

          <Table
            size='small'
            sx={{
              borderCollapse: 'collapse',
              minWidth: 800,
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider'
              }
            }}
          >
            <TableHead>
              {viewMode === 'kelas' ? (
                <>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 60
                      }}
                    >
                      No
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        minWidth: 200
                      }}
                    >
                      Kelas/Marhalah
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 120
                      }}
                    >
                      Jumlah Siswa
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 120
                      }}
                    >
                      Wajib Hadir
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Absensi (Sesi)
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 120
                      }}
                    >
                      Kehadiran %
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      S
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      I
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      A
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 80
                      }}
                    >
                      Hadir
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 60
                      }}
                    >
                      No
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        minWidth: 220
                      }}
                    >
                      Nama Santri
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        width: 140
                      }}
                    >
                      Kelas
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 120
                      }}
                    >
                      Wajib Hadir
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Absensi (Sesi)
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 120
                      }}
                    >
                      Kehadiran %
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      S
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      I
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 70
                      }}
                    >
                      A
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        width: 80
                      }}
                    >
                      Hadir
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableHead>

            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                    <i className='tabler-user-off text-5xl text-secondary mb-2' />
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Data tidak ditemukan
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Tidak ada data presensi santri pada filter yang dipilih
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : viewMode === 'kelas' ? (
                tableData.map((row: any, idx: number) => {
                  const rowNumber = (page - 1) * perPage + idx + 1
                  const persen = row.kehadiran_persen ?? 0

                  return (
                    <TableRow
                      key={row.id_kelas || idx}
                      hover
                      sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{formatNumber(rowNumber)}</TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.nama_kelas || row.kelas_marhalah}
                        </Typography>
                        {row.type && (
                          <Typography variant='caption' color='text.secondary'>
                            {row.type}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                        {formatNumber(row.jumlah_siswa ?? row.jml_siswa ?? 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>
                        {formatNumber(row.wajib_hadir ?? row.total_presensi ?? row.hari_efektif ?? 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.sakit || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.izin || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.alfa || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'success.main' }}>
                        {formatNumber(row.hadir || 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size='small'
                          label={`${persen}%`}
                          color={persen >= 90 ? 'success' : persen >= 75 ? 'warning' : 'error'}
                          variant='tonal'
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                tableData.map((row: any, idx: number) => {
                  const rowNumber = (page - 1) * perPage + idx + 1
                  const persen = row.kehadiran_persen ?? 0

                  return (
                    <TableRow
                      key={`${row.id_santri}_${row.id_kelas}` || idx}
                      hover
                      sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{formatNumber(rowNumber)}</TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.nama_santri || row.nama}
                        </Typography>
                        {row.nis && row.nis !== '-' && (
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                            NIS: {row.nis}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {row.nama_kelas || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>
                        {formatNumber(row.wajib_hadir ?? row.total_presensi ?? row.hari_efektif ?? 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.sakit || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.izin || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatNumber(row.alfa || 0)}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'success.main' }}>
                        {formatNumber(row.hadir || 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size='small'
                          label={`${persen}%`}
                          color={persen >= 90 ? 'success' : persen >= 75 ? 'warning' : 'error'}
                          variant='tonal'
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalCount > perPage && (
          <Box
            sx={{
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              borderTop: 1,
              borderColor: 'divider'
            }}
            className='no-print'
          >
            <Typography variant='caption' color='text.secondary'>
              Menampilkan {formatNumber((page - 1) * perPage + 1)} - {formatNumber(Math.min(page * perPage, totalCount))} dari{' '}
              {formatNumber(totalCount)} {viewMode === 'santri' ? 'santri' : 'kelas'}
            </Typography>
            <Pagination
              count={Math.ceil(totalCount / perPage)}
              page={page}
              onChange={(_, val) => setPage(val)}
              color='primary'
              shape='rounded'
              size='small'
            />
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default RekapKehadiranSantriView
