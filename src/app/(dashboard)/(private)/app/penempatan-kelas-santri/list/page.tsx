'use client'

import React, { useEffect, useState, useCallback } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

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
import { deletePenempatanKelasSantri, fetchPenempatanKelasSantriPage, postExport, resetRedux } from '../slice/index'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import CustomChip from '@/@core/components/mui/Chip'

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: {
    color: 'success',
    value: 'Aktif'
  },
  Alumni: {
    color: 'info',
    value: 'Alumni'
  },
  'Tidak Aktif': {
    color: 'secondary',
    value: 'Tidak Aktif'
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
    dispatch(deletePenempatanKelasSantri(id))
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
          href={`/app/penempatan-kelas-santri/form?id=${data.row.id}&view=true`}
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
            href={`/app/penempatan-kelas-santri/form?id=${data.row.id}`}
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
            id={`Kelas Santri: ${data.row.santri?.fullname || 'Santri'}`}
            open={openConfirm}
            onClose={(event: any, reason: any) => {
              if (reason !== 'backdropClick') {
                setOpenConfirm(false)
              }
            }}
            handleOk={() => {
              handleDelete(data.row.id)
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

const TablePenempatanKelasSantri = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.penempatan_kelas_santri)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Filters State
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<{ label: string; value: string } | null>({
    label: 'Semua',
    value: ''
  })
  const [selectedKelasFormal, setSelectedKelasFormal] = useState<{ label: string; value: string } | null>({
    label: 'Semua',
    value: ''
  })
  const [selectedKelasMda, setSelectedKelasMda] = useState<{ label: string; value: string } | null>({
    label: 'Semua',
    value: ''
  })
  const [statusPenempatan, setStatusPenempatan] = useState<string>('Semua')
  const [statusSantri, setStatusSantri] = useState<string>('Semua')

  const executeFetchData = useCallback(
    (overrides?: any) => {
      dispatch(
        fetchPenempatanKelasSantriPage({
          page: overrides?.page !== undefined ? overrides.page : page,
          perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
          q: overrides?.q !== undefined ? overrides.q : filter,
          id_tahun_ajaran:
            overrides?.id_tahun_ajaran !== undefined ? overrides.id_tahun_ajaran : selectedTahunAjaran?.value || '',
          id_kelas_formal:
            overrides?.id_kelas_formal !== undefined ? overrides.id_kelas_formal : selectedKelasFormal?.value || '',
          id_kelas_mda: overrides?.id_kelas_mda !== undefined ? overrides.id_kelas_mda : selectedKelasMda?.value || '',
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
    [
      dispatch,
      page,
      perPage,
      filter,
      selectedTahunAjaran,
      selectedKelasFormal,
      selectedKelasMda,
      statusPenempatan,
      statusSantri
    ]
  )

  useEffect(() => {
    dispatch(fetchTahunAjaranAll({}))
    dispatch(fetchKelasFormalAll({}))
    dispatch(fetchKelasMdaAll({}))
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
  }, [filter, perPage, selectedTahunAjaran, selectedKelasFormal, selectedKelasMda, statusPenempatan, statusSantri])

  const onAddForm = () => {
    router.replace('/app/penempatan-kelas-santri/form')
  }

  const onImport = () => {
    router.replace('/app/penempatan-kelas-santri/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExport({
          q: filter,
          id_tahun_ajaran: selectedTahunAjaran?.value || '',
          id_kelas_formal: selectedKelasFormal?.value || '',
          id_kelas_mda: selectedKelasMda?.value || '',
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
    setSelectedTahunAjaran({ label: 'Semua', value: '' })
    setSelectedKelasFormal({ label: 'Semua', value: '' })
    setSelectedKelasMda({ label: 'Semua', value: '' })
    setStatusPenempatan('Semua')
    setStatusSantri('Semua')
    setFilter('')
    setPage(1)
    executeFetchData({
      page: 1,
      q: '',
      id_tahun_ajaran: '',
      id_kelas_formal: '',
      id_kelas_mda: '',
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
          tableColumn('KELAS', 'kelas'),
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
            kelas: (
              <Box>
                <Typography variant='body2'>Formal: {row.kelasFormal?.nama_kelas || '-'}</Typography>
                <Typography variant='body2'>MDA: {row.kelasMda?.nama_kelas_mda || '-'}</Typography>
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
                label={statusObj[row.status]?.value || row.status}
                color={statusObj[row.status]?.color || 'primary'}
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
        changePerPage: (event: any) => {
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: '' },
                  ...storeKelasFormal.datas.map((r: any) => ({
                    label: r.nama_kelas,
                    value: r.id_kelas
                  }))
                ]}
                value={selectedKelasFormal}
                onChange={(_, newValue) => setSelectedKelasFormal(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                getOptionKey={option => option.value}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Kelas Formal' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: '' },
                  ...storeKelasMda.datas.map((r: any) => ({
                    label: r.nama_kelas_mda,
                    value: r.id_kelas_mda
                  }))
                ]}
                value={selectedKelasMda}
                onChange={(_, newValue) => setSelectedKelasMda(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                getOptionKey={option => option.value}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => <TextField {...params} label='Kelas MDA' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua', value: 'Semua' },
                  { label: 'Aktif', value: 'Aktif' },
                  { label: 'Alumni', value: 'Alumni' },
                  { label: 'Tidak Aktif', value: 'Tidak Aktif' }
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
          <CardHeader title='Penempatan Kelas Santri' sx={{ paddingBottom: 0 }} />
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
              <TextField label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default TablePenempatanKelasSantri
