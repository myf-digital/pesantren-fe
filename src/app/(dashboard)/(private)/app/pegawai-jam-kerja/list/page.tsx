'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  useMediaQuery
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteJamKerja, fetchJamKerjaPage, postJamKerjaExport, resetRedux } from '../slice/index'

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
        <MenuItem component={Link} href={`/app/pegawai-jam-kerja/form?id=${row.id_jamkerja}&view=true`}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/pegawai-jam-kerja/form?id=${row.id_jamkerja}`}>
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
        id={row.pegawai?.nama_lengkap || 'Master Jam Kerja'}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_jamkerja)
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

const JamKerjaPegawaiList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jam_kerja_pegawai)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const fetchData = useCallback(() => {
    dispatch(fetchJamKerjaPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)

    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Master jam kerja pegawai berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onAddForm = () => {
    router.replace('/app/pegawai-jam-kerja/form')
  }

  const onImport = () => {
    router.replace('/app/pegawai-jam-kerja/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(postJamKerjaExport({ q: filter, template: '0' })).unwrap()

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
      toast.error('Gagal export data excel')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteJamKerja(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('PEGAWAI', 'pegawai_display'),
        tableColumn('JADWAL WAKTU', 'waktu_display'),
        tableColumn('LOKASI KERJA', 'lokasi_display'),
        tableColumn('KETERANGAN', 'keterangan_display'),
        tableColumn('STATUS', 'status_display')
      ],
      values: (dataPage?.values || []).map((row: any) => ({
        ...row,
        pegawai_display: (
          <CopyTooltip
            textToCopy={row.id_jamkerja}
            title={
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {row.pegawai?.nama_lengkap || '-'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {row.pegawai?.nik && (
                    <Typography variant='caption' sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: 'grey.100' }}>
                      NIK: {row.pegawai?.nik}
                    </Typography>
                  )}
                  {row.pegawai?.nip && (
                    <Typography
                      variant='caption'
                      sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.main' }}
                    >
                      NIP: {row.pegawai?.nip}
                    </Typography>
                  )}
                </Box>
              </Box>
            }
          />
        ),
        waktu_display: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip label={`${row.waktu_mulai || '00:00'} WIB`} size='small' color='primary' variant='outlined' />
            <Typography variant='caption' color='text.secondary'>
              s/d
            </Typography>
            <Chip label={`${row.waktu_selesai || '00:00'} WIB`} size='small' color='error' variant='outlined' />
          </Box>
        ),
        lokasi_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {row.lokasiKerja?.nama_lokasi || '-'}
            </Typography>
            {row.lokasiKerja?.jenis_lokasi && (
              <Typography variant='caption' color='text.disabled'>
                Type: {row.lokasiKerja?.jenis_lokasi}
              </Typography>
            )}
          </Box>
        ),
        keterangan_display: (
          <Typography
            variant='body2'
            sx={{
              maxWidth: 250,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={row.keterangan}
          >
            {row.keterangan || '-'}
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
          <CardHeader title='Data Acuan Jam Kerja Pegawai' sx={{ paddingBottom: 0 }} />
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
              <Tooltip title='Tambah Jam Kerja'>
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
                  Import Excel
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
                  {loadingExport ? 'Proses...' : 'Export Excel'}
                </Button>
              </Tooltip>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default JamKerjaPegawaiList
