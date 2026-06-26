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

  // Aturan Visibilitas Tombol Berdasarkan Spesifikasi Role & Status Kepegawaian
  const isManajemenAtasan = ['atasan_langsung', 'direksi', 'administrator', 'manajemen_hrd'].includes(currentUserRole)
  const isHrdStaff = ['staff_hrd', 'manajemen_hrd', 'administrator'].includes(currentUserRole)
  const isStatusMenunggu = row.status_approval === 'Menunggu' && !row.is_canceled
  const isStatusRequestCanceled = row.is_request_canceled && !row.is_canceled

  return (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {/* Tombol Detail: Muncul untuk atasan, manajemen hrd, atau administrator */}
        {isManajemenAtasan && (
          <MenuItem
            component={Link}
            href={`/app/perizinan-pegawai/detail?id=${row.id_izin}&view=true&from=manajemen-hrd`}
          >
            <i className='tabler-eye' style={{ marginRight: 8 }} /> Detail Pegawai
          </MenuItem>
        )}

        {/* Tombol Proses Pengajuan: Aktif untuk divisi kepegawaian atau hrd pada status pending */}
        {isHrdStaff && (isStatusMenunggu || isStatusRequestCanceled) && (
          <MenuItem component={Link} href={`/app/perizinan-pegawai/detail?id=${row.id_izin}&from=manajemen-hrd`}>
            <i className='tabler-gavel' style={{ marginRight: 8 }} /> Proses Izin
          </MenuItem>
        )}

        {/* Cadangan fallback view reguler jika role diluar spesifikasi diatas */}
        {!isManajemenAtasan && !isHrdStaff && (
          <MenuItem
            component={Link}
            href={`/app/perizinan-pegawai/detail?id=${row.id_izin}&view=true&from=manajemen-hrd`}
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
const PerizinanPegawaiTabsList = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  const { data: session } = useSession()
  const currentUser: any = session?.userdata
  const userRole = currentUser?.role_name || 'pegawai_biasa'

  const canImport = useCan('import')
  const canExport = useCan('export')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // State Managing 2 Tab: 0 = Perizinan Pegawai, 1 = Request Pembatalan Izin
  const [activeTab, setActiveTab] = useState<number>(0)

  // State Filter Utama
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfMonth(new Date()))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(endOfMonth(new Date()))
  const [statusApproval, setStatusApproval] = useState('Semua')
  const [jenisIzin, setJenisIzin] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  // Snapshot filter state
  const [currentFilters, setCurrentFilters] = useState<any>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    statusApproval: 'Semua',
    jenisIzin: 'Semua',
    searchQuery: ''
  })

  const [isFilterApplied, setIsFilterApplied] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // State PDF Preview Modal Dokumen Surat
  const [openPdf, setOpenPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')

  // Core Kepegawaian API Fetcher
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
          is_canceled: false,
          is_pegawai: true
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

  // Reset State Monitor Hub setelah CRUD Berhasil
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud.message || 'Data perizinan berhasil diproses')
      if (isFilterApplied && currentFilters) executeFetchData(page, perPage, currentFilters, activeTab)
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, page, perPage, isFilterApplied, currentFilters, activeTab, executeFetchData])

  // Handler Ganti Tab Kategori Pengajuan
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setPage(1)
  }

  const handleSearchSubmit = () => {
    if (tanggalAwal && tanggalAkhir && tanggalAwal > tanggalAkhir) {
      toast.error('Tanggal awal tidak boleh melebihi batas rentang tanggal akhir pencarian')
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
    setTanggalAwal(defaultStart)
    setTanggalAkhir(defaultEnd)
    setStatusApproval('Semua')
    setJenisIzin('Semua')
    setSearchQuery('')
    setPage(1)
    setIsFilterApplied(true)

    const baseFilters = {
      startDate: format(defaultStart, 'yyyy-MM-dd'),
      endDate: format(defaultEnd, 'yyyy-MM-dd'),
      statusApproval: 'Semua',
      jenisIzin: 'Semua',
      searchQuery: ''
    }
    setCurrentFilters(baseFilters)
    executeFetchData(1, perPage, baseFilters, activeTab)
  }

  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data pegawai secara terstruktur terlebih dahulu')
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
        toast.success('Berkas log perizinan pegawai berhasil diexport')
      }
    } catch {
      toast.error('Gagal memproses ekspor berkas data pegawai')
    } finally {
      setLoadingExport(false)
    }
  }

  // Column Renderers
  const renderOption = (row: any) => <RowAction row={row} currentUserRole={userRole} />

  const renderTanggalIzin = (row: any) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {row.tanggal_mulai ? format(new Date(row.tanggal_mulai), 'dd MMM yyyy') : '-'}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        sampai dengan {row.tanggal_selesai ? format(new Date(row.tanggal_selesai), 'dd MMM yyyy') : '-'}
      </Typography>
    </Box>
  )

  const renderStatusApproval = (row: any) => {
    const isCanceled = row.is_canceled === true || row.is_canceled === 'true'
    let label = row.status_approval

    if (isCanceled) {
      label = 'Dibatalkan'
    } else if (label === 'Disetujui') {
      label = row.is_request_canceled ? 'Menunggu Pembatalan' : 'Disetujui'
    } else if (label === 'Menunggu') {
      label = row.is_request_canceled ? 'Menunggu Pembatalan' : 'Menunggu Approval'
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
                  setPdfTitle(`Surat Keterangan Resmi ${item.pegawai?.full_name || 'Pegawai'} - ${item.jenis_izin}`)
                  setOpenPdf(true)
                }}
                sx={{ py: 0.5, px: 2, height: 26, fontSize: '0.7rem' }}
              >
                Lihat Berkas Dokumen
              </Button>
            )}
          </Box>
        )
      }
    })
    const tableCount = dataPage?.total || 0

    // TAB 2: Request Pembatalan Log List Kepegawaian
    if (activeTab === 1) {
      return {
        page: page,
        fields: [
          tableColumn('AKSI', 'act-x', 'center', renderOption as any),
          tableColumn('NO', 'no', 'center'),
          tableColumn('NAMA PEGAWAI', 'pegawai.nama_lengkap'),
          tableColumn('LOKASI KERJA', 'lokasiKerja.nama_lokasi'),
          tableColumn('KATEGORI JENIS', 'jenis_izin'),
          tableColumn('TANGGAL IZIN', 'tanggal_izin_range', 'left', renderTanggalIzin as any),
          tableColumn('PEMOHON DATA', 'creator.full_name'),
          tableColumn('STATUS KEPUTUSAN', 'status_approval_display', 'center', renderStatusApproval as any)
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

    // TAB 1: Perizinan Pegawai List (Default View)
    return {
      page: page,
      fields: [
        tableColumn('AKSI', 'act-x', 'center', renderOption as any),
        tableColumn('NO', 'no', 'center'),
        tableColumn('NAMA PEGAWAI', 'pegawai.nama_lengkap'),
        tableColumn('LOKASI KERJA', 'lokasiKerja.nama_lokasi'),
        tableColumn('KATEGORI JENIS', 'jenis_izin'),
        tableColumn('TANGGAL IZIN', 'tanggal_izin_range', 'left', renderTanggalIzin as any),
        tableColumn('STATUS KEPUTUSAN', 'status_approval_display', 'center', renderStatusApproval as any),
        tableColumn('KONDISI ABSEN', 'kondisi_display', 'center', renderKondisi as any)
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
        {/* IMPLEMENTASI TABS NAVIGATION CONTROLLER UTAMA */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label='Perizinan Pegawai Tabs'>
            <Tab label='Pengajuan Izin Pegawai' id='tab-perizinan-pegawai' />
            <Tab label='Request Pembatalan Izin' id='tab-pembatalan-pegawai' />
          </Tabs>
        </Box>

        {/* CONTAINER PANEL FILTER UTAMA */}
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
              <FormControl fullWidth size='small' disabled={activeTab === 1}>
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
                  <MenuItem value='Izin'>Izin Keluar Kantor</MenuItem>
                  <MenuItem value='Sakit'>Sakit Pendukung Surat Dokter</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Pencarian Nama NIP Unit Kerja'
                size='small'
                placeholder='Ketik nama pegawai, NIP, atau unit kerja...'
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
              Cari Data
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

            {/* {canImport && (
              <Button
                color='secondary'
                variant='contained'
                fullWidth={isMobile}
                startIcon={<i className='tabler-file-import' />}
                component={Link}
                href='/app/perizinan-pegawai/import?ub=manajemen-hrd'
              >
                Import Excel
              </Button>
            )} */}
          </Toolbar>
        </Card>

        {/* LOG DATA TABLE RENDERING */}
        <Card sx={{ overflowX: 'auto' }}>
          <CardHeader
            title={
              activeTab === 0 ? 'Daftar Riwayat Perizinan Kerja Pegawai' : 'Daftar Permintaan Pembatalan Izin Absensi'
            }
          />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      {/* PREVIEW MODAL SURAT */}
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
            Tutup Panel
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

export default PerizinanPegawaiTabsList
