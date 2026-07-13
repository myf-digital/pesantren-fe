'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Grid } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchLembagaFormalById,
  postLembagaFormal,
  postLembagaFormalUpdate,
  resetRedux
} from '../slice/index'
import { fetchCabangPage } from '../../cabang/slice/index'
import api from '@/libs/axios'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const LembagaFormalForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.lembaga_formal)

  // Opsi Dropdown
  const [opt, setOpt] = useState({
    cabang: [] as any[],
    institution: [] as any[],
    jenis: [
      { label: 'SD', value: 'SD' }, { label: 'MI', value: 'MI' },
      { label: 'SMP', value: 'SMP' }, { label: 'MTs', value: 'MTs' },
      { label: 'SMA', value: 'SMA' }, { label: 'MA', value: 'MA' },
      { label: 'SMK', value: 'SMK' }, { label: 'Diniyah', value: 'Diniyah' },
      { label: 'Perguruan Tinggi', value: 'Perguruan Tinggi' }
    ],
    akreditasi: [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' },
      { label: 'Belum Terakreditasi', value: 'Belum Terakreditasi' }
    ]
  })

  const [state, setState] = useState<any>({
    nama_lembaga: '',
    id_cabang: null,
    institution_id_sitrendi: null,
    jenis_lembaga: null,
    status_akreditasi: null,
    nomor_npsn: '',
    keterangan: ''
  })

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    values: state
  })

  /* -----------------------------------------------------------
     1. Inisialisasi Data (Dropdown & Detail)
  ----------------------------------------------------------- */
  const initForm = useCallback(async () => {
    try {
      // Fetch Cabang
      const resCabang = await dispatch(fetchCabangPage({ perPage: 1000 })).unwrap()
      const cabangOptions = (resCabang?.data?.values || [])
        .map((item: any) => ({ label: item.nama_cabang, value: item.id_cabang }))

      setOpt(prev => ({ ...prev, cabang: cabangOptions }))

      // Fetch Institution
      const resInstitution = await api.get('/app/institution/all-data')
      const institutionOptions = (resInstitution?.data?.data || [])
        .map((item: any) => ({ label: item.institution_name, value: item.institution_id_sitrendi }))

      setOpt(prev => ({ ...prev, institution: institutionOptions }))

      // Jika Mode Edit / View
      if (id) {
        const resDetail = await dispatch(fetchLembagaFormalById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatted = {
            ...d,
            id_cabang: d.id_cabang ? cabangOptions.find((o: any) => o.value === d.id_cabang) : null,
            institution_id_sitrendi: d.institution_id_sitrendi ? institutionOptions.find((o: any) => o.value === d.institution_id_sitrendi) : null,
            jenis_lembaga: d.jenis_lembaga ? { label: d.jenis_lembaga, value: d.jenis_lembaga } : null,
            status_akreditasi: d.status_akreditasi ? { label: d.status_akreditasi, value: d.status_akreditasi } : null,
          }
          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error("Gagal memuat referensi data")
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
      router.replace('/app/lembaga-formal/list')
    } else if (store.crud?.status === false) {
      toast.error(store.crud?.message || 'Gagal menyimpan data')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      id_cabang: state.id_cabang?.value || null,
      institution_id_sitrendi: state.institution_id_sitrendi?.value || null,
      jenis_lembaga: state.jenis_lembaga?.value || null,
      status_akreditasi: state.status_akreditasi?.value || null,
    }

    if (id) {
      dispatch(postLembagaFormalUpdate({ id, params: payload }))
    } else {
      // Menggunakan array untuk bulk create di repository
      dispatch(postLembagaFormal([payload]))
    }
  }

  /* -----------------------------------------------------------
     3. Form Fields Configuration
  ----------------------------------------------------------- */
  const fields = () => [
    field({
      type: 'text',
      key: 'nama_lembaga',
      label: 'Nama Lembaga Formal',
      required: true,
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'id_cabang',
      label: 'Kantor Cabang',
      options: { values: opt.cabang },
      required: true,
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'institution_id_sitrendi',
      label: 'Institusi SiTrendi',
      options: { values: opt.institution },
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'jenis_lembaga',
      label: 'Jenjang / Jenis Pendidikan',
      options: { values: opt.jenis },
      required: true,
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'status_akreditasi',
      label: 'Status Akreditasi',
      options: { values: opt.akreditasi },
      readOnly: !!view
    }),

    field({
      type: 'text',
      key: 'nomor_npsn',
      label: 'Nomor NPSN',
      readOnly: !!view,
      placeholder: 'Masukkan 8 digit angka NPSN'
    }),

    field({
      type: 'textarea',
      key: 'keterangan',
      label: 'Keterangan Tambahan',
      readOnly: !!view
    }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/lembaga-formal/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={id ? (view ? 'Detail Lembaga Formal' : 'Edit Lembaga Formal') : 'Tambah Lembaga Formal'}
            subheader='Data pendidikan formal sesuai standar Dapodik/NPSN'
          />
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

export default LembagaFormalForm
