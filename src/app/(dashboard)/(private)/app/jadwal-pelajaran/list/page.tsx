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
  deleteJadwalPelajaran,
  fetchJadwalPelajaranPage,
  postJadwalPelajaranUpdate,
  postExport,
  resetRedux
} from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import CustomChip from '@core/components/mui/Chip'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import { fetchLocationAll } from '../../location/slice'

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: {
    color: 'success',
    value: 'Aktif'
  },
  Nonaktif: {
    color: 'secondary',
    value: 'Nonaktif'
  },
  Arsip: {
    color: 'secondary',
    value: 'Arsip'
  }
}

const statuss = [
  { label: 'Semua', value: '' },
  {
    label: 'Aktif',
    value: 'Aktif'
  },
  {
    label: 'Nonaktif',
    value: 'Nonaktif'
  },
  {
    label: 'Arsip',
    value: 'Arsip'
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
    dispatch(deleteJadwalPelajaran(id))
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
          href={`/app/jadwal-pelajaran/form?id=${data.row.id_jadwal}&view=true`}
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
            href={`/app/jadwal-pelajaran/form?id=${data.row.id_jadwal}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>,

          data.row.status == 'Nonaktif' && (
            <MenuItem onClick={() => data.handleAktifOrArsip(data.row, 'Aktif')} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-toggle-right' />
              Set Aktif
            </MenuItem>
          ),

          data.row.status == 'Nonaktif' && (
            <MenuItem onClick={() => data.handleAktifOrArsip(data.row, 'Arsip')} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-archive' />
              Arsip
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
          id={data.row.hari}
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

interface LokasiOption {
  label: string
  value: string
}

const Table = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jadwal_pelajaran)
  const storeLokasi = useAppSelector(state => state.location)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>({ label: 'Semua', value: '' })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ label: 'Semua', value: '' })

  useEffect(() => {
    if (store.delete) {
      dispatch(
        fetchJadwalPelajaranPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_lokasi: selectedLokasi?.value
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
        fetchJadwalPelajaranPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_lokasi: selectedLokasi?.value
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage, selectedStatus, selectedLokasi])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      dispatch(
        fetchJadwalPelajaranPage({
          page: newPage,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_lokasi: selectedLokasi?.value
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
    router.replace('/app/jadwal-pelajaran/form')
  }

  const onImport = () => {
    router.replace('/app/jadwal-pelajaran/import')
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

  const handleAktifOrArsip = (data: any, status: string) => {
    delete data.status_custom
    dispatch(
      postJadwalPelajaranUpdate({
        id: data.id_jadwal,
        params: {
          ...data,
          status: status,
          id_tahunajaran: {
            value: data.id_tahunajaran
          },
          id_kelas: {
            value: data.id_kelas
          },
          id_gmapel: {
            value: data.id_gmapel
          },
          id_jam_pelajaran: {
            value: data.id_jam_pelajaran
          },
          id_lokasi: {
            value: data.id_lokasi
          },
          id_semester: {
            value: data.id_semester
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
      fetchJadwalPelajaranPage({
        page: 1,
        perPage: newPerPage,
        q: filter,
        status: selectedStatus?.value,
        id_lokasi: selectedLokasi?.value
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
          tableColumn('HARI', 'hari'),
          tableColumn('JAM', 'jam'),
          tableColumn('KELAS/LEMBAGA', 'kelas'),
          tableColumn('MATA PELAJARAN', 'mapel'),
          tableColumn('GURU', 'guru'),
          tableColumn('LOKASI', 'lokasi'),
          tableColumn('STATUS', 'status_custom'),
          tableColumn('KETERANGAN', 'keterangan'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            jam: `${row.jam_pelajaran?.mulai?.slice(0, -3)} - ${row.jam_pelajaran?.selesai?.slice(0, -3)}`,
            kelas: `${row.kelas_formal ? row.kelas_formal?.nama_kelas : row.kelas_mda?.nama_kelas_mda} (${row.kelas_formal ? row.kelas_formal?.lembaga?.nama_lembaga : row.kelas_mda?.lembaga?.nama_lembaga})`,
            mapel: row.jenis_guru?.mata_pelajaran?.nama_mapel,
            guru: row.jenis_guru?.pegawai?.nama_lengkap,
            lokasi: row.lokasi?.nama_lokasi,
            status_custom: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.status]?.value}
                color={statusObj[row.status]?.color}
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
                options={storeLokasi.datas.map(r => {
                  return {
                    label: `${r.parent ? `${r.parent.nama_lokasi} / ` : ''}${r.nama_lokasi}`,
                    value: r.id_lokasi
                  }
                })}
                value={selectedLokasi}
                onChange={(_, newValue) => setSelectedLokasi(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lokasi'
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
          <CardHeader title='Jadwal Pelajaran' sx={{ paddingBottom: 0 }} />
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
