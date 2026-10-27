'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  IconButton,
  Menu,
  Typography,
  useMediaQuery,
  useTheme,
  MenuItem,
  TableCell,
  TextField,
  Toolbar
} from '@mui/material'
import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid2'

import TableView from '@/views/onevour/table/TableView'
import { tableColumn } from '@/views/onevour/table/TableViewBuilder'
import { useAppDispatch } from '@/redux-store/hook'
import { useCan } from '@/hooks/useCan'
import { modules } from '../config'
import { downloadFinanceFile, errorMessage } from '../api'
import type { createFinanceModule } from '../api'
import DialogDelete from '@/views/onevour/components/dialog-delete'
import CustomChip from '@/@core/components/mui/Chip'

type Props = { resource: string; request: ReturnType<typeof createFinanceModule>['request'] }

function RowAction({
  row,
  resource,
  canEdit,
  canDelete,
  onDelete
}: {
  row: any
  resource: string
  canEdit: boolean
  canDelete: boolean
  onDelete: (row: any) => void
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const id = row[modules[resource].id]
  const historical = resource === 'keu-rekap-harian' && !row.is_current

  const content = (
    <>
      <IconButton size='small' aria-label='Aksi' aria-haspopup='true' onClick={event => setAnchor(event.currentTarget)}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { style: { minWidth: '8rem' } } }}
      >
        <MenuItem component={Link} href={`/app/${resource}/form?id=${id}&view=true`} onClick={() => setAnchor(null)}>
          <i className='tabler-eye' />
          View
        </MenuItem>
        {canEdit && !historical && (
          <MenuItem component={Link} href={`/app/${resource}/form?id=${id}`} onClick={() => setAnchor(null)}>
            <i className='tabler-edit' />
            Edit
          </MenuItem>
        )}
        {canDelete && !historical && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setAnchor(null)
              onDelete(row)
            }}
          >
            <i className='tabler-trash' />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )

  return mobile ? (
    <Box sx={{ display: 'inline-block' }}>{content}</Box>
  ) : (
    <TableCell size='small' sx={{ borderBottom: 0 }}>
      {content}
    </TableCell>
  )
}

