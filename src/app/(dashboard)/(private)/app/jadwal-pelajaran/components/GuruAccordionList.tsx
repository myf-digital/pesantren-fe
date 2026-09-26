'use client'

import React, { useEffect, useState, useMemo } from 'react'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteJadwalPelajaran,
  fetchJadwalPelajaranAll,
  resetRedux
} from '../slice/index'
import { fetchGuruMataPelajaranAll, fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import { fetchLocationAll } from '../../location/slice'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import { getInitials } from '@/utils/getInitials'
import DialogDelete from '@views/onevour/components/dialog-delete'
import QuickJadwalDialog from './QuickJadwalDialog'

const HARI_OPTIONS = [
  { label: 'Semua Hari', value: '' },
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' },
  { label: 'Ahad', value: 'Ahad' }
]

const STATUS_OPTIONS = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
  { label: 'Arsip', value: 'Arsip' }
]

const statusObj: Record<string, { color: any; value: string }> = {
  Aktif: { color: 'success', value: 'Aktif' },
  Nonaktif: { color: 'secondary', value: 'Nonaktif' },
  Arsip: { color: 'secondary', value: 'Arsip' }
}

interface GuruAccordionListProps {
  onOpenClassMatrix?: (idKelas: string, lembagaType?: string) => void
  onAddSchedule?: () => void
}

