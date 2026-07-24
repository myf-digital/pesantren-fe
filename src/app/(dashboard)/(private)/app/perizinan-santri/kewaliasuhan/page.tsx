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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  useMediaQuery
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchPerizinanSantriPage,
  postPerizinanApprove,
  postPerizinanCancel,
  postPerizinanExport,
  resetRedux
} from '../slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import { useCan } from '@/hooks/useCan'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useSession } from 'next-auth/react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { fetchLocationPage } from '../../location/slice'

// Komponen Aksi Baris Tabel Dinamis Berdasarkan Struktur Akses & State Dokumen
const RowAction = ({
  row,
  currentUserRole,
  onApproveClick,
  onDetailClick
}: {
  row: any
  currentUserRole: string
  onApproveClick: (data: any) => void
  onDetailClick: (data: any) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Aturan Visibilitas Tombol Berdasarkan Spesifikasi Role & Status
  const isParentOrWali = ['orang_tua_wali', 'administrator'].includes(currentUserRole)
  const isKedisiplinan = ['pegawai_kedisiplinan', 'wali_asuh', 'administrator'].includes(currentUserRole)
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
          <MenuItem component={Link} href={`/app/perizinan-santri/detail?id=${row.id_izin}&view=true`}>
            <i className='tabler-eye' style={{ marginRight: 8 }} /> Detail
          </MenuItem>
        )}

        {/* Tombol Proses Pengajuan: Hanya aktif untuk divisi kedisiplinan pada status pending */}
        {isKedisiplinan && (isStatusMenunggu || isStatusRequestCanceled) && (
          <MenuItem component={Link} href={`/app/perizinan-santri/detail?id=${row.id_izin}`}>
            <i className='tabler-gavel' style={{ marginRight: 8 }} /> Proses Izin
          </MenuItem>
        )}

        {/* Cadangan fallback view reguler jika role diluar spesifikasi diatas */}
        {!isParentOrWali && !isKedisiplinan && (
          <MenuItem component={Link} href={`/app/perizinan-santri/detail?id=${row.id_izin}&view=true`}>
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

const PerizinanSantriList = () => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  // Ambil data profile / user metadata ter-autentikasi untuk mendeteksi Role pengguna saat ini
  const { data: session } = useSession()
  const currentUser: any = session?.userdata

  const userRole = currentUser?.role_name || 'pegawai_kedisiplinan' // Default fallback

  // Hooks Otorisasi Multi-Aksi Konten Vuexy
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Deteksi Breakpoint Media Screen untuk layouting Responsif (Mobile & Tablet)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  // State Options Master Data Dropdown
  const [optKamar, setOptKamar] = useState<any[]>([])

  // State Utama Filter Range Date & Kategori Data
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(null)
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(null)
  const [statusApproval, setStatusApproval] = useState('Semua')
  const [jenisIzin, setJenisIzin] = useState('Semua')
  const [idLokasiKamar, setIdLokasiKamar] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  // State Snapshot Sinkronisasi Fetcher
  const [currentFilters, setCurrentFilters] = useState<any>({
    startDate: null, // format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: null, // format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    statusApproval: 'Semua',
    jenisIzin: 'Semua',
    idLokasiKamar: 'Semua',
    searchQuery: ''
  })
  const [isFilterApplied, setIsFilterApplied] = useState(true)

  // State Pagination Tabel Utama
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // State Manajemen Approval Modal Dialog internal
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [selectedIzinRow, setSelectedIzinRow] = useState<any>(null)
  const [actionApprovalStatus, setActionApprovalStatus] = useState('Disetujui')
  const [alasanTolakText, setAlasanTolakText] = useState('')

  // State Detail Perizinan
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedDetailRow, setSelectedDetailRow] = useState<any>(null)

  // State PDF Preview Modal
  const [openPdf, setOpenPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')

  // Fetch Master Data Lokasi Kamar untuk Dropdown Filter
  useEffect(() => {
    const fetchMasterKamar = async () => {
      try {
        const resKamar = await dispatch(fetchLocationPage({ perPage: 1000, keyword: 'Kamar' })).unwrap()
        const kamarOptions = (resKamar?.data?.values || []).map((item: any) => ({
          label: `${item.nama_lokasi} (${item.parent?.nama_lokasi || 'Asrama'})`,
          value: item.id_lokasi
        }))
        setOptKamar(kamarOptions)
      } catch (err) {
        toast.error('Gagal memuat master lokasi kamar')
      }
    }

    fetchMasterKamar()
  }, [dispatch])

  // Core API Caller Page Fetcher
  const executeFetchData = useCallback(
    (currentPage: number, currentPerPage: number, filters: any) => {
      if (!filters) return
      dispatch(
        fetchPerizinanSantriPage({
          page: currentPage,
          perPage: currentPerPage,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          status_approval: filters.statusApproval !== 'Semua' ? filters.statusApproval : undefined,
          jenis_izin: filters.jenisIzin !== 'Semua' ? filters.jenisIzin : undefined,
          id_lokasi: filters.idLokasiKamar !== 'Semua' ? filters.idLokasiKamar : undefined,
          q: filters.searchQuery || undefined
        })
      )
    },
    [dispatch]
  )

  // Trigger Fetching Data Awal (Default Hari Ini) & Setiap Perubahan Halaman Table
  useEffect(() => {
    if (isFilterApplied && currentFilters) {
      executeFetchData(page, perPage, currentFilters)
    }
  }, [page, perPage, isFilterApplied, currentFilters, executeFetchData])

  // Reset State Monitor Hub setelah CRUD / Approval Selesai diproses
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud.message || 'Aksi status perizinan berhasil diproses')
      setOpenApproveModal(false)
      setSelectedIzinRow(null)
      setAlasanTolakText('')
      if (isFilterApplied && currentFilters) executeFetchData(page, perPage, currentFilters)
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, page, perPage, isFilterApplied, currentFilters, executeFetchData])

  // Handler Submit Filter Manual
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
      idLokasiKamar,
      searchQuery
    }
    setPage(1)
    setIsFilterApplied(true)
    setCurrentFilters(filters)
    executeFetchData(1, perPage, filters)
  }

  // Handler Reset Form Filter Pencarian Kembali ke Kondisi Semula
  const handleResetFilter = () => {
    const defaultStart = startOfMonth(new Date())
    const defaultEnd = endOfMonth(new Date())
    setTanggalAwal(null)
    setTanggalAkhir(null)
    setStatusApproval('Semua')
    setJenisIzin('Semua')
    setIdLokasiKamar('Semua'), setSearchQuery('')
    setPage(1)
    setIsFilterApplied(true)

    const baseFilters = {
      startDate: null,
      endDate: null,
      statusApproval: 'Semua',
      jenisIzin: 'Semua',
      idLokasiKamar: 'Semua',
      searchQuery: ''
    }
    setCurrentFilters(baseFilters)
    executeFetchData(1, perPage, baseFilters)
  }

  // Handler Trigger Approval Dialog Launcher
  const handleOpenApprovalDialog = (row: any) => {
    setSelectedIzinRow(row)
    setActionApprovalStatus('Disetujui')
    setOpenApproveModal(true)
  }

  // Submit Data Keputusan Modal ke Backend Service via Thunk Redux
  const handleSubmitDecision = () => {
    if (!selectedIzinRow) return

    if (actionApprovalStatus === 'Ditolak' && !alasanTolakText.trim()) {
      toast.warning('Silakan isi alasan penolakan berkas perizinan terlebih dahulu')
      return
    }

    dispatch(
      postPerizinanApprove({
        id: selectedIzinRow.id_izin,
        payload: {
          status_approval: actionApprovalStatus,
          alasan_reject: actionApprovalStatus === 'Ditolak' ? alasanTolakText : undefined
        }
      })
    )
  }

  // Core Excel Exporter Feature Client
  const onExport = async () => {
    if (!isFilterApplied || !currentFilters) {
      toast.warning('Silakan lakukan pencarian data log secara terstruktur terlebih dahulu')
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
          id_lokasi: currentFilters.idLokasiKamar !== 'Semua' ? currentFilters.idLokasiKamar : undefined,
          q: currentFilters.searchQuery || undefined
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')
        link.href = url
        link.click()
        toast.success('File perizinan berhasil diexport')
      }
    } catch {
      toast.error('Gagal memproses data export file excel')
    } finally {
      setLoadingExport(false)
    }
  }

  // Render Kolom Opsi Dinamis Terhadap Baris Record Tabel Utama
  const renderOption = (row: any) => {
    return (
      <RowAction
        row={row}
        currentUserRole={userRole}
        onApproveClick={handleOpenApprovalDialog}
        onDetailClick={handleOpenDetailModal}
      />
    )
  }

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
    if (!row.kondisi) {
      return '-'
    }

    return (
      <Chip
        label={row.kondisi || '-'}
        size='small'
        color={row.kondisi === 'Overdue' ? 'error' : row.kondisi === 'Closed' ? 'secondary' : 'primary'}
      />
    )
  }

  // Fungsi Komparasi Komponen Builder Struktur Kolom untuk TableView Komponen
  const buildTable = () => {
    let { dataPage } = store

    let tableValues = dataPage?.values || []
    tableValues = (dataPage?.values || []).map((item: any, index: number) => ({
      ...item,
      no: (page - 1) * perPage + index + 1
    }))
    const tableCount = dataPage?.total || 0

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
      values: tableValues.map((row: any) => {
        const fileUrl = row.file_izin
          ? row.file_izin.startsWith('http')
            ? row.file_izin
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${row.file_izin.startsWith('/') ? '' : '/'}${row.file_izin}`
          : ''

        return {
          ...row,
          jenis_izin: (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              <Typography variant='body2'>{row.jenis_izin}</Typography>
              {fileUrl && (
                <Button
                  size='small'
                  color='primary'
                  variant='tonal'
                  startIcon={<i className='tabler-file-download' />}
                  onClick={() => {
                    setPdfUrl(fileUrl)
                    setPdfTitle(`Berkas Izin ${row.santri?.fullname || 'Santri'} - ${row.jenis_izin}`)
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
      }),
      count: tableCount,
      perPage: perPage,
      changePage: (_: any, n: number) => setPage(n + 1),
      changePerPage: (e: any) => {
        setPerPage(parseInt(e.target.value, 10))
        setPage(1)
      }
    }
  }

  // Open Detail Perizinan
  const handleOpenDetailModal = (row: any) => {
    setSelectedDetailRow(row)
    setOpenDetailModal(true)
  }

  const handlePembatalan = async (idIzin: string) => {
    // Tampilkan konfirmasi native window opsional demi keamanan user klik
    const konfirmasi = window.confirm('Apakah Anda yakin ingin membatalkan pengajuan izin ini?')
    if (!konfirmasi) return

    try {
      // Eksekusi thunk pembatalan ke backend
      await dispatch(postPerizinanCancel({ id: idIzin })).unwrap()

      // Tutup modal setelah berhasil
      setOpenDetailModal(false)
      setSelectedDetailRow(null)
    } catch (err: any) {
      toast.error(err || 'Gagal memproses pembatalan izin')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
          {/* LAYOUT GRID RESPONSIF: Menyesuaikan kolom berdasarkan ukuran perangkat */}
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

            {/* Dropdown Filter Status Approval */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status Approval</InputLabel>
                <Select
                  label='Status Approval'
                  value={statusApproval}
                  onChange={e => setStatusApproval(e.target.value)}
                >
                  <MenuItem value='Semua'>Semua Status</MenuItem>
                  <MenuItem value='Menunggu'>Menunggu</MenuItem>
                  <MenuItem value='Disetujui'>Disetujui</MenuItem>
                  <MenuItem value='Ditolak'>Ditolak</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dropdown Filter Jenis Perizinan */}
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

            {/* Dropdown Filter Lokasi Kamar */}
            <Grid size={{ xs: 12, sm: 6, md: 3.2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Lokasi Kamar</InputLabel>
                <Select label='Lokasi Kamar' value={idLokasiKamar} onChange={e => setIdLokasiKamar(e.target.value)}>
                  <MenuItem value='Semua'>Semua Kamar</MenuItem>
                  {optKamar.map((item: any) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Multi Filter Free Text input */}
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

          {/* UTILITY BUTTONS BAR: Menggunakan Flex Wrap demi menjaga kerapihan tampilan Mobile */}
          {/* BARIS UTILITY BUTTONS */}
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

            <Button
              component={Link}
              href={`/app/perizinan-santri/form`}
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-file-plus' />}
            >
              Ajukan Izin
            </Button>

            {/* Spacer murni untuk mendorong button export/import ke sisi kanan pada layar desktop */}
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
                href='/app/perizinan-santri/import?ub=kewaliasuhan'
              >
                Import Excel
              </Button>
            )} */}
          </Toolbar>
        </Card>

        {/* LOG DATA UTAMA RENDERING */}
        <Card sx={{ overflowX: 'auto' }}>
          <CardHeader title='Daftar Riwayat Perizinan Santri' />

          {/* TableView Vuexy menangani scroll internal otomatis secara murni */}
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      {/* POPUP MODAL DIALOG EVALUASI KEPUTUSAN APPROVAL */}
      <Dialog open={openApproveModal} onClose={() => setOpenApproveModal(false)} maxWidth='sm' fullWidth scroll='body'>
        <DialogTitle
          component='div'
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Form Evaluasi Persetujuan Izin Santri
          </Typography>
          <IconButton onClick={() => setOpenApproveModal(false)} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 5 }}>
          {selectedIzinRow && (
            <Box sx={{ mb: 4, bgcolor: 'action.hover', p: 3, borderRadius: 1 }}>
              <Typography variant='subtitle2' color='primary' sx={{ fontWeight: 600, mb: 1 }}>
                INFORMASI PENGAJUAN
              </Typography>
              <Typography variant='body2'>
                <b>Nama Santri:</b> {selectedIzinRow.santri?.fullname} ({selectedIzinRow.santri?.nis || '-'})
              </Typography>
              <Typography variant='body2'>
                <b>Kamar / Lokasi:</b> {selectedIzinRow.lokasiKamar?.nama_lokasi || '-'}
              </Typography>
              <Typography variant='body2'>
                <b>Alasan Keperluan:</b> {selectedIzinRow.alasan || '-'}
              </Typography>
            </Box>
          )}

          <FormControl component='fieldset' fullWidth sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              Keputusan Otoritas Kedisiplinan:
            </Typography>
            <RadioGroup row value={actionApprovalStatus} onChange={e => setActionApprovalStatus(e.target.value)}>
              <FormControlLabel value='Disetujui' control={<Radio color='success' />} label='Setujui Pengajuan' />
              <FormControlLabel value='Ditolak' control={<Radio color='error' />} label='Tolak Pengajuan' />
            </RadioGroup>
          </FormControl>

          {actionApprovalStatus === 'Ditolak' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Alasan Penolakan Berkas'
              placeholder='Tuliskan catatan mengapa pengajuan ini ditolak oleh pihak kedisiplinan...'
              value={alasanTolakText}
              onChange={e => setAlasanTolakText(e.target.value)}
              variant='outlined'
              size='small'
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenApproveModal(false)} variant='outlined' color='secondary'>
            Kembali
          </Button>
          <Button
            onClick={handleSubmitDecision}
            variant='contained'
            color={actionApprovalStatus === 'Disetujui' ? 'success' : 'error'}
          >
            Eksekusi Keputusan
          </Button>
        </DialogActions>
      </Dialog>

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

export default PerizinanSantriList
