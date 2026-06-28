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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteRaporSantri, fetchRaporSantriPage, resetRedux } from '../slice/index'
import { useCan } from '@/hooks/useCan'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'

interface CabangOption {
  label: string
  value: string
}

interface TahunAjaranOption {
  label: string
  value: string
}

interface KelasOption {
  label: string
  value: string
}

interface TahunAjaranOption {
  label: string
  value: string
}
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

const RowAction = ({ row, onDeleteSuccess }: { row: any; onDeleteSuccess: (id: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openConfirm, setOpenConfirm] = useState(false)

  const canEdit = useCan('edit')
  const canDelete = useCan('delete')

  const content = (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} href={`/app/rapot-santri/form?id=${row.id_rapot}&view=true`}>
          <i className='tabler-eye' style={{ marginRight: 8 }} /> View
        </MenuItem>
        {canEdit && (
          <MenuItem component={Link} href={`/app/rapot-santri/form?id=${row.id_rapot}`}>
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
        id={`Rapor ${row.santri?.fullname || 'Santri'}`}
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        handleOk={() => {
          onDeleteSuccess(row.id_rapot)
          setOpenConfirm(false)
        }}
        handleClose={() => setOpenConfirm(false)}
      />
    </>
  )

  return (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      {content}
    </TableCell>
  )
}

const formatDate = (date: string) => {
  if (!date || date === '-') return ''
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

const RaporSantriList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.rapot_santri)
  const storeCabang = useAppSelector(state => state.cabang)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)

  const canCreate = useCan('create')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [openPdf, setOpenPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')

  const [selectedCabang, setSelectedCabang] = useState<CabangOption | null>({ label: 'Semua Cabang', value: '' })
  const [selectedTahun, setSelectedTahun] = useState<TahunAjaranOption | null>({
    label: 'Semua Tahun Ajaran',
    value: ''
  })
  const [selectedSemester, setSelectedSemester] = useState<string>('Semua')
  const [selectedKelas, setSelectedKelas] = useState<KelasOption | null>({ label: 'Semua Kelas', value: '' })

  const fetchData = useCallback(() => {
    dispatch(
      fetchRaporSantriPage({
        page,
        perPage,
        keyword: filter,
        id_cabang: selectedCabang?.value || '',
        tahun: selectedTahun?.value || '',
        semester: selectedSemester !== 'Semua' ? selectedSemester : '',
        id_kelas: selectedKelas?.value || ''
      })
    )
  }, [dispatch, page, perPage, filter, selectedCabang, selectedTahun, selectedSemester, selectedKelas])

  useEffect(() => {
    dispatch(fetchCabangAll({}))
    dispatch(fetchTahunAjaranAll({ status: '' }))
    dispatch(fetchKelasFormalAll({ status: '', id_tingkat: '' }))
    dispatch(fetchKelasMdaAll({ status: '', id_tingkat: '' }))
  }, [dispatch])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)

    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      toast.success('Rapor Santri berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteRaporSantri(id))} />
  }

  const onAddForm = () => {
    router.replace('/app/rapot-santri/form')
  }

  const buildTable = () => {
    const { dataPage } = store

    return {
      page: page,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption as any),
        tableColumn('SANTRI', 'santri_info'),
        tableColumn('TAHUN AJARAN', 'tahun_ajaran'),
        tableColumn('SEMESTER', 'semester'),
        tableColumn('STATUS', 'status_chip'),
        tableColumn('RAPOR FORMAL', 'file_rapot_link'),
        tableColumn('RAPOR MDA', 'file_rapot_mda_link'),
        tableColumn('TERAKHIR DIUBAH', 'updated_date')
      ],
      values: (dataPage?.values || []).map((row: any) => {
        const fileUrl = row.file_rapot
          ? row.file_rapot.startsWith('http')
            ? row.file_rapot
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${row.file_rapot.startsWith('/') ? '' : '/'}${row.file_rapot}`
          : ''

        const fileUrlMda = row.file_rapot_mda
          ? row.file_rapot_mda.startsWith('http')
            ? row.file_rapot_mda
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${row.file_rapot_mda.startsWith('/') ? '' : '/'}${row.file_rapot_mda}`
          : ''

        const placement = (row.santri?.penempatanKelas || []).find(
          (p: any) => p.tahunAjaran?.tahun_ajaran?.toLowerCase() === row.tahun_ajaran?.toLowerCase()
        )
        const kelasFormalName = placement?.kelasFormal?.nama_kelas || '-'
        const kelasMdaName = placement?.kelasMda?.nama_kelas_mda || '-'

        return {
          ...row,
          santri_info: (
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
                title={row.santri?.fullname}
              >
                {row.santri?.fullname}
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
                  NIS: {row.santri?.nis || '-'}
                </Typography>

                {row?.santri && row?.santri?.cabang && (
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
                    {row?.santri?.cabang?.nama_cabang || '-'}
                  </Typography>
                )}
              </Box>
            </Box>
          ),
          file_rapot_link: (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              {fileUrl ? (
                <Button
                  size='small'
                  color='primary'
                  variant='tonal'
                  startIcon={<i className='tabler-file-download' />}
                  onClick={() => {
                    setPdfUrl(fileUrl)
                    setPdfTitle(`Rapor ${row.santri?.fullname || 'Santri'} - ${row.tahun_ajaran}`)
                    setOpenPdf(true)
                  }}
                >
                  Rapor Formal
                </Button>
              ) : (
                <Typography variant='caption' color='text.disabled'>
                  Belum ada Rapor Formal
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '12px', fontWeight: 300 }}>
                Kelas: {kelasFormalName}
              </Typography>
            </Box>
          ),
          file_rapot_mda_link: (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              {fileUrlMda ? (
                <Button
                  size='small'
                  color='primary'
                  variant='tonal'
                  startIcon={<i className='tabler-file-download' />}
                  onClick={() => {
                    setPdfUrl(fileUrlMda)
                    setPdfTitle(`Rapor MDA ${row.santri?.fullname || 'Santri'} - ${row.tahun_ajaran}`)
                    setOpenPdf(true)
                  }}
                >
                  Rapor MDA
                </Button>
              ) : (
                <Typography variant='caption' color='text.disabled'>
                  Belum ada Rapor MDA
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '12px', fontWeight: 300 }}>
                Kelas: {kelasMdaName}
              </Typography>
            </Box>
          ),
          status_chip: (
            <Chip
              label={row.status || 'Aktif'}
              size='small'
              color={row.status === 'Aktif' ? 'success' : 'secondary'}
              variant='tonal'
            />
          ),
          updated_date: (
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {formatDate(row.updated_at || row.created_at)}
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
        <Card sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua Cabang', value: '' },
                  ...(storeCabang.datas || []).map(r => ({
                    label: `${r.nama_cabang}`,
                    value: r.id_cabang
                  }))
                ]}
                value={selectedCabang}
                onChange={(_, newValue) => {
                  setSelectedCabang(newValue)
                  setPage(1)
                }}
                getOptionLabel={option => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={params => <TextField {...params} label='Cabang' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua Kelas', value: '' },
                  ...(storeKelasFormal.datas || []).map((k: any) => ({
                    label: `${k.nama_kelas} (Formal)`,
                    value: k.id_kelas
                  })),
                  ...(storeKelasMda.datas || []).map((k: any) => ({
                    label: `${k.nama_kelas_mda} (MDA)`,
                    value: k.id_kelas_mda
                  }))
                ]}
                value={selectedKelas}
                onChange={(_, newValue) => {
                  setSelectedKelas(newValue)
                  setPage(1)
                }}
                getOptionLabel={option => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={params => <TextField {...params} label='Kelas' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={[
                  { label: 'Semua Tahun Ajaran', value: '' },
                  ...(storeTahunAjaran.datas || []).map(r => ({
                    label: `${r.tahun_ajaran}`,
                    value: r.tahun_ajaran
                  }))
                ]}
                value={selectedTahun}
                onChange={(_, newValue) => {
                  setSelectedTahun(newValue)
                  setPage(1)
                }}
                getOptionLabel={option => option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={params => <TextField {...params} label='Tahun Ajaran' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel id='semester-select-label'>Semester</InputLabel>
                <Select
                  labelId='semester-select-label'
                  id='semester-select'
                  value={selectedSemester}
                  label='Semester'
                  onChange={e => {
                    setSelectedSemester(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value='Semua'>Semua Semester</MenuItem>
                  <MenuItem value='GANJIL'>Ganjil</MenuItem>
                  <MenuItem value='GENAP'>Genap</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Rapor Santri' subheader='Manajemen rapot santri' />
          <Toolbar sx={{ gap: 2, mb: 4, px: '1.5rem !important' }}>
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
            <Typography sx={{ flex: '1 1 auto' }} />
            <TextField
              size='small'
              placeholder='Cari Nama Santri...'
              onChange={e => {
                setFilter(e.target.value)
                setPage(1)
              }}
            />
          </Toolbar>
          <TableView changeSort={() => {}} model={buildTable()} />
        </Card>
      </Grid>

      <Dialog
        open={openPdf}
        onClose={() => {
          setOpenPdf(false)
          setPdfUrl('')
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{pdfTitle}</span>
          <IconButton
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '650px' }}>
          {pdfUrl ? (
            <iframe src={pdfUrl} width='100%' height='100%' style={{ border: 'none' }} title='PDF Preview' />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
            color='secondary'
            variant='tonal'
          >
            Tutup
          </Button>
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            color='primary'
            variant='contained'
            startIcon={<i className='tabler-external-link' />}
          >
            Buka di Tab Baru
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RaporSantriList
