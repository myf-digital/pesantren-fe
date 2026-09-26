'use client'

import React, { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  deleteJadwalPelajaran,
  fetchJadwalPelajaranAll,
  resetRedux
} from '../slice/index'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchSemesterAll } from '../../semester/slice'
import { fetchTingkatAll } from '../../tingkat/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'
import { fetchJamPelajaranAll } from '../../jam-pelajaran/slice'
import { fetchLembagaAll } from '../../guru-mata-pelajaran/slice'
import DialogDelete from '@views/onevour/components/dialog-delete'
import QuickJadwalDialog from './QuickJadwalDialog'

const DAYS = [
  { key: 'Senin', label: 'Senin' },
  { key: 'Selasa', label: 'Selasa' },
  { key: 'Rabu', label: 'Rabu' },
  { key: 'Kamis', label: 'Kamis' },
  { key: 'Jumat', label: 'Jumat' },
  { key: 'Sabtu', label: 'Sabtu' },
  { key: 'Ahad', label: 'Minggu / Ahad' }
]

const LEMBAGA_TYPES = [
  { label: 'Formal (SD/SMP/SMA)', value: 'FORMAL' },
  { label: 'Kepesantrenan / MDA', value: 'PESANTREN' }
]

interface MatriksJadwalKelasProps {
  initialKelasId?: string | null
  initialLembagaType?: string | null
  onOpenGuruView?: (idPegawai: string) => void
}

