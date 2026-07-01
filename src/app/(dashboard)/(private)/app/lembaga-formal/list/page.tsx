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
import { deleteLembagaFormal, fetchLembagaFormalPage, postExport, resetRedux } from '../slice/index'
import { useCan } from '@/hooks/useCan'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import CopyTooltip from '@/components/CopyTooltip'

/* -----------------------------------------------------------
   RowAction: Menggunakan id_lembaga
----------------------------------------------------------- */
const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const content = (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          component={Link}
          href={`/app/lembaga-formal/form?id=${row.id_lembaga}&view=true`}
          onClick={handleClose}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>

        {canEdit && (
          <MenuItem component={Link} href={`/app/lembaga-formal/form?id=${row.id_lembaga}`} onClick={handleClose}>
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
        id={row.nama_lembaga}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_lembaga)
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

/* -----------------------------------------------------------
   Main Component
----------------------------------------------------------- */
const LembagaFormalList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.lembaga_formal)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const fetchData = useCallback(() => {
    dispatch(fetchLembagaFormalPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      toast.success('Data lembaga formal berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onAddForm = () => {
    router.replace('/app/lembaga-formal/form')
  }

  const onImport = () => {
    router.replace('/app/lembaga-formal/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(postExport({ q: filter })).unwrap()

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
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteLembagaFormal(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store
    const values = dataPage?.values || []

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('NAMA LEMBAGA', 'nama_lembaga_display'),
        tableColumn('JENIS', 'jenis_display'),
        tableColumn('AKREDITASI', 'akreditasi_display'),
        tableColumn('CABANG', 'cabang_display'),
        tableColumn('NPSN', 'nomor_npsn')
      ],
      values: values.map((row: any) => ({
        ...row,
        // Nama Lembaga dengan Subtitle Keterangan
        nama_lembaga_display: (
          <CopyTooltip
            textToCopy={row.id_lembaga}
            title={
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'inherit' }}>
                  {row.nama_lembaga}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.keterangan || '-'}
                </Typography>
              </Box>
            }
          />
        ),
        // Chip untuk Jenis Lembaga (SD, SMP, dll)
        jenis_display: (
          <Chip label={row.jenis_lembaga} size='small' variant='tonal' color='primary' sx={{ fontWeight: 500 }} />
        ),
        // Akreditasi dengan warna dinamik
        akreditasi_display: (
          <Chip
            label={row.status_akreditasi || 'N/A'}
            size='small'
            color={
              row.status_akreditasi === 'A'
                ? 'success'
                : row.status_akreditasi === 'B'
                  ? 'info'
                  : row.status_akreditasi === 'C'
                    ? 'warning'
                    : 'default'
            }
            variant='outlined'
          />
        ),
        // Cabang Display
        cabang_display: <Typography variant='body2'>{row.cabang?.nama_cabang || '-'}</Typography>
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
          <CardHeader title='Lembaga Pendidikan Formal' sx={{ paddingBottom: 0 }} />
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
              <Tooltip title='Tambah'>
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

export default LembagaFormalList
