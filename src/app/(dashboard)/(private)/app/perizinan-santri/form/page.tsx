'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Grid, Button, CircularProgress, Box, Typography, debounce } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

// Redux & Hooks
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { postPerizinanSantri, resetRedux } from '../slice/index'
import { fetchSantriPage } from '../../santri/slice/index'
import { fetchLocationPage } from '../../location/slice/index'

// Form Builder Core Module Imports
import { field, formColumn } from '@views/onevour/form/AppFormBuilder'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { format, isValid } from 'date-fns'
import { useDebounce } from '@/@core/utils/globalHelpers'

const getValue = (val: any) => {
  if (val === null || val === undefined) return null
  if (typeof val === 'object' && 'value' in val) {
    return val.value ?? null
  }
  return val
}

const FormPerizinanSantriPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [fileObject, setFileObject] = useState<File | null>(null)

  const [opt, setOpt] = useState({
    santri: [] as any[],
    kamar: [] as any[],
    sumberPengajuan: [
      { label: 'Santri', value: 'Waliasuh' },
      { label: 'Orang Tua', value: 'Orang Tua' }
    ],
    jenisIzin: [
      { label: 'Izin', value: 'Izin' },
      { label: 'Sakit', value: 'Sakit' }
    ]
  })

  const [state, setState] = useState<any>({
    id_santri: null,
    id_lokasi_kamar: null,
    sumber_pengajuan: { label: 'Santri', value: 'Waliasuh' },
    jenis_izin: { label: 'Izin', value: 'Izin' },
    tanggal_mulai: '',
    tanggal_selesai: '',
    jam_selesai: '',
    alasan: ''
  })

  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm({ values: state })

  const initForm = useCallback(async () => {
    try {
      const [resSantri, resKamar] = await Promise.all([
        dispatch(fetchSantriPage({ perPage: 20 })).unwrap(),
        dispatch(fetchLocationPage({ perPage: 1000, keyword: 'Kamar' })).unwrap()
      ])

      const santriOptions = (resSantri?.data?.values || []).map(mapSantriToOption)

      const kamarOptions = (resKamar?.data?.values || []).map((item: any) => ({
        label: `${item.nama_lokasi} (${item.parent?.nama_lokasi || 'Asrama'})`,
        value: item.id_lokasi
      }))

      setOpt(prev => ({ ...prev, santri: santriOptions, kamar: kamarOptions }))
    } catch (err) {
      toast.error('Gagal memuat referensi master data select')
    }
  }, [dispatch])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data pengajuan perizinan berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/perizinan-santri/kewaliasuhan')
    } else if (store.crud?.message) {
      toast.error(store.crud?.message || 'Gagal menyimpan pengajuan perizinan')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  useEffect(() => {
    if (!state.file_izin) {
      setFileObject(null)
    }
  }, [state.file_izin])

  const mapSantriToOption = (item: any) => {
    const idLokasiKamar = item.penempatanKamar?.[0]?.id_lokasi || item.id_lokasi || null

    return {
      label: `${item.fullname} (${item.nis || '-'})`,
      value: item.id_santri,
      id_lokasi: idLokasiKamar
    }
  }

  const searchSantri = useCallback(
    async (keyword: string) => {
      try {
        const res = await dispatch(fetchSantriPage({ perPage: 20, keyword })).unwrap()
        const rawList = res?.data?.values || res?.values || res?.data || []
        const newOptions = Array.isArray(rawList) ? rawList.map(mapSantriToOption) : []

        setOpt(prev => {
          const currentSelected = prev.santri.find(s => s.value === getValue(state.id_santri))

          if (currentSelected && !newOptions.some(item => item.value === currentSelected.value)) {
            return { ...prev, santri: [currentSelected, ...newOptions] }
          }

          return { ...prev, santri: newOptions }
        })
      } catch (err) {
        console.error('Fetch Santri Error:', err)
      }
    },
    [dispatch, mapSantriToOption]
  )

  // Pasang Debounce Manual (Delay 500ms)
  const debouncedSearchSantri = useDebounce(searchSantri, 500)

  const onSubmitPreValidate = () => {
    const idSantri = getValue(state.id_santri)
    const idLokasiKamar = getValue(state.id_lokasi_kamar)
    const sumberPengajuan = getValue(state.sumber_pengajuan)
    const jenisIzin = getValue(state.jenis_izin)

    if (
      !idSantri ||
      !idLokasiKamar ||
      !sumberPengajuan ||
      !jenisIzin ||
      !state.tanggal_mulai ||
      !state.tanggal_selesai ||
      !state.alasan?.trim()
    ) {
      toast.error('Semua field bertanda bintang (*) wajib diisi!')
      return
    }

    if (new Date(state.tanggal_selesai) < new Date(state.tanggal_mulai)) {
      toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai!')
      return
    }

    setOpenConfirm(true)
  }

  const handleFinalSubmit = () => {
    setOpenConfirm(false)

    // Format tanggal dasar ke YYYY-MM-DD
    const dateMulaiStr = state.tanggal_mulai ? format(new Date(state.tanggal_mulai), 'yyyy-MM-dd') : null
    const dateSelesaiStr = state.tanggal_selesai ? format(new Date(state.tanggal_selesai), 'yyyy-MM-dd') : null

    // Ekstrak string jam (HH:mm) jika state.jam_selesai adalah objek Date
    let jamSelesaiStr = '23:59:59'
    if (state.jam_selesai) {
      const jamDate = new Date(state.jam_selesai)

      if (isValid(jamDate) && typeof state.jam_selesai !== 'string') {
        jamSelesaiStr = `${format(jamDate, 'HH:mm')}:00`
      } else if (typeof state.jam_selesai === 'string' && state.jam_selesai.trim() !== '') {
        jamSelesaiStr = state.jam_selesai.includes(':') ? `${state.jam_selesai}:00` : '23:59:59'
      }
    }

    // Penggabungan waktu yang aman
    const finalTanggalMulai = dateMulaiStr ? `${dateMulaiStr} 00:00:00` : null
    const finalTanggalSelesai = dateSelesaiStr ? `${dateSelesaiStr} ${jamSelesaiStr}` : null

    const payload = {
      id_santri: getValue(state.id_santri),
      id_lokasi_kamar: getValue(state.id_lokasi_kamar),
      sumber_pengajuan: getValue(state.sumber_pengajuan) || 'Waliasuh',
      jenis_izin: getValue(state.jenis_izin) || 'Izin',
      tanggal_mulai: finalTanggalMulai,
      tanggal_selesai: finalTanggalSelesai,
      alasan: state.alasan,
      file_izin: fileObject
    }

    dispatch(postPerizinanSantri(payload))
  }

  const fields = () => [
    field({
      type: 'select',
      key: 'id_santri',
      label: 'Santri',
      placeholder: 'Pilih Santri',
      options: { values: opt.santri },
      required: true,
      onInputChange: (event: any, value: any, reason: string) => {
        if (reason === 'input' && value.trim() !== '') {
          debouncedSearchSantri(value)
        }
      },
      onChange: (selectedOption: any) => {
        const id_santri = selectedOption?.value ?? null
        const id_lokasi = selectedOption?.id_lokasi ?? null

        const lokasiKamarObj = id_lokasi
          ? opt.kamar.find(k => String(k.value) === String(id_lokasi)) || { label: '', value: id_lokasi }
          : null

        if (typeof setValue === 'function') {
          setValue('id_santri', selectedOption)
          setValue('id_lokasi_kamar', lokasiKamarObj)
        }

        setState((prev: any) => ({
          ...prev,
          id_santri: selectedOption,
          id_lokasi_kamar: lokasiKamarObj
        }))

        if (selectedOption && !id_lokasi) {
          toast.warning('Santri belum memiliki penempatan kamar.')
        }
      }
    }),
    field({
      type: 'select',
      key: 'id_lokasi_kamar',
      label: 'Lokasi Kamar',
      placeholder: 'Pilih Lokasi Kamar',
      options: { values: opt.kamar },
      required: true
    }),
    field({
      type: 'select',
      key: 'sumber_pengajuan',
      label: 'Sumber Pengajuan',
      options: { values: opt.sumberPengajuan },
      required: true
    }),
    field({
      type: 'select',
      key: 'jenis_izin',
      label: 'Jenis Izin',
      options: { values: opt.jenisIzin },
      required: true
    }),
    field({ type: 'date', key: 'tanggal_mulai', label: 'Tanggal Mulai', required: true }),
    field({ type: 'date', key: 'tanggal_selesai', label: 'Tanggal Selesai', required: true }),
    field({
      type: 'time', // Menggunakan format input waktu bawaan form builder
      key: 'jam_selesai',
      label: 'Jam Selesai (Opsional)',
      required: false,
      interval: 10
    }),
    field({
      type: 'textarea',
      key: 'alasan',
      label: 'Alasan',
      placeholder: 'Jelaskan alasan pengajuan izin...',
      required: true
    }),
    field({
      type: 'file',
      key: 'file_izin',
      label: 'File Izin (Opsional)',
      required: false,
      helperText: 'File maksimal 2MB',
      options: {
        onChange: (file: File) => {
          setFileObject(file)
          setState((prev: any) => ({ ...prev, file_izin: file.name }))
        }
      },
      urlImage: fileObject
        ? URL.createObjectURL(fileObject)
        : state.file_izin && typeof state.file_izin === 'string'
          ? state.file_izin.startsWith('http')
            ? state.file_izin
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${state.file_izin.startsWith('/') ? '' : '/'}${state.file_izin}`
          : ''
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#0052cc', color: '#fff', p: 5, borderRadius: '8px 8px 0 0' }}>
          <Typography variant='h4' sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            Sistem Perizinan Santri
          </Typography>
        </Box>

        <Card
          sx={{
            border: '1px solid var(--mui-palette-divider)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: 'none'
          }}
        >
          <CardHeader
            title='Ajukan Perizinan Santri'
            subheader='Pastikan seluruh data pengajuan perizinan dan durasi tanggal santri diisi dengan benar'
          />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitPreValidate)}>
              {formColumn({ control, errors, state, setState, fields: fields() })}

              <Box
                sx={{
                  p: 4,
                  mt: 5,
                  borderRadius: 1,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af'
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>
                  Validasi penting:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.825rem', lineHeight: 1.6 }}>
                  <li>Semua field bertanda bintang (*) wajib diisi termasuk deskripsi Alasan.</li>
                  <li>Tanggal selesai pengajuan tidak boleh lebih awal dari tanggal mulai.</li>
                  <li>
                    Sistem jenis Sakit akan langsung terintegrasi otomatis ke dalam modul kesehatan & absensi santri.
                  </li>
                </ul>
              </Box>

              <Grid container spacing={2} sx={{ mt: 5, pt: 2, borderTop: '1px solid var(--mui-palette-divider)' }}>
                <Grid item xs={12} sx={{ display: 'flex', gap: 3 }}>
                  <Button variant='contained' type='submit' disabled={store.loading}>
                    {store.loading ? <CircularProgress size={20} color='inherit' /> : 'Ajukan Izin'}
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => router.push('/app/perizinan-santri/kewaliasuhan')}
                  >
                    Batal
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleFinalSubmit}
        title='Konfirmasi Pengajuan'
        description='Apakah Anda yakin ingin mengirimkan data ini? Pastikan data yang anda inputkan benar.'
      />
    </Grid>
  )
}

export default FormPerizinanSantriPage
