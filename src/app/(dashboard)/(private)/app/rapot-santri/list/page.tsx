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
  Tooltip
} from '@mui/material'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteRapotSantri, fetchRapotSantriPage, resetRedux } from '../slice/index'
import { useCan } from '@/hooks/useCan'

import { tableColumn } from '@views/onevour/table/TableViewBuilder'
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
        id={`Rapot ${row.santri?.fullname || 'Santri'}`}
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

const RapotSantriList = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.rapot_santri)

  const canCreate = useCan('create')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [openPdf, setOpenPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')

  const fetchData = useCallback(() => {
    dispatch(fetchRapotSantriPage({ page, perPage, keyword: filter }))
  }, [dispatch, page, perPage, filter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)

    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    if (store.delete) {
      toast.success('Rapot Santri berhasil dihapus')
      fetchData()
      dispatch(resetRedux())
    }
  }, [store.delete, dispatch, fetchData])

  const renderOption = (row: any) => {
    return <RowAction row={row} onDeleteSuccess={id => dispatch(deleteRapotSantri(id))} />
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
        tableColumn('RAPOT FORMAL', 'file_rapot_link'),
        tableColumn('RAPOT MDA', 'file_rapot_mda_link'),
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

        return {
          ...row,
          santri_info: (
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                {row.santri?.fullname || '-'}
              </Typography>
              <Typography variant='caption'>NIS: {row.santri?.nis || '-'}</Typography>
            </Box>
          ),
          file_rapot_link: fileUrl ? (
            <Button
              size='small'
              color='primary'
              variant='tonal'
              startIcon={<i className='tabler-file-download' />}
              onClick={() => {
                setPdfUrl(fileUrl)
                setPdfTitle(`Rapot ${row.santri?.fullname || 'Santri'} - ${row.tahun_ajaran}`)
                setOpenPdf(true)
              }}
            >
              Rapot Formal
            </Button>
          ) : (
            <Typography variant='caption' color='text.disabled'>
              Belum ada Rapot Formal
            </Typography>
          ),
          file_rapot_mda_link: fileUrlMda ? (
            <Button
              size='small'
              color='primary'
              variant='tonal'
              startIcon={<i className='tabler-file-download' />}
              onClick={() => {
                setPdfUrl(fileUrlMda)
                setPdfTitle(`Rapot MDA ${row.santri?.fullname || 'Santri'} - ${row.tahun_ajaran}`)
                setOpenPdf(true)
              }}
            >
              Rapot MDA
            </Button>
          ) : (
            <Typography variant='caption' color='text.disabled'>
              Belum ada Rapot MDA
            </Typography>
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
        <Card>
          <CardHeader title='Rapot Santri' subheader='Manajemen rapot santri' />
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

export default RapotSantriList