export default function FinanceList({ resource, request }: Props) {
  const config = modules[resource]
  const dispatch = useAppDispatch()
  const canCreate = useCan('create')
  const canEdit = useCan('edit')
  const canDelete = useCan('delete')
  const canImport = useCan('import')
  const canExport = useCan('export')
  const [query, setQuery] = useState({ page: 1, perPage: 10, q: '', status: '' })
  const [data, setData] = useState({ values: [] as any[], total: 0 })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const statusKey = config.master ? 'is_active' : resource === 'keu-import-batch' ? 'status_batch' : 'is_current'

  useEffect(() => {
    let active = true
    let task: ReturnType<ReturnType<typeof request>> | undefined

    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      task = dispatch(
        request({
          params: { page: query.page, perPage: query.perPage, q: query.q, [statusKey]: query.status },
          allowEmpty: true
        })
      )
      task
        .unwrap()
        .then(result => {
          if (active) setData(result.data || { values: [], total: 0 })
        })
        .catch(err => {
          if (active) setError(errorMessage(err))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
      task?.abort()
    }
  }, [dispatch, request, query, revision, statusKey])

  const remove = async () => {
    setDeleting(true)

    try {
      await dispatch(request({ method: 'delete', suffix: `/${selected[config.id]}` })).unwrap()
      toast.success('Data berhasil dihapus')
      setSelected(null)
      setQuery(prev => ({ ...prev, page: 1 }))
      setRevision(prev => prev + 1)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const exportData = async () => {
    setExporting(true)

    try {
      await downloadFinanceFile(resource, { q: query.q, [statusKey]: query.status })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : errorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const actions = (row: any) => (
    <RowAction row={row} resource={resource} canEdit={canEdit} canDelete={canDelete} onDelete={setSelected} />
  )

  const options =
    resource === 'keu-import-batch'
      ? ['Draft', 'ValidasiGagal', 'SiapPublikasi', 'Dipublikasikan', 'Digantikan', 'Dibatalkan'].map(value => ({
          value,
          label: value
        }))
      : [
          { value: 'true', label: 'Aktif' },
          { value: 'false', label: config.master ? 'Nonaktif' : 'Histori / Nonaktif' }
        ]

  return (
    <Grid container spacing={6} sx={{ width: '100%' }}>
      <Grid size={12}>
        <Card sx={{ p: 5 }}>
          <TextField
            select
            label='Status'
            value={query.status}
            size='small'
            sx={{ minWidth: 200 }}
            onChange={e => setQuery({ ...query, status: e.target.value, page: 1 })}
          >
            <MenuItem value=''>Semua</MenuItem>
            {options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title={config.title} sx={{ paddingBottom: 0 }} />
          <Toolbar sx={{ px: '1.5rem !important', minHeight: 'auto', gap: 2, flexWrap: 'wrap', mb: '10px' }}>
            {canCreate && (
              <Button
                variant='outlined'
                size='small'
                sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                component={Link}
                href={`/app/${resource}/form`}
                startIcon={<i className='tabler-plus' />}
              >
                Tambah
              </Button>
            )}
            {canImport && (
              <Button
                startIcon={<i className='tabler-file-import' />}
                sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                variant='outlined'
                size='small'
                color='success'
                component={Link}
                href={`/app/${resource}/import`}
              >
                Import Excel
              </Button>
            )}
            {canExport && (
              <Button
                startIcon={<i className='tabler-file-export' />}
                sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                variant='outlined'
                size='small'
                color='warning'
                disabled={exporting}
                onClick={exportData}
              >
                {exporting ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
            <Typography sx={{ flex: '1 1 auto' }} />
            <TextField
              size='small'
              label='Cari...'
              value={query.q}
              onChange={e => setQuery({ ...query, q: e.target.value, page: 1 })}
              sx={{ ml: 'auto' }}
            />
          </Toolbar>
          {error && (
            <Alert severity='error' action={<Button onClick={() => setRevision(x => x + 1)}>Coba lagi</Button>}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableView
              changeSort={null}
              model={{
                page: query.page,
                perPage: query.perPage,
                count: data.total,
                fields: [
                  tableColumn('AKSI', 'act-x', 'left', actions as any),
                  ...config.columns.map(([key, label]) =>
                    tableColumn(label.toUpperCase(), key, 'left', ((row: any) => {
                      const value = key.split('.').reduce((item, part) => item?.[part], row)

                      if (
                        resource === 'keu-rekap-harian' &&
                        ['saldo_awal', 'masuk', 'keluar', 'saldo_akhir'].includes(key) &&
                        value != null
                      ) {
                        const text = String(value)

                        if (/^-?\d+(\.\d+)?$/.test(text)) {
                          const [whole, fraction = ''] = text.split('.')
                          const decimals = fraction.replace(/0+$/, '')

                          return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (decimals ? `,${decimals}` : '')
                        }
                      }

                      return typeof value === 'boolean' ? (
                        <CustomChip
                          round='true'
                          size='small'
                          label={
                            key === 'is_periodik_tahun_ajaran' ? (value ? 'Ya' : 'Tidak') : value ? 'Aktif' : 'Nonaktif'
                          }
                          color={value ? 'success' : 'secondary'}
                        />
                      ) : (
                        (value ?? '—')
                      )
                    }) as any)
                  )
                ],
                values: error ? [] : data.values,
                changePage: (_: any, page: number) => setQuery({ ...query, page: page + 1 }),
                changePerPage: (e: any) => setQuery({ ...query, perPage: Number(e.target.value), page: 1 })
              }}
            />
          )}
        </Card>
      </Grid>
      <DialogDelete
        id={selected?.[config.fields.find(item => item.key.startsWith('nama_'))?.key || config.id] || ''}
        open={Boolean(selected)}
        handleClose={() => !deleting && setSelected(null)}
        handleOk={() => {
          if (!deleting) remove()
        }}
        disableEscapeKeyDown={true}
      />
    </Grid>
  )
}
