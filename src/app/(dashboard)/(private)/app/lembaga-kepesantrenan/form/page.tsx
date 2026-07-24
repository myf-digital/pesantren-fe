'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchLembagaById, postLembaga, postLembagaUpdate, resetRedux } from '../slice/index'
import { fetchCabangAll } from '../../cabang/slice/index'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const LembagaKepesantrenanForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.lembaga_kepesantrenan)

  // Opsi Dropdown
  const [opt, setOpt] = useState({
    cabang: [] as any[]
  })

  const [state, setState] = useState<any>({
    nama_lembaga: '',
    id_cabang: null,
    keterangan: ''
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    values: state
  })

  /* -----------------------------------------------------------
     1. Inisialisasi Data (Dropdown Cabang & Detail)
  ----------------------------------------------------------- */
  const initForm = useCallback(async () => {
    try {
      // Fetch Cabang untuk referensi id_cabang
      const resCabang = await dispatch(fetchCabangAll({ perPage: 1000 })).unwrap()

      const cabangOptions = (resCabang?.data || []).map((item: any) => ({
        label: item.nama_cabang,
        value: item.id_cabang
      }))

      setOpt(prev => ({ ...prev, cabang: cabangOptions }))

      // Jika Mode Edit / View
      if (id) {
        const resDetail = await dispatch(fetchLembagaById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatted = {
            ...d,

            // Format id_cabang agar terbaca oleh component Select
            id_cabang: d.id_cabang ? cabangOptions.find((o: any) => o.value === d.id_cabang) : null
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
     2. Submit Handler & Response Listeners
  ----------------------------------------------------------- */
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Data berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/lembaga-kepesantrenan/list')
    } else if (store.crud?.status === false) {
      toast.error(store.crud?.message || 'Gagal menyimpan data lembaga')
      dispatch(resetRedux())
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      id_cabang: state.id_cabang?.value || null,
      nama_lembaga: state.nama_lembaga?.trim()
    }

    if (id) {
      dispatch(postLembagaUpdate({ id, params: payload }))
    } else {
      // Sesuai controller yang menggunakan bulkCreate([item]) atau bulk payload
      dispatch(postLembaga(payload))
    }
  }

  /* -----------------------------------------------------------
     3. Form Fields Configuration
  ----------------------------------------------------------- */
  const fields = () => [
    field({
      type: 'text',
      key: 'nama_lembaga',
      label: 'Nama Pendidikan / Lembaga',
      required: true,
      readOnly: !!view,
      placeholder: 'Contoh: Madrasah Tsanawiyah (MTs)'
    }),

    field({
      type: 'select',
      key: 'id_cabang',
      label: 'Cabang',
      options: { values: opt.cabang },
      required: true,
      readOnly: !!view,
      placeholder: 'Pilih cabang lokasi lembaga'
    }),

    field({
      type: 'textarea',
      key: 'keterangan',
      label: 'Keterangan',
      readOnly: !!view,
      placeholder: 'Tambahkan informasi tambahan jika diperlukan...'
    }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/lembaga-kepesantrenan/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={id ? (view ? 'Detail Lembaga' : 'Edit Lembaga') : 'Tambah Lembaga Pendidikan'}
            subheader='Manajemen data jenjang pendidikan dan unit lembaga kepesantrenan'
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

export default LembagaKepesantrenanForm