export default function GuruAccordionList({
  onOpenClassMatrix,
  onAddSchedule
}: GuruAccordionListProps) {
  const dispatch = useAppDispatch()

  const storeJadwal = useAppSelector(state => state.jadwal_pelajaran)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)
  const storeLokasi = useAppSelector(state => state.location)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHari, setSelectedHari] = useState<any>(HARI_OPTIONS[0])
  const [selectedStatus, setSelectedStatus] = useState<any>(STATUS_OPTIONS[0])
  const [selectedGedung, setSelectedGedung] = useState<any>({ label: 'Semua Gedung', value: '' })

  // Data States
  const [rawJadwal, setRawJadwal] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedGuru, setExpandedGuru] = useState<string | false>(false)

  // Pagination State (standard template model: 0-indexed page)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [presetSlot, setPresetSlot] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: ''
  })

  // Load master data
  useEffect(() => {
    dispatch(fetchPegawaiAll({}))
    dispatch(fetchGuruMataPelajaranAll({}))
    dispatch(fetchLocationAll({ orderWithParent: true, jenis_lokasi: 'RuangKelas' }))
  }, [dispatch])

  // Load all schedules for grouping
  const loadJadwalList = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedHari?.value) params.hari = selectedHari.value
      if (selectedStatus?.value) params.status = selectedStatus.value
      if (selectedGedung?.value) params.id_lokasi_parent = selectedGedung.value

      const res = await dispatch(fetchJadwalPelajaranAll(params)).unwrap()
      if (res?.data) {
        setRawJadwal(res.data)
      } else {
        setRawJadwal([])
      }
    } catch {
      toast.error('Gagal memuat jadwal guru')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJadwalList()
  }, [selectedHari, selectedStatus, selectedGedung])

  // Group schedules by Guru (Pegawai)
  const groupedGuruList = useMemo(() => {
    const guruMap = new Map<string, {
      guru: any
      schedules: any[]
    }>()

    // First populate from storePegawai.pegawai or from jadwal data
    storePegawai.pegawai.forEach((p: any) => {
      guruMap.set(p.id_pegawai, {
        guru: p,
        schedules: []
      })
    })

    // Assign schedules into guruMap
    rawJadwal.forEach((item: any) => {
      const pegawai = item.jenis_guru?.pegawai
      if (pegawai) {
        const pId = pegawai.id_pegawai
        if (!guruMap.has(pId)) {
          guruMap.set(pId, {
            guru: pegawai,
            schedules: []
          })
        }
        const g = guruMap.get(pId)!
        g.schedules.push(item)
      }
    })

    // Convert map to array and apply search filtering
    let list = Array.from(guruMap.values())

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(item => {
        const name = (item.guru.nama_lengkap || '').toLowerCase()
        const nip = (item.guru.nip || '').toLowerCase()
        return name.includes(q) || nip.includes(q)
      })
    }

    // Sort: teachers with schedules first, then alphabetically
    list.sort((a, b) => {
      if (a.schedules.length > 0 && b.schedules.length === 0) return -1
      if (a.schedules.length === 0 && b.schedules.length > 0) return 1
      return (a.guru.nama_lengkap || '').localeCompare(b.guru.nama_lengkap || '')
    })

    return list
  }, [rawJadwal, storePegawai.pegawai, searchTerm])

  // Pagination slice
  const paginatedList = useMemo(() => {
    const start = page * rowsPerPage
    return groupedGuruList.slice(start, start + rowsPerPage)
  }, [groupedGuruList, page, rowsPerPage])

  const handleAccordionToggle = (panelId: string) => (_: any, isExpanded: boolean) => {
    setExpandedGuru(isExpanded ? panelId : false)
  }

  const handleEditSchedule = (slot: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setPresetSlot(null)
    setEditId(slot.id_jadwal)
    setDialogOpen(true)
  }

  const handleDeleteSchedulePrompt = (slot: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const mapel = slot.jenis_guru?.mata_pelajaran?.nama_mapel || 'Jadwal'
    const hari = slot.hari || ''
    setDeleteConfirm({
      open: true,
      id: slot.id_jadwal,
      title: `${mapel} - ${hari}`
    })
  }

  const handleDeleteExecute = async () => {
    try {
      await dispatch(deleteJadwalPelajaran(deleteConfirm.id)).unwrap()
      toast.success('Jadwal berhasil dihapus')
      setDeleteConfirm({ open: false, id: '', title: '' })
      loadJadwalList()
    } catch {
      toast.error('Gagal menghapus jadwal')
    }
  }

  const handleQuickAddForGuru = (guruId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditId(null)
    setPresetSlot({
      id_pegawai: guruId
    })
    setDialogOpen(true)
  }

  const getGedungOptions = () => {
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
      { label: 'Semua Gedung', value: '' },
      ...Array.from(parentsMap.values()).sort((a, b) => a.label.localeCompare(b.label))
    ]
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter Card */}
      <Card sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems='center'>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size='small'
              fullWidth
              placeholder='Cari Guru / NIP...'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: <i className='tabler-search' style={{ marginRight: 8, color: '#94a3b8' }} />
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size='small'
              options={HARI_OPTIONS}
              value={selectedHari}
              onChange={(_, val) => {
                setSelectedHari(val || HARI_OPTIONS[0])
                setPage(0)
              }}
              getOptionLabel={o => o.label || ''}
              isOptionEqualToValue={(o, v) => o.value === v?.value}
              renderInput={params => <TextField {...params} label='Hari' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size='small'
              options={getGedungOptions()}
              value={selectedGedung}
              onChange={(_, val) => {
                setSelectedGedung(val || { label: 'Semua Gedung', value: '' })
                setPage(0)
              }}
              getOptionLabel={o => o.label || ''}
              isOptionEqualToValue={(o, v) => o.value === v?.value}
              renderInput={params => <TextField {...params} label='Lembaga / Gedung' />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size='small'
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(_, val) => {
                setSelectedStatus(val || STATUS_OPTIONS[0])
                setPage(0)
              }}
              getOptionLabel={o => o.label || ''}
              isOptionEqualToValue={(o, v) => o.value === v?.value}
              renderInput={params => <TextField {...params} label='Status' />}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Accordion Group List inside Card */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <CircularProgress size={36} />
            <Typography variant='body2' color='text.secondary'>
              Memuat daftar jadwal mengajar guru...
            </Typography>
          </Box>
        ) : paginatedList.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <i className='tabler-user-off' style={{ fontSize: '3rem', color: '#94a3b8' }} />
            <Typography variant='h6' sx={{ mt: 2, fontWeight: 600 }}>
              Tidak Ditemukan Data Guru
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Coba sesuaikan kata kunci pencarian atau filter di atas.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedList.map(({ guru, schedules }) => {
              const isExpanded = expandedGuru === guru.id_pegawai
              const totalSlots = schedules.length

              return (
                <Accordion
                  key={guru.id_pegawai}
                  expanded={isExpanded}
                  onChange={handleAccordionToggle(guru.id_pegawai)}
                  sx={{
                    borderRadius: '8px !important',
                    border: '1px solid',
                    borderColor: isExpanded ? 'primary.main' : 'divider',
                    overflow: 'hidden',
                    boxShadow: 'none',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<i className='tabler-chevron-down' style={{ color: '#7367F0' }} />}
                    sx={{
                      px: 3,
                      py: 1,
                      minHeight: 56,
                      bgcolor: isExpanded ? 'rgba(115, 103, 240, 0.04)' : 'background.paper',
                      '& .MuiAccordionSummary-content': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        my: 0.5
                      }
                    }}
                  >
                    {/* Left: Avatar & Guru Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <CustomAvatar
                        skin='light'
                        color={totalSlots > 0 ? 'primary' : 'secondary'}
                        size={38}
                        sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        {getInitials(guru.nama_lengkap || 'G')}
                      </CustomAvatar>

                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                          {guru.nama_lengkap}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          NIP: {guru.nip || '-'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: Badge Slot & Quick Add */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CustomChip
                        round='true'
                        size='small'
                        label={`${totalSlots} Jadwal / Minggu`}
                        color={totalSlots > 0 ? 'success' : 'secondary'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />

                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        sx={{ height: 30, textTransform: 'none', fontSize: '0.75rem', px: 2 }}
                        startIcon={<i className='tabler-plus' />}
                        onClick={e => handleQuickAddForGuru(guru.id_pegawai, e)}
                      >
                        Tambah Slot
                      </Button>
                    </Box>
                  </AccordionSummary>

                  {/* Body: Sub-Table Jadwal Guru */}
                  <AccordionDetails sx={{ p: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                    {schedules.length === 0 ? (
                      <Box sx={{ py: 4, px: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                        <Typography variant='body2' color='text.secondary'>
                          Guru ini belum memiliki jadwal mengajar aktif.
                        </Typography>
                        <Button
                          size='small'
                          variant='contained'
                          sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.75rem' }}
                          startIcon={<i className='tabler-plus' />}
                          onClick={e => handleQuickAddForGuru(guru.id_pegawai, e)}
                        >
                          Atur Jadwal Pertama
                        </Button>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table size='small' sx={{ minWidth: 700 }}>
                          <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>HARI & JAM</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>KELAS</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>MATA PELAJARAN</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>RUANG / LOKASI</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STATUS</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>KETERANGAN</TableCell>
                              <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                                AKSI
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {schedules.map(slot => {
                              const namaKelas = slot.kelas_formal
                                ? slot.kelas_formal.nama_kelas
                                : slot.kelas_mda?.nama_kelas_mda || '-'
                              const idKelas = slot.kelas_formal
                                ? slot.kelas_formal.id_kelas
                                : slot.kelas_mda?.id_kelas_mda
                              const lembagaType = slot.jenis_guru?.lembaga_type || 'FORMAL'
                              const mapelName = slot.jenis_guru?.mata_pelajaran?.nama_mapel || '-'
                              const jamMulai = slot.jam_pelajaran?.mulai?.slice(0, 5) || ''
                              const jamSelesai = slot.jam_pelajaran?.selesai?.slice(0, 5) || ''

                              return (
                                <TableRow key={slot.id_jadwal} hover>
                                  {/* Hari & Jam */}
                                  <TableCell>
                                    <Box>
                                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                                        {slot.hari || '-'}
                                      </Typography>
                                      <Typography variant='caption' color='text.secondary'>
                                        {jamMulai && jamSelesai ? `${jamMulai} - ${jamSelesai}` : '-'}
                                      </Typography>
                                    </Box>
                                  </TableCell>

                                  {/* Kelas */}
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant='body2' fontWeight={600}>
                                        {namaKelas}
                                      </Typography>
                                      {idKelas && onOpenClassMatrix && (
                                        <Tooltip title='Buka Tampilan Matriks Kelas Ini'>
                                          <IconButton
                                            size='small'
                                            color='info'
                                            sx={{ p: 0.4 }}
                                            onClick={() => onOpenClassMatrix(idKelas, lembagaType)}
                                          >
                                            <i className='tabler-layout-grid' style={{ fontSize: '0.85rem' }} />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                    <Typography variant='caption' color='text.disabled'>
                                      {slot.kelas_formal?.lembaga?.nama_lembaga ||
                                        slot.kelas_mda?.lembaga?.nama_lembaga ||
                                        lembagaType}
                                    </Typography>
                                  </TableCell>

                                  {/* Mapel */}
                                  <TableCell>
                                    <Typography variant='body2' fontWeight={500}>
                                      {mapelName}
                                    </Typography>
                                  </TableCell>

                                  {/* Lokasi */}
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <i className='tabler-map-pin' style={{ fontSize: '0.8rem', color: '#64748b' }} />
                                      <Typography variant='body2'>
                                        {slot.lokasi?.nama_lokasi || '-'}
                                      </Typography>
                                    </Box>
                                  </TableCell>

                                  {/* Status */}
                                  <TableCell>
                                    <CustomChip
                                      round='true'
                                      size='small'
                                      label={statusObj[slot.status]?.value || slot.status}
                                      color={statusObj[slot.status]?.color || 'default'}
                                    />
                                  </TableCell>

                                  {/* Keterangan */}
                                  <TableCell>
                                    <Typography variant='caption' color='text.secondary'>
                                      {slot.keterangan || '-'}
                                    </Typography>
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell align='right'>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                      <Tooltip title='Edit Slot Jadwal'>
                                        <IconButton
                                          size='small'
                                          color='warning'
                                          onClick={e => handleEditSchedule(slot, e)}
                                        >
                                          <i className='tabler-pencil' style={{ fontSize: '0.95rem' }} />
                                        </IconButton>
                                      </Tooltip>

                                      <Tooltip title='Hapus Jadwal'>
                                        <IconButton
                                          size='small'
                                          color='error'
                                          onClick={e => handleDeleteSchedulePrompt(slot, e)}
                                        >
                                          <i className='tabler-trash' style={{ fontSize: '0.95rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Box>
        )}

        {/* Standard Template TablePagination */}
        <TablePagination
          component='div'
          count={groupedGuruList.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[10, 15, 25, 30, 50, 100]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        />
      </Card>

      {/* Quick Add/Edit Dialog */}
      <QuickJadwalDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditId(null)
          setPresetSlot(null)
        }}
        onSuccess={loadJadwalList}
        idJadwal={editId}
        presetData={presetSlot}
      />

      {/* Delete Confirmation */}
      <DialogDelete
        id={deleteConfirm.title}
        open={deleteConfirm.open}
        onClose={(event: any, reason: any) => {
          if (reason !== 'backdropClick') {
            setDeleteConfirm({ open: false, id: '', title: '' })
          }
        }}
        handleOk={handleDeleteExecute}
        handleClose={() => setDeleteConfirm({ open: false, id: '', title: '' })}
        disableEscapeKeyDown={true}
      />
    </Box>
  )
}
