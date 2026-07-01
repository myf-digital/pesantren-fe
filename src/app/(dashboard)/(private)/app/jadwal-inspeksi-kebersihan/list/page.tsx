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
import {
  deleteJadwalInspeksiKebersihan,
  fetchJadwalInspeksiKebersihanPage,
  postJadwalInspeksiKebersihanUpdate,
  postExport,
  resetRedux
} from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import CustomChip from '@/@core/components/mui/Chip'
import { fetchCabangAll } from '../../cabang/slice'

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: {
    color: 'success',
    value: 'Aktif'
  },
  Nonaktif: {
    color: 'secondary',
    value: 'Nonaktif'
  }
}

const statuss = [
  { label: 'Semua', value: '' },
  {
    label: 'Aktif',
    value: 'Ya'
  },
  {
    label: 'Nonaktif',
    value: 'Tidak'
  }
]

const harisObj = [
  { label: 'Senin', value: 1 },
  { label: 'Selasa', value: 2 },
  { label: 'Rabu', value: 3 },
  { label: 'Kamis', value: 4 },
  { label: 'Jumat', value: 5 },
  { label: 'Sabtu', value: 6 },
  { label: 'Ahad', value: 7 }
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
    dispatch(deleteJadwalInspeksiKebersihan(id))
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
          href={`/app/jadwal-inspeksi-kebersihan/form?id=${data.row.id_jadwal}&view=true`}
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
            href={`/app/jadwal-inspeksi-kebersihan/form?id=${data.row.id_jadwal}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>,

          data.row.is_active == false && (
            <MenuItem onClick={() => data.handleAktifOrArsip(data.row, true)} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-toggle-right' />
              Set Aktif
            </MenuItem>
          )
        ]}

        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-trash' />
            Delete
          </MenuItem>
        )}
        <DialogDelete
          id={'Jadwal Inspeksi Kebersihan'}
          open={openConfirm}
          onClose={(event: any, reason: any) => {
            if (reason !== 'backdropClick') {
              setOpenConfirm(false)
            }
          }}
          handleOk={() => {
            handleDelete(data.row.id_jadwal)
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

interface CabangOption {
  label: string
  value: string
}

const Table = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jadwal_inspeksi_kebersihan)
  const storeCabang = useAppSelector(state => state.cabang)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>({ label: 'Semua', value: '' })
  const [selectedCabang, setSelectedCabang] = useState<CabangOption | null>({ label: 'Semua', value: '' })

  useEffect(() => {
    if (store.delete) {
      dispatch(
        fetchJadwalInspeksiKebersihanPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_cabang: selectedCabang?.value
        })
      )
      dispatch(resetRedux())
    }

    dispatch(fetchCabangAll({}))
  }, [dispatch, filter, perPage, store.delete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      dispatch(
        fetchJadwalInspeksiKebersihanPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_cabang: selectedCabang?.value
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage, selectedStatus, selectedCabang])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      dispatch(
        fetchJadwalInspeksiKebersihanPage({
          page: newPage,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_cabang: selectedCabang?.value
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
    router.replace('/app/jadwal-inspeksi-kebersihan/form')
  }

  const onImport = () => {
    router.replace('/app/jadwal-inspeksi-kebersihan/import')
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

  const handleAktifOrArsip = (data: any, status: boolean) => {
    delete data.hari_custom
    delete data.status_custom
    dispatch(
      postJadwalInspeksiKebersihanUpdate({
        id: data.id_jadwal,
        params: {
          ...data,
          is_active: status,
          id_cabang: {
            value: data.id_cabang
          },
          id_petugas: {
            value: data.id_petugas
          },
          kode_slot: {
            value: data.kode_slot
          }
        }
      })
    )
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    dispatch(
      fetchJadwalInspeksiKebersihanPage({
        page: 1,
        perPage: newPerPage,
        q: filter,
        status: selectedStatus?.value,
        id_cabang: selectedCabang?.value
      })
    )
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} handleAktifOrArsip={handleAktifOrArsip} />
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('CABANG', 'cabang'),
          tableColumn('HARI', 'hari_custom'),
          tableColumn('SLOT', 'kode_slot'),
          tableColumn('JAM', 'jam'),
          tableColumn('PETUGAS', 'petugas'),
          tableColumn('STATUS', 'status_custom'),
          tableColumn('KETERANGAN', 'keterangan'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            cabang: row.cabang?.nama_cabang || '',
            hari_custom: harisObj.find(r => r.value === row.hari)?.label,
            slot: row.master_slot_waktu?.kode_slot || '',
            jam: row.master_slot_waktu
              ? `${row.master_slot_waktu.jam_mulai?.slice(0, -3) || ''} - ${row.master_slot_waktu.jam_selesai?.slice(0, -3) || ''}`
              : '',
            petugas: row.pegawai?.nama_lengkap || '',
            status_custom: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.is_active ? 'Aktif' : 'Nonaktif']?.value}
                color={statusObj[row.is_active ? 'Aktif' : 'Nonaktif']?.color}
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={storeCabang.datas.map(r => {
                  return {
                    label: `${r.nama_cabang}`,
                    value: r.id_cabang
                  }
                })}
                value={selectedCabang}
                onChange={(_, newValue) => setSelectedCabang(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Cabang'
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
          <CardHeader title='Jadwal Inspeksi Kebersihan' sx={{ paddingBottom: 0 }} />
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
