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
import { fetchGuruPenggantiById, postGuruPengganti, postGuruPenggantiUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import { fetchJadwalPelajaranAll } from '../../jadwal-pelajaran/slice'
import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'

const statusOption = {
  values: [
    {
      label: 'Menunggu',
      value: 'Menunggu'
    },
    {
      label: 'Disetujui',
      value: 'Disetujui'
    },
    {
      label: 'Ditolak',
      value: 'Ditolak'
    }
  ]
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.guru_pengganti)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)
  const storeJadwal = useAppSelector(state => state.jadwal_pelajaran)

  interface FormData {
    id_jadwal: {
      value: string
      label: string
    } | null
    id_guru_asli: {
      value: string
      label: string
    } | null
    id_guru_pengganti: {
      value: string
      label: string
    } | null
    tanggal: string
    alasan: string
    status_approval: {
      value: string
      label: string
    }
  }

  const defaultValues = {
    id_jadwal: null,
    id_guru_asli: null,
    id_guru_pengganti: null,
    tanggal: '',
    alasan: '',
    status_approval: {
      value: 'Menunggu',
      label: 'Menunggu'
    }
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
    router.replace('/app/guru-pengganti/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchJadwalPelajaranAll({ status: 'Aktif' }))
    dispatch(fetchPegawaiAll({}))

    if (id) {
      dispatch(fetchGuruPenggantiById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status_approval = statusOption.values.find(r => r.value === datas.status_approval)

          datas.id_jadwal = {
            value: datas.jadwal_pelajaran?.id_jadwal,
            label: `${datas.jadwal_pelajaran?.hari} / ${datas.jadwal_pelajaran?.jam_pelajaran?.mulai?.slice(0, -3)} - ${datas.jadwal_pelajaran?.jam_pelajaran?.selesai?.slice(0, -3)} / ${datas.jadwal_pelajaran?.kelas_formal ? datas.jadwal_pelajaran?.kelas_formal?.nama_kelas : datas.jadwal_pelajaran?.kelas_mda?.nama_kelas_mda} (${datas.jadwal_pelajaran?.kelas_formal ? datas.jadwal_pelajaran?.kelas_formal?.lembaga?.nama_lembaga : datas.jadwal_pelajaran?.kelas_mda?.lembaga?.nama_lembaga})`
          }
          datas.id_guru_asli = {
            value: datas.guru_asli?.id_pegawai,
            label: datas.guru_asli?.nama_lengkap
          }
          datas.id_guru_pengganti = {
            value: datas.guru_pengganti?.id_pegawai,
            label: datas.guru_pengganti?.nama_lengkap
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
        postGuruPenggantiUpdate({
          id: id,
          params: { ...state, status_approval: state.status_approval.value }
        })
      )
    } else {
      dispatch(
        postGuruPengganti({
          ...state,
          status_approval: state.status_approval.value
        })
      )
    }
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_jadwal',
        label: 'Jadwal Pelajaran',
        placeholder: 'Pilih Jadwal Pelajaran',
        required: true,
        options: {
          values: storeJadwal.datas.map(r => {
            return {
              label: `${r.hari} / ${r.jam_pelajaran?.mulai?.slice(0, -3)} - ${r.jam_pelajaran?.selesai?.slice(0, -3)} / ${r.kelas_formal ? r.kelas_formal?.nama_kelas : r.kelas_mda?.nama_kelas_mda} (${r.kelas_formal ? r.kelas_formal?.lembaga?.nama_lembaga : r.kelas_mda?.lembaga?.nama_lembaga})`,
              value: r.id_jadwal,
              guru: r.jenis_guru
            }
          })
        },
        onChange: (e: any) => {
          if (!e) return

          setValue('id_guru_asli', {
            label: e.guru?.pegawai?.nama_lengkap,
            value: e.guru?.pegawai?.id_pegawai
          } as any)

          setState(prevState => {
            return {
              ...prevState,
              id_guru_asli: {
                label: e.guru?.pegawai?.nama_lengkap,
                value: e.guru?.pegawai?.id_pegawai
              }
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'date',
        key: 'tanggal',
        label: 'Tanggal',
        required: true,
        readOnly: Boolean(view),
        placeholder: 'dd/mm/yyyy'
      }),
      field({
        type: 'select',
        key: 'id_guru_asli',
        label: 'Guru Asli',
        placeholder: 'Pilih Guru Asli',
        required: true,
        readOnly: true
      }),
      field({
        type: 'select',
        key: 'id_guru_pengganti',
        label: 'Guru Pengganti',
        placeholder: 'Pilih Guru Pengganti',
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
        type: 'select',
        key: 'status_approval',
        label: 'Status Approval',
        placeholder: 'Pilih Status Approval',
        required: true,
        options: statusOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'textarea',
        key: 'alasan',
        label: 'Alasan',
        placeholder: 'Input Alasan',
        required: false,
        readOnly: Boolean(view)
      }),
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <DatePickerWrapper>
      <Card>
        <CardHeader title='Form Guru Pengganti' />
        <CardContent sx={{ marginBottom: '50px' }}>
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
    </DatePickerWrapper>
  )
}

export default FormValidationBasic
