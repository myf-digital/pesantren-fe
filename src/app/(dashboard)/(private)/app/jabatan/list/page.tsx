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
import { deleteJabatan, fetchJabatanPage, postExport, resetRedux } from '../slice/index'
import { useCan } from '@/hooks/useCan'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

/* -----------------------------------------------------------
   RowAction: Menggunakan id_jabatan
----------------------------------------------------------- */
const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = true //useCan('edit')
  const canDelete = true // useCan('delete')

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const content = (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem component={Link} href={`/app/jabatan/form?id=${row.id_jabatan}&view=true`} onClick={handleClose}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>

        {canEdit && (
          <MenuItem component={Link} href={`/app/jabatan/form?id=${row.id_jabatan}`} onClick={handleClose}>
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
        id={row.nama_jabatan}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_jabatan)
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
   Main Component: JabatanList
----------------------------------------------------------- */
const JabatanList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jabatan)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const fetchData = useCallback(() => {
    // Mengirim keyword untuk pencarian di Repository Backend
    dispatch(fetchJabatanPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      if (store.delete.status === true) {
        toast.success(store.delete.message || 'Data jabatan berhasil dihapus')
        fetchData()
      } else {
        // Menampilkan error jika jabatan masih memiliki relasi (misal: Pegawai)
        toast.error(store.delete.message || 'Gagal menghapus data')
      }
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onAddForm = () => {
    router.replace('/app/jabatan/form')
  }

  const onImport = () => {
    router.replace('/app/jabatan/import')
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
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteJabatan(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store
    const values = dataPage?.values || []

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('KODE', 'kode_jabatan'),
        tableColumn('NAMA JABATAN', 'nama_jabatan'),
        tableColumn('UNIT ORGANISASI', 'orgunit_display'),
        tableColumn('SIFAT', 'sifat_display'),
        tableColumn('LEVEL', 'level_display')
      ],
      values: values.map((row: any) => ({
        ...row,
        // Menampilkan Unit Organisasi dari relasi
        orgunit_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {row.orgunit?.nama_orgunit || '-'}
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              {row.orgunit?.jenis_orgunit || ''}
            </Typography>
          </Box>
        ),
        // Chip untuk Sifat Jabatan
        sifat_display: (
          <Chip label={row.sifat_jabatan} size='small' variant='tonal' color='secondary' sx={{ fontWeight: 500 }} />
        ),
        // Menampilkan Level Jabatan
        level_display: <Typography variant='body2'>Level {row.level_jabatan}</Typography>
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
          <CardHeader title='Jabatan' sx={{ paddingBottom: 0 }} />
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
              <Tooltip title='Import CSV'>
                <Button
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onImport}
                  startIcon={<i className='tabler-file-import' />}
                >
                  Import CSV
                </Button>
              </Tooltip>
            )}

            {canExport && (
              <Tooltip title='Export CSV'>
                <Button
                  size='small'
                  color='warning'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onExport}
                  startIcon={<i className='tabler-file-export' />}
                >
                  {loadingExport ? 'Proses...' : 'Export CSV'}
                </Button>
              </Tooltip>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Search'>
              <TextField id='outlined-basic' label='Search' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default JabatanList
