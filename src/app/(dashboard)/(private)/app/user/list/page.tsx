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
import { useCan } from '@/hooks/useCan'

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
        <MenuItem component={Link} href={`/app/user/form?id=${row.resource_id}&view=true`}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/user/form?id=${row.resource_id}`}>
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
        id={row.full_name || row.username}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.resource_id)
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

const formatDate = (date: string) => {
  if (!date || date == '-') return ''
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  } catch (e) {
    return date
  }
}

const UserList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.user)

  const canCreate = useCan('create')

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
    if (store.delete) {
      toast.success('User berhasil dihapus (Soft Delete)')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteUser(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('USER', 'user'),
        tableColumn('KONTAK', 'contact'),
        tableColumn('ROLE', 'role'),
        tableColumn('STATUS', 'status'),
        tableColumn('TERAKHIR DIUBAH', 'updated_at')
      ],
      values: (dataPage?.values || []).map((row: any) => {
        let avatarUrl = ''
        if (row.image_foto) {
          avatarUrl = row.image_foto.startsWith('http')
            ? row.image_foto
            : `${process.env.NEXT_PUBLIC_API_URL || ''}/uploads/resource/${row.image_foto}`
        }

        return {
          ...row,
          user: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar src={avatarUrl} sx={{ width: 38, height: 38 }}>
                {(row.full_name || row.username || '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {row.full_name || '-'}
                </Typography>
                <Typography variant='caption'>{row.username || '-'}</Typography>
              </Box>
            </Box>
          ),
          contact: (
            <Box>
              <Typography variant='body2'>{row.email || '-'}</Typography>
              <Typography variant='caption' color='text.disabled'>
                {row.telepon || '-'}
              </Typography>
            </Box>
          ),
          role: (
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {row.role?.role_name || '-'}
              </Typography>
            </Box>
          ),
          status: (
            <Chip
              label={row.status === 'A' ? 'Aktif' : row.status === 'NV' ? 'Belum Verifikasi' : 'Tidak Aktif'}
              size='small'
              color={row.status === 'A' ? 'success' : row.status === 'NV' ? 'warning' : 'secondary'}
              variant='tonal'
            />
          ),
          updated_at: (
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {formatDate(row.modified_date || row.created_date)}
            </Typography>
          )
        }
      }),
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
          <CardHeader title='Master Data User' subheader='Manajemen data pengguna dan hak akses sistem' />
          <Toolbar sx={{ gap: 2, mb: 4, px: '1.5rem !important' }}>
            {canCreate && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => router.push('/app/user/form')}
              >
                Tambah User
              </Button>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <TextField
              size='small'
              placeholder='Cari Nama, Username, atau Email...'
              onChange={e => {
                setFilter(e.target.value)
                setPage(1)
              }}
            />
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserList
