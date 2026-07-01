'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { Autocomplete, Box, TextField, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteGuruPengganti, fetchGuruPenggantiPage, postExport, resetRedux } from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import CustomChip from '@core/components/mui/Chip'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import { fetchLocationAll } from '../../location/slice'

const statusObj: Record<string, { color: any; value: string }> = {
  Menunggu: {
    color: 'secondary',
    value: 'Menunggu'
  },
  Disetujui: {
    color: 'success',
    value: 'Disetujui'
  },
  Ditolak: {
    color: 'error',
    value: 'Ditolak'
  }
}

const statuss = [
  { label: 'Semua', value: '' },
  {
    label: 'Menunggu',
    value: 'Menunggu'
  },
  {
    label: 'Disetujui',
    value: 'Disetujui'
  },
  {
    label: 'Ditolak',
    value: 'Ditolak'
  }
]

function RowAction(data: any) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

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
    dispatch(deleteGuruPengganti(id))
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
          href={`/app/guru-pengganti/form?id=${data.row.id_pengganti}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>

        {canEdit && [
          <MenuItem
            key='edit'
            component={Link}
            sx={{ '& svg': { mr: 2 } }}
            href={`/app/guru-pengganti/form?id=${data.row.id_pengganti}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>
        ]}

        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-trash' />
            Delete
          </MenuItem>
        )}
        <DialogDelete
          id={`${data.row?.jadwal_pelajaran?.hari} / ${data.row?.jadwal_pelajaran?.jam_pelajaran?.mulai?.slice(0, -3)} - ${data.row?.jadwal_pelajaran?.jam_pelajaran?.selesai?.slice(0, -3)} / ${data.row?.jadwal_pelajaran?.kelas_formal ? data.row?.jadwal_pelajaran?.kelas_formal?.nama_kelas : data.row?.jadwal_pelajaran?.kelas_mda?.nama_kelas_mda} (${data.row?.jadwal_pelajaran?.kelas_formal ? data.row?.jadwal_pelajaran?.kelas_formal?.lembaga?.nama_lembaga : data.row?.jadwal_pelajaran?.kelas_mda?.lembaga?.nama_lembaga})`}
          open={openConfirm}
          onClose={(event: any, reason: any) => {
            if (reason !== 'backdropClick') {
              setOpenConfirm(false)
            }
          }}
          handleOk={() => {
            handleDelete(data.row.id_pengganti)
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

interface StatusOption {
  label: string
  value: string
}

const Table = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.guru_pengganti)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>({ label: 'Semua', value: '' })

  useEffect(() => {
    if (store.delete) {
      dispatch(
        fetchGuruPenggantiPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value
        })
      )
      dispatch(resetRedux())
    }

    dispatch(fetchLocationAll({}))
  }, [dispatch, filter, perPage, store.delete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      dispatch(
        fetchGuruPenggantiPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage, selectedStatus])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      dispatch(
        fetchGuruPenggantiPage({
          page: newPage,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value
        })
      )
    },
    [dispatch, perPage, filter]
  )

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      handleChangePage(page)
      dispatch(resetRedux())
    } else {
      toast.error('Error saved: ' + store.crud.message)
    }
  }, [dispatch, handleChangePage, page, store.crud])

  const onAddForm = () => {
    router.replace('/app/guru-pengganti/form')
  }

  const onImport = () => {
    router.replace('/app/guru-pengganti/import')
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

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    dispatch(
      fetchGuruPenggantiPage({
        page: 1,
        perPage: newPerPage,
        q: filter,
        status: selectedStatus?.value
      })
    )
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
          tableColumn('JADWAL', 'jadwal'),
          tableColumn('Tanggal', 'tanggal_custom'),
          tableColumn('GURU ASLI', 'guru_asli'),
          tableColumn('GURU PENGGANTI', 'guru_pengganti'),
          tableColumn('STATUS APPROVAL', 'status_custom'),
          tableColumn('ALASAN', 'alasan'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          const tanggalArr = row.tanggal?.split('-')

          return {
            ...row,
            jadwal: `${row?.jadwal_pelajaran?.hari} / ${row?.jadwal_pelajaran?.jam_pelajaran?.mulai?.slice(0, -3)} - ${row?.jadwal_pelajaran?.jam_pelajaran?.selesai?.slice(0, -3)} / ${row?.jadwal_pelajaran?.kelas_formal ? row?.jadwal_pelajaran?.kelas_formal?.nama_kelas : row?.jadwal_pelajaran?.kelas_mda?.nama_kelas_mda} (${row?.jadwal_pelajaran?.kelas_formal ? row?.jadwal_pelajaran?.kelas_formal?.lembaga?.nama_lembaga : row?.jadwal_pelajaran?.kelas_mda?.lembaga?.nama_lembaga})`,
            guru_asli: row.guru_asli?.nama_lengkap,
            guru_pengganti: row.guru_pengganti?.nama_lengkap,
            tanggal_custom: row.tanggal ? `${tanggalArr[2]}/${tanggalArr[1]}/${tanggalArr[0]}` : '-',
            status_custom: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.status_approval]?.value}
                color={statusObj[row.status_approval]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            )
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
        <Card sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={statuss}
                value={selectedStatus}
                onChange={(_, newValue) => setSelectedStatus(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Status'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{params.InputProps.endAdornment}</>
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Guru Pengganti' sx={{ paddingBottom: 0 }} />
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
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Table
