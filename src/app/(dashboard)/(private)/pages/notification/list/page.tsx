'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { Menu, MenuItem, TextField, Toolbar } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteNotification, fetchNotificationPage, postNotificationUpdate, resetRedux } from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import CustomChip from '@core/components/mui/Chip'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'

const statusObj: Record<number, { color: any; value: string }> = {
  0: {
    color: 'secondary',
    value: 'Unread'
  },
  1: {
    color: 'success',
    value: 'Read'
  }
}

function RowAction(data: any) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const dispatch = useAppDispatch()

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const setOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
    dispatch(postNotificationUpdate({ id: data.row.id_notification, params: { ...data.row, status: 1 } }))
    optionsOnClose()
  }

  const handleDelete = (id: string) => {
    dispatch(deleteNotification(id))
    optionsOnClose()
  }

  return (
    <TableCell size='small'>
      <IconButton aria-controls='long-menu' size='small' aria-haspopup='true' onClick={setOpen}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={optionsOnClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { style: { minWidth: '8rem' } }
        }}
      >
        <MenuItem component={Link} sx={{ '& svg': { mr: 2 } }} href={`${data.row.url}`} onClick={handleView}>
          <i className='tabler-eye' />
          View
        </MenuItem>

        {canDelete && [
          <MenuItem
            key={data.row.id_notification}
            onClick={() => setOpenConfirm(true)}
            sx={{ '& svg': { mr: 2 }, color: 'error.main' }}
          >
            <i className='tabler-trash' />
            Delete
          </MenuItem>,
          <DialogDelete
            key={'dialog_' + data.row.id_notification}
            id={data.row.title}
            open={openConfirm}
            onClose={(event: any, reason: any) => {
              if (reason !== 'backdropClick') {
                setOpenConfirm(false)
              }
            }}
            handleOk={() => {
              handleDelete(data.row.id_notification)
              setOpenConfirm(false)
            }}
            handleClose={() => {
              setOpenConfirm(false)
            }}
            disableEscapeKeyDown={true}
          />
        ]}
      </Menu>
    </TableCell>
  )
}

const Table = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.notification)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  useEffect(() => {
    if (store.delete) {
      dispatch(fetchNotificationPage({ page: 1, perPage: perPage, q: filter }))

      dispatch(resetRedux())
    }
  }, [dispatch, filter, perPage, store.delete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)

      dispatch(fetchNotificationPage({ page: 1, perPage: perPage, q: filter }))
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage])

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
    dispatch(fetchNotificationPage({ page: newPage, perPage: perPage, q: filter }))
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    dispatch(fetchNotificationPage({ page: 1, perPage: newPerPage, q: filter }))
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} />
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('TITLE', 'title'),
          tableColumn('MESSAGE', 'message'),
          tableColumn('SENDER', 'pengirim'),
          tableColumn('STATUS', 'status'),
          tableColumn('CREATED AT', 'created_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            status: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.status]?.value}
                color={statusObj[row.status]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            ),
            pengirim: row.sender?.full_name
          }
        }),
        count: total,
        perPage: perPage,
        changePage: (_: any, newPage: number) => {
          handleChangePage(newPage + 1)
        },
        changePerPage: (event: any, o: any) => {
          handleChangePerPage(event)
        }
      }
    }
  }

  return (
    <Grid container spacing={6} sx={{ width: '100%' }}>
      <Grid size={12}>
        <Card>
          <CardHeader title='Notification' sx={{ paddingBottom: 0 }} />
          <Toolbar
            sx={{
              px: '1.5rem !important',
              minHeight: 'auto',
              gap: 2,
              flexWrap: 'wrap',
              mb: '10px'
            }}
          >
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Table
