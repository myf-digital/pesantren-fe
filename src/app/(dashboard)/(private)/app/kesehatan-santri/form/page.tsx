'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Box, Typography, IconButton } from '@mui/material'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchKesehatanSantriById, postKesehatanSantri, putKesehatanSantriUpdate, resetRedux } from '../slice/index'
import { fetchSantriPage } from '../../santri/slice/index'
import { fetchLocationPage } from '../../location/slice/index'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { format } from 'date-fns'

const KesehatanSantriForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const { data: session } = useSession()

  const store = useAppSelector(state => state.kesehatan_santri)

  const [opt, setOpt] = useState({
    santri: [] as any[],
    kamar: [] as any[]
  })

  const [state, setState] = useState<any>({
    id_santri: null,
    kategori_sakit: null,
    progres_status: null,
    keluhan: '',
    tindakan: '',
    tanggal_event: format(new Date(), 'yyyy-MM-dd'),
    tempat_dirawat: null,
    tempat_rujukan: '',
    estimasi_hari: '',
    obat_diberikan: '',
    keterangan: '',
    tanggal_mulai_rawat: format(new Date(), 'yyyy-MM-dd'),
    tanggal_dirujuk: format(new Date(), 'yyyy-MM-dd'),
    petugas_display: ''
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    values: state
  })

  useEffect(() => {
    if (session?.userdata?.full_name && !id) {
      setState((prev: any) => ({
        ...prev,
        petugas_display: session?.userdata?.full_name || ''
      }))
    }
  }, [session, id])

  const initForm = useCallback(async () => {
    try {
      const [resSantri, resKamar] = await Promise.all([
        dispatch(fetchSantriPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchLocationPage({ perPage: 1000, jenis_lokasi: 'Kamar' })).unwrap()
      ])

      const santriOptions = (resSantri?.data?.values || []).map((item: any) => ({
        label: `${item.fullname} (${item.nis || '-'})`,
        value: item.id_santri
      }))

      const kamarOptions = (resKamar?.data?.values || []).map((item: any) => ({
        label: `${item.nama_lokasi} (${item.parent?.nama_lokasi || 'Asrama'})`,
        value: item.id_lokasi
      }))

      setOpt({
        santri: santriOptions,
        kamar: kamarOptions
      })

      if (id) {
        const resDetail = await dispatch(fetchKesehatanSantriById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatted = {
            ...d,
            id_santri: santriOptions.find((o: any) => o.value === d.id_santri) || null,
            kategori_sakit: d.kategori_sakit ? { label: d.kategori_sakit, value: d.kategori_sakit } : null,
            progres_status: d.progres_status ? { label: d.progres_status, value: d.progres_status } : null,
            tempat_dirawat: d.tempat_dirawat ? { label: d.tempat_dirawat, value: d.tempat_dirawat } : null,
            tanggal_event: d.tanggal_event ? format(new Date(d.tanggal_event), 'yyyy-MM-dd') : '',
            tanggal_mulai_rawat: d.tanggal_mulai_rawat
              ? format(new Date(d.tanggal_mulai_rawat), 'yyyy-MM-dd')
              : format(new Date(), 'yyyy-MM-dd'),
            tanggal_dirujuk: d.tanggal_dirujuk
              ? format(new Date(d.tanggal_dirujuk), 'yyyy-MM-dd')
              : format(new Date(), 'yyyy-MM-dd'),
            obat_diberikan: d.obat_diberikan || '',
            keterangan: d.keterangan || '',
            petugas_display: d.petugas?.nama_lengkap || ''
          }

          setState(formatted)
          setTimeout(() => {
            reset(formatted)
          }, 100)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat data master referensi')
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data pemeriksaan kesehatan berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/kesehatan-santri/list')
    } else if (store.crud?.message) {
      toast.error(store.crud?.message || 'Gagal menyimpan data')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    if (store.loading) return

    const santriId = state.id_santri?.value
    const kategori = state.kategori_sakit?.value
    const progres = state.progres_status?.value
    const tgl = state.tanggal_event ? format(new Date(state.tanggal_event), 'yyyy-MM-dd') : ''

    if (!santriId) {
      toast.error('Pilih santri terlebih dahulu!')
      return
    }
    if (!kategori) {
      toast.error('Pilih kategori sakit!')
      return
    }
    if (!progres) {
      toast.error('Pilih progres status!')
      return
    }
    if (!tgl) {
      toast.error('Tentukan tanggal pemeriksaan!')
      return
    }
    if (!state.keluhan?.trim()) {
      toast.error('Keluhan wajib diisi!')
      return
    }

    const payload: any = {
      id_santri: santriId,
      kategori_sakit: kategori,
      progres_status: progres,
      keluhan: state.keluhan,
      tindakan: state.tindakan || null,
      tanggal_event: tgl,
      obat_diberikan: state.obat_diberikan || null,
      keterangan: state.keterangan || null
    }

    if (progres === 'Dirawat') {
      const tempat = state.tempat_dirawat?.value || state.tempat_dirawat
      const tglMulai = state.tanggal_mulai_rawat ? format(new Date(state.tanggal_mulai_rawat), 'yyyy-MM-dd') : ''

      if (!tempat) {
        toast.error('Pilih lokasi rawat!')
        return
      }
      if (!tglMulai) {
        toast.error('Tanggal mulai rawat wajib diisi!')
        return
      }

      payload.tempat_dirawat = tempat
      payload.tanggal_mulai_rawat = tglMulai

      const estimasiRaw = state.estimasi_hari?.toString().trim()
      if (estimasiRaw) {
        const estimasi = parseInt(estimasiRaw, 10)
        if (isNaN(estimasi) || estimasi <= 0) {
          toast.error('Estimasi hari rawat harus berupa angka positif!')
          return
        }
        payload.estimasi_hari = estimasi
      } else {
        payload.estimasi_hari = null
      }
    } else if (progres === 'Dirujuk') {
      const tempat = state.tempat_rujukan?.trim()
      const estimasi = parseInt(state.estimasi_hari, 10)
      const tglRujuk = state.tanggal_dirujuk ? format(new Date(state.tanggal_dirujuk), 'yyyy-MM-dd') : ''

      if (!tglRujuk) {
        toast.error('Tanggal dirujuk wajib diisi!')
        return
      }
      if (!tempat) {
        toast.error('Tempat rujukan wajib diisi!')
        return
      }
      if (isNaN(estimasi) || estimasi <= 0) {
        toast.error('Estimasi hari rujukan harus berupa angka positif!')
        return
      }

      payload.tempat_rujukan = tempat
      payload.estimasi_hari = estimasi
      payload.tanggal_dirujuk = tglRujuk
    }

    if (id) {
      dispatch(putKesehatanSantriUpdate({ id, params: payload }))
    } else {
      dispatch(postKesehatanSantri(payload))
    }
  }

  const getIdentitasFields = () => {
    return [
      field({
        type: 'select',
        key: 'id_santri',
        label: 'Santri',
        placeholder: 'Cari Nama / NIS - autocomplete',
        options: { values: opt.santri },
        required: true,
        readOnly: !!view || !!id,
        onChange: (val: any) => {
          const newState = { ...state, id_santri: val }
          setState(newState)
          reset(newState)
        }
      }),
      field({
        type: 'date',
        key: 'tanggal_event',
        label: 'Tanggal Event',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'text',
        key: 'petugas_display',
        label: 'Petugas',
        readOnly: true,
        placeholder: 'Admin UKS (Auto dari session)'
      })
    ]
  }

  const getKondisiMedisFields = () => {
    return [
      field({
        type: 'select',
        key: 'kategori_sakit',
        label: 'Kategori Sakit',
        options: {
          values: [
            { label: 'Ringan', value: 'Ringan' },
            { label: 'Sedang', value: 'Sedang' },
            { label: 'Berat', value: 'Berat' }
          ]
        },
        required: true,
        readOnly: !!view,
        onChange: (val: any) => {
          const newState = { ...state, kategori_sakit: val }
          setState(newState)
          reset(newState)
        }
      }),
      field({
        type: 'select',
        key: 'progres_status',
        label: 'Progres Status',
        options: {
          values: [
            { label: 'Selesai', value: 'Selesai' },
            { label: 'Dirawat', value: 'Dirawat' },
            { label: 'Dirujuk', value: 'Dirujuk' }
          ]
        },
        required: true,
        readOnly: !!view,
        onChange: (val: any) => {
          const newState = {
            ...state,
            progres_status: val,
            lokasi_rawat: null,
            id_lokasi_rawat: null,
            tempat_rujukan: '',
            estimasi_hari: ''
          }
          setState(newState)
          reset(newState)
        }
      })
    ]
  }

  const getDataKlinisFields = () => {
    return [
      field({
        type: 'textarea',
        key: 'keluhan',
        label: 'Keluhan',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'textarea',
        key: 'tindakan',
        label: 'Tindakan',
        readOnly: !!view
      }),
      field({
        type: 'textarea',
        key: 'obat_diberikan',
        label: 'Obat Diberikan',
        readOnly: !!view
      })
    ]
  }

  const getDataPerawatanFields = () => {
    const list = [
      field({
        type: 'select',
        key: 'tempat_dirawat',
        label: 'Lokasi Rawat',
        options: {
          values: [
            { label: 'UKS', value: 'UKS' },
            { label: 'Kamar', value: 'Kamar' }
          ]
        },
        required: true,
        readOnly: !!view,
        onChange: (val: any) => {
          const newState = { ...state, tempat_dirawat: val }
          setState(newState)
          reset(newState)
        }
      })
    ]

    list.push(
      field({
        type: 'date',
        key: 'tanggal_mulai_rawat',
        label: 'Tanggal Mulai Rawat',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'numeral',
        key: 'estimasi_hari',
        label: 'Estimasi Hari Rawat',
        required: false,
        readOnly: !!view
      })
    )

    return list
  }

  const getDataRujukanFields = () => {
    return [
      field({
        type: 'date',
        key: 'tanggal_dirujuk',
        label: 'Tanggal Dirujuk',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'text',
        key: 'tempat_rujukan',
        label: 'Tempat Rujukan',
        placeholder: 'Klinik / Rumah Sakit',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'numeral',
        key: 'estimasi_hari',
        label: 'Estimasi Hari Rujukan',
        required: true,
        readOnly: !!view
      })
    ]
  }

  const getCatatanFields = () => {
    return [
      field({
        type: 'textarea',
        key: 'keterangan',
        label: 'Keterangan',
        readOnly: !!view
      })
    ]
  }

  const progresVal = state.progres_status?.value || state.progres_status

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton component={Link} href='/app/kesehatan-santri/list'>
          <i className='tabler-arrow-left' />
        </IconButton>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {id ? (view ? 'Detail Pemeriksaan Santri' : 'Edit Pemeriksaan Santri') : 'Pemeriksaan Kesehatan Santri'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {id && view ? 'Detail data pemeriksaan kesehatan' : 'Input data pemeriksaan kesehatan'}
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Card sx={{ overflow: 'visible' }}>
            <CardHeader title='Identitas' />
            <CardContent>{formColumn({ control, errors, state, setState, fields: getIdentitasFields() })}</CardContent>
          </Card>
          <Card sx={{ overflow: 'visible' }}>
            <CardHeader title='Kondisi Medis' />
            <CardContent>
              {formColumn({ control, errors, state, setState, fields: getKondisiMedisFields() })}
            </CardContent>
          </Card>

          <Card sx={{ overflow: 'visible' }}>
            <CardHeader title='Data Klinis' />
            <CardContent>{formColumn({ control, errors, state, setState, fields: getDataKlinisFields() })}</CardContent>
          </Card>
          {progresVal === 'Dirawat' && (
            <Card sx={{ overflow: 'visible' }}>
              <CardHeader title='Data Perawatan' />
              <CardContent>
                {formColumn({ control, errors, state, setState, fields: getDataPerawatanFields() })}
              </CardContent>
            </Card>
          )}

          {progresVal === 'Dirujuk' && (
            <Card sx={{ overflow: 'visible' }}>
              <CardHeader title='Data Rujukan' />
              <CardContent>
                {formColumn({ control, errors, state, setState, fields: getDataRujukanFields() })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title='Catatan' />
            <CardContent>{formColumn({ control, errors, state, setState, fields: getCatatanFields() })}</CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            {formColumn({
              control,
              errors,
              state,
              setState,
              fields: [
                fieldBuildSubmit({
                  submit: 'Simpan',
                  cancel: 'Batal',
                  onCancel: () => router.push('/app/kesehatan-santri/list'),
                  loading: store.loading,
                  disabled: !!view
                })
              ]
            })}
          </Box>
        </Box>
      </form>
    </Box>
  )
}

export default KesehatanSantriForm
