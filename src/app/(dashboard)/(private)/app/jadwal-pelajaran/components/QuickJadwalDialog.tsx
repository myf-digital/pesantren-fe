'use client'

import React, { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchJadwalPelajaranById, postJadwalPelajaran, postJadwalPelajaranUpdate, resetRedux } from '../slice/index'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchSemesterAll } from '../../semester/slice'
import { fetchJamPelajaranAll } from '../../jam-pelajaran/slice'
import { fetchGuruMataPelajaranAll } from '../../guru-mata-pelajaran/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'
import { fetchLocationAll } from '../../location/slice'

export interface QuickJadwalDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  idJadwal?: string | null
  presetData?: {
    hari?: string
    id_jam_pelajaran?: string
    id_kelas?: string
    id_tahunajaran?: string
    id_semester?: string
    lembaga_type?: string
    id_tingkat?: string
    id_pegawai?: string
    id_lokasi?: string
  } | null
}

const HARI_OPTIONS = [
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' },
  { label: 'Ahad', value: 'Ahad' }
]

const STATUS_OPTIONS = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' }
]

export default function QuickJadwalDialog({ open, onClose, onSuccess, idJadwal, presetData }: QuickJadwalDialogProps) {
  const dispatch = useAppDispatch()

  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeSemester = useAppSelector(state => state.semester)
  const storeJam = useAppSelector(state => state.jam_pelajaran)
  const storeGuru = useAppSelector(state => state.guru_mata_pelajaran)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)
  const storeLokasi = useAppSelector(state => state.location)

  const [loading, setLoading] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)

  // Form State
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<any>(null)
  const [selectedSemester, setSelectedSemester] = useState<any>(null)
  const [selectedGMapel, setSelectedGMapel] = useState<any>(null)
  const [selectedHari, setSelectedHari] = useState<any>(null)
  const [selectedJamPelajaran, setSelectedJamPelajaran] = useState<any>(null)
  const [selectedKelas, setSelectedKelas] = useState<any>(null)
  const [selectedLokasi, setSelectedLokasi] = useState<any>(null)
  const [status, setStatus] = useState<string>('Aktif')
  const [keterangan, setKeterangan] = useState<string>('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load master data on mount
  useEffect(() => {
    if (open) {
      dispatch(fetchTahunAjaranAll({ status: 'Aktif' }))
      dispatch(fetchGuruMataPelajaranAll({}))
      dispatch(fetchLocationAll({ jenis_lokasi: 'RuangKelas' }))
      dispatch(fetchJamPelajaranAll({}))
      dispatch(fetchKelasFormalAll({ status: 'Aktif' }))
      dispatch(fetchKelasMdaAll({ status: 'Aktif' }))
    }
  }, [open, dispatch])

  // Reset or fill form when open/idJadwal/presetData changes
  useEffect(() => {
    if (!open) return

    setErrors({})
    if (idJadwal) {
      setFetchingDetail(true)
      dispatch(fetchJadwalPelajaranById(idJadwal)).then((res: any) => {
        setFetchingDetail(false)
        const d = res?.payload?.data
        if (d) {
          setStatus(d.status || 'Aktif')
          setKeterangan(d.keterangan || '')

          if (d.hari) {
            setSelectedHari(HARI_OPTIONS.find(h => h.value === d.hari) || { label: d.hari, value: d.hari })
          }

          if (d.tahun_ajaran) {
            setSelectedTahunAjaran({
              label: d.tahun_ajaran.tahun_ajaran,
              value: d.tahun_ajaran.id_tahunajaran
            })
            dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: d.tahun_ajaran.id_tahunajaran }))
          }

          if (d.semester) {
            setSelectedSemester({
              label: d.semester.nama_semester,
              value: d.semester.id_semester
            })
          }

          if (d.jenis_guru) {
            setSelectedGMapel({
              label: `${d.jenis_guru?.pegawai?.nama_lengkap} - ${d.jenis_guru?.mata_pelajaran?.nama_mapel}`,
              value: d.jenis_guru?.id_jenisguru,
              lembaga_type: d.jenis_guru?.lembaga_type,
              id_tingkat: d.jenis_guru?.id_tingkat
            })

            dispatch(fetchJamPelajaranAll({ lembaga_type: d.jenis_guru.lembaga_type }))
            if (d.jenis_guru.lembaga_type === 'FORMAL') {
              dispatch(fetchKelasFormalAll({ status: 'Aktif', id_tingkat: d.jenis_guru.id_tingkat }))
            } else {
              dispatch(fetchKelasMdaAll({ status: 'Aktif', id_tingkat: d.jenis_guru.id_tingkat }))
            }
          }

          if (d.jam_pelajaran) {
            setSelectedJamPelajaran({
              label: `${d.jam_pelajaran?.nama_jampel ? `${d.jam_pelajaran.nama_jampel} ` : ''}(${d.jam_pelajaran?.mulai?.slice(0, -3)} - ${d.jam_pelajaran?.selesai?.slice(0, -3)})`,
              value: d.jam_pelajaran?.id_jampel
            })
          }

          if (d.kelas_formal) {
            setSelectedKelas({
              label: d.kelas_formal.nama_kelas,
              value: d.kelas_formal.id_kelas
            })
          } else if (d.kelas_mda) {
            setSelectedKelas({
              label: d.kelas_mda.nama_kelas_mda,
              value: d.kelas_mda.id_kelas_mda
            })
          }

          if (d.lokasi) {
            setSelectedLokasi({
              label: d.lokasi.nama_lokasi,
              value: d.lokasi.id_lokasi
            })
          }
        }
      })
    } else {
      // Create mode with potential presetData
      setStatus('Aktif')
      setKeterangan('')

      if (presetData?.hari) {
        setSelectedHari(
          HARI_OPTIONS.find(h => h.value === presetData.hari) || { label: presetData.hari, value: presetData.hari }
        )
      } else {
        setSelectedHari(null)
      }

      if (presetData?.id_tahunajaran) {
        const ta = storeTahunAjaran.datas.find(t => t.id_tahunajaran === presetData.id_tahunajaran)
        if (ta) {
          setSelectedTahunAjaran({ label: ta.tahun_ajaran, value: ta.id_tahunajaran })
          dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: ta.id_tahunajaran }))
        }
      } else {
        // default first active tahun ajaran
        if (storeTahunAjaran.datas.length > 0) {
          const firstTa = storeTahunAjaran.datas[0]
          setSelectedTahunAjaran({ label: firstTa.tahun_ajaran, value: firstTa.id_tahunajaran })
          dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: firstTa.id_tahunajaran }))
        }
      }

      if (presetData?.id_semester) {
        setSelectedSemester({ label: '', value: presetData.id_semester })
      } else {
        setSelectedSemester(null)
      }

      if (presetData?.id_jam_pelajaran) {
        const jam = storeJam.datas.find(j => j.id_jampel === presetData.id_jam_pelajaran)
        if (jam) {
          setSelectedJamPelajaran({
            label: `${jam.nama_jampel ? `${jam.nama_jampel} ` : ''}(${jam.mulai?.slice(0, -3)} - ${jam.selesai?.slice(0, -3)})`,
            value: jam.id_jampel
          })
        } else {
          setSelectedJamPelajaran({ label: 'Jam Terpilih', value: presetData.id_jam_pelajaran })
        }
      } else {
        setSelectedJamPelajaran(null)
      }

      if (presetData?.id_kelas) {
        const kf = storeKelasFormal.datas.find(k => k.id_kelas === presetData.id_kelas)
        const km = storeKelasMda.datas.find(k => k.id_kelas_mda === presetData.id_kelas)
        if (kf) {
          setSelectedKelas({ label: kf.nama_kelas, value: kf.id_kelas })
        } else if (km) {
          setSelectedKelas({ label: km.nama_kelas_mda, value: km.id_kelas_mda })
        } else {
          setSelectedKelas({ label: 'Kelas Terpilih', value: presetData.id_kelas })
        }
      } else {
        setSelectedKelas(null)
      }

      if (presetData?.id_pegawai) {
        const gm = storeGuru.datas.find(g => g.pegawai?.id_pegawai === presetData.id_pegawai)
        if (gm) {
          setSelectedGMapel({
            label: `${gm.pegawai?.nama_lengkap} - ${gm.mata_pelajaran?.nama_mapel}`,
            value: gm.id_jenisguru,
            lembaga_type: gm.lembaga_type,
            id_tingkat: gm.id_tingkat
          })
        } else {
          setSelectedGMapel(null)
        }
      } else {
        setSelectedGMapel(null)
      }

      if (presetData?.id_lokasi) {
        const lok = storeLokasi.datas.find(l => l.id_lokasi === presetData.id_lokasi)
        if (lok) {
          setSelectedLokasi({ label: lok.nama_lokasi, value: lok.id_lokasi })
        } else {
          setSelectedLokasi(null)
        }
      } else {
        setSelectedLokasi(null)
      }
    }
  }, [open, idJadwal, presetData])

  // Sync semester once fetched if preset had id_semester
  useEffect(() => {
    if (presetData?.id_semester && storeSemester.datas.length > 0) {
      const sem = storeSemester.datas.find(s => s.id_semester === presetData.id_semester)
      if (sem) {
        setSelectedSemester({ label: sem.nama_semester, value: sem.id_semester })
      }
    } else if (!selectedSemester && storeSemester.datas.length > 0) {
      const firstSem = storeSemester.datas[0]
      setSelectedSemester({ label: firstSem.nama_semester, value: firstSem.id_semester })
    }
  }, [storeSemester.datas, presetData?.id_semester])

  const handleTahunAjaranChange = (_: any, val: any) => {
    setSelectedTahunAjaran(val)
    setSelectedSemester(null)
    if (val?.value) {
      dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: val.value }))
    }
  }

  const handleGMapelChange = (_: any, val: any) => {
    setSelectedGMapel(val)
    if (val) {
      dispatch(fetchJamPelajaranAll({ lembaga_type: val.lembaga_type }))
      if (val.lembaga_type === 'FORMAL') {
        dispatch(fetchKelasFormalAll({ status: 'Aktif', id_tingkat: val.id_tingkat }))
      } else {
        dispatch(fetchKelasMdaAll({ status: 'Aktif', id_tingkat: val.id_tingkat }))
      }
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!selectedTahunAjaran?.value) errs.id_tahunajaran = 'Tahun Ajaran wajib dipilih'
    if (!selectedSemester?.value) errs.id_semester = 'Semester wajib dipilih'
    if (!selectedGMapel?.value) errs.id_gmapel = 'Guru & Mata Pelajaran wajib dipilih'
    if (!selectedHari?.value) errs.hari = 'Hari wajib dipilih'
    if (!selectedJamPelajaran?.value) errs.id_jam_pelajaran = 'Jam Pelajaran wajib dipilih'
    if (!selectedKelas?.value) errs.id_kelas = 'Kelas wajib dipilih'
    if (!selectedLokasi?.value) errs.id_lokasi = 'Lokasi / Ruang Kelas wajib dipilih'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.warn('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setLoading(true)

    const payload = {
      hari: selectedHari?.value,
      id_tahunajaran: { value: selectedTahunAjaran?.value },
      id_semester: { value: selectedSemester?.value },
      id_gmapel: { value: selectedGMapel?.value },
      id_jam_pelajaran: { value: selectedJamPelajaran?.value },
      id_kelas: { value: selectedKelas?.value },
      id_lokasi: { value: selectedLokasi?.value },
      status: status,
      keterangan: keterangan
    }

    try {
      let res: any
      if (idJadwal) {
        res = await dispatch(
          postJadwalPelajaranUpdate({
            id: idJadwal,
            params: payload
          })
        ).unwrap()
      } else {
        res = await dispatch(postJadwalPelajaran(payload)).unwrap()
      }

      if (res?.status) {
        toast.success(idJadwal ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan')
        dispatch(resetRedux())
        onSuccess()
        onClose()
      } else {
        toast.error(res?.message || 'Gagal menyimpan jadwal')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat menyimpan jadwal')
    } finally {
      setLoading(false)
    }
  }

  const kelasOptions = () => {
    if (selectedGMapel?.lembaga_type === 'PESANTREN') {
      return storeKelasMda.datas.map(k => ({
        label: k.nama_kelas_mda,
        value: k.id_kelas_mda
      }))
    }
    return storeKelasFormal.datas.map(k => ({
      label: k.nama_kelas,
      value: k.id_kelas
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <i className='tabler-calendar-plus' style={{ fontSize: '1.5rem', color: '#7367F0' }} />
          <Typography variant='h6' fontWeight={600}>
            {idJadwal ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
          </Typography>
        </Box>
        <IconButton size='small' onClick={onClose}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {fetchingDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ pt: 1 }}>
            {/* Tahun Ajaran & Semester */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={storeTahunAjaran.datas.map(t => ({ label: t.tahun_ajaran, value: t.id_tahunajaran }))}
                value={selectedTahunAjaran}
                onChange={handleTahunAjaranChange}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Tahun Ajaran *'
                    error={Boolean(errors.id_tahunajaran)}
                    helperText={errors.id_tahunajaran}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={storeSemester.datas.map(s => ({ label: s.nama_semester, value: s.id_semester }))}
                value={selectedSemester}
                onChange={(_, val) => setSelectedSemester(val)}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Semester *'
                    error={Boolean(errors.id_semester)}
                    helperText={errors.id_semester}
                  />
                )}
              />
            </Grid>

            {/* Guru & Mata Pelajaran */}
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                size='small'
                options={storeGuru.datas.map(g => ({
                  label: `${g.pegawai?.nama_lengkap} (${g.pegawai?.nip || '-'}) - Mapel: ${g.mata_pelajaran?.nama_mapel || '-'} [${g.lembaga_type || 'FORMAL'}]`,
                  value: g.id_jenisguru,
                  lembaga_type: g.lembaga_type,
                  id_tingkat: g.id_tingkat
                }))}
                value={selectedGMapel}
                onChange={handleGMapelChange}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Guru & Mata Pelajaran *'
                    placeholder='Cari Guru / Mapel...'
                    error={Boolean(errors.id_gmapel)}
                    helperText={errors.id_gmapel}
                  />
                )}
              />
            </Grid>

            {/* Hari & Jam Pelajaran */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={HARI_OPTIONS}
                value={selectedHari}
                onChange={(_, val) => setSelectedHari(val)}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField {...params} label='Hari *' error={Boolean(errors.hari)} helperText={errors.hari} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={storeJam.datas.map(j => ({
                  label: `${j.nama_jampel ? `${j.nama_jampel} ` : ''}(${j.mulai?.slice(0, -3)} - ${j.selesai?.slice(0, -3)})`,
                  value: j.id_jampel
                }))}
                value={selectedJamPelajaran}
                onChange={(_, val) => setSelectedJamPelajaran(val)}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Jam Pelajaran *'
                    error={Boolean(errors.id_jam_pelajaran)}
                    helperText={errors.id_jam_pelajaran}
                  />
                )}
              />
            </Grid>

            {/* Kelas & Lokasi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={kelasOptions()}
                value={selectedKelas}
                onChange={(_, val) => setSelectedKelas(val)}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Kelas *'
                    error={Boolean(errors.id_kelas)}
                    helperText={errors.id_kelas}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size='small'
                options={storeLokasi.datas
                  .filter(l => l.jenis_lokasi === 'RuangKelas')
                  .map(l => ({
                    label: `${l.parent ? `${l.parent.nama_lokasi} / ` : ''}${l.nama_lokasi}`,
                    value: l.id_lokasi
                  }))}
                value={selectedLokasi}
                onChange={(_, val) => setSelectedLokasi(val)}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Lokasi / Ruang Kelas *'
                    error={Boolean(errors.id_lokasi)}
                    helperText={errors.id_lokasi}
                  />
                )}
              />
            </Grid>

            {/* Status & Keterangan */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select-label'>Status</InputLabel>
                <Select
                  labelId='status-select-label'
                  value={status}
                  label='Status'
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size='small'
                fullWidth
                label='Keterangan (Opsional)'
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                placeholder='Catatan tambahan'
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 5, py: 3 }}>
        <Button variant='outlined' color='secondary' onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={loading || fetchingDetail}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-check' />}
        >
          {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
