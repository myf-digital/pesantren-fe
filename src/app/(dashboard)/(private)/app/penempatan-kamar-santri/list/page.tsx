'use client'

import React, { useEffect, useState, useCallback } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { Avatar, Box, TextField, Toolbar, useMediaQuery, useTheme, Autocomplete } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deletePenempatanKamarSantri, fetchPenempatanKamarSantriPage, postExport, resetRedux } from '../slice/index'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchLocationAll } from '../../location/slice'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import CustomChip from '@/@core/components/mui/Chip'

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: {
    color: 'success',
    value: 'Aktif'
  },
  'Non-Aktif': {
    color: 'secondary',
    value: 'Non-Aktif'
  }
}

const statusObjSantri: Record<string, { color: any; value: string }> = {
  '1': {
    color: 'success',
    value: 'Aktif'
  },
  '0': {
    color: 'secondary',
    value: 'Non-Aktif'
  }
}

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
    dispatch(deletePenempatanKamarSantri(id))
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
          href={`/app/penempatan-kamar-santri/form?id=${data.row.id_penempatan}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>

        {canEdit && (
          <MenuItem
            key='edit'
            component={Link}
            sx={{ '& svg': { mr: 2 } }}
            href={`/app/penempatan-kamar-santri/form?id=${data.row.id_penempatan}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>
        )}

        {canDelete && [
          <MenuItem key='delete' onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-trash' />
            Delete
          </MenuItem>,
          <DialogDelete
            key='dialog-delete'
            id={data.row.nama_mapel}
            open={openConfirm}
            onClose={(event: any, reason: any) => {
              if (reason !== 'backdropClick') {
                setOpenConfirm(false)
              }
            }}
            handleOk={() => {
              handleDelete(data.row.id_penempatan)
              setOpenConfirm(false)
            }}
            handleClose={() => {
              setOpenConfirm(false)
            }}
            disableEscapeKeyDown={true}
          />
        ]}
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

