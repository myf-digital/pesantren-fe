'use client'

import React, { Fragment, useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { Autocomplete, TextField, Toolbar, useMediaQuery, useTheme, Box } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { deleteKebersihanTemuan, fetchKebersihanTemuanPage, postExport, resetRedux } from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import CustomChip from '@/@core/components/mui/Chip'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchLocationAll } from '../../location/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'

const statusObj: Record<string, { color: any; value: string }> = {
  0: {
    color: 'secondary',
    value: 'Belum Diproses'
  },
  1: {
    color: 'info',
    value: 'Sedang Diproses'
  },
  2: {
    color: 'success',
    value: 'Sudah Diproses'
  },
  3: {
    color: 'error',
    value: 'Tidak Dapat Diproses'
  }
}

const statuss = [
  { label: 'Semua', value: '' },
  {
    label: 'Belum Diproses',
    value: 0
  },
  {
    label: 'Sedang Diproses',
    value: 1
  },
  {
    label: 'Sudah Diproses',
    value: 2
  },
  {
    label: 'Tidak Dapat Diproses',
    value: 3
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
    dispatch(deleteKebersihanTemuan(id))
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
          href={`/app/kebersihan-temuan/form?id=${data.row.id_temuan}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>

        <MenuItem
          key='tindakan'
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href={`/app/kebersihan-temuan/form?id=${data.row.id_temuan}&tindakan=true`}
          onClick={handleView}
        >
          <i className='tabler-check' />
          Tindakan
        </MenuItem>

        {canEdit && [
          <MenuItem
            key='edit'
            component={Link}
            sx={{ '& svg': { mr: 2 } }}
            href={`/app/kebersihan-temuan/form?id=${data.row.id_temuan}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>
        ]}

        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-trash' />
            Delete
          </MenuItem>
        )}
        <DialogDelete
          id={data.row.kategori}
          open={openConfirm}
          onClose={(event: any, reason: any) => {
            if (reason !== 'backdropClick') {
              setOpenConfirm(false)
            }
          }}
          handleOk={() => {
            handleDelete(data.row.id_temuan)
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

interface CabangOption {
  label: string
  value: string
}

interface LokasiOption {
  label: string
  value: string
}

interface StatusOption {
  label: string
  value: number | string
}

interface PetugasOption {
  label: string
  value: string
}

const TableTemuan = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kebersihan_temuan)
  const storeCabang = useAppSelector(state => state.cabang)
  const storeLokasi = useAppSelector(state => state.location)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [selectedCabang, setSelectedCabang] = useState<CabangOption | null>({ label: 'Semua', value: '' })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ label: 'Semua', value: '' })
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>({ label: 'Semua', value: '' })
  const [selectedPetugas, setSelectedPetugas] = useState<PetugasOption | null>({ label: 'Semua', value: '' })

  useEffect(() => {
    if (store.delete) {
      dispatch(
        fetchKebersihanTemuanPage({
          page: 1,
          perPage: perPage,
          q: filter,
          id_cabang: selectedCabang?.value,
          id_lokasi: selectedLokasi?.value,
          status: selectedStatus?.value,
          id_petugas: selectedPetugas?.value
        })
      )
      dispatch(resetRedux())
    }

    dispatch(fetchCabangAll({}))
    dispatch(fetchLocationAll({}))
    dispatch(fetchPegawaiAll({}))
  }, [dispatch, filter, perPage, store.delete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      dispatch(
        fetchKebersihanTemuanPage({
          page: 1,
          perPage: perPage,
          q: filter,
          id_cabang: selectedCabang?.value,
          id_lokasi: selectedLokasi?.value,
          status: selectedStatus?.value,
          id_petugas: selectedPetugas?.value
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, filter, perPage, selectedCabang, selectedLokasi, selectedStatus, selectedPetugas])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      dispatch(
        fetchKebersihanTemuanPage({
          page: newPage,
          perPage: perPage,
          q: filter,
          id_cabang: selectedCabang?.value,
          id_lokasi: selectedLokasi?.value,
          status: selectedStatus?.value,
          id_petugas: selectedPetugas?.value
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
    router.replace('/app/kebersihan-temuan/form')
  }

  const onImport = () => {
    router.replace('/app/kebersihan-temuan/import')
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

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)

    setPage(1)
    setPerPage(newPerPage)
    dispatch(
      fetchKebersihanTemuanPage({
        page: 1,
        perPage: newPerPage,
        q: filter,
        id_cabang: selectedCabang?.value,
        id_lokasi: selectedLokasi?.value,
        status: selectedStatus?.value,
        id_petugas: selectedPetugas?.value
      })
    )
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} />
  }

  const convertOptionTingkat = () => {
    return [
      {
        label: 'Ringan',
        value: 1
      },
      {
        label: 'Sedang',
        value: 2
      },
      {
        label: 'Berat',
        value: 3
      }
    ]
  }

  const imageView = (row: any) => {
    if (row.foto_path?.match(/^data:(.+);base64,(.+)$/)) {
      return <img src={row.foto_path} alt='image' width={100} height={100} />
    }

    return <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.foto_path}`} alt='image' width={100} height={100} />
  }

  const imageViewTindakan = (row: any) => {
    if (!row.foto_path_tindakan) return null

    if (row.foto_path_tindakan?.match(/^data:(.+);base64,(.+)$/)) {
      return <img src={row.foto_path_tindakan} alt='image' width={100} height={100} />
    }

    return (
      <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.foto_path_tindakan}`} alt='image' width={100} height={100} />
    )
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('INSPEKSI & PETUGAS', 'inspeksi'),
          tableColumn('STATUS', 'status_text'),
          tableColumn('KATEGORI', 'kategori'),
          tableColumn('DESKRIPSI', 'deskripsi'),
          tableColumn('TINGKAT', 'tingkat_custom'),
          tableColumn('TINDAK LANJUT', 'tindak_lanjut'),
          tableColumn('FOTO', 'foto_path', 'left', imageView as any),
          tableColumn('FOTO TINDAKAN', 'foto_path_tindakan', 'left', imageViewTindakan as any)
        ],
        values: values?.map((row: any) => {
          const tanggalArr = row.kebersihan_inspeksi?.tanggal?.split('-')

          return {
            ...row,
            tingkat_custom: convertOptionTingkat().find(d => d.value === row.tingkat)?.label,
            tindak_lanjut: row.perlu_tindak_lanjut ? 'Ya' : 'Tidak',
            inspeksi: (
              <Fragment>
                <p>{`${row.kebersihan_inspeksi?.cabang?.nama_cabang}`}</p>
                <p>{`${row.kebersihan_inspeksi?.lokasi?.nama_lokasi}`}</p>
                <p>{`${tanggalArr[2]}/${tanggalArr[1]}/${tanggalArr[0]}`}</p>
                <p>{`${row.kebersihan_inspeksi?.waktu.slice(0, -3)}`}</p>
                <p>{`${row.kebersihan_inspeksi?.pegawai?.nama_lengkap}`}</p>
              </Fragment>
            ),
            status_text: (
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={storePegawai.pegawai.map(r => {
                  return {
                    label: `${r.nama_lengkap}`,
                    value: r.id_pegawai
                  }
                })}
                value={selectedPetugas}
                onChange={(_, newValue) => setSelectedPetugas(newValue)}
                getOptionLabel={option => option.label || ''}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Petugas'
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
          </Grid>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Temuan' sx={{ paddingBottom: 0 }} />
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
              <TextField id='outlined-basic' label='Cari...' size='small' onChange={handleFilter} />
            </Tooltip>
          </Toolbar>
          <TableView model={buildTable()} changeSort={null} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default TableTemuan
