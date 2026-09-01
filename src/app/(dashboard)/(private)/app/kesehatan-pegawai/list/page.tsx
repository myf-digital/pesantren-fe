'use client'

import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  Tooltip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchKesehatanSantriPage,
  deleteKesehatanSantri,
  putKesehatanSantriUpdate,
  resetRedux,
  postExportKesehatan
} from '../../kesehatan-santri/slice'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchOrgUnitAll } from '../../organisasi/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CopyTooltip from '@/components/CopyTooltip'

const DialogUpdateStatus = ({
  open,
  row,
  onClose,
  onSave,
  loading
}: {
  open: boolean
  row: any
  onClose: () => void
  onSave: (id: string, payload: any) => void
  loading: boolean
}) => {
  const [progresStatus, setProgresStatus] = useState<string>('Selesai')
  const [tempatDirawat, setTempatDirawat] = useState<string>('UKS')
  const [tanggalMulaiRawat, setTanggalMulaiRawat] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [tempatRujukan, setTempatRujukan] = useState<string>('')
  const [tanggalDirujuk, setTanggalDirujuk] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [estimasiHari, setEstimasiHari] = useState<string>('')

  useEffect(() => {
    if (row) {
      setProgresStatus(row.progres_status || 'Selesai')
      setTempatDirawat(row.tempat_dirawat || 'UKS')
      setTanggalMulaiRawat(
        row.tanggal_mulai_rawat ? format(new Date(row.tanggal_mulai_rawat), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      )
      setTempatRujukan(row.tempat_rujukan || '')
      setTanggalDirujuk(
        row.tanggal_dirujuk ? format(new Date(row.tanggal_dirujuk), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      )
      setEstimasiHari(row.estimasi_hari ? String(row.estimasi_hari) : '1')
    }
  }, [row])

  if (!row) return null

  const handleSave = () => {
    const payload: any = {
      id_santri: row.id_santri,
      id_pegawai: row.id_pegawai,
      kategori_sakit: row.kategori_sakit,
      progres_status: progresStatus,
      keluhan: row.keluhan,
      tindakan: row.tindakan || null,
      tanggal_event: row.tanggal_event ? format(new Date(row.tanggal_event), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      obat_diberikan: row.obat_diberikan || null,
      keterangan: row.keterangan || null
    }

    if (progresStatus === 'Dirawat') {
      if (!tempatDirawat) {
        toast.error('Pilih lokasi rawat!')
        return
      }
      if (!tanggalMulaiRawat) {
        toast.error('Tanggal mulai rawat wajib diisi!')
        return
      }
      const est = parseInt(estimasiHari, 10)
      if (isNaN(est) || est <= 0) {
        toast.error('Estimasi hari rawat wajib diisi minimal 1 hari!')
        return
      }
      payload.tempat_dirawat = tempatDirawat
      payload.tanggal_mulai_rawat = tanggalMulaiRawat
      payload.estimasi_hari = est
    } else if (progresStatus === 'Dirujuk') {
      if (!tempatRujukan.trim()) {
        toast.error('Tempat rujukan wajib diisi!')
        return
      }
      if (!tanggalDirujuk) {
        toast.error('Tanggal dirujuk wajib diisi!')
        return
      }
      const est = parseInt(estimasiHari, 10)
      if (isNaN(est) || est <= 0) {
        toast.error('Estimasi hari rujukan wajib diisi minimal 1 hari!')
        return
      }
      payload.tempat_rujukan = tempatRujukan.trim()
      payload.tanggal_dirujuk = tanggalDirujuk
      payload.estimasi_hari = est
    } else if (progresStatus === 'Selesai') {
      if (row.tempat_dirawat) payload.tempat_dirawat = row.tempat_dirawat
      if (row.tanggal_mulai_rawat) {
        payload.tanggal_mulai_rawat = format(new Date(row.tanggal_mulai_rawat), 'yyyy-MM-dd')
      }
      if (row.tempat_rujukan) payload.tempat_rujukan = row.tempat_rujukan
      if (row.tanggal_dirujuk) {
        payload.tanggal_dirujuk = format(new Date(row.tanggal_dirujuk), 'yyyy-MM-dd')
      }
      if (row.estimasi_hari) {
        payload.estimasi_hari = row.estimasi_hari
      } else if (row.tempat_dirawat || row.tempat_rujukan) {
        payload.estimasi_hari = 1
      }
    }

    onSave(row.id_kesehatan, payload)
  }

  const titleName = row.pegawai?.nama_lengkap || row.santri?.fullname || 'Pasien'
  const isOriginalDirawat = row?.progres_status === 'Dirawat'
  const isOriginalDirujuk = row?.progres_status === 'Dirujuk'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ pb: 1 }}>Update Progres Status</DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body2' color='text.secondary'>
          Nama: <strong>{titleName}</strong>
        </Typography>

        <FormControl fullWidth size='small'>
          <InputLabel>Progres Status</InputLabel>
          <Select
            value={progresStatus}
            label='Progres Status'
            onChange={e => setProgresStatus(e.target.value as string)}
          >
            <MenuItem value='Selesai'>Selesai</MenuItem>
            <MenuItem value='Dirawat'>Dirawat</MenuItem>
            <MenuItem value='Dirujuk'>Dirujuk</MenuItem>
          </Select>
        </FormControl>

        {progresStatus === 'Dirawat' && (
          <>
            <FormControl fullWidth size='small' disabled={isOriginalDirawat}>
              <InputLabel>Lokasi Rawat</InputLabel>
              <Select
                value={tempatDirawat}
                label='Lokasi Rawat'
                disabled={isOriginalDirawat}
                onChange={e => setTempatDirawat(e.target.value as string)}
              >
                <MenuItem value='UKS'>UKS</MenuItem>
                <MenuItem value='Kamar'>Kamar</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size='small'
              type='date'
              label='Tanggal Mulai Rawat'
              value={tanggalMulaiRawat}
              disabled={isOriginalDirawat}
              onChange={e => setTanggalMulaiRawat(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              size='small'
              type='number'
              label='Estimasi Hari Rawat'
              required
              inputProps={{ min: 1, max: 30 }}
              value={estimasiHari}
              onChange={e => setEstimasiHari(e.target.value)}
            />
          </>
        )}

        {progresStatus === 'Dirujuk' && (
          <>
            <TextField
              fullWidth
              size='small'
              type='date'
              label='Tanggal Dirujuk'
              value={tanggalDirujuk}
              disabled={isOriginalDirujuk}
              onChange={e => setTanggalDirujuk(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              size='small'
              label='Tempat Rujukan'
              placeholder='Klinik / Rumah Sakit'
              value={tempatRujukan}
              disabled={isOriginalDirujuk}
              onChange={e => setTempatRujukan(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              type='number'
              label='Estimasi Hari Rujukan'
              required
              inputProps={{ min: 1, max: 30 }}
              value={estimasiHari}
              onChange={e => setEstimasiHari(e.target.value)}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' disabled={loading}>
          Batal
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const RowAction = ({
  row,
  onDeleteSuccess,
  onUpdateStatus
}: {
  row: any
  onDeleteSuccess: (id: string) => void
  onUpdateStatus: (row: any) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const hasIzin = !!row.perizinan_id || !!row.izin_auto_created
  const isSelesai = row.progres_status === 'Selesai'

  const content = (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          component={Link}
          href={`/app/kesehatan-pegawai/form?id=${row.id_kesehatan}&view=true`}
          onClick={handleClose}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View Detail
        </MenuItem>

        {canEdit && !isSelesai && (
          <MenuItem
            onClick={() => {
              handleClose()
              onUpdateStatus(row)
            }}
          >
            <i className='tabler-refresh' style={{ marginRight: 8 }} /> Ubah Progres Status
          </MenuItem>
        )}

        {canEdit && !hasIzin && !isSelesai && (
          <MenuItem component={Link} href={`/app/kesehatan-pegawai/form?id=${row.id_kesehatan}`} onClick={handleClose}>
            <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
          </MenuItem>
        )}

        {canDelete && !hasIzin && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
            <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        id={row.pegawai?.nama_lengkap || 'Pemeriksaan Kesehatan'}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_kesehatan)
          setOpenConfirm(false)
        }}
        handleClose={() => setOpenConfirm(false)}
      />
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

const KesehatanPegawaiList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kesehatan_santri) // Menggunakan slice yang sama
  const storeCabang = useAppSelector(state => state.cabang)
  const storeOrgUnit = useAppSelector(state => state.organisasi_unit)

  const canCreate = useCan('create')
  const canExport = useCan('export')

  // Filter States
  const [selectedCabang, setSelectedCabang] = useState<{ label: string; value: string } | null>({
    label: 'Semua Cabang',
    value: ''
  })
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<{ label: string; value: string } | null>({
    label: 'Semua Org Unit',
    value: ''
  })
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfMonth(new Date()))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(endOfMonth(new Date()))
  const [kategoriSakit, setKategoriSakit] = useState('Semua')
  const [progresStatus, setProgresStatus] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const [selectedRowStatus, setSelectedRowStatus] = useState<any>(null)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)

  const handleOpenStatusDialog = (row: any) => {
    setSelectedRowStatus(row)
    setOpenStatusDialog(true)
  }

  const handleSaveStatus = (id: string, payload: any) => {
    dispatch(putKesehatanSantriUpdate({ id, params: payload }))
  }

  useEffect(() => {
    dispatch(fetchCabangAll({}))
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchOrgUnitAll({ id_cabang: selectedCabang?.value || undefined }))
  }, [dispatch, selectedCabang])

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExportKesehatan({
          q: searchQuery || undefined,
          kategori_sakit: kategoriSakit !== 'Semua' ? kategoriSakit : undefined,
          progres_status: progresStatus !== 'Semua' ? progresStatus : undefined,
          tanggal_awal: tanggalAwal ? format(tanggalAwal, 'yyyy-MM-dd') : undefined,
          tanggal_akhir: tanggalAkhir ? format(tanggalAkhir, 'yyyy-MM-dd') : undefined,
          id_cabang: selectedCabang?.value || undefined,
          id_orgunit: selectedOrgUnit?.value || undefined,
          subject_type: 'pegawai'
        })
      ).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')

        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Data kesehatan pegawai berhasil diexport')
      } else {
        toast.error(res?.message || 'Gagal export data')
      }
    } catch {
      toast.error('Gagal export data')
    } finally {
      setLoadingExport(false)
    }
  }

  const fetchData = useCallback(() => {
    dispatch(
      fetchKesehatanSantriPage({
        page,
        perPage,
        q: searchQuery || undefined,
        kategori_sakit: kategoriSakit !== 'Semua' ? kategoriSakit : undefined,
        progres_status: progresStatus !== 'Semua' ? progresStatus : undefined,
        tanggal_awal: tanggalAwal ? format(tanggalAwal, 'yyyy-MM-dd') : undefined,
        tanggal_akhir: tanggalAkhir ? format(tanggalAkhir, 'yyyy-MM-dd') : undefined,
        id_cabang: selectedCabang?.value || undefined,
        id_orgunit: selectedOrgUnit?.value || undefined,
        subject_type: 'pegawai'
      })
    )
  }, [
    dispatch,
    page,
    perPage,
    searchQuery,
    kategoriSakit,
    progresStatus,
    tanggalAwal,
    tanggalAkhir,
    selectedCabang,
    selectedOrgUnit
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      if (store.delete.status) {
        toast.success(store.delete.message || 'Log medis pegawai berhasil dihapus')
        fetchData()
      } else {
        toast.error(store.delete.message || 'Gagal menghapus log medis')
      }
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message || 'Progres status berhasil diperbarui')
        setOpenStatusDialog(false)
        setSelectedRowStatus(null)
        fetchData()
      } else {
        toast.error(store.crud.message || 'Gagal memperbarui progres status')
      }
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, fetchData])

  const handleDelete = (id: string) => {
    dispatch(deleteKesehatanSantri(id))
  }

  const renderKategori = (row: any) => {
    const mapColor: any = {
      Ringan: 'success',
      Sedang: 'warning',
      Berat: 'error'
    }
    return <Chip label={row.kategori_sakit} size='small' color={mapColor[row.kategori_sakit] || 'primary'} />
  }

  const renderProgres = (row: any) => {
    const mapColor: any = {
      Selesai: 'success',
      Dirawat: 'warning',
      Dirujuk: 'secondary'
    }
    const status = row.progres_status

    if (status === 'Dirawat') {
      const tooltipContent = (
        <Box sx={{ p: 1 }}>
          <Typography
            variant='subtitle2'
            sx={{
              color: 'common.white',
              fontWeight: 600,
              mb: 1,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              pb: 0.5
            }}
          >
            Detail Perawatan (Klik untuk ubah)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Tgl Mulai:</strong>{' '}
              {row.tanggal_mulai_rawat ? format(new Date(row.tanggal_mulai_rawat), 'dd MMM yyyy') : '-'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Lokasi:</strong> {row.tempat_dirawat || '-'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Estimasi:</strong> {row.estimasi_hari ? `${row.estimasi_hari} Hari` : '-'}
            </Typography>
          </Box>
        </Box>
      )

      return (
        <Tooltip title={tooltipContent} arrow placement='top' enterTouchDelay={0} leaveTouchDelay={3000}>
          <Chip
            label={status}
            size='small'
            color={mapColor[status] || 'primary'}
            variant='outlined'
            onClick={() => handleOpenStatusDialog(row)}
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          />
        </Tooltip>
      )
    }

    if (status === 'Dirujuk') {
      const tooltipContent = (
        <Box sx={{ p: 1 }}>
          <Typography
            variant='subtitle2'
            sx={{
              color: 'common.white',
              fontWeight: 600,
              mb: 1,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              pb: 0.5
            }}
          >
            Detail Rujukan (Klik untuk ubah)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Tgl Rujuk:</strong>{' '}
              {row.tanggal_dirujuk ? format(new Date(row.tanggal_dirujuk), 'dd MMM yyyy') : '-'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Tempat Rujukan:</strong> {row.tempat_rujukan || '-'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'common.white' }}>
              <strong>Estimasi:</strong> {row.estimasi_hari ? `${row.estimasi_hari} Hari` : '-'}
            </Typography>
          </Box>
        </Box>
      )

      return (
        <Tooltip title={tooltipContent} arrow placement='top' enterTouchDelay={0} leaveTouchDelay={3000}>
          <Chip
            label={status}
            size='small'
            color={mapColor[status] || 'primary'}
            variant='outlined'
            onClick={() => handleOpenStatusDialog(row)}
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          />
        </Tooltip>
      )
    }

    if (status === 'Selesai') {
      return <Chip label={status} size='small' color={mapColor[status] || 'primary'} variant='outlined' />
    }

    return (
      <Tooltip title='Klik untuk ubah progres status' arrow placement='top'>
        <Chip
          label={status}
          size='small'
          color={mapColor[status] || 'primary'}
          variant='outlined'
          onClick={() => handleOpenStatusDialog(row)}
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
        />
      </Tooltip>
    )
  }

  const renderStatusIzin = (row: any) => {
    if (!row.perizinan) return '-'
    const status = row.perizinan.status_approval
    const color = status === 'Disetujui' ? 'success' : status === 'Ditolak' ? 'error' : 'warning'
    return <Chip label={status} size='small' color={color} />
  }

  const renderGate = (row: any) => {
    if (!row.perizinan) return '-'
    const kondisi = row.perizinan.kondisi
    if (kondisi === 'Normal') {
      return <Chip label='Keluar' size='small' color='error' variant='tonal' />
    } else if (kondisi === 'Closed' || kondisi === 'Overdue') {
      return <Chip label='Kembali' size='small' color='success' variant='tonal' />
    }
    return '-'
  }

  const buildTable = () => {
    const { dataPage } = store
    const values = dataPage?.values || []
    const total = dataPage?.total || 0

    return {
      page: page,
      fields: [
        tableColumn('AKSI', 'act-x', 'center', ((row: any) => (
          <RowAction row={row} onDeleteSuccess={handleDelete} onUpdateStatus={handleOpenStatusDialog} />
        )) as any),
        tableColumn('NAMA PEGAWAI', 'pegawai'),
        tableColumn('TGL EVENT', 'tanggal_event'),
        tableColumn('NAMA PETUGAS', 'petugas'),
        tableColumn('KATEGORI', 'kategori_sakit_badge', 'center', renderKategori as any),
        tableColumn('PROGRES', 'progres_status_badge', 'center', renderProgres as any),
        tableColumn('STATUS IZIN', 'status_izin_badge', 'center', renderStatusIzin as any),
        tableColumn('GATE', 'gate_badge', 'center', renderGate as any)
      ],
      values: values.map((row: any) => ({
        ...row,
        tanggal_event: row.tanggal_event ? format(new Date(row.tanggal_event), 'dd MMM yyyy HH:mm') : '-',
        petugas: row?.petugas?.full_name || '-',
        pegawai: (
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
                title={row?.pegawai?.nama_lengkap}
              >
                {row?.pegawai?.nama_lengkap}
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
                  NIP: {row?.pegawai?.nip || '-'}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.disabled'>
                {row?.pegawai?.organizationUnit?.nama_orgunit || '-'}
              </Typography>
            </Box>
          </Box>
        )
      })),
      count: total,
      perPage: perPage,
      changePage: (_: any, newPage: number) => setPage(newPage + 1),
      changePerPage: (event: any) => {
        setPerPage(parseInt(event.target.value, 10))
        setPage(1)
      }
    }
  }

  const summary = store.dataPage?.summary || { ringan: 0, sedang: 0, berat: 0, dirawat: 0, dirujuk: 0 }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant='h5'>Kesehatan Pegawai</Typography>
            <Typography variant='body2' color='text.secondary'>
              Modul Kesehatan Pegawai / Guru
            </Typography>
          </Box>
        </Box>

        <Card sx={{ p: 5, mb: 4, overflow: 'visible' }}>
          {canCreate && (
            <Tooltip title='Pemeriksaan Baru'>
              <Button
                size='small'
                variant='outlined'
                sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                component={Link}
                href='/app/kesehatan-pegawai/form'
                startIcon={<i className='tabler-plus' />}
              >
                Pemeriksaan Baru
              </Button>
            </Tooltip>
          )}
          {canExport && (
            <Tooltip title='Export Excel'>
              <Button
                size='small'
                color='warning'
                variant='outlined'
                sx={{ height: 32, fontSize: '0.75rem', px: 2, ml: 2 }}
                onClick={onExport}
                disabled={loadingExport}
                startIcon={<i className='tabler-file-export' />}
              >
                {loadingExport ? 'Memproses...' : 'Export Excel'}
              </Button>
            </Tooltip>
          )}
          <Grid container spacing={4} sx={{ pt: 10 }}>
            <Grid size={{ xs: 12, sm: 2 }}>
              <AppReactDatepicker
                selected={tanggalAwal}
                onChange={(date: Date | null) => setTanggalAwal(date)}
                placeholderText='MM/DD/YYYY'
                customInput={<PickersComponent label='Tanggal Mulai' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <AppReactDatepicker
                selected={tanggalAkhir}
                onChange={(date: Date | null) => setTanggalAkhir(date)}
                placeholderText='MM/DD/YYYY'
                customInput={<PickersComponent label='Tanggal Selesai' />}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4} sx={{ pt: 5 }}>
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua Cabang', value: '' },
                  ...(storeCabang.datas || []).map((r: any) => ({
                    label: `${r.nama_cabang}`,
                    value: r.id_cabang
                  }))
                ]}
                value={selectedCabang}
                onChange={(_, newValue) => {
                  setSelectedCabang(newValue)
                  setSelectedOrgUnit({ label: 'Semua Org Unit', value: '' })
                  setPage(1)
                }}
                getOptionLabel={option => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={params => <TextField {...params} label='Cabang' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua Org Unit', value: '' },
                  ...(storeOrgUnit.datas || [])
                    .filter((r: any) => !selectedCabang?.value || r.id_cabang === selectedCabang?.value)
                    .map((r: any) => ({
                      label: `${r.nama_orgunit}`,
                      value: r.id_orgunit
                    }))
                ]}
                value={selectedOrgUnit}
                onChange={(_, newValue) => {
                  setSelectedOrgUnit(newValue)
                  setPage(1)
                }}
                getOptionLabel={option => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={params => <TextField {...params} label='Organisasi Unit' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Kategori</InputLabel>
                <Select label='Kategori' value={kategoriSakit} onChange={e => setKategoriSakit(e.target.value)}>
                  <MenuItem value='Semua'>Semua Kategori</MenuItem>
                  <MenuItem value='Ringan'>Ringan</MenuItem>
                  <MenuItem value='Sedang'>Sedang</MenuItem>
                  <MenuItem value='Berat'>Berat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Progres</InputLabel>
                <Select label='Progres' value={progresStatus} onChange={e => setProgresStatus(e.target.value)}>
                  <MenuItem value='Semua'>Semua Status</MenuItem>
                  <MenuItem value='Selesai'>Selesai</MenuItem>
                  <MenuItem value='Dirawat'>Dirawat</MenuItem>
                  <MenuItem value='Dirujuk'>Dirujuk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label='Cari Nama / NIP'
                size='small'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Cari...'
              />
            </Grid>
          </Grid>
        </Card>

        {/* Ringkasan */}
        <Card sx={{ p: 5, mb: 4 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3 }}>
            Ringkasan
          </Typography>
          <Grid container spacing={6}>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ borderRight: { sm: '1px solid var(--mui-palette-divider)' }, pr: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Ringan
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, color: 'success.main', fontWeight: 600 }}>
                  {summary.ringan}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ borderRight: { sm: '1px solid var(--mui-palette-divider)' }, pr: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Sedang
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, color: 'warning.main', fontWeight: 600 }}>
                  {summary.sedang}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ borderRight: { sm: '1px solid var(--mui-palette-divider)' }, pr: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Berat
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, color: 'error.main', fontWeight: 600 }}>
                  {summary.berat}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ borderRight: { sm: '1px solid var(--mui-palette-divider)' }, pr: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Dirawat
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, color: 'warning.dark', fontWeight: 600 }}>
                  {summary.dirawat}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Dirujuk
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, color: 'secondary.main', fontWeight: 600 }}>
                  {summary.dirujuk}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Tabel Data */}
        <Card sx={{ overflowX: 'auto' }}>
          <CardHeader title='Tabel Data' sx={{ pb: 0 }} />
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      <DialogUpdateStatus
        open={openStatusDialog}
        row={selectedRowStatus}
        onClose={() => setOpenStatusDialog(false)}
        onSave={handleSaveStatus}
        loading={store.loading}
      />
    </Grid>
  )
}

export default KesehatanPegawaiList
