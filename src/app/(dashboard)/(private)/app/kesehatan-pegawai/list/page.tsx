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
  Autocomplete
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchKesehatanSantriPage,
  deleteKesehatanSantri,
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

const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const hasIzin = !!row.perizinan_id || !!row.izin_auto_created

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

        {canEdit && !hasIzin && (
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
            Detail Perawatan
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
            sx={{ cursor: 'pointer' }}
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
            Detail Rujukan
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
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      )
    }

    return <Chip label={status} size='small' color={mapColor[status] || 'primary'} variant='outlined' />
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
          <RowAction row={row} onDeleteSuccess={handleDelete} />
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
    </Grid>
  )
}

export default KesehatanPegawaiList
