'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Grid, Button, CircularProgress, Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

// Redux & Hooks
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { postPerizinanMassal, resetRedux } from '../slice/index'
import { fetchCabangPage } from '../../cabang/slice/index'

// Form Builder Core Module Imports
import { field, formColumn } from '@views/onevour/form/AppFormBuilder'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { format } from 'date-fns'

const FormPerizinanSantriMassalPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.perizinan_santri)

  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [optCabang, setOptCabang] = useState<any[]>([])

  const [opt] = useState({
    jenisIzin: [
      { label: 'Izin', value: 'Izin' },
      { label: 'Sakit', value: 'Sakit' }
    ]
  })

  // Struktur default untuk inisialisasi dan reset form
  const defaultState = {
    id_cabang: null,
    jenis_izin: { label: 'Izin', value: 'Izin' },
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: ''
  }

  const [state, setState] = useState<any>(defaultState)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset // Gunakan method reset dari react-hook-form
  } = useForm({ values: state })

  const initMassalForm = useCallback(async () => {
    try {
      const resCabang = await dispatch(fetchCabangPage({ perPage: 1000 })).unwrap()
      const cabangOptions = (resCabang?.data?.values || []).map((item: any) => ({
        label: item.nama_cabang,
        value: item.id_cabang
      }))
      setOptCabang(cabangOptions)
    } catch (err) {
      toast.error('Gagal memuat data master cabang')
    }
  }, [dispatch])

  useEffect(() => {
    initMassalForm()
  }, [initMassalForm])

  // Efek handling response: Berhasil -> Notif & Reset Form (Tanpa Redirect)
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data perizinan massal berhasil diproses')

      dispatch(resetRedux())

      setState(defaultState)
      reset(defaultState)
    } else if (store.crud?.message) {
      toast.error(store.crud?.message || 'Gagal memproses perizinan massal')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, reset])

  const onSubmitPreValidate = () => {
    if (!state.id_cabang?.value || !state.tanggal_mulai || !state.tanggal_selesai || !state.alasan?.trim()) {
      toast.error('Semua field massal bertanda bintang (*) wajib diisi!')
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
    const payload = {
      id_cabang: state.id_cabang.value,
      jenis_izin: state.jenis_izin?.value || 'Izin',
      tanggal_mulai: state.tanggal_mulai ? format(state.tanggal_mulai, 'yyyy-MM-dd') : null,
      tanggal_selesai: state.tanggal_selesai ? format(state.tanggal_selesai, 'yyyy-MM-dd') : null,
      alasan: state.alasan
    }

    dispatch(postPerizinanMassal(payload))
  }

  const fieldsMassal = () => [
    field({
      type: 'select',
      key: 'id_cabang',
      label: 'Cabang / Institusi',
      placeholder: 'Pilih Cabang Terpilih',
      options: { values: optCabang },
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
      label: 'Alasan Kolektif',
      placeholder: 'Jelaskan alasan perizinan massal untuk cabang ini...',
      required: true
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
            title='Ajukan Perizinan Massal Cabang'
            subheader='Seluruh santri aktif pada cabang yang dipilih akan otomatis mendapatkan dokumen izin disetujui sistem'
            action={
              <Button variant='outlined' size='small' onClick={() => router.push('form')}>
                Kembali ke Izin Reguler
              </Button>
            }
          />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitPreValidate)}>
              {formColumn({ control, errors, state, setState, fields: fieldsMassal() })}

              <Box
                sx={{
                  p: 4,
                  mt: 5,
                  borderRadius: 1,
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c'
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>
                  Pemberitahuan Sistem:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.825rem', lineHeight: 1.6 }}>
                  <li>
                    Tindakan ini akan mengenerate surat nomor resmi dan log gate keluar otomatis untuk satu cabang
                    penuh.
                  </li>
                  <li>Pastikan rentang kalender libur/perizinan bersama telah divalidasi dengan benar.</li>
                </ul>
              </Box>

              <Grid container spacing={2} sx={{ mt: 5, pt: 2, borderTop: '1px solid var(--mui-palette-divider)' }}>
                <Grid item xs={12} sx={{ display: 'flex', gap: 3 }}>
                  <Button variant='contained' color='warning' type='submit' disabled={store.loading}>
                    {store.loading ? <CircularProgress size={20} color='inherit' /> : 'Proses Izin Massal'}
                  </Button>
                  {/* <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => router.push('/app/perizinan-santri/kewaliasuhan')}
                  >
                    Kembali ke List
                  </Button> */}
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
        title='Konfirmasi Pemrosesan Massal'
        description='Apakah Anda benar-benar yakin ingin memproses perizinan massal satu cabang ini secara serentak?'
      />
    </Grid>
  )
}

export default FormPerizinanSantriMassalPage
