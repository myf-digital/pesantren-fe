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

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchJadwalInspeksiKebersihanById,
  postJadwalInspeksiKebersihan,
  postJadwalInspeksiKebersihanUpdate,
  resetRedux
} from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchMasterSlotWaktuAll } from '../../master-slot-waktu/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'

const harisOption = {
  values: [
    {
      label: 'Senin',
      value: 1
    },
    {
      label: 'Selasa',
      value: 2
    },
    {
      label: 'Rabu',
      value: 3
    },
    {
      label: 'Kamis',
      value: 4
    },
    {
      label: 'Jumat',
      value: 5
    },
    {
      label: 'Sabtu',
      value: 6
    },
    {
      label: 'Ahad',
      value: 7
    }
  ]
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jadwal_inspeksi_kebersihan)
  const storeCabang = useAppSelector(state => state.cabang)
  const storeSlot = useAppSelector(state => state.master_slot_waktu)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)

  interface FormData {
    id_cabang: {
      value: string
      label: string
    } | null
    id_petugas: {
      value: string
      label: string
    } | null
    kode_slot: {
      value: string
      label: string
    } | null
    keterangan: string
    hari: {
      label: string
      value: number
    }[]
    is_active: boolean
  }

  const defaultValues = {
    id_cabang: null,
    id_petugas: null,
    kode_slot: null,
    hari: [],
    keterangan: '',
    is_active: false
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
    router.replace('/app/jadwal-inspeksi-kebersihan/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchPegawaiAll({}))

    dispatch(fetchCabangAll({}))

    dispatch(
      fetchMasterSlotWaktuAll({
        is_active: true
      })
    )

    if (id) {
      dispatch(fetchJadwalInspeksiKebersihanById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          const dayList = Array.isArray(datas.hari) ? datas.hari : [datas.hari]
          datas.hari = harisOption.values.filter(r => dayList.includes(r.value))
          datas.id_cabang = {
            value: datas.cabang?.id_cabang,
            label: datas.cabang?.nama_cabang
          }
          datas.kode_slot = {
            value: datas.master_slot_waktu?.kode_slot,
            label: datas.master_slot_waktu?.kode_slot
          }
          datas.id_petugas = {
            value: datas.pegawai?.id_pegawai,
            label: datas.pegawai?.nama_lengkap
          }

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
      ...state,
      hari: Array.isArray(state.hari) ? state.hari.map(h => h.value) : []
    }

    if (id) {
      // update
      dispatch(
        postJadwalInspeksiKebersihanUpdate({
          id: id,
          params: payload
        })
      )
    } else {
      dispatch(
        postJadwalInspeksiKebersihan(payload)
      )
    }
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_cabang',
        label: 'Cabang',
        placeholder: 'Pilih Cabang',
        required: true,
        options: {
          values: storeCabang.datas.map(r => {
            return {
              label: r.nama_cabang,
              value: r.id_cabang
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select-multi',
        key: 'hari',
        label: 'Hari',
        placeholder: 'Pilih Hari',
        required: true,
        options: harisOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'kode_slot',
        label: 'Slot',
        placeholder: 'Pilih Slot',
        required: true,
        options: {
          values: storeSlot.datas.map(r => {
            return {
              label: `${r.kode_slot} (${r.jam_mulai?.slice(0, -3)} - ${r.jam_selesai?.slice(0, -3)})`,
              value: r.kode_slot
            }
          })
        },
        readOnly: Boolean(view)
      }),

      field({
        type: 'select',
        key: 'id_petugas',
        label: 'Petugas',
        placeholder: 'Pilih Petugas',
        required: true,
        options: {
          values: storePegawai.pegawai.map(r => {
            return {
              label: r.nama_lengkap,
              value: r.id_pegawai
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'checkbox',
        key: 'is_active',
        label: 'Aktif',
        placeholder: 'Input Aktif',
        required: false,
        readOnly: Boolean(view)
      }),
      field({
        type: 'textarea',
        key: 'keterangan',
        label: 'Keterangan',
        placeholder: 'Input Keterangan',
        required: false,
        readOnly: Boolean(view)
      }),

      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <CardHeader title='Form Jadwal Inspeksi Kebersihan' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          {formColumn({
            control: control,
            errors: errors,
            state: state,
            setState: setState,
            fields: fields()
          })}
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationBasic
