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
  Pagination
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchRekapGuruPage, postRekapGuruExport } from '../../../absen-kelas-santri/slice/index'
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

const RekapJadwalGuruView: React.FC<{ isStandalone?: boolean }> = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.absen_kelas_santri)

  const canExport = useCan('export')

  const [loadingExport, setLoadingExport] = useState(false)

  const [listLembaga, setListLembaga] = useState<OptionType[]>([{ label: 'Semua Lembaga', value: '' }])
  const [selectedLembaga, setSelectedLembaga] = useState<OptionType | null>({
    label: 'Semua Lembaga',
    value: ''
  })

  const [selectedBulan, setSelectedBulan] = useState<Date>(new Date())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

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

  const executeFetch = useCallback(
    (currentPage: number, currentPerPage: number) => {
      const start = startOfMonth(selectedBulan)
      const end = endOfMonth(selectedBulan)

      const params: any = {
        page: currentPage,
        perPage: currentPerPage,
        keyword: searchKeyword.trim() || undefined,
        id_lembaga: selectedLembaga?.value || undefined,
        bulan: format(selectedBulan, 'yyyy-MM'),
        tanggal_awal: format(start, 'yyyy-MM-dd'),
        tanggal_akhir: format(end, 'yyyy-MM-dd')
      }

      dispatch(fetchRekapGuruPage(params))
    },
    [dispatch, searchKeyword, selectedLembaga?.value, selectedBulan]
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
    toast.info('Data kehadiran guru diperbarui')
  }

  const handleExportExcel = async () => {
    try {
      setLoadingExport(true)
      const start = startOfMonth(selectedBulan)
      const end = endOfMonth(selectedBulan)

      const payload: any = {
        keyword: searchKeyword.trim() || undefined,
        id_lembaga: selectedLembaga?.value || undefined,
        nama_lembaga: selectedLembaga?.label || 'Semua Lembaga',
        bulan: format(selectedBulan, 'yyyy-MM'),
        tanggal_awal: format(start, 'yyyy-MM-dd'),
        tanggal_akhir: format(end, 'yyyy-MM-dd')
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

  const tableData = store.rekapGuruPage?.values || []
  const totalCount = store.rekapGuruPage?.total || 0
  const isLoading = store.loading

  const bulanFormatted = format(selectedBulan, 'MMMM yyyy')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Card sx={{ p: 4, borderRadius: 2 }} className='no-print'>
        <Grid container spacing={4} alignItems='center'>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Bulan (Periode Bulan & Tahun)
            </Typography>
            <AppReactDatepicker
              selected={selectedBulan}
              id='filter-bulan'
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                setPage(1)
              }}
              getOptionLabel={option => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              renderInput={params => <TextField {...params} placeholder='Pilih Lembaga' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Typography variant='caption' sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              Pencarian Guru
            </Typography>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size='small'
                placeholder='Cari Nama / NIP Guru...'
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

      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
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
                PRESENTASE KEHADIRAN GURU
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, minWidth: 80, color: 'text.primary' }}>
                    Lembaga :
                  </Typography>
                  <Typography variant='body2' color='text.primary'>
                    {selectedLembaga?.label || 'Semua Lembaga'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, minWidth: 80, color: 'text.primary' }}>
                    Bulan :
                  </Typography>
                  <Typography variant='body2' color='text.primary'>
                    {bulanFormatted}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} className='no-print'>
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
                    minWidth: 240
                  }}
                >
                  Nama Guru
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
                    width: 140
                  }}
                >
                  Total Jam
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
                      Tidak ada data guru atau jadwal mengajar pada filter yang dipilih
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row: any, idx: number) => {
                  const rowNumber = (page - 1) * perPage + idx + 1
                  const persen = row.kehadiran_persen ?? 0

                  return (
                    <TableRow
                      key={row.id_pegawai || idx}
                      hover
                      sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{rowNumber}</TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.nama_guru || row.nama}
                        </Typography>
                        {row.nip && row.nip !== '-' && (
                          <Typography variant='caption' color='text.secondary'>
                            NIP: {row.nip}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{row.wajib_hadir || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{row.sakit || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{row.izin || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{row.alfa || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'primary.main' }}>
                        {row.hadir ?? row.total_hadir ?? row.total ?? 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                        {row.total_jam_label || (row.total_jam !== undefined ? `${row.total_jam} Jam` : '0 Jam')}
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
              Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalCount)} dari {totalCount} guru
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

export default RekapJadwalGuruView
