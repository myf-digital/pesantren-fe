'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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
  Tooltip,
  useTheme,
  useMediaQuery,
  Autocomplete,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deletePegawai, fetchPegawaiPage, postExport, resetRedux } from '../slice/index'
import { fetchJabatanAll } from '../../jabatan/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'
import { useCan } from '@/hooks/useCan'
import CopyTooltip from '@/components/CopyTooltip'

const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = true //useCan('edit')
  const canDelete = true // useCan('delete')

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
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

const PegawaiList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.pegawai)
  const storeJabatan = useAppSelector(state => state.jabatan)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Read initial filters from URL params
  const initialStatusPegawai = searchParams.get('status_pegawai') || 'Semua'
  const initialIdJabatan = searchParams.get('id_jabatan') || ''

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const [statusPegawai, setStatusPegawai] = useState(initialStatusPegawai)
  const [selectedJabatan, setSelectedJabatan] = useState<any>({ label: 'Semua', value: '' })

  // Fetch all jabatans on mount
  useEffect(() => {
    dispatch(fetchJabatanAll({}))
  }, [dispatch])

  // Resolve initial select label when jabatan list finishes loading
  useEffect(() => {
    if (initialIdJabatan && storeJabatan.datas.length > 0) {
      const match = storeJabatan.datas.find(j => j.id_jabatan === initialIdJabatan)
      if (match) {
        setSelectedJabatan({ label: match.nama_jabatan, value: match.id_jabatan })
      }
    }
  }, [initialIdJabatan, storeJabatan.datas])

  const fetchData = useCallback(() => {
    dispatch(
      fetchPegawaiPage({
        page,
        perPage,
        keyword: filter,
        status_pegawai: statusPegawai !== 'Semua' ? statusPegawai : undefined,
        id_jabatan: selectedJabatan?.value || undefined
      })
    )
  }, [dispatch, page, perPage, filter, statusPegawai, selectedJabatan])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)

    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Pegawai berhasil dihapus (Soft Delete)')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onAddForm = () => {
    router.replace('/app/pegawai/form')
  }

  const onImport = () => {
    router.replace('/app/pegawai/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExport({
          q: filter,
          status_pegawai: statusPegawai !== 'Semua' ? statusPegawai : undefined,
          id_jabatan: selectedJabatan?.value || undefined
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

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deletePegawai(id))} />
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
        tableColumn('STATUS', 'status_display')
      ],
      values: (dataPage?.values || []).map((row: any) => ({
        ...row,
        nama_display: (
          <CopyTooltip
            textToCopy={row.id_pegawai}
            title={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  minWidth: 0,
                  width: '100%'
                }}
              >
                <Avatar src={row.foto} sx={{ width: 38, height: 38 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={row.nama_lengkap}
                  >
                    {row.nama_lengkap}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start', mt: 0.5 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      NIK: {row.nik || '-'}
                    </Typography>

                    <Typography
                      variant='caption'
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      NIP: {row.nip || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            }
          />
        ),
        kontak_display: (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
              {row.email || '-'}
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              {row.no_hp || '-'}
            </Typography>
          </Box>
        ),
        posisi_display: (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {row.jabatan?.nama_jabatan || '-'}
            </Typography>
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
          <CardHeader title='Data Pegawai' sx={{ paddingBottom: 2 }} />
          <Box sx={{ px: 6, pb: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='status-pegawai-select-label'>Status Pegawai</InputLabel>
                  <Select
                    labelId='status-pegawai-select-label'
                    id='status-pegawai-select'
                    value={statusPegawai}
                    label='Status Pegawai'
                    onChange={e => setStatusPegawai(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='guru'>Guru</MenuItem>
                    <MenuItem value='pegawai'>Pegawai</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete
                  size='small'
                  options={[{ label: 'Semua', value: '' }, ...storeJabatan.datas.map(r => ({
                    label: r.nama_jabatan,
                    value: r.id_jabatan
                  }))]}
                  value={selectedJabatan}
                  onChange={(_, newValue) => setSelectedJabatan(newValue || { label: 'Semua', value: '' })}
                  getOptionLabel={option => option.label || ''}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Jabatan'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
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
              <Tooltip title='Import CSV'>
                <Button
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onImport}
                  startIcon={<i className='tabler-file-import' />}
                >
                  Import CSV
                </Button>
              </Tooltip>
            )}

            {canExport && (
              <Tooltip title='Export CSV'>
                <Button
                  size='small'
                  color='warning'
                  variant='outlined'
                  sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                  onClick={onExport}
                  startIcon={<i className='tabler-file-export' />}
                >
                  {loadingExport ? 'Proses...' : 'Export CSV'}
                </Button>
              </Tooltip>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' label='Cari...' size='small' value={filter} onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default PegawaiList
