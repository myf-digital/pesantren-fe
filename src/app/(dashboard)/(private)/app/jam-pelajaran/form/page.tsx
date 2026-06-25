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

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import {
  fetchLembagaAll,
  fetchLembagaKepesantrenanAll,
  fetchJamPelajaranById,
  postJamPelajaran,
  postJamPelajaranUpdate,
  resetRedux
} from '../slice/index'
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchJenisJamPelajaranAll } from '../../jenis-jam-pelajaran/slice'

const statusOption = {
  values: [
    {
      label: 'Aktif',
      value: 'A'
    },
    {
      label: 'Nonaktif',
      value: 'N'
    }
  ]
}

const typeOption = [
  {
    label: 'Formal',
    value: 'FORMAL'
  },
  {
    label: 'Pesantren',
    value: 'PESANTREN'
  }
]

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.jam_pelajaran)
  const storeJenisJam = useAppSelector(state => state.jenis_jam_pelajaran)

  interface FormData {
    nama_jampel: string
    keterangan: string
    mulai: string
    selesai: string
    status: {
      value: string
      label: string
    }
    lembaga_type: {
      value: string
      label: string
    } | null
    id_lembaga: {
      value: string
      label: string
    } | null
    id_jenisjam: {
      value: string
      label: string
    } | null
  }

  const defaultValues = {
    kode_mapel: '',
    nama_jampel: '',
    keterangan: '',
    mulai: '',
    selesai: '',
    status: {
      value: 'A',
      label: 'Aktif'
    },
    lembaga_type: null,
    id_lembaga: null,
    id_jenisjam: null
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
    router.replace('/app/jam-pelajaran/list')
  }, [dispatch, router])

  const timeToDate = (time: any) => {
    if (!time) return null

    const [hour, minute] = time.split(':').map(Number)

    const date = new Date()

    date.setHours(hour, minute, 0, 0)

    return date
  }

  useEffect(() => {
    dispatch(fetchLembagaAll({}))
    dispatch(fetchJenisJamPelajaranAll({}))

    if (id) {
      dispatch(fetchJamPelajaranById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.lembaga_type = typeOption.find(r => r.value === datas.lembaga_type)
          datas.status = statusOption.values.find(r => r.value === datas.status)

          if (datas.lembaga_formal) {
            datas.id_lembaga = {
              ...datas.lembaga_formal,
              label: datas?.lembaga_formal?.nama_lembaga,
              value: datas?.lembaga_formal?.id_lembaga
            }
          }

          if (datas.lembaga_kepesantrenan) {
            datas.id_lembaga = {
              ...datas.lembaga_kepesantrenan,
              label: datas?.lembaga_kepesantrenan?.nama_lembaga,
              value: datas?.lembaga_kepesantrenan?.id_lembaga
            }
          }

          datas.id_jenisjam = {
            ...datas.jenis_jam_pelajaran,
            label: datas?.jenis_jam_pelajaran?.nama_jenis_jam,
            value: datas?.jenis_jam_pelajaran?.id_jenisjam
          }
          datas.mulai = datas.mulai ? timeToDate(datas.mulai) : null
          datas.selesai = datas.selesai ? timeToDate(datas.selesai) : null

          if (datas.lembaga_type.value == 'FORMAL') {
            dispatch(fetchLembagaAll({}))
          } else {
            dispatch(fetchLembagaKepesantrenanAll({}))
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

  const dateToTime = (date: any) => {
    const newDate = new Date(date)

    return newDate
      .toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      .replace(/\./g, ':')
  }

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    if (id) {
      // update
      dispatch(
        postJamPelajaranUpdate({
          id: id,
          params: {
            ...state,
            status: state.status.value,
            lembaga_type: state?.lembaga_type?.value || null,
            mulai: state.mulai ? dateToTime(state.mulai) : null,
            selesai: state.selesai ? dateToTime(state.selesai) : null
          }
        })
      )
    } else {
      dispatch(
        postJamPelajaran({
          ...state,
          status: state.status.value,
          lembaga_type: state?.lembaga_type?.value || null,
          mulai: state.mulai ? dateToTime(state.mulai) : null,
          selesai: state.selesai ? dateToTime(state.selesai) : null
        })
      )
    }
  }

  const fields = () => {
    return [
      field({
        type: 'text',
        key: 'nama_jampel',
        label: 'Name',
        placeholder: 'Input nama',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_jenisjam',
        label: 'Jenis Jam',
        placeholder: 'Pilih Jenis Jam',
        required: true,
        options: {
          values: storeJenisJam.datas.map(m => {
            return {
              label: m.nama_jenis_jam,
              value: m.id_jenisjam
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'lembaga_type',
        label: 'Tipe',
        placeholder: 'Pilih Tipe',
        required: true,
        options: {
          values: typeOption,
          onChange: (e: any) => {
            if (!e) return

            setValue('id_lembaga', null)
            setState(state => ({ ...state, id_lembaga: null }))

            if (e.value == 'FORMAL') {
              dispatch(fetchLembagaAll({}))
            } else {
              dispatch(fetchLembagaKepesantrenanAll({}))
            }
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_lembaga',
        label: 'Lembaga',
        placeholder: 'Pilih Lembaga',
        required: true,
        options: {
          values:
            state.lembaga_type?.value == 'FORMAL'
              ? store.lembaga.map(m => {
                  return {
                    label: m.nama_lembaga,
                    value: m.id_lembaga
                  }
                })
              : store.lembaga_kepesantrenan.map(m => {
                  return {
                    label: m.nama_lembaga,
                    value: m.id_lembaga
                  }
                })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'time',
        key: 'mulai',
        label: 'Waktu Mulai',
        placeholder: 'Input Waktu Mulai',
        required: true,
        interval: 15,
        readOnly: Boolean(view)
      }),
      field({
        type: 'time',
        key: 'selesai',
        label: 'Waktu Selesai',
        placeholder: 'Input Waktu Selesai',
        required: true,
        interval: 15,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'status',
        label: 'Status',
        placeholder: 'Pilih Status',
        required: true,
        options: statusOption,
        readOnly: Boolean(view)
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
        <CardHeader title='Form Jam Pelajaran' />
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
    </>
  )
}

export default FormValidationBasic
