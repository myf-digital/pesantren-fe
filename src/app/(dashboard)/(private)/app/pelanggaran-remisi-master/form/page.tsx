'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchMasterPelanggaranRemisiById,
  postMasterPelanggaranRemisi,
  postMasterPelanggaranRemisiUpdate,
  resetRedux
} from '../slice' // Sesuaikan dengan path slice Anda

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const MasterPelanggaranRemisiForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.master_pelanggaran_remisi)

  const [opt] = useState<any>({
    jenis: [
      { label: 'Pelanggaran', value: 'Pelanggaran' },
      { label: 'Remisi', value: 'Remisi' }
    ],
    kategori: [
      { label: 'Ringan', value: 'Ringan' },
      { label: 'Sedang', value: 'Sedang' },
      { label: 'Berat', value: 'Berat' },
      { label: 'Sangat Berat', value: 'Sangat Berat' }
    ],
    status: [
      { label: 'Aktif', value: true },
      { label: 'Tidak Aktif', value: false }
    ]
  })

  const [state, setState] = useState<any>({
    kode_pelanggaran: '',
    nama_pelanggaran: '',
    jenis: null,
    kategori: null,
    skor: 0,
    keterangan: '',
    is_active: { label: 'Aktif', value: true }
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  const initForm = useCallback(async () => {
    try {
      if (id) {
        const resDetail = await dispatch(fetchMasterPelanggaranRemisiById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatted = {
            ...d,
            jenis: d.jenis ? { label: d.jenis, value: d.jenis } : null,
            kategori: d.kategori ? { label: d.kategori, value: d.kategori } : null,
            is_active:
              d.is_active !== undefined
                ? { label: d.is_active ? 'Aktif' : 'Tidak Aktif', value: d.is_active }
                : { label: 'Aktif', value: true }
          }

          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat data detail')
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message)
        dispatch(resetRedux())
        router.replace('/app/pelanggaran-remisi-master/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      jenis: state.jenis?.value || null,
      kategori: state.kategori?.value || null,
      is_active: state.is_active?.value,
      skor: Number(state.skor) || 0
    }

    id
      ? dispatch(postMasterPelanggaranRemisiUpdate({ id, params: payload }))
      : dispatch(postMasterPelanggaranRemisi(payload))
  }

  const fields = () => [
    { section: 'Informasi Master Data' },
    field({
      type: 'text',
      key: 'kode_pelanggaran',
      label: 'Kode',
      required: true,
      readOnly: !!view,
      placeholder: 'Contoh: PEL-001'
    }),
    field({
      type: 'text',
      key: 'nama_pelanggaran',
      label: 'Nama Pelanggaran / Remisi',
      required: true,
      readOnly: !!view,
      placeholder: 'Contoh: Terlambat Masuk Kerja'
    }),
    field({
      type: 'select',
      key: 'jenis',
      label: 'Jenis',
      options: { values: opt.jenis },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'kategori',
      label: 'Kategori',
      options: { values: opt.kategori },
      readOnly: !!view
    }),
    field({
      type: 'numeral',
      key: 'skor',
      label: 'Skor / Poin',
      required: true,
      readOnly: !!view
    }),

    { section: 'Keterangan & Status' },
    field({
      type: 'textarea',
      key: 'keterangan',
      label: 'Keterangan',
      readOnly: !!view,
      placeholder: 'Penjelasan tambahan aturan (opsional)'
    }),
    field({
      type: 'select',
      key: 'is_active',
      label: 'Status Aktif',
      options: { values: opt.status },
      required: true,
      readOnly: !!view
    }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/pelanggaran-remisi-master/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={id ? (view ? 'Detail Master Data' : 'Edit Master Data') : 'Tambah Master Data'} />
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

export default MasterPelanggaranRemisiForm
