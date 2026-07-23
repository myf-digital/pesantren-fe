'use client'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import {
  Card,
  CardHeader,
  TextField,
  Toolbar,
  Button,
  Typography,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchPerizinanSantriPage, postPerizinanExport, resetRedux } from '../slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import { useCan } from '@/hooks/useCan'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useSession } from 'next-auth/react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// ==========================================
// KOMPONEN AKSI BARIS TABEL (ROW ACTION)
// ==========================================
const RowAction = ({ row, currentUserRole }: { row: any; currentUserRole: string }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Aturan Visibilitas Tombol Berdasarkan Spesifikasi Role & Status
  const isParentOrWali = ['orang_tua_wali', 'administrator'].includes(currentUserRole)
  const isKedisiplinan = ['petugas_kedisiplinan', 'wali_asuh', 'administrator'].includes(currentUserRole)
  const isStatusMenunggu = row.status_approval === 'Menunggu' && !row.is_canceled
  const isStatusRequestCanceled = row.is_request_canceled && !row.is_canceled

  return (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {/* Tombol Detail: Selalu muncul untuk Akses Guru/Wali, atau kondisi kondisional */}
        {isParentOrWali && (
          <MenuItem
            component={Link}
            href={`/app/perizinan-santri/detail?id=${row.id_izin}&view=true&from=kedisiplinan`}
          >
            <i className='tabler-eye' style={{ marginRight: 8 }} /> Detail
          </MenuItem>
        )}

        {/* Tombol Proses Pengajuan: Hanya aktif untuk divisi kedisiplinan pada status pending */}
        {isKedisiplinan && (isStatusMenunggu || isStatusRequestCanceled) && (
          <MenuItem component={Link} href={`/app/perizinan-santri/detail?id=${row.id_izin}&from=kedisiplinan`}>
            <i className='tabler-gavel' style={{ marginRight: 8 }} /> Proses Izin
          </MenuItem>
        )}

        {/* Cadangan fallback view reguler jika role diluar spesifikasi diatas */}
        {!isParentOrWali && !isKedisiplinan && (
          <MenuItem
            component={Link}
            href={`/app/perizinan-santri/detail?id=${row.id_izin}&view=true&from=kedisiplinan`}
          >
            <i className='tabler-eye' style={{ marginRight: 8 }} /> View Detail
          </MenuItem>
        )}
      </Menu>
    </TableCell>
  )
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

// ==========================================
// KOMPONEN UTAMA
// ==========================================
const PerizinanSantriTabsList = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  const { data: session } = useSession()
  const currentUser: any = session?.userdata
  const userRole = currentUser?.role_name || 'pegawai_kedisiplinan'

  const canImport = useCan('import')
  const canExport = useCan('export')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // 💡 State Managing 2 Tab: 0 = Perizinan Santri, 1 = Request Pembatalan
  const [activeTab, setActiveTab] = useState<number>(0)

  // State Filter Utama
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(null)
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(null)
  const [statusApproval, setStatusApproval] = useState('Semua')
  const [jenisIzin, setJenisIzin] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  // Snapshot filter state
  const [currentFilters, setCurrentFilters] = useState<any>({
    startDate: null, // format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: null, // format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    statusApproval: 'Semua',
    jenisIzin: 'Semua',
    searchQuery: ''
  })

  const [isFilterApplied, setIsFilterApplied] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // State PDF Preview Modal
  const [openPdf, setOpenPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')

  // Core API Fetcher
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any, tabIndex: number) => {
      if (!filters) return

      dispatch(
        fetchPerizinanSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          status_approval: tabIndex === 1 ? 'Disetujui' : 'Menunggu',
          jenis_izin: filters.jenisIzin !== 'Semua' ? filters.jenisIzin : undefined,
          q: filters.searchQuery || undefined,
          is_request_canceled: tabIndex === 1 ? true : false,
          is_canceled: false
        })
      )
    },
    [dispatch]
  )

  // Trigger Fetching Data saat Halaman, Filter, atau Tab berubah
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters, activeTab)
    }
  }, [page, perPage, isFilterApplied, currentFilters, activeTab, executeFetchData])

  // Reset State Monitor Hub setelah CRUD
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud.message || 'Data berhasil diproses')
      if (isFilterApplied && currentFilters) executeFetchData(page, perPage, currentFilters, activeTab)
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, page, perPage, isFilterApplied, currentFilters, activeTab, executeFetchData])

  // Handler Ganti Tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setPage(1) // Kembalikan ke halaman 1 setiap ganti tab
  }

  const handleSearchSubmit = () => {
    if (tanggalAwal && tanggalAkhir && tanggalAwal > tanggalAkhir) {
      toast.error('Tanggal awal tidak boleh melebihi batas tanggal akhir pencarian')
      return
    }

    const filters = {
      startDate: tanggalAwal ? format(tanggalAwal, 'yyyy-MM-dd') : '',
      endDate: tanggalAkhir ? format(tanggalAkhir, 'yyyy-MM-dd') : '',
      statusApproval,
      jenisIzin,
      searchQuery
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters, activeTab)
  }

  const handleResetFilter = () => {
    const defaultStart = startOfMonth(new Date())
    const defaultEnd = endOfMonth(new Date())
    setTanggalAwal(null)
    setTanggalAkhir(null)
    setStatusApproval('Semua')
    setJenisIzin('Semua')
    setSearchQuery('')
    setPage(1)
    setIsFilterApplied(true)

    const baseFilters = {
      startDate: null,
      endDate: null,
      statusApproval: 'Semua',
      jenisIzin: 'Semua',
      searchQuery: ''
    }
    setCurrentFilters(baseFilters)
    executeFetchData(1, perPage, baseFilters, activeTab)
  }

  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data secara terstruktur terlebih dahulu')
      return
    }
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postPerizinanExport({
          start_date: currentFilters.startDate,
          end_date: currentFilters.endDate,
          status_approval: currentFilters.statusApproval !== 'Semua' ? currentFilters.statusApproval : undefined,
          jenis_izin: currentFilters.jenisIzin !== 'Semua' ? currentFilters.jenisIzin : undefined,
          q: currentFilters.searchQuery || undefined,
          is_request_canceled: activeTab === 1 ? true : undefined
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.click()
        toast.success('File berhasil diexport')
      }
    } catch {
      toast.error('Gagal memproses data export')
    } finally {
      setLoadingExport(false)
    }
  }

  // Column Renderers
  const renderOption = (row: any) => <RowAction row={row} currentUserRole={userRole} />

  const renderTanggalIzin = (row: any) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {row.tanggal_mulai ? format(new Date(row.tanggal_mulai), 'dd MMM yyyy HH:mm') : '-'}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        s/d {row.tanggal_selesai ? format(new Date(row.tanggal_selesai), 'dd MMM yyyy HH:mm') : '-'}
      </Typography>
    </Box>
  )

  const renderStatusApproval = (row: any) => {
    const isCanceled = row.is_canceled === true || row.is_canceled === 'true'
    let label = row.status_approval

    if (isCanceled) {
      label = 'Dibatalkan'
    } else if (label === 'Disetujui') {
      label = row.is_request_canceled ? 'Menunggu Permintaan Pembatalan' : 'Disetujui'
    } else if (label === 'Menunggu') {
      label = row.is_request_canceled ? 'Menunggu Permintaan Pembatalan' : 'Menunggu Approval'
    }

    const color = isCanceled
      ? 'error'
      : label === 'Disetujui'
        ? 'success'
        : label?.includes('Menunggu')
          ? 'warning'
          : 'error'

    return (
      <Chip
        label={label}
        size='small'
        color={color}
        variant='tonal'
        sx={{ fontWeight: 500, borderRadius: 'var(--mui-shape-borderRadius)' }}
      />
    )
  }

  const renderKondisi = (row: any) => {
    if (!row.kondisi) return '-'
    return (
      <Chip
        label={row.kondisi}
        size='small'
        color={row.kondisi === 'Overdue' ? 'error' : row.kondisi === 'Closed' ? 'secondary' : 'primary'}
      />
    )
  }

  // ==========================================
  // BUILD DATA STRUKTUR TABEL (KONDISIONAL TAB)
  // ==========================================
  const buildTable = () => {
    const { dataPage } = store
    let tableValues = (dataPage?.values || []).map((item: any, index: number) => {
      const fileUrl = item.file_izin
        ? item.file_izin.startsWith('http')
          ? item.file_izin
          : `${process.env.NEXT_PUBLIC_API_URL || ''}${item.file_izin.startsWith('/') ? '' : '/'}${item.file_izin}`
        : ''

      return {
        ...item,
        no: (page - 1) * perPage + index + 1,
        jenis_izin: (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
            <Typography variant='body2'>{item.jenis_izin}</Typography>
            {fileUrl && (
              <Button
                size='small'
                color='primary'
                variant='tonal'
                startIcon={<i className='tabler-file-download' />}
                onClick={() => {
                  setPdfUrl(fileUrl)
                  setPdfTitle(`Berkas Izin ${item.santri?.fullname || 'Santri'} - ${item.jenis_izin}`)
                  setOpenPdf(true)
                }}
                sx={{ py: 0.5, px: 2, height: 26, fontSize: '0.7rem' }}
              >
                Lihat Berkas
              </Button>
            )}
          </Box>
        )
      }
    })
    const tableCount = dataPage?.total || 0

    // 💡 TAB 2: Request Pembatalan List
    if (activeTab === 1) {
      return {
        page: page,
        fields: [
          tableColumn('AKSI', 'act-x', 'center', renderOption as any),
          tableColumn('NO', 'no', 'center'),
          tableColumn('NAMA SANTRI', 'santri.fullname'),
          tableColumn('KAMAR', 'lokasiKamar.nama_lokasi'),
          tableColumn('JENIS', 'jenis_izin'),
          tableColumn('TGL IZIN', 'tanggal_izin_range', 'left', renderTanggalIzin as any),
          tableColumn('PEMOHON', 'creator.full_name'), // Menyesuaikan field pemohon dari API/Session
          tableColumn('STATUS', 'status_approval_display', 'center', renderStatusApproval as any)
        ],
        values: tableValues,
        count: tableCount,
        perPage: perPage,
        changePage: (_: any, n: number) => setPage(n + 1),
        changePerPage: (e: any) => {
          setPerPage(parseInt(e.target.value, 10))
          setPage(1)
        }
      }
    }

    // 💡 TAB 1: Perizinan Santri List (Default)
    return {
      page: page,
      fields: [
        tableColumn('AKSI', 'act-x', 'center', renderOption as any),
        tableColumn('NO', 'no', 'center'),
        tableColumn('NAMA SANTRI', 'santri.fullname'),
        tableColumn('KAMAR', 'lokasiKamar.nama_lokasi'),
        tableColumn('JENIS', 'jenis_izin'),
        tableColumn('TGL IZIN', 'tanggal_izin_range', 'left', renderTanggalIzin as any),
        tableColumn('STATUS', 'status_approval_display', 'center', renderStatusApproval as any),
        tableColumn('KONDISI', 'kondisi_display', 'center', renderKondisi as any)
      ],
      values: tableValues,
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
        {/* 💡 IMPLEMENTASI TABS NAVIGATION CONTROLLER */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label='Perizinan Tabs'>
            <Tab label='Pengajuan Izin' id='tab-perizinan' />
            <Tab label='Request Pembatalan' id='tab-pembatalan' />
          </Tabs>
        </Box>

        {/* CONTAINER PANEL FILTER (SHARED FOR BOTH TABS) */}
        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
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

            {/* <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small' disabled={true}>
                <InputLabel>Status Approval</InputLabel>
                <Select
                  label='Status Approval'
                  value={activeTab === 1 ? 'Menunggu' : statusApproval}
                  onChange={e => setStatusApproval(e.target.value)}
                >
                  <MenuItem value='Semua'>Semua Status</MenuItem>
                  <MenuItem value='Menunggu'>Menunggu</MenuItem>
                  <MenuItem value='Disetujui'>Disetujui</MenuItem>
                  <MenuItem value='Ditolak'>Ditolak</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Jenis Perizinan</InputLabel>
                <Select label='Jenis Perizinan' value={jenisIzin} onChange={e => setJenisIzin(e.target.value)}>
                  <MenuItem value='Semua'>Semua Jenis</MenuItem>
                  <MenuItem value='Izin'>Izin (Keluar)</MenuItem>
                  <MenuItem value='Sakit'>Sakit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Pencarian Nama/NIS/kamar'
                size='small'
                placeholder='Ketik nama santri, NIS, atau kamar...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              />
            </Grid>
          </Grid>

          {/* TOOLBAR ACTION UTILITY */}
          <Toolbar
            sx={{
              px: '0px !important',
              gap: 2,
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              minHeight: 'auto'
            }}
          >
            <Button
              variant='contained'
              color='info'
              fullWidth={isMobile}
              startIcon={<i className='tabler-search' />}
              onClick={handleSearchSubmit}
            >
              Cari
            </Button>

            <Button
              variant='outlined'
              color='secondary'
              fullWidth={isMobile}
              startIcon={<i className='tabler-refresh' />}
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>

            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {canExport && (
              <Button
                color='success'
                variant='contained'
                fullWidth={isMobile}
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
                disabled={loadingExport}
              >
                {loadingExport ? 'Memproses...' : 'Export Excel'}
              </Button>
            )}

            {canImport && (
              <Button
                color='secondary'
                variant='contained'
                fullWidth={isMobile}
                startIcon={<i className='tabler-file-import' />}
                component={Link}
                href='/app/perizinan-santri/import?ub=kedisiplinan'
              >
                Import Excel
              </Button>
            )}
          </Toolbar>
        </Card>

        {/* LOG DATA UTAMA TABLE RENDERING */}
        <Card sx={{ overflowX: 'auto' }}>
          <CardHeader
            title={activeTab === 0 ? 'Daftar Riwayat Perizinan Santri' : 'Daftar Permintaan Pembatalan Izin'}
          />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      {/* PREVIEW MODAL */}
      <Dialog
        open={openPdf}
        onClose={() => {
          setOpenPdf(false)
          setPdfUrl('')
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{pdfTitle}</span>
          <IconButton
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '650px' }}>
          {pdfUrl ? (
            <iframe src={pdfUrl} width='100%' height='100%' style={{ border: 'none' }} title='PDF Preview' />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
            color='secondary'
            variant='tonal'
          >
            Tutup
          </Button>
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            color='primary'
            variant='contained'
            startIcon={<i className='tabler-external-link' />}
          >
            Buka di Tab Baru
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PerizinanSantriTabsList
