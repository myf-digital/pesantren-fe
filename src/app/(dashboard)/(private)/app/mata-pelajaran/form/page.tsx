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
  fetchMataPelajaranById,
  postMataPelajaran,
  postMataPelajaranUpdate,
  resetRedux
} from '../slice/index'
import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchKelompokPelajaranAll } from '../../kelompok-pelajaran/slice'

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

  const store = useAppSelector(state => state.mata_pelajaran)
  const storeKelpel = useAppSelector(state => state.kelompok_pelajaran)

  interface FormData {
    kode_mapel: string
    nama_mapel: string
    keterangan: string
    kkm: string
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
    id_kelpelajaran: {
      value: string
      label: string
    } | null
  }

  const defaultValues = {
    kode_mapel: '',
    nama_mapel: '',
    keterangan: '',
    kkm: '',
    status: {
      value: 'A',
      label: 'Aktif'
    },
    lembaga_type: null,
    id_lembaga: null,
    id_kelpelajaran: null
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
    router.replace('/app/mata-pelajaran/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchKelompokPelajaranAll({}))

    if (id) {
      dispatch(fetchMataPelajaranById(id)).then(res => {
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

          datas.id_kelpelajaran = {
            ...datas.kelompok_pelajaran,
            label: datas?.kelompok_pelajaran?.nama_kelpelajaran,
            value: datas?.kelompok_pelajaran?.id_kelpelajaran
          }

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

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    if (id) {
      // update
      dispatch(
        postMataPelajaranUpdate({
          id: id,
          params: {
            ...state,
            status: state.status.value,
            lembaga_type: state.lembaga_type?.value
          }
        })
      )
    } else {
      dispatch(
        postMataPelajaran({
          ...state,
          status: state.status.value,
          lembaga_type: state.lembaga_type?.value
        })
      )
    }
  }

  const fields = () => {
    return [
      field({
        type: 'text',
        key: 'kode_mapel',
        label: 'Kode',
        placeholder: 'Input kode',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'text',
        key: 'nama_mapel',
        label: 'Name',
        placeholder: 'Input nama',
        required: true,
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
        type: 'select',
        key: 'id_kelpelajaran',
        label: 'Kelompok',
        placeholder: 'Pilih Kelompok',
        required: true,
        options: {
          values: storeKelpel.datas.map(m => {
            return {
              label: m.nama_kelpelajaran,
              value: m.id_kelpelajaran
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'numeral',
        key: 'kkm',
        label: 'KKM',
        placeholder: 'Input KKM',
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
        <CardHeader title='Form Mata Pelajaran' />
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
