'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import {
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
  Tooltip,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteMasterPelanggaranRemisi,
  fetchMasterPelanggaranRemisiPage,
  postMasterPelanggaranRemisiExport,
  resetRedux
} from '../slice/index' // Sesuaikan path import

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import CopyTooltip from '@/components/CopyTooltip'

const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/app/pelanggaran-remisi-master/form?id=${row.id_pelanggaran_remisi}&view=true`}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/pelanggaran-remisi-master/form?id=${row.id_pelanggaran_remisi}`}>
            <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
            <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        id={row.nama_pelanggaran}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_pelanggaran_remisi)
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

const MasterPelanggaranRemisiList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.master_pelanggaran_remisi)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Read initial filters from URL params
  const initialJenis = searchParams.get('jenis') || 'Semua'
  const initialKategori = searchParams.get('kategori') || 'Semua'
  const initialIsActive = searchParams.get('is_active') || 'Semua'

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const [jenis, setJenis] = useState(initialJenis)
  const [kategori, setKategori] = useState(initialKategori)
  const [isActive, setIsActive] = useState(initialIsActive)

  const fetchData = useCallback(() => {
    dispatch(
      fetchMasterPelanggaranRemisiPage({
        page,
        perPage,
        keyword: filter,
        jenis: jenis !== 'Semua' ? jenis : undefined,
        kategori: kategori !== 'Semua' ? kategori : undefined,
        is_active: isActive !== 'Semua' ? isActive : undefined
      })
    )
  }, [dispatch, page, perPage, filter, jenis, kategori, isActive])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Master Data berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onAddForm = () => {
    router.replace('/app/pelanggaran-remisi-master/form')
  }

  const onImport = () => {
    router.replace('/app/pelanggaran-remisi-master/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postMasterPelanggaranRemisiExport({
          q: filter,
          jenis: jenis !== 'Semua' ? jenis : undefined,
          kategori: kategori !== 'Semua' ? kategori : undefined,
          is_active: isActive !== 'Semua' ? isActive : undefined
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
      }
    } catch {
      toast.error('Gagal export data')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteMasterPelanggaranRemisi(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('MASTER DATA', 'master_display'),
        tableColumn('KLASIFIKASI', 'klasifikasi_display'),
        tableColumn('SKOR', 'skor_display'),
        tableColumn('STATUS', 'status_display')
      ],
      values: (dataPage?.values || []).map((row: any) => ({
        ...row,
        master_display: (
          <CopyTooltip
            textToCopy={row.kode_pelanggaran}
            sx={{ display: 'flex', minWidth: 0, width: '100%' }}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%' }}>
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
                    title={row.nama_pelanggaran}
                  >
                    {row.nama_pelanggaran}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.2,
                      mt: 0.5,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      fontWeight: 500
                    }}
                  >
                    {row.kode_pelanggaran || '-'}
                  </Typography>
                </Box>
              </Box>
            }
          />
        ),
        klasifikasi_display: (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {row.jenis || '-'}
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              {row.kategori || 'Tanpa Kategori'}
            </Typography>
          </Box>
        ),
        skor_display: (
          <Typography
            variant='body2'
            sx={{
              fontWeight: 700,
              color: row.jenis === 'Pelanggaran' ? 'error.main' : 'success.main'
            }}
          >
            {row.skor > 0 ? `+${row.skor}` : row.skor}
          </Typography>
        ),
        status_display: (
          <Chip
            label={row.is_active ? 'Aktif' : 'Tidak Aktif'}
            size='small'
            color={row.is_active ? 'success' : 'secondary'}
            variant='tonal'
          />
        )
      })),
      count: dataPage?.total || 0,
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
        <Card>
          <CardHeader title='Master Pelanggaran & Remisi' sx={{ paddingBottom: 2 }} />
          <Box sx={{ px: 6, pb: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='jenis-select-label'>Jenis</InputLabel>
                  <Select
                    labelId='jenis-select-label'
                    id='jenis-select'
                    value={jenis}
                    label='Jenis'
                    onChange={e => setJenis(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='Pelanggaran'>Pelanggaran</MenuItem>
                    <MenuItem value='Remisi'>Remisi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='kategori-select-label'>Kategori</InputLabel>
                  <Select
                    labelId='kategori-select-label'
                    id='kategori-select'
                    value={kategori}
                    label='Kategori'
                    onChange={e => setKategori(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='Ringan'>Ringan</MenuItem>
                    <MenuItem value='Sedang'>Sedang</MenuItem>
                    <MenuItem value='Berat'>Berat</MenuItem>
                    <MenuItem value='Sangat Berat'>Sangat Berat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='status-select-label'>Status Aktif</InputLabel>
                  <Select
                    labelId='status-select-label'
                    id='status-select'
                    value={isActive}
                    label='Status Aktif'
                    onChange={e => setIsActive(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='1'>Aktif</MenuItem>
                    <MenuItem value='0'>Tidak Aktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          <Toolbar
            sx={{
              px: '1.5rem !important',
              minHeight: 'auto',
              gap: 2,
              flexWrap: 'wrap',
              mb: '10px'
            }}
          >
            {canCreate && (
              <Tooltip title='Tambah Master'>
                <Button
                  size='small'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onAddForm}
                  startIcon={<i className='tabler-plus' />}
                >
                  Tambah
                </Button>
              </Tooltip>
            )}

            {canImport && (
              <Tooltip title='Import Excel'>
                <Button
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onImport}
                  startIcon={<i className='tabler-file-import' />}
                >
                  Import
                </Button>
              </Tooltip>
            )}

            {canExport && (
              <Tooltip title='Export Excel'>
                <Button
                  size='small'
                  color='warning'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onExport}
                  startIcon={<i className='tabler-file-export' />}
                >
                  {loadingExport ? 'Proses...' : 'Export'}
                </Button>
              </Tooltip>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari Nama / Kode...'>
              <TextField id='outlined-basic' label='Cari Data...' size='small' value={filter} onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default MasterPelanggaranRemisiList
