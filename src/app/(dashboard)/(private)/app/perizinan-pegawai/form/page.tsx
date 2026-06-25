'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Grid, Button, CircularProgress, Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

// Redux & Hooks
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { postPerizinanSantri, resetRedux } from '../slice/index' // Menggunakan slice terpadu yang memproses payload perizinan
import { fetchPegawaiPage } from '../../pegawai/slice/index' // Penyesuaian ke endpoint master data pegawai
import { fetchLocationPage } from '../../location/slice/index'

// Form Builder Core Module Imports
import { field, formColumn } from '@views/onevour/form/AppFormBuilder'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { useSession } from 'next-auth/react'

const FormPerizinanPegawaiPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Mengambil state loading dan crud status dari store perizinan
  const store = useAppSelector(state => state.perizinan_santri)

  const { data: session } = useSession()
  const currentUser: any = session?.userdata

  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [fileObject, setFileObject] = useState<File | null>(null)

  // Opsi Dropdown Select & Radio (Data Referensi Form Builder Pegawai)
  const [opt, setOpt] = useState({
    pegawai: [] as any[],
    lokasiKerja: [] as any[],
    sumberPengajuan: [{ label: 'Mandiri (Pegawai)', value: 'Pegawai' }],
    jenisIzin: [
      { label: 'Izin', value: 'Izin' },
      { label: 'Sakit', value: 'Sakit' }
    ]
  })

  // State awal form values sesuai acuan skema parameter payload API Pegawai
  const [state, setState] = useState<any>({
    id_pegawai: currentUser?.pegawai
      ? { label: currentUser.pegawai.nama_lengkap, value: currentUser.pegawai.id_pegawai }
      : null,
    id_lokasi_kerja: currentUser?.pegawai?.jamKerjaPegawai
      ? {
          label: currentUser.pegawai.jamKerjaPegawai?.lokasiKerja.nama_lokasi,
          value: currentUser.pegawai.jamKerjaPegawai.id_lokasi
        }
      : null,
    sumber_pengajuan: { label: 'Mandiri (Pegawai)', value: 'Pegawai' },
    jenis_izin: { label: 'Izin', value: 'Izin' },
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: ''
  })

  useEffect(() => {
    if (currentUser?.pegawai) {
      setState((prev: any) => ({
        ...prev,
        id_pegawai: prev.id_pegawai || {
          label: currentUser.pegawai.nama_lengkap,
          value: currentUser.pegawai.id_pegawai
        },
        id_lokasi_kerja: prev.id_lokasi_kerja || {
          label: currentUser.pegawai.jamKerjaPegawai?.lokasiKerja.nama_lokasi,
          value: currentUser.pegawai.jamKerjaPegawai.id_lokasi
        }
      }))
    }
  }, [currentUser])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    values: state
  })

  /* -----------------------------------------------------------
     1. Inisialisasi Data Master Dropdown (Select Options)
  ----------------------------------------------------------- */
  const initForm = useCallback(async () => {
    try {
      // Mengambil referensi data pegawai aktif dan unit lokasi kerja dinas
      const [resPegawai, resLokasi] = await Promise.all([
        dispatch(fetchPegawaiPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchLocationPage({ perPage: 1000 })).unwrap()
      ])

      const pegawaiOptions = (resPegawai?.data?.values || []).map((item: any) => ({
        label: `${item.nama_lengkap} (${item.nip || '-'})`,
        value: item.id_pegawai
      }))

      const lokasiOptions = (resLokasi?.data?.values || []).map((item: any) => ({
        label: `${item.nama_lokasi} (${item.parent?.nama_lokasi || 'Kantor Pusat'})`,
        value: item.id_lokasi
      }))

      setOpt(prev => ({ ...prev, pegawai: pegawaiOptions, lokasiKerja: lokasiOptions }))
    } catch (err) {
      toast.error('Gagal memuat referensi master data select pegawai')
    }
  }, [dispatch])

  useEffect(() => {
    initForm()
  }, [initForm])

  /* -----------------------------------------------------------
     2. Watcher & Submit Response Handler
  ----------------------------------------------------------- */
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data pengajuan perizinan pegawai berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/perizinan-pegawai/list')
    } else if (store.crud?.message) {
      toast.error(store.crud?.message || 'Gagal menyimpan pengajuan perizinan pegawai')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  useEffect(() => {
    if (!state.file_izin) {
      setFileObject(null)
    }
  }, [state.file_izin])

  const onSubmitPreValidate = () => {
    if (
      !state.id_pegawai?.value ||
      !state.id_lokasi_kerja?.value ||
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

    // Buka Dialog Konfirmasi jika validasi front-end lolos
    setOpenConfirm(true)
  }

  const handleFinalSubmit = () => {
    setOpenConfirm(false)
    const payload = {
      id_pegawai: state.id_pegawai.value,
      id_lokasi_kerja: state.id_lokasi_kerja.value,
      sumber_pengajuan: state.sumber_pengajuan?.value || 'Pegawai',
      jenis_izin: state.jenis_izin?.value || 'Izin',
      tanggal_mulai: state.tanggal_mulai,
      tanggal_selesai: state.tanggal_selesai,
      alasan: state.alasan,
      file_izin: fileObject,
      is_pegawai: true // Flag parameter penanda konteks entitas pegawai pada backend
    }

    dispatch(postPerizinanSantri(payload))
  }

  /* -----------------------------------------------------------
     3. Form Fields Builder Configuration
  ----------------------------------------------------------- */
  const fields = () => [
    field({
      type: 'select',
      key: 'id_pegawai',
      label: 'Pegawai',
      placeholder: 'Pilih Pegawai',
      options: { values: opt.pegawai },
      required: true
    }),

    field({
      type: 'select',
      key: 'id_lokasi_kerja',
      label: 'Lokasi Kerja',
      placeholder: 'Pilih Lokasi Kerja',
      options: { values: opt.lokasiKerja },
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

    field({
      type: 'date',
      key: 'tanggal_mulai',
      label: 'Tanggal Mulai',
      required: true
    }),

    field({
      type: 'date',
      key: 'tanggal_selesai',
      label: 'Tanggal Selesai',
      required: true
    }),

    field({
      type: 'textarea',
      key: 'alasan',
      label: 'Alasan',
      placeholder: 'Jelaskan alasan pengajuan perizinan dinas atau sakit...',
      required: true
    }),

    field({
      type: 'file',
      key: 'file_izin',
      label: 'Surat Keterangan / File Pendukung (Opsional)',
      required: false,
      helperText: 'File berkas maksimal 2MB',
      options: {
        onChange: (file: File) => {
          setFileObject(file)
          setState((prev: any) => ({
            ...prev,
            file_izin: file.name
          }))
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
        {/* Top Banner Aplikasi Terintegrasi Kepegawaian */}
        <Box sx={{ backgroundColor: '#0052cc', color: '#fff', p: 5, borderRadius: '8px 8px 0 0' }}>
          <Typography variant='h4' sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            Sistem Perizinan Pegawai
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
            title='Ajukan Perizinan Pegawai'
            subheader='Pastikan seluruh data pengajuan perizinan dan durasi tanggal dinas pegawai diisi dengan benar'
          />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitPreValidate)}>
              {/* Eksekusi Form Builder Module */}
              {formColumn({ control, errors, state, setState, fields: fields() })}

              {/* Info Banner Validasi Tambahan */}
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
                  <li>Semua field bertanda bintang (*) wajib diisi termasuk kelengkapan berkas deskripsi Alasan.</li>
                  <li>Tanggal selesai pengajuan tidak boleh lebih awal dari rentang tanggal mulai kerja.</li>
                  <li>
                    Persetujuan perizinan akan langsung terintegrasi otomatis secara murni ke dalam sistem rekapitulasi
                    absensi harian pegawai.
                  </li>
                </ul>
              </Box>

              {/* Action Toolbar Footer Layout */}
              <Grid container spacing={2} sx={{ mt: 5, pt: 2, borderTop: '1px solid var(--mui-palette-divider)' }}>
                <Grid item xs={12} className='demo-space-x' sx={{ display: 'flex', gap: 3 }}>
                  <Button variant='contained' type='submit' disabled={store.loading}>
                    {store.loading ? <CircularProgress size={20} color='inherit' /> : 'Ajukan Izin Pegawai'}
                  </Button>

                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => router.push('/app/perizinan-pegawai/list')}
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
        description='Apakah Anda yakin ingin mengirimkan data ini? Pastikan durasi absensi dan data pegawai yang dimasukkan sudah benar.'
      />
    </Grid>
  )
}

export default FormPerizinanPegawaiPage
