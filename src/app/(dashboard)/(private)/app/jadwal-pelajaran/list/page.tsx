'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import {
  Autocomplete,
  Box,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteJadwalPelajaran,
  fetchJadwalPelajaranPage,
  postJadwalPelajaranUpdate,
  postExport,
  resetRedux
} from '../slice/index'
import { tableColumn } from '@views/onevour/table/TableViewBuilder'
import TableView from '@views/onevour/table/TableView'
import CustomChip from '@core/components/mui/Chip'
import DialogDelete from '@views/onevour/components/dialog-delete'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { useCan } from '@/hooks/useCan'
import { fetchLocationAll } from '../../location/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import GuruAccordionList from '../components/GuruAccordionList'
import MatriksJadwalKelas from '../components/MatriksJadwalKelas'
import QuickJadwalDialog from '../components/QuickJadwalDialog'
import RekapJadwalGuruView from '../../report/rekap-jadwal-guru/components/RekapJadwalGuruView'

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: {
    color: 'success',
    value: 'Aktif'
  },
  Nonaktif: {
    color: 'secondary',
    value: 'Nonaktif'
  },
  Arsip: {
    color: 'secondary',
    value: 'Arsip'
  }
}

const statuss = [
  { label: 'Semua', value: '' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
  { label: 'Arsip', value: 'Arsip' }
]

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
    dispatch(deleteJadwalPelajaran(id))
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
          href={`/app/jadwal-pelajaran/form?id=${data.row.id_jadwal}&view=true`}
          onClick={handleView}
        >
          <i className='tabler-eye' />
          View
        </MenuItem>

        {canEdit && [
          <MenuItem
            key='edit'
            component={Link}
            sx={{ '& svg': { mr: 2 } }}
            href={`/app/jadwal-pelajaran/form?id=${data.row.id_jadwal}`}
            onClick={handleView}
          >
            <i className='tabler-edit' />
            Edit
          </MenuItem>,

          data.row.status === 'Nonaktif' && (
            <MenuItem key='aktif' onClick={() => data.handleAktifOrArsip(data.row, 'Aktif')} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-toggle-right' />
              Set Aktif
            </MenuItem>
          ),

          data.row.status === 'Nonaktif' && (
            <MenuItem key='arsip' onClick={() => data.handleAktifOrArsip(data.row, 'Arsip')} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-archive' />
              Arsip
            </MenuItem>
          )
        ]}

        {canDelete && (
          <MenuItem onClick={() => setOpenConfirm(true)} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <i className='tabler-trash' />
            Delete
          </MenuItem>
        )}
        <DialogDelete
          id={data.row.hari}
          open={openConfirm}
          onClose={(event: any, reason: any) => {
            if (reason !== 'backdropClick') {
              setOpenConfirm(false)
            }
          }}
          handleOk={() => {
            handleDelete(data.row.id_jadwal)
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

interface StatusOption {
  label: string
  value: string
}

interface LokasiOption {
  label: string
  value: string
}

interface HariOption {
  label: string
  value: string
}

interface GuruOption {
  label: string
  value: string
}

const haris = [
  { label: 'Semua', value: '' },
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' },
  { label: 'Ahad', value: 'Ahad' }
]

const JadwalPelajaranPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.jadwal_pelajaran)
  const storeLokasi = useAppSelector(state => state.location)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  // Tab State: 0 = Accordion Guru, 1 = Matriks Jadwal Kelas, 2 = Tabel Semua
  const [activeTab, setActiveTab] = useState<number>(0)

  // Quick Dialog State
  const [quickDialogOpen, setQuickDialogOpen] = useState(false)

  // Target class selection when jumping from Accordion to Matrix
  const [targetClassForMatrix, setTargetClassForMatrix] = useState<{
    idKelas: string | null
    lembagaType: string
  }>({ idKelas: null, lembagaType: 'FORMAL' })

  // Flat Table State (Tab 2)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>({ label: 'Semua', value: '' })
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiOption | null>({ label: 'Semua', value: '' })
  const [selectedLembagaParent, setSelectedLembagaParent] = useState<LokasiOption | null>({ label: 'Semua', value: '' })
  const [selectedHari, setSelectedHari] = useState<HariOption | null>({ label: 'Semua', value: '' })
  const [selectedGuru, setSelectedGuru] = useState<GuruOption | null>({ label: 'Semua', value: '' })

  // Check query params if any
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'matrix') {
      setActiveTab(1)
    } else if (tabParam === 'table') {
      setActiveTab(2)
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 2) {
      if (store.delete) {
        dispatch(
          fetchJadwalPelajaranPage({
            page: 1,
            perPage: perPage,
            q: filter,
            status: selectedStatus?.value,
            id_lokasi: selectedLokasi?.value,
            id_lokasi_parent: selectedLembagaParent?.value,
            hari: selectedHari?.value,
            id_pegawai: selectedGuru?.value
          })
        )
        dispatch(resetRedux())
      }

      dispatch(fetchLocationAll({ orderWithParent: true, jenis_lokasi: 'RuangKelas' }))
      dispatch(fetchPegawaiAll({}))
    }
  }, [dispatch, filter, perPage, store.delete, activeTab, selectedStatus, selectedLokasi, selectedLembagaParent, selectedHari, selectedGuru])

  useEffect(() => {
    if (activeTab !== 2) return

    const timer = setTimeout(() => {
      setPage(1)
      dispatch(
        fetchJadwalPelajaranPage({
          page: 1,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_lokasi: selectedLokasi?.value,
          id_lokasi_parent: selectedLembagaParent?.value,
          hari: selectedHari?.value,
          id_pegawai: selectedGuru?.value
        })
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [
    dispatch,
    filter,
    perPage,
    selectedStatus,
    selectedLokasi,
    selectedLembagaParent,
    selectedHari,
    selectedGuru,
    activeTab
  ])

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      dispatch(
        fetchJadwalPelajaranPage({
          page: newPage,
          perPage: perPage,
          q: filter,
          status: selectedStatus?.value,
          id_lokasi: selectedLokasi?.value,
          id_lokasi_parent: selectedLembagaParent?.value,
          hari: selectedHari?.value,
          id_pegawai: selectedGuru?.value
        })
      )
    },
    [
      dispatch,
      perPage,
      filter,
      selectedStatus,
      selectedLokasi,
      selectedLembagaParent,
      selectedHari,
      selectedGuru
    ]
  )

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      if (activeTab === 2) handleChangePage(page)
      dispatch(resetRedux())
    } else {
      toast.error('Error saved: ' + store.crud.message)
    }
  }, [dispatch, handleChangePage, page, store.crud, activeTab])

  const onAddForm = () => {
    setQuickDialogOpen(true)
  }

  const onImport = () => {
    router.replace('/app/jadwal-pelajaran/import')
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

  const handleAktifOrArsip = (data: any, status: string) => {
    delete data.status_custom
    dispatch(
      postJadwalPelajaranUpdate({
        id: data.id_jadwal,
        params: {
          ...data,
          status: status,
          id_tahunajaran: { value: data.id_tahunajaran },
          id_kelas: { value: data.id_kelas },
          id_gmapel: { value: data.id_gmapel },
          id_jam_pelajaran: { value: data.id_jam_pelajaran },
          id_lokasi: { value: data.id_lokasi },
          id_semester: { value: data.id_semester }
        }
      })
    )
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value)
  }

  const handleChangePerPage = (event: any) => {
    const newPerPage = parseInt(event.target.value, 10)
    setPage(1)
    setPerPage(newPerPage)
    dispatch(
      fetchJadwalPelajaranPage({
        page: 1,
        perPage: newPerPage,
        q: filter,
        status: selectedStatus?.value,
        id_lokasi: selectedLokasi?.value,
        id_lokasi_parent: selectedLembagaParent?.value,
        hari: selectedHari?.value,
        id_pegawai: selectedGuru?.value
      })
    )
  }

  const renderOption = (row: any) => {
    return <RowAction row={row} handleAktifOrArsip={handleAktifOrArsip} />
  }

  const buildTable = () => {
    const { dataPage } = store

    if (dataPage) {
      const { values, total } = dataPage

      return {
        page: page,
        fields: [
          tableColumn('OPTION', 'act-x', 'left', renderOption as any),
          tableColumn('HARI', 'hari'),
          tableColumn('KELAS', 'kelas'),
          tableColumn('MATA PELAJARAN', 'mapel'),
          tableColumn('GURU', 'guru'),
          tableColumn('LOKASI', 'lokasi'),
          tableColumn('STATUS', 'status_custom'),
          tableColumn('KETERANGAN', 'keterangan'),
          tableColumn('TERAKHIR DIUBAH', 'updated_at')
        ],
        values: values?.map((row: any) => {
          return {
            ...row,
            kelas: row.kelas_formal ? row.kelas_formal?.nama_kelas : row.kelas_mda?.nama_kelas_mda,
            lokasi: (
              <Box>
                <Typography variant='body2'>{row.lokasi?.nama_lokasi}</Typography>
                <Typography variant='caption' color='text.disabled'>
                  {row.kelas_formal ? row.kelas_formal?.lembaga?.nama_lembaga : row.kelas_mda?.lembaga?.nama_lembaga}
                </Typography>
              </Box>
            ),
            mapel: row.jenis_guru?.mata_pelajaran?.nama_mapel,
            guru: row.jenis_guru?.pegawai?.nama_lengkap,
            status_custom: (
              <CustomChip
                round='true'
                size='small'
                label={statusObj[row.status]?.value}
                color={statusObj[row.status]?.color}
                sx={{ textTransform: 'capitalize' }}
              />
            ),
            hari: (
              <Box>
                <Typography variant='body2'>{row.hari || '-'}</Typography>
                <Typography variant='caption' color='text.disabled' sx={{ whiteSpace: 'nowrap' }}>
                  {row.jam_pelajaran
                    ? `${row.jam_pelajaran?.mulai?.slice(0, -3)} - ${row.jam_pelajaran?.selesai?.slice(0, -3)}`
                    : '-'}
                </Typography>
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

  const getLembagaParentOptions = () => {
    const parentsMap = new Map<string, { label: string; value: string }>()
    storeLokasi.datas.forEach(r => {
      if (r.parent) {
        parentsMap.set(r.parent.id_lokasi, {
          label: r.parent.nama_lokasi,
          value: r.parent.id_lokasi
        })
      }
    })
    return [
      { label: 'Semua', value: '' },
      ...Array.from(parentsMap.values()).sort((a, b) => a.label.localeCompare(b.label))
    ]
  }

  const getLokasiOptions = () => {
    const allOptions = storeLokasi.datas
      .filter(r => r.jenis_lokasi === 'RuangKelas')
      .map(r => ({
        label: `${r.parent ? `${r.parent.nama_lokasi} / ` : ''}${r.nama_lokasi}`,
        value: r.id_lokasi,
        parent_id: r.parent_id
      }))

    if (!selectedLembagaParent || selectedLembagaParent.value === '') {
      return [{ label: 'Semua', value: '' }, ...allOptions]
    }

    const filtered = allOptions.filter(opt => opt.parent_id === selectedLembagaParent.value)
    return [{ label: 'Semua', value: '' }, ...filtered]
  }

  // Handler to jump to Matrix View with target class
  const handleOpenClassMatrix = (idKelas: string, lembagaType: string = 'FORMAL') => {
    setTargetClassForMatrix({ idKelas, lembagaType })
    setActiveTab(1)
  }

  return (
    <Grid container spacing={6} sx={{ width: '100%' }}>
      {/* Top Header & Tab Navigation */}
      <Grid size={12}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor='primary'
            indicatorColor='primary'
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minHeight: 44,
                gap: 1.5
              }
            }}
          >
            <Tab
              icon={<i className='tabler-users' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Jadwal Mengajar Guru'
            />
            <Tab
              icon={<i className='tabler-layout-grid' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Matriks Jadwal Kelas'
            />
            <Tab
              icon={<i className='tabler-table' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Semua Data Jadwal'
            />
            <Tab
              icon={<i className='tabler-file-analytics' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Rekap Mengajar Guru'
            />
          </Tabs>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {canCreate && (
              <Button
                size='small'
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={onAddForm}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Tambah Jadwal
              </Button>
            )}

            {canImport && (
              <Button
                size='small'
                color='success'
                variant='outlined'
                startIcon={<i className='tabler-file-import' />}
                onClick={onImport}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Import Excel
              </Button>
            )}

            {canExport && (
              <Button
                size='small'
                color='warning'
                variant='outlined'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
                disabled={loadingExport}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Tab 0: Jadwal Mengajar Guru (Accordion) */}
      {activeTab === 0 && (
        <Grid size={12}>
          <GuruAccordionList
            onOpenClassMatrix={handleOpenClassMatrix}
            onAddSchedule={onAddForm}
          />
        </Grid>
      )}

      {/* Tab 1: Matriks Jadwal Kelas (Grid Timetable) */}
      {activeTab === 1 && (
        <Grid size={12}>
          <MatriksJadwalKelas
            initialKelasId={targetClassForMatrix.idKelas}
            initialLembagaType={targetClassForMatrix.lembagaType}
          />
        </Grid>
      )}

      {/* Tab 2: Tabel Semua Data (Flat Table) */}
      {activeTab === 2 && (
        <>
          <Grid size={12}>
            <Card sx={{ p: 5 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    size='small'
                    options={haris}
                    value={selectedHari}
                    onChange={(_, newValue) => setSelectedHari(newValue)}
                    getOptionLabel={option => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={params => <TextField {...params} label='Hari' />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    size='small'
                    options={[
                      { label: 'Semua', value: '' },
                      ...storePegawai.pegawai.map(r => ({
                        label: `${r.nama_lengkap} (${r.nip || '-'})`,
                        value: r.id_pegawai
                      }))
                    ]}
                    value={selectedGuru}
                    onChange={(_, newValue) => setSelectedGuru(newValue)}
                    getOptionLabel={option => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={params => <TextField {...params} label='Guru' />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    size='small'
                    options={statuss}
                    value={selectedStatus}
                    onChange={(_, newValue) => setSelectedStatus(newValue)}
                    getOptionLabel={option => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={params => <TextField {...params} label='Status' />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    size='small'
                    options={getLembagaParentOptions()}
                    value={selectedLembagaParent}
                    onChange={(_, newValue) => {
                      setSelectedLembagaParent(newValue)
                      setSelectedLokasi({ label: 'Semua', value: '' })
                    }}
                    getOptionLabel={option => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={params => <TextField {...params} label='Lembaga / Gedung' />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    size='small'
                    options={getLokasiOptions()}
                    value={selectedLokasi}
                    onChange={(_, newValue) => setSelectedLokasi(newValue)}
                    getOptionLabel={option => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={params => <TextField {...params} label='Lokasi (Ruang Kelas)' />}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={12}>
            <Card>
              <CardHeader title='Jadwal Pelajaran' sx={{ paddingBottom: 0 }} />
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
        </>
      )}

      {/* Tab 3: Rekap Mengajar Guru (Monthly Teacher Report) */}
      {activeTab === 3 && (
        <Grid size={12}>
          <RekapJadwalGuruView isStandalone={false} />
        </Grid>
      )}

      {/* Global Quick Add Dialog */}
      <QuickJadwalDialog
        open={quickDialogOpen}
        onClose={() => setQuickDialogOpen(false)}
        onSuccess={() => {
          if (activeTab === 2) handleChangePage(page)
        }}
      />
    </Grid>
  )
}

export default JadwalPelajaranPage
