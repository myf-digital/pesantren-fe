'use client'

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import {
  TextField,
  Toolbar,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TableCell,
  useTheme,
  useMediaQuery,
  MenuItem,
  Menu
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'

import api from '@/libs/axios'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'

import '@assets/iconify-icons/generated-icons.css'
import { format, startOfMonth } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomChip from '@/@core/components/mui/Chip'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

const tableOptions = [
  { label: 'Semua Modul', value: '' },
  { label: 'Perizinan Santri', value: 'perizinan_santri' },
  { label: 'Absen Kamar', value: 'absen_harian_santri' },
  { label: 'Absen Kelas', value: 'absen_kelas_santri' },
  { label: 'Temuan Kebersihan', value: 'kebersihan_temuan' },
  { label: 'Inspeksi Kebersihan', value: 'kebersihan_inspeksi' }
]

const actionOptions = [
  { label: 'Semua Aksi', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' }
]

const getFriendlyTableName = (tbl: string) => {
  switch (tbl) {
    case 'perizinan_santri':
      return 'Perizinan Santri'
    case 'absen_harian_santri':
      return 'Absen Kamar'
    case 'absen_kelas_santri':
      return 'Absen Kelas'
    case 'kebersihan_temuan':
      return 'Temuan Kebersihan'
    case 'kebersihan_inspeksi':
      return 'Inspeksi Kebersihan'
    default:
      return tbl || '-'
  }
}

function RowAction({ row, onOpenDetail }: { row: any; onOpenDetail: (row: any) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down('md'))
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(matches)
  }, [matches])

  const setOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
    optionsOnClose()
    onOpenDetail(row)
  }

  const content = (
    <>
      <IconButton aria-controls='long-menu' size='small' aria-haspopup='true' onClick={setOpen}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={optionsOnClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { style: { minWidth: '8rem' } }
        }}
      >
        <MenuItem onClick={handleView} sx={{ '& svg': { mr: 2 } }}>
          <i className='tabler-eye' />
          View
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

