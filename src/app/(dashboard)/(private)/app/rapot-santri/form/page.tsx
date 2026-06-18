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
import { fetchRapotSantriById, postRapotSantri, postRapotSantriUpdate, resetRedux } from '../slice'

const statusOption = {
  values: [
    {
      label: 'Aktif',
      value: 'Aktif'
    },
    {
      label: 'Arsip',
      value: 'Arsip'
    }
  ]
}

const semesterOption = {
  values: [
    {
      label: 'Ganjil',
      value: 'GANJIL'
    },
    {
      label: 'Genap',
      value: 'GENAP'
    }
  ]
}

const defaultValues = {
  id_santri: null,
  tahun_ajaran: '',
  semester: null,
  file_rapot: '',
  file_rapot_mda: '',
  status: {
    value: 'Aktif',
    label: 'Aktif'
  }
}

const RapotSantriForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.rapot_santri)
  const storeSantri = useAppSelector(state => state.santri)

  const [state, setState] = useState<any>(defaultValues)
  const [fileObject, setFileObject] = useState<File | null>(null)
  const [fileObjectMda, setFileObjectMda] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/rapot-santri/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchSantriAll({ status: '1' }))

    if (id) {
      dispatch(fetchRapotSantriById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status = {
            value: datas.status || 'Aktif',
            label: datas.status || 'Aktif'
          }
          datas.id_santri = {
            value: datas.id_santri || '',
            label: datas.santri?.fullname || ''
          }

          const semester = semesterOption.values.find(s => s.value == datas.semester)
          if (semester) {
            datas.semester = semester
          } else {
            datas.semester = {
              value: datas.semester,
              label: datas.semester
            }
          }

          setState(datas)
          reset(datas)
        }
      })
    }
  }, [dispatch, id, reset])

  useEffect(() => {
    if (!state.file_rapot) {
      setFileObject(null)
    }
  }, [state.file_rapot])

  useEffect(() => {
    if (!state.file_rapot_mda) {
      setFileObject(null)
    }
  }, [state.file_rapot_mda])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Rapot Santri berhasil disimpan')
      onCancel()
    } else {
      toast.error('Gagal menyimpan Rapot Santri: ' + (store.crud.message || 'Error'))
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
    if (!state.tahun_ajaran) {
      toast.error('Tahun Ajaran wajib dipilih')
      setLoading(false)
      return
    }
    if (!state.semester?.value) {
      toast.error('Semester wajib dipilih')
      setLoading(false)
      return
    }
    if (!id && !fileObject) {
      toast.error('File Rapot wajib diunggah')
      setLoading(false)
      return
    }

    const payload = {
      id_santri: state.id_santri.value,
      tahun_ajaran: state.tahun_ajaran,
      semester: state.semester.value,
      status: state.status.value,
      file_rapot: fileObject,
      file_rapot_mda: fileObjectMda
    }

    if (id) {
      dispatch(
        postRapotSantriUpdate({
          id,
          params: payload
        })
      )
    } else {
      dispatch(postRapotSantri(payload))
    }
  }

  const fields = () => {
    const list: any[] = [
      field({
        type: 'select',
        key: 'id_santri',
        label: 'Santri',
        placeholder: 'Pilih Santri',
        required: true,
        readOnly: Boolean(view),
        options: {
          values: (storeSantri.datas || []).map(m => ({
            label: m.fullname,
            value: m.id_santri
          }))
        }
      }),
      field({
        type: 'text',
        key: 'tahun_ajaran',
        label: 'Tahun Ajaran',
        placeholder: 'Contoh: AJARAN 2022/2023',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'semester',
        label: 'Semester',
        placeholder: 'Pilih Semester',
        required: true,
        readOnly: Boolean(view),
        options: semesterOption
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
      field({
        type: 'file',
        key: 'file_rapot',
        label: 'Rapot Kelas Formal (PDF)',
        required: !id,
        readOnly: Boolean(view),
        accept: 'application/pdf',
        helperText: 'Hanya mendukung file PDF (maks. 10MB)',
        options: {
          onChange: (file: File) => {
            setFileObject(file)
            setState((prev: any) => ({
              ...prev,
              file_rapot: file.name
            }))
          }
        },
        urlImage: fileObject
          ? URL.createObjectURL(fileObject)
          : state.file_rapot && typeof state.file_rapot === 'string'
            ? state.file_rapot.startsWith('http')
              ? state.file_rapot
              : `${process.env.NEXT_PUBLIC_API_URL || ''}${state.file_rapot.startsWith('/') ? '' : '/'}${state.file_rapot}`
            : ''
      }),
      field({
        type: 'file',
        key: 'file_rapot_mda',
        label: 'Rapot Kelas MDA (PDF)',
        required: !id,
        readOnly: Boolean(view),
        accept: 'application/pdf',
        helperText: 'Hanya mendukung file PDF (maks. 10MB)',
        options: {
          onChange: (file: File) => {
            setFileObjectMda(file)
            setState((prev: any) => ({
              ...prev,
              file_rapot_mda: file.name
            }))
          }
        },
        urlImage: fileObject
          ? URL.createObjectURL(fileObject)
          : state.file_rapot_mda && typeof state.file_rapot_mda === 'string'
            ? state.file_rapot_mda.startsWith('http')
              ? state.file_rapot_mda
              : `${process.env.NEXT_PUBLIC_API_URL || ''}${state.file_rapot_mda.startsWith('/') ? '' : '/'}${state.file_rapot_mda}`
            : ''
      })
    ]
    list.push(fieldBuildSubmit({ onCancel, loading, disabled: Boolean(view) }))

    return list
  }

  const getTitle = () => {
    if (id) {
      return view ? 'Detail Rapot Santri' : 'Ubah Rapot Santri'
    }
    return 'Tambah Rapot Santri'
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

export default RapotSantriForm
