'use client'

import React, { useState, useEffect, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
  Avatar,
  Autocomplete,
  IconButton,
  Tooltip
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { format } from 'date-fns'

// Import actions dari slice (Pastikan path dan nama function sesuai dengan export Anda)
import {
  fetchMonitoringKamar,
  fetchMonitoringKelas,
  fetchMonitoringPegawai,
  fetchMonitoringGuru,
  fetchMonitoringInspeksi
} from '../slice/index'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchMatchingShiftAsrama } from '../../absen-harian-santri/slice'
import { fetchLembagaFormalAll } from '../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../lembaga-kepesantrenan/slice/index'
import { fetchJamPelajaranAll } from '../../jam-pelajaran/slice'

// Custom Input untuk DatePicker
const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField {...props} inputRef={ref} fullWidth size='small' label='Pilih Tanggal' />
})

// === KOMPONEN EMPTY STATE UNTUK DATA KOSONG ===
const EmptyState = ({ text }: { text: string }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
    <i className='tabler-inbox' style={{ fontSize: '4rem', color: '#B0BEC5', marginBottom: '16px' }} />
    <Typography variant='h6' color='text.secondary'>
      {text}
    </Typography>
  </Box>
)

const MonitoringPage = () => {
  const dispatch = useDispatch<any>()

  // --- REDUX STATES ---
  const { dataKamar, dataKelas, dataPegawai, dataGuru, dataInspeksi, loading } = useSelector(
    (state: any) => state.monitoring
  )

  // --- LOCAL STATES ---
  const [activeTab, setActiveTab] = useState(0)
  const [tanggal, setTanggal] = useState<Date | null>(new Date())

  // States untuk Autocomplete Options
  const [optCabang, setOptCabang] = useState<any[]>([])
  const [optShift, setOptShift] = useState<any[]>([])
  const [optLembaga, setOptLembaga] = useState<any[]>([])
  const [optJampel, setOptJampel] = useState<any[]>([])

  // States Loading Autocomplete
  const [loadCabang, setLoadCabang] = useState(false)
  const [loadShift, setLoadShift] = useState(false)
  const [loadLembaga, setLoadLembaga] = useState(false)
  const [loadJampel, setLoadJampel] = useState(false)

  // States Selected Filters
  const [selectedCabang, setSelectedCabang] = useState<any>(null)
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [selectedLembaga, setSelectedLembaga] = useState<any>(null)
  const [selectedJampel, setSelectedJampel] = useState<any>(null)
  const [txtLokasi, setTxtLokasi] = useState('')

  // --- INIT DATA FILTER OPTIONS ---
  useEffect(() => {
    const initFilters = async () => {
      // Fetch Cabang
      setLoadCabang(true)
      dispatch(fetchCabangAll({})).then((res: any) => {
        setOptCabang(res.payload?.data || [])
        setLoadCabang(false)
      })

      // Fetch Shift Asrama
      setLoadShift(true)
      const waktuSekarang = format(new Date(), 'HH:mm:ss')
      dispatch(fetchMatchingShiftAsrama({ waktu_absen: waktuSekarang })).then((res: any) => {
        setOptShift(res.payload?.data || [])
        setLoadShift(false)
      })

      // Fetch Lembaga (Gabungan)
      setLoadLembaga(true)
      const resFormal = await dispatch(fetchLembagaFormalAll({}))
      const resPesantren = await dispatch(fetchLembagaKepesantrenanAll({}))

      const combinedLembaga = [
        ...(resFormal.payload?.data || []).map((item: any) => ({
          label: `[Formal] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'FORMAL',
          id_cabang: item.id_cabang
        })),
        ...(resPesantren.payload?.data || []).map((item: any) => ({
          label: `[Pesantren] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'PESANTREN',
          id_cabang: item.id_cabang
        }))
      ]
      setOptLembaga(combinedLembaga)
      setLoadLembaga(false)
    }

    initFilters()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect khusus untuk Jam Pelajaran yang bergantung pada pilihan Lembaga
  useEffect(() => {
    if (selectedLembaga?.type) {
      setLoadJampel(true)
      dispatch(fetchJamPelajaranAll({ lembaga_type: selectedLembaga.type })).then((res: any) => {
        setOptJampel(res.payload?.data || [])
        setLoadJampel(false)
      })
    } else {
      setOptJampel([])
      setSelectedJampel(null)
    }
  }, [selectedLembaga]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- HANDLERS ---
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    fetchData(newValue)
  }

  const handleWhatsApp = (phone: string) => {
    if (!phone) return
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1)
    window.open(`https://wa.me/${cleaned}`, '_blank')
  }

  const fetchData = (tabIndex = activeTab) => {
    const params: any = { tanggal: tanggal ? format(tanggal, 'yyyy-MM-dd') : '' }

    if (selectedCabang?.id_cabang) params.id_cabang = selectedCabang.id_cabang

    switch (tabIndex) {
      case 0: // Kamar
        if (selectedShift?.id_shift) params.id_shift = selectedShift.id_shift
        dispatch(fetchMonitoringKamar(params))
        break
      case 1: // Kelas
        if (selectedLembaga?.value) params.id_lembaga = selectedLembaga.value
        if (selectedJampel?.id_jampel) params.id_jampel = selectedJampel.id_jampel
        dispatch(fetchMonitoringKelas(params))
        break
      case 2: // Pegawai
        if (selectedLembaga?.value) params.id_lembaga = selectedLembaga.value
        if (txtLokasi) params.id_lokasi = txtLokasi
        dispatch(fetchMonitoringPegawai(params))
        break
      case 3: // Guru
        if (selectedLembaga?.value) params.id_lembaga = selectedLembaga.value
        dispatch(fetchMonitoringGuru(params))
        break
      case 4: // Inspeksi
        dispatch(fetchMonitoringInspeksi(params))
        break
    }
  }

  // --- RENDER FILTERS ---
  const renderFilters = () => {
    return (
      <Grid container spacing={3} alignItems='center' sx={{ mb: 4, overflow: 'visible' }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <AppReactDatepicker
            selected={tanggal}
            onChange={(date: Date | null) => setTanggal(date)}
            placeholderText='MM/DD/YYYY'
            showMonthDropdown
            showYearDropdown
            scrollableYearDropdown
            maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
            dropdownMode='select'
            customInput={<PickersComponent />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <Autocomplete
            size='small'
            options={optCabang}
            loading={loadCabang}
            value={selectedCabang}
            onChange={(_, val) => setSelectedCabang(val)}
            getOptionLabel={opt => opt.nama_cabang || ''}
            isOptionEqualToValue={(opt, val) => opt.id_cabang === val?.id_cabang}
            renderInput={params => (
              <TextField
                {...params}
                label='Cabang'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadCabang ? <CircularProgress color='inherit' size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </Grid>

        {activeTab === 0 && (
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size='small'
              options={optShift}
              loading={loadShift}
              value={selectedShift}
              onChange={(_, val) => setSelectedShift(val)}
              getOptionLabel={opt => opt.nama_shift || ''}
              isOptionEqualToValue={(opt, val) => opt.id_shift === val?.id_shift}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Shift Asrama'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadShift ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
        )}

        {[1, 2, 3].includes(activeTab) && (
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size='small'
              options={optLembaga}
              loading={loadLembaga}
              value={selectedLembaga}
              onChange={(_, val) => setSelectedLembaga(val)}
              getOptionLabel={opt => opt.label || ''}
              isOptionEqualToValue={(opt, val) => opt.value === val?.value}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Lembaga'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadLembaga ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size='small'
              options={optJampel}
              loading={loadJampel}
              disabled={!selectedLembaga}
              value={selectedJampel}
              onChange={(_, val) => setSelectedJampel(val)}
              getOptionLabel={opt => opt.nama_jampel || ''}
              isOptionEqualToValue={(opt, val) => opt.id_jampel === val?.id_jampel}
              renderInput={params => (
                <TextField
                  {...params}
                  label={selectedLembaga ? 'Jam Pelajaran' : 'Pilih Lembaga Dulu'}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadJampel ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              fullWidth
              size='small'
              label='ID Lokasi'
              value={txtLokasi}
              onChange={e => setTxtLokasi(e.target.value)}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 2 }}>
          <Button variant='contained' onClick={() => fetchData()} disabled={loading} fullWidth>
            Filter Data
          </Button>
        </Grid>
      </Grid>
    )
  }

  // --- RENDERERS TAB CONTENT ---
  const renderTabKamar = () => {
    if (!dataKamar?.rekap_kamar || dataKamar.rekap_kamar.length === 0) {
      return <EmptyState text='Tidak ada tunggakan absensi kamar saat ini.' />
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ bgcolor: 'error.main', color: 'common.white', boxShadow: 3 }}>
              <CardContent>
                <Typography variant='h6' sx={{ color: 'white', opacity: 0.8 }}>
                  Total Kamar Tertunggak
                </Typography>
                <Typography variant='h3' sx={{ color: 'white', mt: 1 }}>
                  {dataKamar.rekap_kamar.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ bgcolor: 'warning.main', color: 'common.white', boxShadow: 3 }}>
              <CardContent>
                <Typography variant='h6' sx={{ color: 'white', opacity: 0.8 }}>
                  Wali Asuh Belum Absen
                </Typography>
                <Typography variant='h3' sx={{ color: 'white', mt: 1 }}>
                  {dataKamar.rekap_waliasuh?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2, color: 'text.secondary' }}>
          DETAIL PER KAMAR (SHIFT: {dataKamar.shift_terpilih || '-'})
        </Typography>

        {dataKamar.rekap_kamar.map((kamar: any, idx: number) => (
          <Accordion key={idx} sx={{ mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mr: 2 }}
              >
                <Typography fontWeight='bold'>{kamar.nama_kamar}</Typography>
                <Chip
                  size='small'
                  color='error'
                  label={`${kamar.shifts_valid?.[0]?.total_santri_belum_absen || 0} / ${kamar.total_santri} Belum Absen`}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
              <Grid container spacing={2}>
                {kamar.shifts_valid?.[0]?.santri_belum_absen?.map((santri: any, sIdx: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sIdx}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography fontWeight='bold' variant='body1'>
                        {santri.nama_santri}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        NIS: {santri.nis || '-'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant='caption' color='text.disabled'>
                        Wali Asuh:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2'>{santri.nama_waliasuh || '-'}</Typography>
                        {santri.no_hp && (
                          <Tooltip title='Hubungi via WhatsApp'>
                            <IconButton size='small' color='success' onClick={() => handleWhatsApp(santri.no_hp)}>
                              <i className='tabler-brand-whatsapp' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  const renderTabKelas = () => {
    if (!dataKelas?.rekap_kelas || dataKelas.rekap_kelas.length === 0) {
      return <EmptyState text='Tidak ada tunggakan absensi kelas saat ini.' />
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ bgcolor: 'error.main', color: 'common.white', boxShadow: 3 }}>
              <CardContent>
                <Typography variant='h6' sx={{ color: 'white', opacity: 0.8 }}>
                  Total Kelas Tertunggak
                </Typography>
                <Typography variant='h3' sx={{ color: 'white', mt: 1 }}>
                  {dataKelas.rekap_kelas.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2, color: 'text.secondary' }}>
          DETAIL KELAS
        </Typography>

        {dataKelas.rekap_kelas.map((kelas: any, idx: number) => (
          <Accordion key={idx} sx={{ mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mr: 2 }}
              >
                <Box>
                  <Typography fontWeight='bold'>{kelas.nama_kelas}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {kelas.tipe_kelas}
                  </Typography>
                </Box>
                <Chip
                  size='small'
                  color='error'
                  label={`${kelas.jam_pelajaran_valid?.[0]?.total_santri_belum_absen || 0} / ${kelas.total_santri} Santri`}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
              <Typography variant='body2' fontWeight='bold' sx={{ mb: 2 }}>
                Jam Pelajaran: {kelas.jam_pelajaran_valid?.[0]?.nama_jampel || 'Tidak Diketahui'}
              </Typography>
              <Grid container spacing={2}>
                {kelas.jam_pelajaran_valid?.[0]?.santri_belum_absen?.map((santri: any, sIdx: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sIdx}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography fontWeight='bold' variant='body2'>
                        {santri.nama_santri}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        NIS: {santri.nis || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  const renderTabPegawai = () => {
    if (!dataPegawai?.length) {
      return <EmptyState text='Tidak ada data pegawai yang belum absen.' />
    }

    return (
      <Box>
        {dataPegawai.map((lokasi: any, idx: number) => (
          <Accordion key={idx} defaultExpanded={idx === 0} sx={{ mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2, alignItems: 'center' }}
              >
                <Typography fontWeight='bold'>{lokasi.nama_lokasi}</Typography>
                <Chip size='small' color='warning' label={`${lokasi.total_pegawai_belum_absen} Pegawai`} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
              <Grid container spacing={2}>
                {lokasi.pegawai_belum_absen.map((pegawai: any, pIdx: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pIdx}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
                        {pegawai.nama_pegawai.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight='bold' variant='body2'>
                          {pegawai.nama_pegawai}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {pegawai.waktu_mulai} - {pegawai.waktu_selesai}
                        </Typography>
                      </Box>
                      {pegawai.no_hp && (
                        <Tooltip title='Hubungi via WhatsApp'>
                          <IconButton size='small' color='success' onClick={() => handleWhatsApp(pegawai.no_hp)}>
                            <i className='tabler-brand-whatsapp' />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  const renderTabGuru = () => {
    if (!dataGuru?.length) {
      return <EmptyState text='Tidak ada tunggakan jurnal guru saat ini.' />
    }

    return (
      <Box>
        {dataGuru.map((guru: any, idx: number) => (
          <Accordion key={idx} defaultExpanded={idx === 0} sx={{ mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2, alignItems: 'center' }}
              >
                <Box>
                  <Typography fontWeight='bold'>{guru.nama_guru}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    NIP: {guru.nip || '-'}
                  </Typography>
                  <Typography variant='body2'>{guru.nama_waliasuh}</Typography>
                </Box>
                <Chip size='small' color='error' label={`${guru.total_jadwal_terlewat} Jurnal Belum Diisi`} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
              {guru.no_hp && (
                <Button
                  variant='outlined'
                  color='success'
                  size='small'
                  startIcon={<i className='tabler-brand-whatsapp' />}
                  onClick={() => handleWhatsApp(guru.no_hp)}
                  sx={{ mb: 3 }}
                >
                  Hubungi Guru
                </Button>
              )}
              <Grid container spacing={2}>
                {guru.jadwal_terlewat.map((jadwal: any, jIdx: number) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={jIdx}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography fontWeight='bold' variant='body2'>
                        {jadwal.nama_kelas} - {jadwal.nama_jampel}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {jadwal.waktu_mulai} - {jadwal.waktu_selesai}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip size='small' label={jadwal.status_presensi} color='warning' variant='outlined' />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  const renderTabInspeksi = () => {
    if (!dataInspeksi?.length) {
      return <EmptyState text='Tidak ada data inspeksi yang terlewat.' />
    }

    return (
      <Box>
        {dataInspeksi.map((petugas: any, idx: number) => (
          <Accordion key={idx} defaultExpanded={idx === 0} sx={{ mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2, alignItems: 'center' }}
              >
                <Box>
                  <Typography fontWeight='bold'>{petugas.nama_petugas}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    NIP: {petugas.nip || '-'}
                  </Typography>
                </Box>
                <Chip size='small' color='warning' label={`${petugas.total_tugas_terlewat} Inspeksi Terlewat`} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
              {petugas.no_hp && (
                <Button
                  variant='outlined'
                  color='success'
                  size='small'
                  startIcon={<i className='tabler-brand-whatsapp' />}
                  onClick={() => handleWhatsApp(petugas.no_hp)}
                  sx={{ mb: 3 }}
                >
                  Hubungi Petugas
                </Button>
              )}
              <Grid container spacing={2}>
                {petugas.jadwal_terlewat.map((jadwal: any, jIdx: number) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={jIdx}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography fontWeight='bold' variant='body2'>
                        {jadwal.nama_cabang}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        {jadwal.keterangan_slot}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  return (
    <Card sx={{ overflow: 'visible' }}>
      <CardHeader title='Dashboard Monitoring Aktivitas' subheader='Pantau keterlambatan dan tunggakan absensi' />
      <Divider />

      {/* TABS NAVIGATION */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant='scrollable'
        sx={{ borderBottom: 1, borderColor: 'divider', px: 4, pt: 2 }}
      >
        <Tab
          icon={<i className='tabler-users' style={{ fontSize: '1.25rem' }} />}
          iconPosition='start'
          label='Asrama (Kamar)'
        />
        <Tab
          icon={<i className='tabler-clipboard-x' style={{ fontSize: '1.25rem' }} />}
          iconPosition='start'
          label='Sekolah (Kelas)'
        />
        <Tab
          icon={<i className='tabler-alert-triangle' style={{ fontSize: '1.25rem' }} />}
          iconPosition='start'
          label='Pegawai Biasa'
        />
        <Tab
          icon={<i className='tabler-book-2' style={{ fontSize: '1.25rem' }} />}
          iconPosition='start'
          label='Guru / Jurnal'
        />
        <Tab
          icon={<i className='tabler-broom' style={{ fontSize: '1.25rem' }} />}
          iconPosition='start'
          label='Inspeksi Kebersihan'
        />
      </Tabs>

      <CardContent sx={{ pt: 4, overflow: 'visible' }}>
        {/* FILTERS */}
        {renderFilters()}

        {/* LOADING STATE */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderTabKamar()}
            {activeTab === 1 && renderTabKelas()}
            {activeTab === 2 && renderTabPegawai()}
            {activeTab === 3 && renderTabGuru()}
            {activeTab === 4 && renderTabInspeksi()}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default MonitoringPage
