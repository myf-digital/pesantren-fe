'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Button, CircularProgress, IconButton } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchLocationById, fetchLocationAll, postLocation, postLocationUpdate, resetRedux } from '../slice/index'
import { fetchCabangAll } from '../../cabang/slice/index'

import { field, formColumn } from '@views/onevour/form/AppFormBuilder'
import QrPrintModal from './QrPrintModal'
import GeoLocation from './GeoLocation'

const LocationForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.location)

  // Opsi Dropdown
  const [opt, setOpt] = useState({
    parents: [] as any[],
    cabang: [] as any[],
    jenis: [
      { label: 'Cabang', value: 'Cabang' },
      { label: 'Asrama', value: 'Asrama' },
      { label: 'Kamar', value: 'Kamar' },
      { label: 'Masjid', value: 'Masjid' },
      { label: 'Area Masjid', value: 'AreaMasjid' },
      { label: 'Sekolah Formal', value: 'SekolahFormal' },
      { label: 'Sekolah MDA', value: 'SekolahMDA' },
      { label: 'Ruang Kelas', value: 'RuangKelas' },
      { label: 'Ruang Guru', value: 'RuangGuru' },
      { label: 'Ruang TU', value: 'RuangTU' },
      { label: 'Perpustakaan', value: 'Perpustakaan' },
      { label: 'Laboratorium', value: 'Laboratorium' },
      { label: 'Guest House', value: 'GuestHouse' },
      { label: 'Klinik', value: 'Klinik' },
      { label: 'UKS', value: 'UKS' },
      { label: 'Dapur', value: 'Dapur' },
      { label: 'Kantin', value: 'Kantin' },
      { label: 'Koperasi', value: 'Koperasi' },
      { label: 'Kantor', value: 'Kantor' },
      { label: 'Aula', value: 'Aula' },
      { label: 'Gudang', value: 'Gudang' },
      { label: 'Lapangan', value: 'Lapangan' },
      { label: 'Parkiran', value: 'Parkiran' },
      { label: 'Pos Satpam', value: 'PosSatpam' },
      { label: 'Ruang Rapat', value: 'RuangRapat' },
      { label: 'Ruang Serbaguna', value: 'RuangSerbaguna' },
      { label: 'Taman', value: 'Taman' },
      { label: 'Area Umum', value: 'AreaUmum' },
      { label: 'Ruang Makan', value: 'RuangMakan' },
      { label: 'Lahan', value: 'Lahan' },
      { label: 'Workshop', value: 'Workshop' },
      { label: 'Studio', value: 'Studio' },
      { label: 'Ruang IT', value: 'RuangIT' },
      { label: 'Gedung Lain', value: 'GedungLain' },
      { label: 'Area Lain', value: 'AreaLain' }
    ]
  })

  const [state, setState] = useState<any>({
    nama_lokasi: '',
    kode_lokasi: '',
    jenis_lokasi: null,
    parent_id: null,
    id_cabang: null,
    kapasitas: 0,
    lantai: 0,
    latitude: '',
    longitude: '',
    keterangan: ''
  })

  const [isGeoModalOpen, setGeoModalOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    values: state
  })

  /* -----------------------------------------------------------
     1. Inisialisasi Data (Dropdown & Detail)
  ----------------------------------------------------------- */
  const initForm = useCallback(async () => {
    try {
      // Fetch Parent dan Cabang secara paralel
      const [resParent, resCabang] = await Promise.all([
        dispatch(fetchLocationAll({ perPage: 1000 })).unwrap(),
        dispatch(fetchCabangAll({ perPage: 1000 })).unwrap()
      ])

      const parentOptions = (resParent?.data || [])
        .filter((item: any) => item.id_lokasi !== id) // Hindari circular reference
        .map((item: any) => ({ label: item.nama_lokasi, value: item.id_lokasi }))

      const cabangOptions = (resCabang?.data || []).map((item: any) => ({
        label: item.nama_cabang,
        value: item.id_cabang
      }))

      setOpt(prev => ({ ...prev, parents: parentOptions, cabang: cabangOptions }))

      // Jika Mode Edit / View
      if (id) {
        const resDetail = await dispatch(fetchLocationById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatted = {
            ...d,
            jenis_lokasi: d.jenis_lokasi ? { label: d.jenis_lokasi, value: d.jenis_lokasi } : null,
            id_cabang: d.id_cabang ? cabangOptions.find((o: any) => o.value === d.id_cabang) : null,
            parent_id: d.parent ? { label: d.parent.nama_lokasi, value: d.parent_id } : null,
            latitude: d.latitude ?? '',
            longitude: d.longitude ?? ''
          }

          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat referensi data')
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    initForm()
  }, [initForm])

  /* -----------------------------------------------------------
     2. Submit Handler
  ----------------------------------------------------------- */
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/location/list')
    } else {
      if (store.crud?.message) {
        toast.error(store.crud?.message || 'Gagal menyimpan data lokasi')
      }

      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      jenis_lokasi: state.jenis_lokasi?.value,
      parent_id: state.parent_id?.value || null,
      id_cabang: state.id_cabang?.value || null,
      kapasitas: state.kapasitas ? Number(state.kapasitas) : 0,
      lantai: state.lantai ? Number(state.lantai) : 0,
      latitude: state.latitude || null,
      longitude: state.longitude || null,
      map_zoom: state.map_zoom ? Number(state.map_zoom) : 0
    }

    if (id) {
      dispatch(postLocationUpdate({ id, params: payload }))
    } else {
      // Mengikuti repository yang menggunakan bulkCreate(data.payload)
      dispatch(postLocation(payload))
    }
  }

  /* -----------------------------------------------------------
     3. Form Fields Configuration
  ----------------------------------------------------------- */
  /* -----------------------------------------------------------
     3. Form Fields Configuration (Lengkap)
  ----------------------------------------------------------- */
  const fields = () => [
    // --- Informasi Utama ---
    field({ type: 'text', key: 'nama_lokasi', label: 'Nama Lokasi', required: true, readOnly: !!view }),
    field({
      type: 'text',
      key: 'kode_lokasi',
      label: 'Kode Lokasi',
      tooltip: 'Jika kosong, akan diisi otomatis oleh sistem',
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'jenis_lokasi',
      label: 'Jenis Lokasi',
      options: { values: opt.jenis },
      required: true,
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'id_cabang',
      label: 'Kantor Cabang',
      options: { values: opt.cabang },
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'parent_id',
      label: 'Lokasi Induk (Parent)',
      options: { values: opt.parents },
      readOnly: !!view
    }),

    // --- Kapasitas & Gedung ---
    field({ type: 'numeral', key: 'kapasitas', label: 'Kapasitas (Orang)', readOnly: !!view }),
    field({ type: 'numeral', key: 'lantai', label: 'Lantai', readOnly: !!view }),

    // --- Geografis & Map ---
    field({ type: 'text', key: 'latitude', label: 'Latitude', readOnly: !!view }),
    field({ type: 'text', key: 'longitude', label: 'Longitude', readOnly: !!view }),
    field({ type: 'numeral', key: 'map_zoom', label: 'Zoom Level Map', readOnly: !!view }), // Ditambahkan

    // --- Sistem ---
    ...(id ? [field({ type: 'image', key: 'qr_code_base64', base64: true, label: 'QR Code' })] : []),

    // --- Lainnya ---
    field({ type: 'textarea', key: 'keterangan', label: 'Keterangan', readOnly: !!view })

    // fieldBuildSubmit({
    //   onCancel: () => router.push('/app/location/list'),
    //   loading: store.loading,
    //   disabled: !!view
    // })
  ]

  const [isQrModalOpen, setQrModalOpen] = useState(false)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {!isGeoModalOpen && (
          <Card>
            <CardHeader
              title={id ? (view ? 'Detail Lokasi' : 'Edit Lokasi') : 'Tambah Lokasi'}
              subheader='Pastikan data lokasi sesuai dengan hierarki cabang atau gedung'
            />
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                {formColumn({ control, errors, state, setState, fields: fields() })}

                <Grid container spacing={2} sx={{ mt: 4 }}>
                  <Grid item xs={12} className='demo-space-x'>
                    {/* Tombol Submit */}
                    <Button variant='contained' type='submit' disabled={store.loading || !!view}>
                      {store.loading ? <CircularProgress size={20} color='inherit' /> : 'Simpan'}
                    </Button>

                    {/* Tombol Cancel */}
                    <Button variant='outlined' color='secondary' onClick={() => router.push('/app/location/list')}>
                      Batal
                    </Button>

                    {/* Tombol Kelola Area (Hanya muncul saat Edit) */}
                    {id && (
                      <Button
                        type='button'
                        variant='outlined'
                        color='primary'
                        startIcon={<i className='tabler-map-pin' />}
                        // onClick={() => router.push(`/app/location/geo?id=${id}`)}
                        onClick={() => setGeoModalOpen(true)}
                      >
                        Kelola Area
                      </Button>
                    )}

                    {/* Tombol Cetak QR (Hanya muncul saat Edit) */}
                    {id && (
                      <Button
                        type='button'
                        variant='contained'
                        color='info'
                        startIcon={<i className='tabler-qrcode' />}
                        onClick={() => setQrModalOpen(true)}
                      >
                        Cetak QR
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}
        {isGeoModalOpen && (
          <Card id={`map-container-card-${id || 'default'}`} sx={{ mt: 4 }}>
            <CardHeader
              title={`Kelola Area Geo - ${state.nama_lokasi}`}
              subheader={`Kode Lokasi: ${state.kode_lokasi}`}
              action={
                <IconButton onClick={() => setGeoModalOpen(false)}>
                  <i className='tabler-x' />
                </IconButton>
              }
            />
            <CardContent>
              <GeoLocation data={state} onClose={() => setGeoModalOpen(false)} />
            </CardContent>
          </Card>
        )}
      </Grid>

      <QrPrintModal open={isQrModalOpen} onClose={() => setQrModalOpen(false)} data={state} />
    </Grid>
  )
}

export default LocationForm