const TablePenempatanKamarSantri = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.penempatan_kamar_santri)
  const storeLokasi = useAppSelector(state => state.location)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Filters State
  const [selectedLokasi, setSelectedLokasi] = useState<{ label: string; value: string } | null>({
    label: 'Semua',
    value: ''
  })
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<{ label: string; value: string } | null>({
    label: 'Semua',
    value: ''
  })
  const [statusPenempatan, setStatusPenempatan] = useState<string>('Semua')
  const [statusSantri, setStatusSantri] = useState<string>('Semua')

  const executeFetchData = useCallback(
    (overrides?: any) => {
      dispatch(
        fetchPenempatanKamarSantriPage({
          page: overrides?.page !== undefined ? overrides.page : page,
          perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
          q: overrides?.q !== undefined ? overrides.q : filter,
          id_lokasi: overrides?.id_lokasi !== undefined ? overrides.id_lokasi : selectedLokasi?.value || '',
          id_tahunajaran:
            overrides?.id_tahunajaran !== undefined ? overrides.id_tahunajaran : selectedTahunAjaran?.value || '',
          status:
            overrides?.status !== undefined ? overrides.status : statusPenempatan !== 'Semua' ? statusPenempatan : '',
          status_santri:
            overrides?.status_santri !== undefined
              ? overrides.status_santri
              : statusSantri !== 'Semua'
                ? statusSantri
                : ''
        })
      )
    },
    [dispatch, page, perPage, filter, selectedLokasi, selectedTahunAjaran, statusPenempatan, statusSantri]
  )

  useEffect(() => {
    dispatch(fetchLocationAll({ jenis_lokasi: 'Kamar' }))
    dispatch(fetchTahunAjaranAll({}))
  }, [dispatch])

  useEffect(() => {
    if (store.delete) {
      executeFetchData({ page: 1 })
      dispatch(resetRedux())
    }
  }, [dispatch, store.delete, executeFetchData])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      executeFetchData({ page: 1 })
    }, 500)

    return () => clearTimeout(timer)
  }, [filter, perPage, selectedLokasi, selectedTahunAjaran, statusPenempatan, statusSantri])

  const onAddForm = () => {
    router.replace('/app/penempatan-kamar-santri/form')
  }

  const onImport = () => {
    router.replace('/app/penempatan-kamar-santri/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExport({
          q: filter,
          id_lokasi: selectedLokasi?.value || '',
          id_tahunajaran: selectedTahunAjaran?.value || '',
          status: statusPenempatan !== 'Semua' ? statusPenempatan : '',
          status_santri: statusSantri !== 'Semua' ? statusSantri : ''
        })
      ).unwrap()

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

  const handleSearchSubmit = () => {
    setPage(1)
    executeFetchData({ page: 1 })
  }

  const handleResetFilter = () => {
    setSelectedLokasi({ label: 'Semua', value: '' })
    setSelectedTahunAjaran({ label: 'Semua', value: '' })
    setStatusPenempatan('Semua')
    setStatusSantri('Semua')
    setFilter('')
    setPage(1)
    executeFetchData({
      page: 1,
      q: '',
      id_lokasi: '',
      id_tahunajaran: '',
      status: '',
      status_santri: ''
    })
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
    executeFetchData({ page: newPage })
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    executeFetchData({ page: 1, perPage: newPerPage })
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
          tableColumn('SANTRI', 'santri'),
          tableColumn('LOKASI', 'lokasi'),
          tableColumn('AJARAN', 'tahun_ajaran'),
          tableColumn('IN OUT', 'in_out'),
          tableColumn('STATUS', 'status'),
          tableColumn('STATUS SANTRI', 'status_santri'),
          tableColumn('KETERANGAN', 'keterangan'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            santri: (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  minWidth: 0
                }}
              >
                <Avatar src={row.foto} sx={{ width: 38, height: 38 }} />
                <Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-all'
                    }}
                  >
                    {row.santri?.fullname || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      NIK: {row.santri?.nik || '-'}
                    </Typography>

                    <Typography
                      variant='caption'
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontWeight: 500
                      }}
                    >
                      NIS: {row.santri?.nis || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ),
            lokasi: (
              <Box>
                <Typography variant='body2'>{row.lokasi?.nama_lokasi || '-'}</Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.lokasi && row?.lokasi?.parent ? row?.lokasi?.parent?.nama_lokasi : ''}
                </Typography>
              </Box>
            ),
            tahun_ajaran: (
              <Box>
                <Typography variant='body2'>{row.tahunAjaran?.tahun_ajaran || '-'}</Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.tahunAjaran?.keterangan || ''}
                </Typography>
              </Box>
            ),
            status: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.status]?.value}
                color={statusObj[row.status]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            ),
            status_santri: (
              <CustomChip
                round='true'
                size='small'
                label={statusObjSantri[row.santri?.status]?.value}
                color={statusObjSantri[row.santri?.status]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            ),
            in_out: (
              <Box>
                <Typography variant='body2'>IN: {row.tanggal_masuk || '-'}</Typography>
                <Typography variant='body2'>OUT: {row.tanggal_keluar || '-'}</Typography>
              </Box>
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
                options={[
                  { label: 'Semua', value: '' },
                  ...storeLokasi.datas.map((r: any) => ({
                    label: r.nama_lokasi,
                    value: r.id_lokasi
                  }))
                ]}
                value={selectedLokasi}
                onChange={(_, newValue) => setSelectedLokasi(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                getOptionKey={option => option.value}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Lokasi' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: '' },
                  ...storeTahunAjaran.datas.map((r: any) => ({
                    label: r.tahun_ajaran,
                    value: r.id_tahunajaran
                  }))
                ]}
                value={selectedTahunAjaran}
                onChange={(_, newValue) => setSelectedTahunAjaran(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                getOptionKey={option => option.value}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Tahun Ajaran' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: 'Semua' },
                  { label: 'Aktif', value: 'Aktif' },
                  { label: 'Non-Aktif', value: 'Non-Aktif' }
                ]}
                value={
                  statusPenempatan === 'Semua'
                    ? { label: 'Semua', value: 'Semua' }
                    : { label: statusPenempatan, value: statusPenempatan }
                }
                onChange={(_, newValue) => setStatusPenempatan(newValue ? newValue.value : 'Semua')}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Status Penempatan' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: 'Semua' },
                  { label: 'Aktif', value: '1' },
                  { label: 'Non-Aktif', value: '0' }
                ]}
                value={
                  statusSantri === 'Semua'
                    ? { label: 'Semua', value: 'Semua' }
                    : statusSantri === '1'
                      ? { label: 'Aktif', value: '1' }
                      : { label: 'Non-Aktif', value: '0' }
                }
                onChange={(_, newValue) => setStatusSantri(newValue ? newValue.value : 'Semua')}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Status Santri' />}
              />
            </Grid>
          </Grid>
          <Toolbar sx={{ px: '0px !important', gap: 2, flexWrap: 'wrap', minHeight: 'auto', mt: 4 }}>
            <Button
              variant='contained'
              color='info'
              startIcon={<i className='tabler-search' />}
              onClick={handleSearchSubmit}
            >
              Cari
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='tabler-refresh' />}
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>
          </Toolbar>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Penempatan Kamar Santri' sx={{ paddingBottom: 0 }} />
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

export default TablePenempatanKamarSantri
