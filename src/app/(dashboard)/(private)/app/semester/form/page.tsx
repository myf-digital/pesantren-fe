'use client'

// ** React Imports
import React, { useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchSemesterById, postSemester, postSemesterUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'

const statusOption = {
  values: [
    {
      label: 'Aktif',
      value: 'Aktif'
    },
    {
      label: 'Nonaktif',
      value: 'Nonaktif'
    }
  ]
}

const semesterOption = [
  {
    label: 'Ganjil',
    value: 'Ganjil',
    nomor: 1
  },
  {
    label: 'Genap',
    value: 'Genap',
    nomor: 2
  }
]

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.semester)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)

  interface FormData {
    nama_semester: {
      value: string
      label: string
    } | null
    keterangan: string
    nomor_urut: any
    status: {
      value: string
      label: string
    }
    id_tahunajaran: {
      value: string
      label: string
    } | null
  }

  const defaultValues = {
    nama_semester: null,
    keterangan: '',
    nomor_urut: '',
    status: {
      value: 'Aktif',
      label: 'Aktif'
    },
    id_tahunajaran: null
  }

  const [state, setState] = useState<FormData>(defaultValues)

  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({ defaultValues })

  useEffect(() => {
    dispatch(
      fetchTahunAjaranAll({
        status: 'Aktif'
      })
    )

    if (id) {
      dispatch(fetchSemesterById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.nama_semester = semesterOption.find(r => r.value === datas.nama_semester)
          datas.status = statusOption.values.find(r => r.value === datas.status) || { label: 'Arsip', value: 'Arsip' }
          datas.id_tahunajaran = {
            value: datas.tahun_ajaran.id_tahunajaran,
            label: datas.tahun_ajaran.tahun_ajaran
          }

          setState(datas)
          reset(datas)
        }
      })
    }
  }, [dispatch, reset])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      onCancel()
    } else {
      toast.error('Error saved: ' + store.crud.message)

      setLoading(false)
    }
  }, [store])

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    if (id) {
      // update
      dispatch(
        postSemesterUpdate({
          id: id,
          params: {
            ...state,
            status: state.status.value,
            nomor_urut: parseInt(state.nomor_urut),
            nama_semester: state.nama_semester?.value
          }
        })
      )
    } else {
      dispatch(
        postSemester({
          ...state,
          status: state.status.value,
          nomor_urut: parseInt(state.nomor_urut),
          nama_semester: state.nama_semester?.value
        })
      )
    }
  }

  const onCancel = () => {
    dispatch(resetRedux())
    router.replace('/app/semester/list')
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_tahunajaran',
        label: 'Tahun Ajaran',
        placeholder: 'Pilih Tahun Ajaran',
        required: true,
        options: {
          values: storeTahunAjaran.datas.map(r => {
            return {
              label: r.tahun_ajaran,
              value: r.id_tahunajaran
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'nama_semester',
        label: 'Semester',
        placeholder: 'Input Semester',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: semesterOption,
          onChange: (e: any) => {
            setValue('nomor_urut', e.nomor)
            setState(prevState => {
              return {
                ...prevState,
                nomor_urut: e.nomor
              }
            })
          }
        }
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
        type: 'numeral',
        key: 'nomor_urut',
        label: 'Nomor Urut',
        placeholder: 'Input Nomor Urut',
        required: true,
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
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <CardHeader title='Form Semester' />
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
