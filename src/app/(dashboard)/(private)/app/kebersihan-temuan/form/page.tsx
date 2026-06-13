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
import { fetchKebersihanTemuanById, postKebersihanTemuan, postKebersihanTemuanUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchKebersihanInspeksiAll } from '../../kebersihan-inspeksi/slice'
import DialogLoading from '@/views/onevour/components/dialog-loading'

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const tindakan = searchParams.get('tindakan')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kebersihan_temuan)
  const storeInspeksi = useAppSelector(state => state.kebersihan_inspeksi)

  interface FormData {
    id_inspeksi: {
      value: string
      label: string
    } | null
    kategori: string
    deskripsi: string
    tingkat: {
      value: number
      label: string
    } | null
    perlu_tindak_lanjut: boolean
    foto_path: string
    foto_path_tindakan: string
    petugas: {
      value: string
      label: string
    } | null
    status: {
      value: number
      label: string
    } | null
  }

  const defaultValues = {
    id_inspeksi: null,
    kategori: '',
    deskripsi: '',
    tingkat: null,
    perlu_tindak_lanjut: false,
    foto_path: '',
    foto_path_tindakan: '',
    petugas: null,
    status: null
  }

  const [state, setState] = useState<FormData>(defaultValues)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/kebersihan-temuan/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchKebersihanInspeksiAll({}))

    if (id) {
      dispatch(fetchKebersihanTemuanById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          const tanggalArr = datas.kebersihan_inspeksi?.tanggal?.split('-') ?? []

          datas.petugas = datas.kebersihan_inspeksi?.pegawai?.nama_lengkap
          datas.id_inspeksi = {
            value: datas.kebersihan_inspeksi?.id_inspeksi,
            label: `${datas.kebersihan_inspeksi?.cabang.nama_cabang} - ${datas.kebersihan_inspeksi?.lokasi?.nama_lokasi} - ${tanggalArr[2]}/${tanggalArr[1]}/${tanggalArr[0]} - ${datas.kebersihan_inspeksi?.waktu.slice(0, -3)}`
          }

          datas.tingkat = convertOptionTingkat().find(d => d.value === datas.tingkat)
          datas.status = convertOptionStatus().find(d => d.value === datas.status)

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
        postKebersihanTemuanUpdate({
          id: id,
          params: { ...state, tingkat: state.tingkat?.value, status: state.status?.value || 0 }
        })
      )
    } else {
      dispatch(
        postKebersihanTemuan({
          ...state,
          tingkat: state.tingkat?.value,
          status: state.status?.value || 0
        })
      )
    }
  }

  const convertOptionTingkat = () => {
    return [
      {
        label: 'Ringan',
        value: 1
      },
      {
        label: 'Sedang',
        value: 2
      },
      {
        label: 'Berat',
        value: 3
      }
    ]
  }

  const convertOptionStatus = () => {
    return [
      {
        label: 'Belum Diproses',
        value: 0
      },
      {
        label: 'Sedang Diproses',
        value: 1
      },
      {
        label: 'Sudah Diproses',
        value: 2
      },
      {
        label: 'Tidak Dapat Diproses',
        value: 3
      }
    ]
  }

  const fields = () => {
    let tindakanForm: {}[] = []

    if (tindakan || view) {
      tindakanForm = [
        field({
          type: 'separator',
          label: 'Tindakan'
        }),
        field({
          type: 'select',
          key: 'status',
          label: 'Status',
          placeholder: 'Pilih Status',
          required: true,
          options: {
            values: convertOptionStatus()
          },
          readOnly: Boolean(view)
        }),
        field({
          type: 'image',
          key: 'foto_path_tindakan',
          label: 'Foto Tindakan',
          placeholder: 'Upload foto',
          urlImage: '',
          required: false,
          readOnly: Boolean(view)
        })
      ]
    }

    return [
      field({
        type: 'select',
        key: 'id_inspeksi',
        label: 'Inspeksi',
        placeholder: 'Pilih Inspeksi',
        required: true,
        options: {
          values: storeInspeksi.datas.map(r => {
            const tanggalArr = r.tanggal?.split('-')

            return {
              label: `${r.cabang?.nama_cabang} - ${r.lokasi?.nama_lokasi} - ${tanggalArr[2]}/${tanggalArr[1]}/${tanggalArr[0]} - ${r.waktu.slice(0, -3)}`,
              value: r.id_inspeksi,
              petugas: r.pegawai?.nama_lengkap
            }
          }),
          onChange: (e: any) => {
            if (!e) return

            setValue('petugas', e.petugas)
          }
        },
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      field({
        type: 'text',
        key: 'petugas',
        label: 'Petugas',
        placeholder: 'Input Petugas',
        readOnly: true
      }),
      field({
        type: 'text',
        key: 'kategori',
        label: 'Kategori',
        placeholder: 'Input Kategori',
        required: true,
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      field({
        type: 'select',
        key: 'tingkat',
        label: 'Tingkat',
        placeholder: 'Input Tingkat',
        required: true,
        options: {
          values: convertOptionTingkat()
        },
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      field({
        type: 'textarea',
        key: 'deskripsi',
        label: 'Deskripsi',
        placeholder: 'Input Deskripsi',
        required: false,
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      field({
        type: 'image',
        key: 'foto_path',
        label: 'Foto',
        placeholder: 'Upload foto',
        urlImage: '',
        required: false,
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      field({
        type: 'checkbox',
        key: 'perlu_tindak_lanjut',
        label: 'Perlu Tindak Lanjut',
        placeholder: 'Input Perlu Tindak Lanjut',
        required: false,
        readOnly: Boolean(view) || Boolean(tindakan)
      }),
      ...tindakanForm,
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <DialogLoading open={store.loading} loadingProgress={store.loadingProgress} />
      <CardHeader title='Form Temuan' />
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
