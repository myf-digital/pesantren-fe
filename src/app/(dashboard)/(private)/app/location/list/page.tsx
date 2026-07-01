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
import { deleteLocation, fetchLocationPage, postExportLocation, resetRedux } from '../slice/index'
import { useCan } from '@/hooks/useCan'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import CopyTooltip from '@/components/CopyTooltip'

/* -----------------------------------------------------------
   RowAction: Menggunakan id_lokasi
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
        <MenuItem component={Link} href={`/app/location/form?id=${row.id_lokasi}&view=true`} onClick={handleClose}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>

        {/* {canEdit && ( */}
        <MenuItem component={Link} href={`/app/location/form?id=${row.id_lokasi}`} onClick={handleClose}>
          <i className='tabler-edit' style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        {/* )} */}

        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ color: 'error.main' }}>
            <i className='tabler-trash' style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        id={row.nama_lokasi}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_lokasi)
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
const LocationList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.location)
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const fetchData = useCallback(() => {
    // Pastikan params dikirim sebagai keyword agar dibaca oleh Repository
    dispatch(fetchLocationPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      toast.success('Data lokasi berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteLocation(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store
    const values = dataPage?.values || []

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('KODE', 'kode_lokasi'),
        tableColumn('NAMA LOKASI', 'nama_lokasi'),
        tableColumn('JENIS', 'jenis_display'),
        tableColumn('INDUK LOKASI', 'parent_display'), // Self-referencing display
        tableColumn('KAPASITAS', 'kapasitas_display')
      ],
      values: values.map((row: any) => ({
        ...row,
        nama_lokasi: (
          <CopyTooltip
            textToCopy={row.id_lokasi}
            title={
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'inherit' }}>
                  {row.nama_lokasi}
                </Typography>
              </Box>
            }
          />
        ),
        // Chip untuk Jenis Lokasi
        jenis_display: (
          <Chip label={row.jenis_lokasi} size='small' variant='tonal' color='primary' sx={{ fontWeight: 500 }} />
        ),
        // Menampilkan Nama Parent (Induk Lokasi)
        parent_display: (
          <Typography variant='body2' sx={{ color: row.parent ? 'text.primary' : 'text.disabled' }}>
            {row.parent?.nama_lokasi || '-'}
          </Typography>
        ),
        // Menampilkan Kapasitas & Lantai
        kapasitas_display: (
          <Box>
            <Typography variant='body2'>{row.kapasitas ? `${row.kapasitas} Orang` : '-'}</Typography>
            <Typography variant='caption' color='text.disabled'>
              {row.lantai ? `Lantai ${row.lantai}` : ''}
            </Typography>
          </Box>
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

  const onAddForm = () => {
    router.replace('/app/location/form')
  }

  const onImport = () => {
    router.replace('/app/location/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(postExportLocation({ q: filter })).unwrap()

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

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader title='Master Data Lokasi' />
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

export default LocationList
