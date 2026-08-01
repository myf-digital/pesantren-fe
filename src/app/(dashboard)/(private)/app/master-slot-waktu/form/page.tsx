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

import { formatDate } from 'date-fns/format'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchMasterSlotWaktuById, postMasterSlotWaktu, postMasterSlotWaktuUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const setTime = (hour: number, minute = 0) => {
  const date = new Date()

  date.setHours(hour, minute, 0, 0)

  return date
}

const timeToDate = (time: any) => {
  if (!time) return null

  const [hour, minute] = time.split(':').map(Number)

  const date = new Date()

  date.setHours(hour, minute, 0, 0)

  return date
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.master_slot_waktu)

  interface FormData {
    kode_slot: string
    jam_mulai: string
    jam_selesai: string
    keterangan: string
    is_active: boolean
  }

  const defaultValues = {
    kode_slot: '',
    jam_mulai: '',
    jam_selesai: '',
    keterangan: '',
    is_active: false
  }

  const [state, setState] = useState<FormData>(defaultValues)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/master-slot-waktu/list')
  }, [dispatch, router])

  useEffect(() => {
    if (id) {
      dispatch(fetchMasterSlotWaktuById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.jam_mulai = datas.jam_mulai ? timeToDate(datas.jam_mulai) : null
          datas.jam_selesai = datas.jam_selesai ? timeToDate(datas.jam_selesai) : null

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

    if (id) {
      // update
      dispatch(
        postMasterSlotWaktuUpdate({
          id: id,
          params: {
            ...state,
            jam_mulai: formatDate(state.jam_mulai, 'HH:mm'),
            jam_selesai: formatDate(state.jam_selesai, 'HH:mm')
          }
        })
      )
    } else {
      dispatch(
        postMasterSlotWaktu({
          ...state,
          jam_mulai: formatDate(state.jam_mulai, 'HH:mm'),
          jam_selesai: formatDate(state.jam_selesai, 'HH:mm')
        })
      )
    }
  }

  const fields = () => {
    return [
      field({
        type: 'text',
        key: 'kode_slot',
        label: 'Kode Slot',
        placeholder: 'Input Kode Slot',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'time',
        key: 'jam_mulai',
        label: 'Jam Mulai',
        placeholder: 'Input Jam Mulai',
        required: true,
        readOnly: Boolean(view),
        options: {
          onChange: async (value: any) => {
            setValue('jam_selesai', value)
          }
        }
      }),
      field({
        type: 'time',
        key: 'jam_selesai',
        label: 'Jam Selesai',
        placeholder: 'Input Jam Selesai',
        required: true,
        readOnly: Boolean(view),
        minTime: state.jam_mulai ? state.jam_mulai : null,
        maxTime: state.jam_mulai ? setTime(23, 59) : null
      }),
      field({
        type: 'textarea',
        key: 'keterangan',
        label: 'Keterangan',
        placeholder: 'Input Keterangan',
        required: false,
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
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <CardHeader title='Form Master Slot Waktu' />
      <CardContent sx={{ marginBottom: 20 }}>
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
