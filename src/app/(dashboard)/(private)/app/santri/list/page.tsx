'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { toast } from 'react-toastify'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import {
  Avatar,
  Box,
  TextField,
  Toolbar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchSantriPage, fetchSantriById, postSantriUpdate, postExport, resetRedux } from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import CustomChip from '@/@core/components/mui/Chip'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchLembagaFormalAll } from '../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../lembaga-kepesantrenan/slice'

interface CabangOption {
  label: string
  value: string
}

interface LembagaOption {
  label: string
  value: string
}

const statusObj: Record<string, { color: any; value: string }> = {
  '1': {
    color: 'success',
    value: 'Aktif'
  },
  '0': {
    color: 'secondary',
    value: 'Nonaktif'
  }
}

function RowAction({ row, onView }: { row: any; onView: (row: any) => void }) {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const canEdit = useCan('edit')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)

  const setOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleDetail = async () => {
    try {
      setLoading(true)

      const res = await dispatch(fetchSantriById(row.id_santri)).unwrap()

      if (res?.status) {
        onView(res.data)
      }
    } catch (error) {
      toast.error('Gagal mengambil detail santri')
    } finally {
      setLoading(false)
      optionsOnClose()
    }
  }

  const handleStatusSantri = (data: any, status: string) => {
    dispatch(
      postSantriUpdate({
        id: data.id_santri,
        params: {
          status: status
        }
      })
    )
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
        <MenuItem onClick={handleDetail} disabled={loading} sx={{ '& svg': { mr: 2 } }}>
          <i className='tabler-eye' />
          {loading ? 'Loading...' : 'View'}
        </MenuItem>

        {canEdit && row.status == '0' && (
          <MenuItem onClick={() => handleStatusSantri(row, '1')} sx={{ '& svg': { mr: 2 }, color: 'success.main' }}>
            <i className='tabler-circle-check' />
            Set Aktif
          </MenuItem>
        )}

        {canEdit && row.status == '1' && (
          <MenuItem onClick={() => handleStatusSantri(row, '0')} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-circle-x' />
            Set Non Aktif
          </MenuItem>
        )}
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

const TableSantri = () => {
  // ** Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.santri)
  const storeCabang = useAppSelector(state => state.cabang)
  const storeLembagaFormal = useAppSelector(state => state.lembaga_formal)
  const storeLembagaKepesantrenan = useAppSelector(state => state.lembaga_kepesantrenan)

  const canExport = useCan('export')

  // Read initial filters from URL params
  const initialStatus = searchParams.get('status') || 'Semua'

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [openKartu, setOpenKartu] = useState(false)
  const [selectedKartu, setSelectedKartu] = useState<string | null>(null)
  const [openDetail, setOpenDetail] = useState(false)
  const [detail, setDetail] = useState<any>(null)

  const [selectedCabang, setSelectedCabang] = useState<CabangOption | null>({ label: 'Semua', value: '' })
  const [selectedLembagaFormal, setSelectedLembagaFormal] = useState<LembagaOption | null>({
    label: 'Semua',
    value: ''
  })
  const [selectedLembagaMda, setSelectedLembagaMda] = useState<LembagaOption | null>({ label: 'Semua', value: '' })
  const [status, setStatus] = useState(initialStatus)

  const executeFetchData = useCallback(
    (overrides?: any) => {
      dispatch(
        fetchSantriPage({
          page: overrides?.page !== undefined ? overrides.page : page,
          perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
          id_cabang: overrides?.id_cabang !== undefined ? overrides.id_cabang : selectedCabang?.value || '',
          id_lembaga_formal:
            overrides?.id_lembaga_formal !== undefined
              ? overrides.id_lembaga_formal
              : selectedLembagaFormal?.value || '',
          id_lembaga_mda:
            overrides?.id_lembaga_mda !== undefined ? overrides.id_lembaga_mda : selectedLembagaMda?.value || '',
          status: overrides?.status !== undefined ? overrides.status : status !== 'Semua' ? status : undefined,
          q: overrides?.q !== undefined ? overrides.q : filter
        })
      )
    },
    [dispatch, page, perPage, selectedCabang, selectedLembagaFormal, selectedLembagaMda, status, filter]
  )

  const handleSearchSubmit = () => {
    setPage(1)
    executeFetchData({ page: 1 })
  }

  const handleResetFilter = () => {
    setSelectedCabang({ label: 'Semua', value: '' })
    setSelectedLembagaFormal({ label: 'Semua', value: '' })
    setSelectedLembagaMda({ label: 'Semua', value: '' })
    setStatus('Semua')
    setFilter('')
    setPage(1)

    executeFetchData({
      page: 1,
      perPage: 10,
      id_cabang: '',
      id_lembaga_formal: '',
      id_lembaga_mda: '',
      status: undefined,
      q: ''
    })
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      executeFetchData({ page: newPage, q: filter })
    },
    [dispatch, perPage, filter, selectedCabang?.value, selectedLembagaFormal?.value, selectedLembagaMda?.value]
  )

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    executeFetchData({ page: 1, perPage: newPerPage, q: filter })
  }

  useEffect(() => {
    dispatch(fetchCabangAll({}))
    dispatch(fetchLembagaFormalAll({}))
    dispatch(fetchLembagaKepesantrenanAll({}))
  }, [dispatch])

  // Reset lembaga formal & mda filters when selected cabang changes
  useEffect(() => {
    setSelectedLembagaFormal({ label: 'Semua', value: '' })
    setSelectedLembagaMda({ label: 'Semua', value: '' })
  }, [selectedCabang])

  useEffect(() => {
    if (store.delete) {
      executeFetchData({ page: 1, perPage: perPage, q: filter })

      dispatch(resetRedux())
    }
  }, [dispatch, filter, perPage, store.delete])

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)

      dispatch(
        fetchSantriPage({
          page: 1,
          perPage: perPage,
          q: filter,
          id_cabang: selectedCabang?.value || '',
          id_lembaga_formal: selectedLembagaFormal?.value || '',
          id_lembaga_mda: selectedLembagaMda?.value || '',
          status: status !== 'Semua' ? status : undefined
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage, selectedCabang, selectedLembagaFormal, selectedLembagaMda, status])

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExport({
          q: filter,
          id_cabang: selectedCabang?.value || '',
          id_lembaga_formal: selectedLembagaFormal?.value || '',
          id_lembaga_mda: selectedLembagaMda?.value || '',
          status: status !== 'Semua' ? status : undefined
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

  const formatDate = (date: string) => {
    if (!date || date == '-') return '-'

    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderOption = (row: any) => {
    return (
      <RowAction
        row={row}
        onView={(selectedRow: any) => {
          setDetail(selectedRow)
          setOpenDetail(true)
        }}
      />
    )
  }

  const gender = (val: string) => {
    let result = '-'

    switch (val) {
      case 'P':
        result = 'Perempuan'
        break
      case 'L':
        result = 'Laki-Laki'
        break
    }

    return result
  }

  const handleOpenKartu = (url: string) => {
    setSelectedKartu(url)
    setTimeout(() => {
      setOpenKartu(true)
    }, 500)
  }

  const handleCloseKartu = () => {
    setOpenKartu(false)
    setSelectedKartu(null)
  }

  const handlePrintKartu = () => {
    if (!selectedKartu) return

    // buat iframe sementara
    const iframe = document.createElement('iframe')

    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'

    document.body.appendChild(iframe)

    const iframeWindow = iframe.contentWindow

    if (!iframeWindow) {
      document.body.removeChild(iframe)

      return
    }

    const doc = iframeWindow.document

    doc.open()
    doc.write(`
      <html>
        <head>
          <title>Kartu Santri</title>
          <style>
            @media print {
              @page {
                margin: 0;
              }

              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
              }

              img {
                width: 100%;
                height: auto;
              }
            }

            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <img src="${selectedKartu}" />
        </body>
      </html>
    `)
    doc.close()

    iframe.onload = () => {
      iframeWindow.focus()
      iframeWindow.print()

      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 500)
    }
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('SANTRI', 'fullname'),
          tableColumn('WALI', 'nama_wali'),
          tableColumn('CABANG', 'nama_cabang'),
          tableColumn('LEMBAGA', 'lembaga'),
          tableColumn('KARTU SANTRI', 'kartu_santri'),
          tableColumn('STATUS', 'status_label'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            fullname: (
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
                    title={row.fullname}
                  >
                    {row.fullname}
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
                      NIS: {row.nis || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ),
            nama_wali: (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
                  {row.wali?.nama_wali || '-'}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.wali?.no_hp || '-'}
                </Typography>
              </Box>
            ),
            nama_cabang: (
              <Box>
                <Typography variant='body2'>{row.cabang?.nama_cabang || '-'}</Typography>
                <Typography variant='caption' color='text.disabled' sx={{ wordBreak: 'break-all' }}>
                  {row.cabang?.email || '-'}
                </Typography>
              </Box>
            ),
            lembaga: (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
                  Formal: {row.lembagaFormal?.nama_lembaga || '-'}
                </Typography>
                <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
                  MDA: {row.lembagaMda?.nama_lembaga || '-'}
                </Typography>
              </Box>
            ),
            gender: gender(row?.gender),
            kartu_santri: (
              <Box>
                <Typography variant='body2'>{row.kartu_santri_nomor || '-'}</Typography>

                {row.kartu_santri ? (
                  <Typography
                    variant='caption'
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: theme => theme.palette.info.main
                    }}
                    onClick={() => handleOpenKartu(row.kartu_santri)}
                  >
                    Lihat Kartu
                  </Typography>
                ) : (
                  <Typography variant='caption' color='text.disabled'>
                    -
                  </Typography>
                )}
              </Box>
            ),
            status_label: (
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

  const dialogKartuSantri = () => {
    return (
      <Dialog open={openKartu} onClose={handleCloseKartu} maxWidth='md' fullWidth>
        <DialogTitle>Kartu Santri</DialogTitle>
        <DialogContent>
          {selectedKartu && (
            <Box
              component='img'
              src={selectedKartu}
              alt='Kartu Santri'
              sx={{
                width: '100%',
                borderRadius: 2
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseKartu} color='inherit'>
            Tutup
          </Button>
          <Button variant='contained' onClick={handlePrintKartu}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const dialogDetail = () => {
    return (
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth='md' fullWidth>
        <DialogTitle>Detail</DialogTitle>

        <DialogContent dividers>
          {/* SECTION SANTRI */}
          <Box mb={6}>
            <Typography variant='h6' mb={3}>
              Data Santri
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Nama Lengkap</Typography>
                <Typography variant='body2'>{detail?.fullname || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>NIS</Typography>
                <Typography variant='body2'>{detail?.nis || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>NIK</Typography>
                <Typography variant='body2'>{detail?.nik || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Jenis Kelamin</Typography>
                <Typography variant='body2'>{gender(detail?.gender || '')}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>No HP</Typography>
                <Typography variant='body2'>{detail?.phone || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Tempat Lahir</Typography>
                <Typography variant='body2'>{detail?.birth_place || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Tanggal Lahir</Typography>
                <Typography variant='body2'>{formatDate(detail?.birth_date || '')}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Nomor Kartu Santri</Typography>
                <Typography variant='body2'>{detail?.kartu_santri_nomor || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kelas</Typography>
                <Typography variant='body2'>{detail?.group_code_1 || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Status</Typography>
                <Typography variant='body2' component='div'>
                  <CustomChip
                    round='true'
                    size='small'
                    label={statusObj[detail?.status]?.value}
                    color={statusObj[detail?.status]?.color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Keterangan</Typography>
                <Typography variant='body2'>{detail?.keterangan || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* SECTION WALI */}
          <Box mb={6}>
            <Typography variant='h6' mb={3}>
              Data Wali
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Nama Wali</Typography>
                <Typography variant='body2'>{detail?.wali?.nama_wali || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>NIK</Typography>
                <Typography variant='body2'>{detail?.wali?.nik || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>No HP</Typography>
                <Typography variant='body2'>{detail?.wali?.no_hp || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Pendidikan</Typography>
                <Typography variant='body2'>{detail?.wali?.pendidikan || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Pekerjaan</Typography>
                <Typography variant='body2'>{detail?.wali?.pekerjaan || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Penghasilan</Typography>
                <Typography variant='body2'>{detail?.wali?.penghasilan || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Keterangan</Typography>
                <Typography variant='body2'>{detail?.wali?.keterangan || '-'}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={3} mt={10}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Provinsi</Typography>
                <Typography variant='body2'>{detail?.wali?.province?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kota/Kabupaten</Typography>
                <Typography variant='body2'>{detail?.wali?.city?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kecamatan</Typography>
                <Typography variant='body2'>{detail?.wali?.district?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kalurahan</Typography>
                <Typography variant='body2'>{detail?.wali?.subDistrict?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Alamat</Typography>
                <Typography variant='body2'>{detail?.wali?.alamat || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* SECTION CABANG */}
          <Box sx={{ mb: 6 }}>
            <Typography variant='h6' mb={3}>
              Data Cabang
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Nama Cabang</Typography>
                <Typography variant='body2'>{detail?.cabang?.nama_cabang || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Email</Typography>
                <Typography variant='body2'>{detail?.cabang?.email || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kontak</Typography>
                <Typography variant='body2'>{detail?.cabang?.contact || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Keterangan</Typography>
                <Typography variant='body2'>{detail?.wali?.keterangan || '-'}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={3} mt={10}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Provinsi</Typography>
                <Typography variant='body2'>{detail?.cabang?.province?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kota/Kabupaten</Typography>
                <Typography variant='body2'>{detail?.cabang?.city?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kecamatan</Typography>
                <Typography variant='body2'>{detail?.cabang?.district?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Kalurahan</Typography>
                <Typography variant='body2'>{detail?.cabang?.subDistrict?.name || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Alamat</Typography>
                <Typography variant='body2'>{detail?.cabang?.alamat || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* SECTION LEMBAGA */}
          <Box>
            <Typography variant='h6' mb={3}>
              Data Lembaga
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Lembaga Formal</Typography>
                <Typography variant='body2'>{detail?.lembagaFormal?.nama_lembaga || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='caption'>Lembaga MDA</Typography>
                <Typography variant='body2'>{detail?.lembagaMda?.nama_lembaga || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const formalOptions = [
    { label: 'Semua', value: '' },
    ...storeLembagaFormal.datas
      .filter(r => !selectedCabang?.value || r.id_cabang === selectedCabang.value)
      .map(r => ({
        label: r.nama_lembaga,
        value: r.id_lembaga
      }))
  ]

  const mdaOptions = [
    { label: 'Semua', value: '' },
    ...storeLembagaKepesantrenan.datas
      .filter(r => !selectedCabang?.value || r.id_cabang === selectedCabang.value)
      .map(r => ({
        label: r.nama_lembaga,
        value: r.id_lembaga
      }))
  ]

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
                  ...storeCabang.datas.map(r => ({
                    label: `${r.nama_cabang}`,
                    value: r.id_cabang
                  }))
                ]}
                value={selectedCabang}
                onChange={(_, newValue) => setSelectedCabang(newValue || { label: 'Semua', value: '' })}
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={formalOptions}
                value={selectedLembagaFormal}
                onChange={(_, newValue) => setSelectedLembagaFormal(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lembaga Formal'
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
                options={mdaOptions}
                value={selectedLembagaMda}
                onChange={(_, newValue) => setSelectedLembagaMda(newValue || { label: 'Semua', value: '' })}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lembaga MDA'
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
                options={[
                  { label: 'Semua', value: 'Semua' },
                  { label: 'Aktif', value: '1' },
                  { label: 'Nonaktif', value: '0' }
                ]}
                value={
                  status === 'Semua'
                    ? { label: 'Semua', value: 'Semua' }
                    : status === '1'
                      ? { label: 'Aktif', value: '1' }
                      : status === '0'
                        ? { label: 'Nonaktif', value: '0' }
                        : null
                }
                onChange={(_, newValue) => setStatus(newValue ? newValue.value : 'Semua')}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Status Santri'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{params.InputProps.endAdornment}</>
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* BARIS UTILITY BUTTONS */}
          <Toolbar sx={{ px: '0px !important', gap: 2, flexWrap: 'wrap', minHeight: 'auto' }}>
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

            {canExport && (
              <Button
                color='warning'
                variant='outlined'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
              >
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
          </Toolbar>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Santri' sx={{ paddingBottom: 0 }} />
          <Toolbar
            sx={{
              px: '1.5rem !important',
              minHeight: 'auto',
              gap: 2,
              flexWrap: 'wrap',
              mb: '10px'
            }}
          >
            <Typography sx={{ flex: '1 1 auto' }} />
            <Tooltip title='Cari...'>
              <TextField id='outlined-basic' label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
          {dialogDetail()}
          {dialogKartuSantri()}
        </Card>
      </Grid>
    </Grid>
  )
}

export default TableSantri