const ActivityUserReportList = () => {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchTyped, setSearchTyped] = useState('')

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfMonth(new Date()))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(new Date())
  const [selectedTable, setSelectedTable] = useState<any>(tableOptions[0])
  const [selectedAction, setSelectedAction] = useState<any>(actionOptions[0])

  // Dialog State untuk detail JSON
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const executeFetchData = useCallback(
    async (overrides?: any) => {
      try {
        setLoading(true)
        const activePage = overrides?.page !== undefined ? overrides.page : page
        const activePerPage = overrides?.perPage !== undefined ? overrides.perPage : perPage
        const activeKeyword = overrides?.keyword !== undefined ? overrides.keyword : searchTyped
        const activeTable = overrides?.table_name !== undefined ? overrides.table_name : selectedTable?.value
        const activeAction = overrides?.action !== undefined ? overrides.action : selectedAction?.value
        const activeStart =
          overrides?.tanggal_awal !== undefined
            ? overrides.tanggal_awal
            : tanggalAwal
              ? format(tanggalAwal, 'yyyy-MM-dd')
              : ''
        const activeEnd =
          overrides?.tanggal_akhir !== undefined
            ? overrides.tanggal_akhir
            : tanggalAkhir
              ? format(tanggalAkhir, 'yyyy-MM-dd')
              : ''

        const res = await api.get('/app/activity-log', {
          params: {
            page: activePage,
            perPage: activePerPage,
            q: activeKeyword || undefined,
            table_name: activeTable || undefined,
            action: activeAction || undefined,
            tanggal_awal: activeStart || undefined,
            tanggal_akhir: activeEnd || undefined
          }
        })

        if (res.data?.status) {
          setData(res.data.data?.values || [])
          setTotal(res.data.data?.total || 0)
        } else {
          setData([])
          setTotal(0)
        }
      } catch (err: any) {
        setData([])
        setTotal(0)
        toast.error(err.response?.data?.message || 'Gagal memuat data activity log')
      } finally {
        setLoading(false)
      }
    },
    [page, perPage, tanggalAwal, tanggalAkhir, selectedTable, selectedAction, searchTyped]
  )

  const executeFetchRef = useRef(executeFetchData)
  useEffect(() => {
    executeFetchRef.current = executeFetchData
  }, [executeFetchData])

  useEffect(() => {
    executeFetchRef.current({ page: 1 })
  }, [perPage])

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
    const defaultTanggalAwal = startOfMonth(new Date())
    const defaultTanggalAkhir = new Date()
    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setSelectedTable(tableOptions[0])
    setSelectedAction(actionOptions[0])
    setSearchTyped('')
    setPage(1)

    executeFetchData({
      page: 1,
      tanggal_awal: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      tanggal_akhir: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      table_name: '',
      action: '',
      keyword: ''
    })
  }

  const handleOpenDetail = (log: any) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setSelectedLog(null)
    setDetailOpen(false)
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} onOpenDetail={handleOpenDetail} />
  }

  const buildTable = () => {
    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('WAKTU', 'created_at_display'),
        tableColumn('USER', 'user_display'),
        tableColumn('MODUL/TABLE', 'table_display'),
        tableColumn('AKSI', 'action_display'),
        tableColumn('RECORD ID', 'record_id')
      ],
      values: data.map((row: any) => {
        let actionColor: 'success' | 'warning' | 'error' | 'secondary' = 'secondary'
        if (row.action === 'CREATE') actionColor = 'success'
        else if (row.action === 'UPDATE') actionColor = 'warning'
        else if (row.action === 'DELETE') actionColor = 'error'

        return {
          ...row,
          created_at_display: row.created_at ? format(new Date(row.created_at), 'dd/MM/yyyy HH:mm:ss') : '-',
          user_display: (
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {row.resource?.full_name || row.username || '-'}
              </Typography>
              <Typography variant='caption' color='text.disabled'>
                {row.username || '-'}
              </Typography>
            </Box>
          ),
          table_display: getFriendlyTableName(row.table_name),
          action_display: (
            <CustomChip
              round='true'
              size='small'
              label={row.action}
              color={actionColor}
              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
            />
          )
        }
      }),
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={tableOptions}
                value={selectedTable}
                onChange={(_, newValue) => setSelectedTable(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Modul/Table' />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={actionOptions}
                value={selectedAction}
                onChange={(_, newValue) => setSelectedAction(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Aksi' />}
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
          </Toolbar>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardHeader title='Laporan Activity User' sx={{ paddingBottom: 0 }} />
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
            <Tooltip title='Cari User...'>
              <TextField
                label='Cari User...'
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

      {/* Dialog Detail JSON */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        maxWidth='md'
        fullWidth
        aria-labelledby='activity-detail-dialog-title'
      >
        <DialogTitle id='activity-detail-dialog-title'>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' component='span' sx={{ fontWeight: 600 }}>
              Detail Perubahan Data
            </Typography>
            {selectedLog && (
              <Chip
                label={selectedLog.action}
                size='small'
                color={
                  selectedLog.action === 'CREATE' ? 'success' : selectedLog.action === 'UPDATE' ? 'warning' : 'error'
                }
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={4}>
              <Grid size={12} sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Waktu:</strong>{' '}
                  {selectedLog.created_at ? format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss') : '-'}
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>User:</strong> {selectedLog.resource?.full_name || selectedLog.username} (
                  {selectedLog.username})
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Modul:</strong> {getFriendlyTableName(selectedLog.table_name)}
                </Typography>
                <Typography variant='body2'>
                  <strong>Record ID:</strong> {selectedLog.record_id}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}>
                  Sebelum Perubahan (Before Data)
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    maxHeight: 400,
                    overflowY: 'auto'
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }}
                  >
                    {selectedLog.before_data
                      ? JSON.stringify(selectedLog.before_data, null, 2)
                      : 'Tidak ada data (CREATE)'}
                  </pre>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}>
                  Setelah Perubahan (After Data)
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    maxHeight: 400,
                    overflowY: 'auto'
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }}
                  >
                    {selectedLog.after_data
                      ? JSON.stringify(selectedLog.after_data, null, 2)
                      : 'Tidak ada data (DELETE)'}
                  </pre>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} variant='contained' color='primary'>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ActivityUserReportList
