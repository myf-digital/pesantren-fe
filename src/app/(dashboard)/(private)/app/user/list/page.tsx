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
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteUser, fetchUserPage, resetRedux } from '../slice/index'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = true //useCan('edit')
  const canDelete = true // useCan('delete')

  const content = (
    <>
      <IconButton size='small' onClick={(e) => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} href={`/app/pegawai/form?id=${row.id_pegawai}&view=true`}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/pegawai/form?id=${row.id_pegawai}`}>
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
        id={row.nama_lengkap}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_pegawai)
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

const UserList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.pegawai)

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const fetchData = useCallback(() => {
    dispatch(fetchUserPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)

    
return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('User berhasil dihapus (Soft Delete)')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={(id) => dispatch(deleteUser(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    
return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('PEGAWAI', 'nama_display'),
        tableColumn('KONTAK', 'kontak_display'),
        tableColumn('PENEMPATAN', 'posisi_display'),
        tableColumn('STATUS', 'status_display'),
      ],
      values: (dataPage?.values || []).map((row: any) => ({
        ...row,
        nama_display: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar src={row.foto} sx={{ width: 38, height: 38 }} />
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                {row.nama_lengkap}
              </Typography>
              <Typography variant='caption'>{row.nip || row.nik}</Typography>
            </Box>
          </Box>
        ),
        kontak_display: (
          <Box>
            <Typography variant='body2'>{row.email || '-'}</Typography>
            <Typography variant='caption' color='text.disabled'>{row.no_hp || '-'}</Typography>
          </Box>
        ),
        posisi_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>{row.jabatan?.nama_jabatan || '-'}</Typography>
            <Typography variant='caption'>{row.organizationUnit?.nama_orgunit || '-'}</Typography>
          </Box>
        ),
        status_display: (
          <Chip
            label={row.status_pegawai}
            size='small'
            color={row.status_pegawai === 'Aktif' ? 'success' : 'secondary'}
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
          <CardHeader title='Master Data User' subheader='Manajemen SDM dan struktur organisasi' />
          <Toolbar sx={{ gap: 2, mb: 4, px: '1.5rem !important' }}>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => router.push('/app/pegawai/form')}>
              Tambah User
            </Button>
            <Typography sx={{ flex: '1 1 auto' }} />
            <TextField size='small' placeholder='Cari NIP, Nama, atau Unit...' onChange={(e) => { setFilter(e.target.value); setPage(1); }} />
          </Toolbar>
          <TableView changeSort={() => { }} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserList
