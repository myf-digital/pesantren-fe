'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchBobotPenilaianById, postBobotPenilaian, postBobotPenilaianUpdate, resetRedux } from '../slice'

// Import Thunks dari modul lain untuk kebutuhan dropdown
import { fetchJenisPenilaianList } from '../../jenis-penilaian/slice'
import { fetchTingkatAll } from '../../tingkat/slice'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'

// Asumsi service/thunk untuk lembaga (Formal & Pesantren)
import { fetchLembagaFormalAll } from '../../lembaga-formal/slice'
import { fetchLembagaAll } from '../../lembaga-kepesantrenan/slice'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const JenisPenilaianBobotForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jenis_penilaian_bobot)

  const [opt, setOpt] = useState<any>({
    jenisPenilaian: [],
    lembagaType: [
      { label: 'FORMAL', value: 'FORMAL' },
      { label: 'PESANTREN', value: 'PESANTREN' }
    ],
    lembagaList: [], // Dinamis tergantung lembaga_type
    tingkat: [],
    tahunAjaran: [],
    status: [
      { label: 'Aktif', value: 'Aktif' },
      { label: 'Nonaktif', value: 'Nonaktif' }
    ]
  })

  const [state, setState] = useState<any>({
    id_penilaian: null,
    lembaga_type: { label: 'FORMAL', value: 'FORMAL' },
    id_lembaga: null,
    id_tingkat: null,
    id_tahunajaran: null,
    bobot: 0,
    status: { label: 'Aktif', value: 'Aktif' }
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  // Fungsi untuk fetch daftar lembaga berdasarkan type
  const fetchLembagaOptions = useCallback(
    async (type: string) => {
      try {
        let res: any

        if (type === 'FORMAL') {
          res = await dispatch(fetchLembagaFormalAll({ perPage: 1000 })).unwrap()
        } else {
          res = await dispatch(fetchLembagaAll({ perPage: 1000 })).unwrap()
        }

        const options = (res?.data || []).map((i: any) => ({
          label: i.nama_lembaga,
          value: i.id_lembaga
        }))

        setOpt((prev: any) => ({ ...prev, lembagaList: options }))

        return options
      } catch (err) {
        return []
      }
    },
    [dispatch]
  )

  const fetchTingkatOptions = useCallback(
    async (q: string) => {
      try {
        const res = await dispatch(fetchTingkatAll({ type: q })).unwrap()

        const options = (res?.data || []).map((i: any) => ({
          label: i.tingkat,
          value: i.id_tingkat
        }))

        setOpt((prev: any) => ({ ...prev, tingkat: options }))

        return options
      } catch (err) {
        return []
      }
    },
    [dispatch]
  )

  const initForm = useCallback(async () => {
    try {
      // 1. Fetch Referensi Umum (Paralel)
      const [resJP, resTingkat, resTA] = await Promise.all([
        dispatch(fetchJenisPenilaianList({})).unwrap(),
        dispatch(fetchTingkatAll({ type: state.lembaga_type.value })).unwrap(),
        dispatch(fetchTahunAjaranAll({ status: 'Aktif' })).unwrap()
      ])

      const jpOpts = (resJP?.data || []).map((i: any) => ({
        label: `${i.singkatan} - ${i.jenis_pengujian} (${i.lembaga_type})`,
        value: i.id_penilaian,
        rawLembagaType: i.lembaga_type
      }))

      const tingkatOpts = (resTingkat?.data || []).map((i: any) => ({ label: i.tingkat, value: i.id_tingkat }))
      const taOpts = (resTA?.data || []).map((i: any) => ({ label: i.tahun_ajaran, value: i.id_tahunajaran }))

      setOpt((prev: any) => ({
        ...prev,
        jenisPenilaian: jpOpts,
        tingkat: tingkatOpts,
        tahunAjaran: taOpts
      }))

      // 2. Jika Mode EDIT atau VIEW
      if (id) {
        const resDetail = await dispatch(fetchBobotPenilaianById(id)).unwrap()
        const d = resDetail?.data?.[0] // Mengambil data pertama dari array hasil query

        if (d) {
          // --- KUNCI PERBAIKAN DI SINI ---
          const currentLembagaOpts = await fetchLembagaOptions(d.lembaga_type)

          const formatted = {
            ...d,

            // Cari objek label & value dari list yang sudah kita fetch
            id_penilaian: jpOpts.find((o: any) => o.value === d.id_penilaian) || null,
            lembaga_type: opt.lembagaType.find((o: any) => o.value === d.lembaga_type) || null,
            id_lembaga: currentLembagaOpts.find((o: any) => o.value === d.lembaga.id_lembaga) || null,
            id_tingkat: tingkatOpts.find((o: any) => o.value === d.id_tingkat) || null,
            id_tahunajaran: taOpts.find((o: any) => o.value === d.id_tahunajaran) || null,
            status: opt.status.find((o: any) => o.value === d.status) || null
          }

          // Set state dan reset react-hook-form secara bersamaan
          setState(formatted)
          reset(formatted)
        }
      } else {
        // Jika Create baru, default ke FORMAL
        fetchLembagaOptions('FORMAL')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data')
    }
  }, [id, dispatch, reset, fetchLembagaOptions, opt.lembagaType, opt.status])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (state.id_penilaian?.value) {
      const selectedJPOpt = opt.jenisPenilaian.find((o: any) => o.value === state.id_penilaian.value)

      if (selectedJPOpt && selectedJPOpt.rawLembagaType) {
        const targetLembagaType = selectedJPOpt.rawLembagaType

        const matchedLembagaTypeOpt = opt.lembagaType.find((o: any) => o.value === targetLembagaType)

        if (matchedLembagaTypeOpt && state.lembaga_type?.value !== targetLembagaType) {
          const updatedState = {
            ...state,
            lembaga_type: matchedLembagaTypeOpt,
            id_lembaga: null
          }

          setState(updatedState)
          reset(updatedState)

          fetchLembagaOptions(targetLembagaType)
          fetchTingkatOptions(targetLembagaType)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.id_penilaian, opt.jenisPenilaian, fetchLembagaOptions, reset])

  // Efek ketika lembaga_type berubah (saat input manual)
  useEffect(() => {
    if (state.lembaga_type?.value && !id) {
      fetchLembagaOptions(state.lembaga_type.value)
      fetchTingkatOptions(state.lembaga_type.value)
    }
  }, [state.lembaga_type, fetchLembagaOptions, id])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message)
        dispatch(resetRedux())
        router.replace('/app/jenis-penilaian-bobot/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      id_penilaian: state.id_penilaian?.value,
      lembaga_type: state.lembaga_type?.value,
      id_lembaga: state.id_lembaga?.value,
      id_tingkat: state.id_tingkat?.value,
      id_tahunajaran: state.id_tahunajaran?.value,
      status: state.status?.value,
      bobot: parseFloat(state.bobot)
    }

    id ? dispatch(postBobotPenilaianUpdate({ id, params: payload })) : dispatch(postBobotPenilaian([payload]))
  }

  const fields = () => [
    { section: 'Relasi Penilaian' },
    field({
      type: 'select',
      key: 'id_penilaian',
      label: 'Jenis Penilaian',
      options: { values: opt.jenisPenilaian },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'id_tahunajaran',
      label: 'Tahun Ajaran',
      options: { values: opt.tahunAjaran },
      required: true,
      readOnly: !!view
    }),

    { section: 'Target Lembaga & Tingkat' },
    field({
      type: 'select',
      key: 'lembaga_type',
      label: 'Tipe Lembaga',
      options: { values: opt.lembagaType },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'id_lembaga',
      label: 'Pilih Lembaga',
      options: { values: opt.lembagaList },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'id_tingkat',
      label: 'Tingkat (Opsional)',
      options: { values: opt.tingkat },
      readOnly: !!view
    }),

    { section: 'Konfigurasi Bobot' },
    field({
      type: 'numeral',
      key: 'bobot',
      label: 'Nilai Bobot (%)',
      placeholder: '0.00',
      required: true,
      readOnly: !!view
    }),
    field({ type: 'select', key: 'status', label: 'Status Aktif', options: { values: opt.status }, readOnly: !!view }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/jenis-penilaian-bobot/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={id ? (view ? 'Detail Bobot' : 'Edit Bobot Penilaian') : 'Tambah Bobot Penilaian'} />
          <Divider sx={{ m: '0 !important' }} />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {formColumn({ control, errors, state, setState, fields: fields() })}
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default JenisPenilaianBobotForm
