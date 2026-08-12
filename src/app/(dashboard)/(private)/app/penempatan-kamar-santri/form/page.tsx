'use client'

// ** React Imports
import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import Grid from '@mui/material/Grid2'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import {
  fetchPenempatanKamarSantriById,
  postPenempatanKamarSantri,
  postPenempatanKamarSantriUpdate,
  resetRedux
} from '../slice/index'
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchSantriAll } from '../../santri/slice'
import { fetchLocationAll } from '../../location/slice'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { stat } from 'fs'
import { fetchPegawaiAll } from '../../pegawai/slice'

const statusOption = {
  values: [
    {
      label: 'Aktif',
      value: 'Aktif'
    },
    {
      label: 'Non-Aktif',
      value: 'Non-Aktif'
    }
  ]
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.penempatan_kamar_santri)
  const storeSantri = useAppSelector(state => state.santri)
  const storeLokasi = useAppSelector(state => state.location)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storePegawai = useAppSelector(state => state.pegawai)

  interface FormData {
    tanggal_masuk: string
    tanggal_keluar: string
    keterangan: string | null
    status: {
      value: string
      label: string
    }
    id_santri: {
      value: string
      label: string
    }
    id_lokasi: {
      value: string
      label: string
    }
    id_tahunajaran: {
      value: string
      label: string
    }
    id_waliasuh: {
      value: string
      label: string
    }
  }

  const defaultValues = {
    tanggal_masuk: '',
    tanggal_keluar: '',
    keterangan: '',
    status: {
      value: 'Aktif',
      label: 'Aktif'
    },
    id_santri: {
      value: '',
      label: ''
    },
    id_lokasi: {
      value: '',
      label: ''
    },
    id_tahunajaran: {
      value: '',
      label: ''
    },
    id_waliasuh: {
      value: '',
      label: ''
    }
  }

  const [state, setState] = useState<FormData>(defaultValues)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/penempatan-kamar-santri/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchSantriAll({ status: '1' }))
    dispatch(fetchLocationAll({ jenis_lokasi: 'Kamar' }))
    dispatch(fetchTahunAjaranAll({ status: 'Aktif' }))
    dispatch(fetchPegawaiAll({ status_pegawai: 'Aktif' }))

    if (id) {
      dispatch(fetchPenempatanKamarSantriById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status = {
            value: datas.status,
            label: datas.status
          }
          datas.id_santri = {
            value: datas.id_santri,
            label: datas.santri?.fullname
          }
          datas.id_lokasi = {
            value: datas.id_lokasi,
            label: datas.lokasi?.nama_lokasi
          }
          datas.id_tahunajaran = {
            value: datas.id_tahunajaran,
            label: datas.tahunAjaran?.tahun_ajaran
          }
          datas.id_waliasuh = {
            value: datas.id_waliasuh,
            label: datas.waliasuh?.nama_pegawai
          }
          datas.tanggal_masuk = datas.tanggal_masuk || ''
          datas.tanggal_keluar = datas.tanggal_keluar || ''
          datas.keterangan = datas.keterangan || ''

          setState(datas)
          reset(datas)
        }
      })
    }
  }, [dispatch, id, reset])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      onCancel()
    } else {
      toast.error('Error saved: ' + store.crud.message)

      setLoading(false)
    }
  }, [onCancel, store])

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    const payload = {
      id_santri: state.id_santri.value || null,
      id_lokasi: state.id_lokasi.value || null,
      id_tahunajaran: state.id_tahunajaran.value || null,
      id_waliasuh: state.id_waliasuh.value || null,
      status: state.status.value || null,
      tanggal_masuk: state.tanggal_masuk || null,
      tanggal_keluar: state.tanggal_keluar || null,
      keterangan: state.keterangan || null
    }

    if (id) {
      // update
      dispatch(
        postPenempatanKamarSantriUpdate({
          id: id,
          params: payload
        })
      )
    } else {
      dispatch(postPenempatanKamarSantri(payload))
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
          values: storeSantri.datas.map(m => {
            return {
              label: `${m.fullname} (NIS: ${m.nis})`,
              value: m.id_santri
            }
          })
        }
      }),
      field({
        type: 'select',
        key: 'id_lokasi',
        label: 'Lokasi',
        placeholder: 'Pilih Lokasi',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: storeLokasi.datas.map(m => {
            return {
              label: m.nama_lokasi,
              value: m.id_lokasi
            }
          })
        }
      }),
      field({
        type: 'select',
        key: 'id_tahunajaran',
        label: 'Tahun Ajaran',
        placeholder: 'Pilih Tahun Ajaran',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: storeTahunAjaran.datas.map(m => {
            return {
              label: m.tahun_ajaran,
              value: m.id_tahunajaran
            }
          })
        }
      }),
      field({
        type: 'select',
        key: 'status',
        label: 'Status',
        placeholder: 'Pilih Status',
        required: false,
        options: statusOption,
        readOnly: Boolean(view)
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
        key: 'id_waliasuh',
        label: 'Wali Asuh',
        placeholder: 'Pilih Wali Asuh',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: storePegawai.datas.map(m => {
            return {
              label: m.nama_lengkap,
              value: m.id_pegawai
            }
          })
        }
      }),
      field({
        type: 'textarea',
        key: 'keterangan',
        label: 'Keterangan',
        placeholder: 'Input keterangan',
        required: false,
        readOnly: Boolean(view)
      }),
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <>
      <Card>
        <CardHeader title='Form Penempatan Kamar Santri' />
        <CardContent>
          <Grid container spacing={5} sx={{ paddingBottom: 40 }}>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              {formColumn({
                control: control,
                errors: errors,
                state: state,
                setState: setState,
                fields: fields()
              })}
            </form>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}

export default FormValidationBasic
