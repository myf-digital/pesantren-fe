'use client'

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'

import CardHeader from '@mui/material/CardHeader'
import { Autocomplete, CircularProgress, TextField, Toolbar, useMediaQuery, useTheme, Box } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchKebersihanTemuanPage, postExport } from '../../../kebersihan-temuan/slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import { format, startOfWeek } from 'date-fns'
import { fetchCabangAll } from '../../../cabang/slice'
import { fetchLocationAll } from '../../../location/slice'
import { fetchPegawaiAll } from '../../../guru-mata-pelajaran/slice'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

function RowAction(data: any) {
  const [anchorEl, setAnchorEl] = useState(null)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const setOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
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
          href={`/app/report/kebersihan-temuan/form?id=${data.row.id_temuan}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>
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
  id_cabang: string
  nama_cabang: string
}

interface LokasiOption {
  id_lokasi: string
  nama_lokasi: string
}

interface PetugasOption {
  id_pegawai: string
  nama_lengkap: string
}

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return (
    <TextField
      inputRef={ref}
      fullWidth
      size='small'
      {...props}
    />
  )
})

const TableTemuan = () => {
  // ** Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kebersihan_temuan)

  const canExport = useCan('export')

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

  // Opsi Data Dropdown Master
  const [listCabang, setListCabang] = useState<CabangOption[]>([])
  const [listLokasi, setListLokasi] = useState<LokasiOption[]>([])
  const [listPetugas, setListPetugas] = useState<PetugasOption[]>([])
  const [loadingCabang, setLoadingCabang] = useState(false)
  const [loadingLokasi, setLoadingLokasi] = useState(false)
  const [loadingPetugas, setLoadingPetugas] = useState(false)

  // State Filter Utama UI
  const [tanggalAwal, setTanggalAwal] = useState<Date | null>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(new Date())
  const [selectedCabang, setSelectedCabang] = useState<CabangOption | null>({ id_cabang: '', nama_cabang: 'Semua' })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const [selectedPetugas, setSelectedPetugas] = useState<PetugasOption | null>({ id_pegawai: '', nama_lengkap: 'Semua' })
  const [searchTyped, setSearchTyped] = useState('')

  // Ambil Master Data Cabang via fetchCabangAll
  useEffect(() => {
    const getCabangMaster = async () => {
      try {
        setLoadingCabang(true)
        const res = await dispatch(fetchCabangAll({ page: 1, perPage: 100, q: filter })).unwrap()

        if (res?.status && res?.data) {
          setListCabang([{ id_cabang: '', nama_cabang: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListCabang([{ id_cabang: '', nama_cabang: 'Semua' }, ...res])
        }
      } catch {
        setListCabang([{ id_cabang: '', nama_cabang: 'Semua' }])
      } finally {
        setLoadingCabang(false)
      }
    }
    getCabangMaster()
  }, [dispatch])

  // Ambil Master Data Lokasi via fetchLocationAll
  useEffect(() => {
    const getLokasiMaster = async () => {
      try {
        setLoadingLokasi(true)
        const res = await dispatch(fetchLocationAll({ page: 1, perPage: 100, q: '' })).unwrap()

        if (res?.status && res?.data) {
          setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...res])
        }
      } catch {
        setListLokasi([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingLokasi(false)
      }
    }
    getLokasiMaster()
  }, [dispatch])

    // Ambil Master Data Petugas via fetchPegawaiAll
    useEffect(() => {
      const getPetugasMaster = async () => {
        try {
          setLoadingPetugas(true)
          const res = await dispatch(fetchPegawaiAll({ page: 1, perPage: 100, q: filter })).unwrap()
  
          if (res?.status && res?.data) {
            setListPetugas([{ id_pegawai: '', nama_lengkap: 'Semua' }, ...res.data])
          } else if (Array.isArray(res)) {
            setListPetugas([{ id_pegawai: '', nama_lengkap: 'Semua' }, ...res])
          }
        } catch {
          setListPetugas([{ id_pegawai: '', nama_lengkap: 'Semua' }])
        } finally {
          setLoadingPetugas(false)
        }
      }
      getPetugasMaster()
    }, [dispatch])

  const executeFetchData = useCallback((overrides?: any) => {
    dispatch(
      fetchKebersihanTemuanPage({
        page: overrides?.page !== undefined ? overrides.page : page,
        perPage: overrides?.perPage !== undefined ? overrides.perPage : perPage,
        id_cabang: overrides?.id_cabang !== undefined ? overrides.id_cabang : (selectedCabang?.id_cabang || ''),
        id_lokasi: overrides?.id_lokasi !== undefined ? overrides.id_lokasi : (selectedLokasi?.id_lokasi || ''),
        id_petugas: overrides?.id_petugas !== undefined ? overrides.id_petugas : (selectedPetugas?.id_pegawai || ''),
        tanggal_awal: overrides?.tanggal_awal !== undefined ? overrides.tanggal_awal : (tanggalAwal || ''),
        tanggal_akhir: overrides?.tanggal_akhir !== undefined ? overrides.tanggal_akhir : (tanggalAkhir || ''),
        q: overrides?.q !== undefined ? overrides.q : searchTyped
      })
    )
  }, [dispatch, page, perPage, selectedCabang, selectedLokasi, selectedPetugas, tanggalAwal, tanggalAkhir, searchTyped])

  const executeFetchRef = useRef(executeFetchData)
  useEffect(() => {
    executeFetchRef.current = executeFetchData
  }, [executeFetchData])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      executeFetchRef.current({ page: 1, q: filter })
    }, 500)

    return () => clearTimeout(timer)
  }, [filter, perPage])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      executeFetchRef.current({ page: newPage })
    },
    []
  )

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const res = await dispatch(
        postExport({
          q: searchTyped,
          id_cabang: selectedCabang?.id_cabang || '',
          id_lokasi: selectedLokasi?.id_lokasi || '',
          id_petugas: selectedPetugas?.id_pegawai || '',
          tanggal_awal: tanggalAwal || '',
          tanggal_akhir: tanggalAkhir || ''
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
      } else {
        toast.error(res?.message || 'Gagal export data')
      }
    } catch {
      toast.error('Terjadi kesalahan saat export data')
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
    executeFetchData({ page: 1, perPage: newPerPage })
  }

  const handleSearchSubmit = () => {
    setPage(1)
    executeFetchData({ page: 1 })
  }

  const handleResetFilter = () => {
    const defaultTanggalAwal = startOfWeek(new Date(), { weekStartsOn: 1 })
    const defaultTanggalAkhir = new Date()
    setTanggalAwal(defaultTanggalAwal)
    setTanggalAkhir(defaultTanggalAkhir)
    setSelectedCabang(listCabang.find(s => s.id_cabang === '') || null)
    setSelectedLokasi(listLokasi.find(k => k.id_lokasi === '') || null)
    setSelectedPetugas(listPetugas.find(p => p.id_pegawai === '') || null)
    setSearchTyped('')
    setPage(1)
    
    executeFetchData({
      page: 1,
      id_cabang: '',
      id_lokasi: '',
      id_petugas: '',
      tanggal_awal: format(defaultTanggalAwal, 'yyyy-MM-dd'),
      tanggal_akhir: format(defaultTanggalAkhir, 'yyyy-MM-dd'),
      q: ''
    })
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
    if (row.foto_path.match(/^data:(.+);base64,(.+)$/)) {
      return <img src={row.foto_path} alt='image' width={100} height={100} />
    }

    return <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.foto_path}`} alt='image' width={100} height={100} />
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('CABANG', 'cabang'),
          tableColumn('LOKASI', 'lokasi'),
          tableColumn('PETUGAS', 'petugas'),
          tableColumn('KATEGORI', 'kategori'),
          tableColumn('DESKRIPSI', 'deskripsi'),
          tableColumn('TINGKAT', 'tingkat_custom'),
          tableColumn('PERLU TINDAK LANJUT', 'tindak_lanjut'),
          tableColumn('FOTO', 'foto_path', 'left', imageView as any)
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            tingkat_custom: row.tingkat?.label ?? convertOptionTingkat().find(d => d.value === row.tingkat)?.label,
            tindak_lanjut: row.perlu_tindak_lanjut ? 'Ya' : 'Tidak',
            cabang: row.kebersihan_inspeksi?.cabang?.nama_cabang || '-',
            lokasi: row.kebersihan_inspeksi?.lokasi?.nama_lokasi || '-',
            petugas: row.kebersihan_inspeksi?.pegawai?.nama_lengkap || '-',
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
        <Card sx={{ p: 5, mb: 4 }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={listCabang}
                loading={loadingCabang}
                value={selectedCabang}
                onChange={(_, newValue) => setSelectedCabang(newValue)}
                getOptionLabel={option => option.nama_cabang || ''}
                isOptionEqualToValue={(option, value) => option.id_cabang === value?.id_cabang}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Cabang'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingCabang ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={listLokasi}
                loading={loadingLokasi}
                value={selectedLokasi}
                onChange={(_, newValue) => setSelectedLokasi(newValue)}
                getOptionLabel={option => option.nama_lokasi || ''}
                isOptionEqualToValue={(option, value) => option.id_lokasi === value?.id_lokasi}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lokasi'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingLokasi ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete
                size='small'
                options={listPetugas}
                loading={loadingPetugas}
                value={selectedPetugas}
                onChange={(_, newValue) => setSelectedPetugas(newValue)}
                getOptionLabel={option => option.nama_lengkap || ''}
                isOptionEqualToValue={(option, value) => option.id_pegawai === value?.id_pegawai}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Petugas'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingPetugas ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppReactDatepicker
                selected={tanggalAwal}
                onChange={(date: Date | null) => setTanggalAwal(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent label="Tanggal Awal" />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <AppReactDatepicker
                selected={tanggalAkhir}
                onChange={(date: Date | null) => setTanggalAkhir(date)}
                placeholderText='MM/DD/YYYY'
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dropdownMode='select'
                customInput={<PickersComponent label="Tanggal Akhir" />}
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
                color='success'
                variant='contained'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
              >
                {loadingExport ? 'Proses...' : 'Export CSV'}
              </Button>
            )}
          </Toolbar>
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
