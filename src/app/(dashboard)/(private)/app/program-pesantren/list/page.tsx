'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { TextField, Toolbar, useMediaQuery, useTheme, Box } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteProgramPesantren, fetchProgramPesantrenPage, resetRedux } from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import CustomChip from '@core/components/mui/Chip'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const statusObj: Record<string, { color: any; value: string }> = {
  Ya: {
    color: 'success',
    value: 'Ya'
  },
  Tidak: {
    color: 'secondary',
    value: 'Tidak'
  }
}

const wajibObj: Record<string, { color: any; value: string }> = {
  1: {
    color: 'success',
    value: 'Ya'
  },
  0: {
    color: 'secondary',
    value: 'Tidak'
  }
}

function RowAction(data: any) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const rowOptionsOpen = Boolean(anchorEl)

  const setOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
    optionsOnClose()
  }

  const handleDelete = (id: string) => {
    dispatch(deleteProgramPesantren(id))
    optionsOnClose()
  }

  const content = (
    <>
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
        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href={`/app/program-pesantren/form?id=${data.row.id_program}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>

        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href={`/app/program-pesantren/form?id=${data.row.id_program}`}
          onClick={handleView}
        >
          <i className='tabler-edit' />
          Edit
        </MenuItem>

        <MenuItem onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
          <i className='tabler-trash' />
          Delete
        </MenuItem>
        <DialogDelete
          id={data.row.nama_program}
          open={openConfirm}
          onClose={(event: any, reason: any) => {
            if (reason !== 'backdropClick') {
              setOpenConfirm(false)
            }
          }}
          handleOk={() => {
            handleDelete(data.row.id_program)
            setOpenConfirm(false)
          }}
          handleClose={() => {
            setOpenConfirm(false)
          }}
          disableEscapeKeyDown={true}
        />
      </Menu>
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

const Table = () => {
  // ** Hooks
  const router = useRouter()

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.program_pesantren)

  const [filter, setFilter] = useState('')

  const [page, setPage] = useState(1)

  const [perPage, setPerPage] = useState(10)

  useEffect(() => {
    if (store.delete) {
      dispatch(fetchProgramPesantrenPage({ page: 1, perPage: perPage, q: filter }))

      dispatch(resetRedux())
    }
  }, [dispatch, store.delete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)

      dispatch(fetchProgramPesantrenPage({ page: 1, perPage: perPage, q: filter }))
    }, 500)

    return () => clearTimeout(timer)
  }, [filter])

  const onSubmit = () => {
    router.replace('/app/program-pesantren/form')
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
    dispatch(fetchProgramPesantrenPage({ page: newPage, perPage: perPage, q: filter }))
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    dispatch(fetchProgramPesantrenPage({ page: 1, perPage: newPerPage, q: filter }))
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
          tableColumn('TIPE PROGRAM', 'tipe_program'),
          tableColumn('NAMA PROGRAM', 'nama_program'),
          tableColumn('WAJIB', 'wajib'),
          tableColumn('AKTIF', 'aktif')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            wajib: (
              <CustomChip
                round='true'
                size='small'
                label={wajibObj[row.wajib]?.value}
                color={wajibObj[row.wajib]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            ),
            aktif: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.aktif]?.value}
                color={statusObj[row.aktif]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            )
          }
        }),
        count: total,
        perPage: perPage,
        changePage: (_: any, newPage: number) => {
          handleChangePage(newPage + 1);
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
          <CardHeader title='Program Pesantren' sx={{ paddingBottom: 0 }} />
          <Toolbar sx={{ paddingLeft: '1.5rem !important', paddingRight: '1.5rem !important' }}>
            <Tooltip title='Add'>
              <Button size='medium' variant='outlined' onClick={onSubmit}>
                Add
              </Button>
            </Tooltip>
            <Typography sx={{ flex: '1 1 100%' }} variant='h6' id='tableTitle' component='div'></Typography>
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' fullWidth label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Table
