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
  Tooltip,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

import { toast } from 'react-toastify'
import { format } from 'date-fns'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteKasusPelanggaranSantri,
  fetchKasusPelanggaranSantriPage,
  postKasusPelanggaranSantriExport,
  resetRedux
} from '../slice/index' // Sesuaikan path import

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

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  // Menentukan parameter tipe form (pelanggaran / remisi) berdasarkan jenis dari master_pelanggaran
  const formType = row.master_pelanggaran?.jenis === 'Remisi' ? 'remisi' : 'pelanggaran'

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/app/pelanggaran-remisi-santri/form?id=${row.id_kasus}&type=${formType}&view=true`}
        >
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/pelanggaran-remisi-santri/form?id=${row.id_kasus}&type=${formType}`}>
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
        id={row.nomor_kasus}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_kasus)
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

const KasusPelanggaranSantriList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.pelanggaran_remisi_santri)

  // Permission Hooks
  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Read initial filters from URL params
  const initialStatus = searchParams.get('status_progress') || 'Semua'
  const initialLevelSp = searchParams.get('level_sp') || 'Semua'

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  const [statusProgress, setStatusProgress] = useState(initialStatus)
  const [levelSp, setLevelSp] = useState(initialLevelSp)

  // State untuk dropdown tombol tambah
  const [anchorElAdd, setAnchorElAdd] = useState<null | HTMLElement>(null)

  const fetchData = useCallback(() => {
    dispatch(
      fetchKasusPelanggaranSantriPage({
        page,
        perPage,
        keyword: filter,
        status_progress: statusProgress !== 'Semua' ? statusProgress : undefined,
        level_sp: levelSp !== 'Semua' ? levelSp : undefined
      })
    )
  }, [dispatch, page, perPage, filter, statusProgress, levelSp])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete?.status) {
      toast.success('Data Kasus berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const onImport = () => {
    router.replace('/app/pelanggaran-remisi-santri/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postKasusPelanggaranSantriExport({
          q: filter,
          status_progress: statusProgress !== 'Semua' ? statusProgress : undefined,
          level_sp: levelSp !== 'Semua' ? levelSp : undefined
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
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteKasusPelanggaranSantri(id))} />
  }

  const buildTable = () => {
    const { dataPage } = store

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('KASUS', 'kasus_display'),
        tableColumn('SANTRI', 'santri_display'),
        tableColumn('SKOR', 'skor_display'),
        tableColumn('STATUS', 'status_display')
      ],
      values: (dataPage?.values || []).map((row: any) => {
        const isRemisi = row.master_pelanggaran?.jenis === 'Remisi'

        return {
          ...row,
          kasus_display: (
            <CopyTooltip
              textToCopy={row.nomor_kasus}
              sx={{ display: 'flex', minWidth: 0, width: '100%' }}
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 600,
                        color: isRemisi ? 'success.main' : 'error.main',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={row.master_pelanggaran?.nama_pelanggaran}
                    >
                      {row.master_pelanggaran?.nama_pelanggaran || 'Data Master Terhapus'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
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
                        {row.nomor_kasus}
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        {row.tanggal_kejadian ? format(new Date(row.tanggal_kejadian), 'dd MMM yyyy') : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              }
            />
          ),
          santri_display: (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {row.santri?.fullname || '-'}
              </Typography>
              <Typography variant='caption' color='text.disabled'>
                NIS: {row.santri?.nis || '-'}
              </Typography>
            </Box>
          ),
          skor_display: (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 700,
                    color: isRemisi ? 'success.main' : 'error.main'
                  }}
                >
                  {row.skor_diberikan > 0 ? `+${row.skor_diberikan}` : row.skor_diberikan}
                </Typography>

                {row.level_sp && (
                  <Chip label={row.level_sp} size='small' color='error' sx={{ height: 20, fontSize: '0.65rem' }} />
                )}
              </Box>

              {row.skor_diberikan !== row.skor_master_snapshot && (
                <Typography variant='caption' color='warning.main' sx={{ display: 'block' }}>
                  (Disesuaikan)
                </Typography>
              )}
            </Box>
          ),
          status_display: (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
              <Chip
                label={row.status_progress}
                size='small'
                color={
                  row.status_progress === 'Selesai' ? 'success' : row.status_progress === 'Batal' ? 'error' : 'warning'
                }
                variant='tonal'
              />
            </Box>
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
          <CardHeader title='Data Kasus & Remisi Santri' sx={{ paddingBottom: 2 }} />
          <Box sx={{ px: 6, pb: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='status-select-label'>Status Progress</InputLabel>
                  <Select
                    labelId='status-select-label'
                    id='status-select'
                    value={statusProgress}
                    label='Status Progress'
                    onChange={e => setStatusProgress(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='Proses'>Proses</MenuItem>
                    <MenuItem value='Selesai'>Selesai</MenuItem>
                    <MenuItem value='Batal'>Batal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='sp-select-label'>Level SP</InputLabel>
                  <Select
                    labelId='sp-select-label'
                    id='sp-select'
                    value={levelSp}
                    label='Level SP'
                    onChange={e => setLevelSp(e.target.value)}
                  >
                    <MenuItem value='Semua'>Semua</MenuItem>
                    <MenuItem value='SP1'>SP 1</MenuItem>
                    <MenuItem value='SP2'>SP 2</MenuItem>
                    <MenuItem value='SP3'>SP 3</MenuItem>
                  </Select>
                </FormControl>
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
              <>
                <Tooltip title='Tambah Data'>
                  <Button
                    size='small'
                    variant='outlined'
                    sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                    onClick={e => setAnchorElAdd(e.currentTarget)}
                    startIcon={<i className='tabler-plus' />}
                  >
                    Tambah
                  </Button>
                </Tooltip>
                <Menu anchorEl={anchorElAdd} open={Boolean(anchorElAdd)} onClose={() => setAnchorElAdd(null)}>
                  <MenuItem component={Link} href='/app/pelanggaran-remisi-santri/form?type=pelanggaran'>
                    <i className='tabler-gavel' style={{ marginRight: 8, color: '#ff4c51' }} /> Kasus Pelanggaran
                  </MenuItem>
                  <MenuItem component={Link} href='/app/pelanggaran-remisi-santri/form?type=remisi'>
                    <i className='tabler-award' style={{ marginRight: 8, color: '#28c76f' }} /> Remisi / Penghargaan
                  </MenuItem>
                </Menu>
              </>
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
                  Import
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
                  {loadingExport ? 'Proses...' : 'Export'}
                </Button>
              </Tooltip>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari Nomor / Kronologi / Nama...'>
              <TextField id='outlined-basic' label='Cari Data...' size='small' value={filter} onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default KasusPelanggaranSantriList