export default function MatriksJadwalKelas({
  initialKelasId,
  initialLembagaType = 'FORMAL',
  onOpenGuruView
}: MatriksJadwalKelasProps) {
  const dispatch = useAppDispatch()

  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeSemester = useAppSelector(state => state.semester)
  const storeTingkat = useAppSelector(state => state.tingkat)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)
  const storeJam = useAppSelector(state => state.jam_pelajaran)
  const storeJadwal = useAppSelector(state => state.jadwal_pelajaran)

  // Filters State
  const [selectedLembagaType, setSelectedLembagaType] = useState<any>(
    LEMBAGA_TYPES.find(l => l.value === initialLembagaType) || LEMBAGA_TYPES[0]
  )
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<any>(null)
  const [selectedSemester, setSelectedSemester] = useState<any>(null)
  const [selectedTingkat, setSelectedTingkat] = useState<any>(null)
  const [selectedKelas, setSelectedKelas] = useState<any>(null)

  // Data State
  const [matrixData, setMatrixData] = useState<any[]>([])
  const [loadingMatrix, setLoadingMatrix] = useState(false)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [presetSlot, setPresetSlot] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: ''
  })

  // Initial master fetch
  useEffect(() => {
    dispatch(fetchTahunAjaranAll({ status: 'Aktif' }))
    dispatch(fetchTingkatAll({ type: selectedLembagaType?.value || 'FORMAL' }))
  }, [dispatch, selectedLembagaType])

  // Fetch Jam Pelajaran with id_kelas filter when selectedKelas or selectedLembagaType changes
  useEffect(() => {
    const params: any = {
      lembaga_type: selectedLembagaType?.value || 'FORMAL'
    }
    if (selectedKelas?.value) {
      params.id_kelas = selectedKelas.value
    }
    dispatch(fetchJamPelajaranAll(params))
  }, [dispatch, selectedLembagaType, selectedKelas?.value])

  // Set default Tahun Ajaran & load Semester
  useEffect(() => {
    if (storeTahunAjaran.datas.length > 0 && !selectedTahunAjaran) {
      const activeTa = storeTahunAjaran.datas.find(t => t.status === 'Aktif') || storeTahunAjaran.datas[0]
      setSelectedTahunAjaran({ label: activeTa.tahun_ajaran, value: activeTa.id_tahunajaran })
      dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: activeTa.id_tahunajaran }))
    }
  }, [storeTahunAjaran.datas, selectedTahunAjaran, dispatch])

  // Set default Semester
  useEffect(() => {
    if (storeSemester.datas.length > 0 && !selectedSemester) {
      const activeSem = storeSemester.datas.find(s => s.status === 'Aktif') || storeSemester.datas[0]
      setSelectedSemester({ label: activeSem.nama_semester, value: activeSem.id_semester })
    }
  }, [storeSemester.datas, selectedSemester])

  // Fetch Kelas options when Tingkat or LembagaType changes
  useEffect(() => {
    if (selectedLembagaType?.value === 'PESANTREN') {
      dispatch(fetchKelasMdaAll({ status: 'Aktif', id_tingkat: selectedTingkat?.value }))
    } else {
      dispatch(fetchKelasFormalAll({ status: 'Aktif', id_tingkat: selectedTingkat?.value }))
    }
  }, [dispatch, selectedLembagaType, selectedTingkat])

  // Set default Kelas if initialKelasId provided or choose first available
  useEffect(() => {
    const list = selectedLembagaType?.value === 'PESANTREN' ? storeKelasMda.datas : storeKelasFormal.datas
    if (list.length > 0) {
      if (initialKelasId) {
        const found = list.find(k => (k.id_kelas || k.id_kelas_mda) === initialKelasId)
        if (found) {
          setSelectedKelas({
            label: found.nama_kelas || found.nama_kelas_mda,
            value: found.id_kelas || found.id_kelas_mda
          })
          return
        }
      }
      if (!selectedKelas) {
        const first = list[0]
        setSelectedKelas({
          label: first.nama_kelas || first.nama_kelas_mda,
          value: first.id_kelas || first.id_kelas_mda
        })
      }
    }
  }, [storeKelasFormal.datas, storeKelasMda.datas, selectedLembagaType, initialKelasId, selectedKelas])

  // Fetch Matrix Data when filters change or refresh requested
  const loadScheduleMatrix = async () => {
    if (!selectedKelas?.value) return

    setLoadingMatrix(true)
    try {
      dispatch(
        fetchJamPelajaranAll({
          lembaga_type: selectedLembagaType?.value || 'FORMAL',
          id_kelas: selectedKelas.value
        })
      )

      const params: any = {
        id_kelas: selectedKelas.value,
        status: 'Aktif'
      }
      if (selectedTahunAjaran?.value) params.id_tahunajaran = selectedTahunAjaran.value
      if (selectedSemester?.value) params.id_semester = selectedSemester.value

      const res = await dispatch(fetchJadwalPelajaranAll(params)).unwrap()
      if (res?.data) {
        setMatrixData(res.data)
      } else {
        setMatrixData([])
      }
    } catch {
      toast.error('Gagal memuat jadwal kelas')
    } finally {
      setLoadingMatrix(false)
    }
  }

  useEffect(() => {
    if (selectedKelas?.value) {
      loadScheduleMatrix()
    }
  }, [selectedKelas, selectedTahunAjaran, selectedSemester])

  // Filter jam pelajaran sorted
  const sortedJamPelajaran = useMemo(() => {
    return [...storeJam.datas].sort((a, b) => {
      if (a.urutan !== undefined && b.urutan !== undefined) return a.urutan - b.urutan
      return (a.mulai || '').localeCompare(b.mulai || '')
    })
  }, [storeJam.datas])

  // Matrix Map helper: key `${hari}_${id_jam_pelajaran}` => list of jadwal items
  const matrixMap = useMemo(() => {
    const map = new Map<string, any[]>()
    matrixData.forEach(item => {
      const jamId = item.id_jam_pelajaran || item.jam_pelajaran?.id_jampel
      const hari = item.hari
      if (jamId && hari) {
        const key = `${hari}_${jamId}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)?.push(item)
      }
    })
    return map
  }, [matrixData])

  // Handle Quick Add for a specific slot
  const handleSlotAdd = (hari: string, jamId: string) => {
    setEditId(null)
    setPresetSlot({
      hari: hari,
      id_jam_pelajaran: jamId,
      id_kelas: selectedKelas?.value,
      id_tahunajaran: selectedTahunAjaran?.value,
      id_semester: selectedSemester?.value,
      lembaga_type: selectedLembagaType?.value,
      id_tingkat: selectedTingkat?.value
    })
    setDialogOpen(true)
  }

  // Handle Edit for a specific schedule item
  const handleSlotEdit = (item: any) => {
    setPresetSlot(null)
    setEditId(item.id_jadwal)
    setDialogOpen(true)
  }

  // Handle Delete for a specific schedule item
  const handleSlotDeletePrompt = (item: any) => {
    const mapelName = item.jenis_guru?.mata_pelajaran?.nama_mapel || 'Jadwal'
    const guruName = item.jenis_guru?.pegawai?.nama_lengkap || ''
    setDeleteConfirm({
      open: true,
      id: item.id_jadwal,
      title: `${mapelName} (${guruName}) - Hari ${item.hari}`
    })
  }

  const handleDeleteExecute = async () => {
    try {
      await dispatch(deleteJadwalPelajaran(deleteConfirm.id)).unwrap()
      toast.success('Jadwal berhasil dihapus')
      setDeleteConfirm({ open: false, id: '', title: '' })
      loadScheduleMatrix()
    } catch {
      toast.error('Gagal menghapus jadwal')
    }
  }

  return (
    <Card sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
      {/* Header Bar with JIBAS-like aesthetic banner & filters */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#fff',
          p: 4,
          borderBottom: '2px solid #0284c7'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <i className='tabler-calendar-event' style={{ fontSize: '1.6rem', color: '#38bdf8' }} />
            </Box>
            <Box>
              <Typography variant='h6' sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                Jadwal Berdasarkan Kelas
              </Typography>
              <Typography variant='caption' sx={{ color: '#94a3b8' }}>
                Atur dan susun jadwal pelajaran mingguan per kelas secara visual
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant='contained'
              size='small'
              sx={{
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
                textTransform: 'none',
                fontWeight: 600
              }}
              startIcon={<i className='tabler-plus' />}
              onClick={() => {
                setEditId(null)
                setPresetSlot({
                  id_kelas: selectedKelas?.value,
                  id_tahunajaran: selectedTahunAjaran?.value,
                  id_semester: selectedSemester?.value,
                  lembaga_type: selectedLembagaType?.value
                })
                setDialogOpen(true)
              }}
            >
              Tambah Jadwal
            </Button>
            <Tooltip title='Segarkan Data'>
              <IconButton
                size='small'
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                onClick={loadScheduleMatrix}
              >
                <i className='tabler-refresh' />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Toolbar (Departemen, Tahun Ajaran, Semester, Tingkat, Kelas) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Grid container spacing={3} alignItems='center'>
            {/* Lembaga Type */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography variant='caption' sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Departemen / Jalur:
              </Typography>
              <Autocomplete
                size='small'
                options={LEMBAGA_TYPES}
                value={selectedLembagaType}
                onChange={(_, val) => {
                  setSelectedLembagaType(val)
                  setSelectedKelas(null)
                  setSelectedTingkat(null)
                }}
                getOptionLabel={o => o.label || ''}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                renderInput={params => <TextField {...params} placeholder='Pilih Lembaga' />}
              />
            </Grid>

            {/* Tahun Ajaran */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography variant='caption' sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Tahun Ajaran:
              </Typography>
              <Autocomplete
                size='small'
                options={storeTahunAjaran.datas.map(t => ({ label: t.tahun_ajaran, value: t.id_tahunajaran }))}
                value={selectedTahunAjaran}
                onChange={(_, val) => {
                  setSelectedTahunAjaran(val)
                  if (val?.value) {
                    dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: val.value }))
                  }
                }}
                getOptionLabel={o => o.label || ''}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                renderInput={params => <TextField {...params} placeholder='Pilih Tahun Ajaran' />}
              />
            </Grid>

            {/* Semester / Info Jadwal */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography variant='caption' sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Semester / Info Jadwal:
              </Typography>
              <Autocomplete
                size='small'
                options={storeSemester.datas.map(s => ({ label: s.nama_semester, value: s.id_semester }))}
                value={selectedSemester}
                onChange={(_, val) => setSelectedSemester(val)}
                getOptionLabel={o => o.label || ''}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                renderInput={params => <TextField {...params} placeholder='Pilih Semester' />}
              />
            </Grid>

            {/* Tingkat */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography variant='caption' sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Tingkat:
              </Typography>
              <Autocomplete
                size='small'
                options={storeTingkat.datas.map(t => ({
                  label: t.nama_tingkat || t.tingkat,
                  value: t.id_tingkat
                }))}
                value={selectedTingkat}
                onChange={(_, val) => {
                  setSelectedTingkat(val)
                  setSelectedKelas(null)
                }}
                getOptionLabel={o => o.label || ''}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                renderInput={params => <TextField {...params} placeholder='Semua Tingkat' />}
              />
            </Grid>

            {/* Kelas */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography variant='caption' sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Kelas:
              </Typography>
              <Autocomplete
                size='small'
                options={
                  selectedLembagaType?.value === 'PESANTREN'
                    ? storeKelasMda.datas.map(k => ({ label: k.nama_kelas_mda, value: k.id_kelas_mda }))
                    : storeKelasFormal.datas.map(k => ({ label: k.nama_kelas, value: k.id_kelas }))
                }
                value={selectedKelas}
                onChange={(_, val) => setSelectedKelas(val)}
                getOptionLabel={o => o.label || ''}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                renderInput={params => <TextField {...params} placeholder='Pilih Kelas' />}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Timetable Grid Matrix */}
      <CardContent sx={{ p: 0 }}>
        {loadingMatrix ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant='body2' color='text.secondary'>
              Memuat data matriks jadwal kelas...
            </Typography>
          </Box>
        ) : !selectedKelas?.value ? (
          <Box sx={{ textAlign: 'center', py: 12, px: 4 }}>
            <i className='tabler-search' style={{ fontSize: '3rem', color: '#94a3b8' }} />
            <Typography variant='h6' sx={{ mt: 2, fontWeight: 600 }}>
              Silakan Pilih Kelas
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 450, mx: 'auto', mt: 1 }}>
              Pilih kelas pada filter di atas untuk melihat dan menyusun matriks jadwal pelajaran mingguan.
            </Typography>
          </Box>
        ) : sortedJamPelajaran.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, px: 4 }}>
            <i className='tabler-clock-exclamation' style={{ fontSize: '3rem', color: '#f59e0b' }} />
            <Typography variant='h6' sx={{ mt: 2, fontWeight: 600 }}>
              Belum Ada Master Jam Pelajaran
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 450, mx: 'auto', mt: 1 }}>
              Master jam pelajaran untuk jalur {selectedLembagaType?.label} belum dikonfigurasi.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflowX: 'auto' }}>
            <Table
              stickyHeader
              size='small'
              sx={{
                borderCollapse: 'collapse',
                minWidth: 1000,
                '& th, & td': {
                  border: '1px solid #e2e8f0'
                }
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#0f172a' }}>
                  {/* Jam Column */}
                  <TableCell
                    sx={{
                      width: 140,
                      bgcolor: '#1e293b',
                      color: '#fff',
                      fontWeight: 700,
                      textAlign: 'center',
                      py: 1.8,
                      fontSize: '0.85rem'
                    }}
                  >
                    Jam
                  </TableCell>

                  {/* Day Columns */}
                  {DAYS.map(day => (
                    <TableCell
                      key={day.key}
                      sx={{
                        bgcolor: '#1e293b',
                        color: '#fff',
                        fontWeight: 700,
                        textAlign: 'center',
                        py: 1.8,
                        minWidth: 130,
                        fontSize: '0.85rem'
                      }}
                    >
                      {day.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedJamPelajaran.map((jam, idx) => {
                  const jamId = jam.id_jampel
                  const timeLabel = `${jam.mulai?.slice(0, 5)} - ${jam.selesai?.slice(0, 5)}`
                  const jamIndex = jam.nama_jampel || `${idx + 1}. ${timeLabel}`

                  return (
                    <TableRow key={jamId} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                      {/* Jam Cell */}
                      <TableCell
                        sx={{
                          bgcolor: 'background.default',
                          textAlign: 'center',
                          fontWeight: 600,
                          px: 2,
                          py: 2.5
                        }}
                      >
                        <Typography variant='body2' fontWeight={700} color='text.primary'>
                          {jam.nama_jampel ? `${idx + 1}. ${jam.nama_jampel}` : `${idx + 1}.`}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          {timeLabel}
                        </Typography>
                      </TableCell>

                      {/* Day Cells */}
                      {DAYS.map(day => {
                        const cellKey = `${day.key}_${jamId}`
                        const slotItems = matrixMap.get(cellKey) || []

                        return (
                          <TableCell
                            key={cellKey}
                            sx={{
                              p: 1.5,
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              position: 'relative',
                              minHeight: 90,
                              '&:hover': {
                                bgcolor: 'rgba(2, 132, 199, 0.04)'
                              }
                            }}
                          >
                            {slotItems.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {slotItems.map(item => {
                                  const mapel = item.jenis_guru?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran'
                                  const guru = item.jenis_guru?.pegawai?.nama_lengkap || 'Guru Pengajar'
                                  const lokasi = item.lokasi?.nama_lokasi

                                  return (
                                    <Box
                                      key={item.id_jadwal}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: '8px',
                                        bgcolor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        position: 'relative',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                          borderColor: '#38bdf8'
                                        }
                                      }}
                                    >
                                      <Typography
                                        variant='subtitle2'
                                        sx={{
                                          fontWeight: 700,
                                          color: '#0f172a',
                                          fontSize: '0.82rem',
                                          lineHeight: 1.2
                                        }}
                                      >
                                        {mapel}
                                      </Typography>

                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: '#475569',
                                          fontWeight: 500,
                                          fontSize: '0.75rem',
                                          lineHeight: 1.2
                                        }}
                                      >
                                        {guru}
                                      </Typography>

                                      {lokasi && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                          <i className='tabler-map-pin' style={{ fontSize: '0.7rem', color: '#64748b' }} />
                                          <Typography variant='caption' sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                                            {lokasi}
                                          </Typography>
                                        </Box>
                                      )}

                                      {/* Action Buttons: Edit (Pensil) & Delete (Silang/Trash) */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
                                        <Tooltip title='Edit Jadwal Slot Ini'>
                                          <IconButton
                                            size='small'
                                            sx={{
                                              p: 0.5,
                                              color: '#eab308',
                                              bgcolor: 'rgba(234, 179, 8, 0.1)',
                                              '&:hover': { bgcolor: 'rgba(234, 179, 8, 0.2)' }
                                            }}
                                            onClick={() => handleSlotEdit(item)}
                                          >
                                            <i className='tabler-pencil' style={{ fontSize: '0.9rem' }} />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title='Hapus Jadwal Slot Ini'>
                                          <IconButton
                                            size='small'
                                            sx={{
                                              p: 0.5,
                                              color: '#ef4444',
                                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                            }}
                                            onClick={() => handleSlotDeletePrompt(item)}
                                          >
                                            <i className='tabler-trash' style={{ fontSize: '0.9rem' }} />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                  )
                                })}
                              </Box>
                            ) : (
                              /* Empty Cell: Green Plus Button (persis seperti SS) */
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                                <Tooltip title={`Tambah Jadwal Hari ${day.label} (${timeLabel})`}>
                                  <IconButton
                                    size='small'
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      bgcolor: '#22c55e',
                                      color: '#fff',
                                      boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)',
                                      transition: 'transform 0.15s ease-in-out',
                                      '&:hover': {
                                        bgcolor: '#16a34a',
                                        transform: 'scale(1.15)'
                                      }
                                    }}
                                    onClick={() => handleSlotAdd(day.key, jamId)}
                                  >
                                    <i className='tabler-plus' style={{ fontSize: '1rem', strokeWidth: 3 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Quick Add / Edit Dialog */}
      <QuickJadwalDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditId(null)
          setPresetSlot(null)
        }}
        onSuccess={loadScheduleMatrix}
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
    </Card>
  )
}
