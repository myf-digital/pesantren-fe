'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'

import { fetchSantriAll } from '../../santri/slice'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import {
  fetchPenempatanKelasSantriById,
  postPenempatanKelasSantri,
  postPenempatanKelasSantriUpdate,
  resetRedux
} from '../slice'

const statusOption = {
  values: [
    {
      label: 'Aktif',
      value: 'Aktif'
    },
    {
      label: 'Alumni',
      value: 'Alumni'
    },
    {
      label: 'Tidak Aktif',
      value: 'Tidak Aktif'
    }
  ]
}

const defaultValues = {
  id_santri: {
    value: '',
    label: ''
  },
  id_kelas_mda: {
    value: '',
    label: ''
  },
  id_kelas_formal: {
    value: '',
    label: ''
  },
  id_tahun_ajaran: {
    value: '',
    label: ''
  },
  tanggal_masuk: '',
  tanggal_keluar: '',
  status: {
    value: 'Aktif',
    label: 'Aktif'
  }
}

const PenempatanKelasSantriForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.penempatan_kelas_santri)
  const storeSantri = useAppSelector(state => state.santri)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)

  const [state, setState] = useState<any>(defaultValues)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/penempatan-kelas-santri/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchSantriAll({ status: '1' }))
    dispatch(fetchTahunAjaranAll({ status: 'Aktif' }))
    dispatch(fetchKelasMdaAll({ status: 'Aktif', id_tingkat: '' }))
    dispatch(fetchKelasFormalAll({ status: 'Aktif', id_tingkat: '' }))

    if (id) {
      dispatch(fetchPenempatanKelasSantriById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status = statusOption.values.find(s => s.value === datas.status) || {
            value: datas.status,
            label: datas.status
          }
          datas.id_santri = {
            value: datas.id_santri || '',
            label: datas.santri?.fullname || ''
          }
          datas.id_kelas_mda = {
            value: datas.id_kelas_mda || '',
            label: datas.kelasMda?.nama_kelas_mda || ''
          }
          datas.id_kelas_formal = {
            value: datas.id_kelas_formal || '',
            label: datas.kelasFormal?.nama_kelas || ''
          }
          datas.id_tahun_ajaran = {
            value: datas.id_tahun_ajaran || '',
            label: datas.tahunAjaran?.tahun_ajaran || ''
          }
          datas.tanggal_masuk = datas.tanggal_masuk || ''
          datas.tanggal_keluar = datas.tanggal_keluar || ''

          setState(datas)
          reset(datas)
        }
      })
    }
  }, [dispatch, id, reset])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Penempatan Kelas berhasil disimpan')
      onCancel()
    } else {
      toast.error('Gagal menyimpan Penempatan Kelas: ' + (store.crud.message || 'Error'))
      setLoading(false)
    }
  }, [onCancel, store.crud])

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    if (!state.id_santri?.value) {
      toast.error('Santri wajib dipilih')
      setLoading(false)
      return
    }
    if (!state.id_tahun_ajaran?.value) {
      toast.error('Tahun Ajaran wajib dipilih')
      setLoading(false)
      return
    }
    if (!state.id_kelas_mda?.value && !state.id_kelas_formal?.value) {
      toast.error('Salah satu dari Kelas MDA atau Kelas Formal wajib dipilih')
      setLoading(false)
      return
    }

    const payload = {
      id_santri: state.id_santri.value,
      id_kelas_mda: state.id_kelas_mda.value || null,
      id_kelas_formal: state.id_kelas_formal.value || null,
      id_tahun_ajaran: state.id_tahun_ajaran.value,
      status: state.status.value,
      tanggal_masuk: state.tanggal_masuk || null,
      tanggal_keluar: state.tanggal_keluar || null
    }

    if (id) {
      dispatch(
        postPenempatanKelasSantriUpdate({
          id,
          params: payload
        })
      )
    } else {
      dispatch(postPenempatanKelasSantri(payload))
    }
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_santri',
        label: 'Santri',
        placeholder: 'Pilih Santri',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: (storeSantri.datas || []).map(m => ({
            label: `${m.fullname} (NIS: ${m.nis})`,
            value: m.id_santri
          }))
        }
      }),
      field({
        type: 'select',
        key: 'id_kelas_mda',
        label: 'Kelas MDA',
        placeholder: 'Pilih Kelas MDA',
        required: false,
        readOnly: Boolean(view),
        options: {
          values: (storeKelasMda.datas || []).map(m => ({
            label: m.nama_kelas_mda,
            value: m.id_kelas_mda
          }))
        }
      }),
      field({
        type: 'select',
        key: 'id_kelas_formal',
        label: 'Kelas Formal',
        placeholder: 'Pilih Kelas Formal',
        required: false,
        readOnly: Boolean(view),
        options: {
          values: (storeKelasFormal.datas || []).map(m => ({
            label: m.nama_kelas,
            value: m.id_kelas
          }))
        }
      }),
      field({
        type: 'select',
        key: 'id_tahun_ajaran',
        label: 'Tahun Ajaran',
        placeholder: 'Pilih Tahun Ajaran',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: (storeTahunAjaran.datas || []).map(m => ({
            label: m.tahun_ajaran,
            value: m.id_tahunajaran
          }))
        }
      }),
      field({
        type: 'date_custom',
        key: 'tanggal_masuk',
        label: 'Masuk',
        popperPlacement: 'top-start',
        required: false,
        readOnly: Boolean(view)
      }),
      field({
        type: 'date_custom',
        key: 'tanggal_keluar',
        label: 'Keluar',
        popperPlacement: 'top-start',
        required: false,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'status',
        label: 'Status',
        placeholder: 'Pilih Status',
        required: true,
        readOnly: Boolean(view),
        options: statusOption
      }),
      fieldBuildSubmit({ onCancel, loading, disabled: Boolean(view) })
    ]
  }

  const getTitle = () => {
    if (id) {
      return view ? 'Detail Penempatan Kelas' : 'Ubah Penempatan Kelas'
    }
    return 'Tambah Penempatan Kelas'
  }

  return (
    <Card>
      <CardHeader title={getTitle()} />
      <CardContent>
        <Grid container spacing={5} sx={{ paddingBottom: 40 }}>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' style={{ width: '100%' }}>
            {formColumn({
              control,
              errors,
              state,
              setState,
              fields: fields()
            })}
          </form>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PenempatanKelasSantriForm
