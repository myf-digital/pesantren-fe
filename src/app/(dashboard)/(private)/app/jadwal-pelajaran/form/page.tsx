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
import { fetchJadwalPelajaranById, postJadwalPelajaran, postJadwalPelajaranUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchTahunAjaranAll } from '../../tahun-ajaran/slice'
import { fetchSemesterAll } from '../../semester/slice'
import { fetchJamPelajaranAll } from '../../jam-pelajaran/slice'
import { fetchGuruMataPelajaranAll } from '../../guru-mata-pelajaran/slice'
import { fetchKelasFormalAll } from '../../kelas-formal/slice'
import { fetchKelasMdaAll } from '../../kelas-mda/slice'
import { fetchLocationAll } from '../../location/slice'

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

const hariOption = {
  values: [
    {
      label: 'Senin',
      value: 'Senin'
    },
    {
      label: 'Selasa',
      value: 'Selasa'
    },
    {
      label: 'Rabu',
      value: 'Rabu'
    },
    {
      label: 'Kamis',
      value: 'Kamis'
    },
    {
      label: 'Jumat',
      value: 'Jumat'
    },
    {
      label: 'Sabtu',
      value: 'Sabtu'
    },
    {
      label: 'Ahad',
      value: 'Ahad'
    }
  ]
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jadwal_pelajaran)
  const storeTahunAjaran = useAppSelector(state => state.tahun_ajaran)
  const storeSemester = useAppSelector(state => state.semester)
  const storeJam = useAppSelector(state => state.jam_pelajaran)
  const storeGuru = useAppSelector(state => state.guru_mata_pelajaran)
  const storeKelasFormal = useAppSelector(state => state.kelas_formal)
  const storeKelasMda = useAppSelector(state => state.kelas_mda)
  const storeLokasi = useAppSelector(state => state.location)

  interface FormData {
    hari: {
      value: string
      label: string
    } | null
    id_kelas: {
      value: string
      label: string
    } | null
    id_tahunajaran: {
      value: string
      label: string
    } | null
    id_gmapel: {
      value: string
      label: string
      lembaga_type: string
      id_tingkat: string
    } | null
    id_jam_pelajaran: {
      value: string
      label: string
    } | null
    id_semester: {
      value: string
      label: string
    } | null
    id_lokasi: {
      value: string
      label: string
    } | null
    keterangan: string
    status: {
      value: string
      label: string
    }
  }

  const defaultValues = {
    hari: null,
    id_kelas: null,
    id_tahunajaran: null,
    id_gmapel: null,
    id_jam_pelajaran: null,
    id_semester: null,
    id_lokasi: null,
    keterangan: '',
    status: {
      value: 'Aktif',
      label: 'Aktif'
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
    router.replace('/app/jadwal-pelajaran/list')
  }, [dispatch, router])

  useEffect(() => {
    dispatch(fetchJamPelajaranAll({}))

    dispatch(
      fetchTahunAjaranAll({
        status: 'Aktif'
      })
    )

    dispatch(fetchGuruMataPelajaranAll({}))

    dispatch(fetchLocationAll({}))

    if (id) {
      dispatch(fetchJadwalPelajaranById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status = statusOption.values.find(r => r.value === datas.status) || { label: 'Arsip', value: 'Arsip' }
          datas.hari = hariOption.values.find(r => r.value === datas.hari)

          if (datas.kelas_formal) {
            datas.id_kelas = {
              value: datas.kelas_formal.id_kelas,
              label: datas.kelas_formal.nama_kelas
            }
          }

          if (datas.kelas_mda) {
            datas.id_kelas = {
              value: datas.kelas_mda.id_kelas_mda,
              label: datas.kelas_mda.nama_kelas_mda
            }
          }

          datas.id_tahunajaran = {
            value: datas.tahun_ajaran?.id_tahunajaran,
            label: datas.tahun_ajaran?.tahun_ajaran
          }
          datas.id_gmapel = {
            lembaga_type: datas.jenis_guru?.lembaga_type,
            id_tingkat: datas.jenis_guru?.id_tingkat,
            value: datas.jenis_guru?.id_jenisguru,
            label: `${datas.jenis_guru?.pegawai?.nama_lengkap} - ${datas.jenis_guru?.mata_pelajaran?.nama_mapel}`
          }
          datas.id_jam_pelajaran = {
            value: datas.jam_pelajaran?.id_jampel,
            label: `${datas.jam_pelajaran?.mulai?.slice(0, -3)} - ${datas.jam_pelajaran?.selesai?.slice(0, -3)}`
          }
          datas.id_lokasi = {
            value: datas.lokasi?.id_lokasi,
            label: datas.lokasi?.nama_lokasi
          }
          datas.id_semester = {
            value: datas.semester?.id_semester,
            label: datas.semester?.nama_semester
          }

          if (datas.id_gmapel?.lembaga_type == 'FORMAL') {
            dispatch(
              fetchKelasFormalAll({
                status: 'Aktif',
                id_tingkat: datas.id_gmapel.id_tingkat
              })
            )
          } else {
            dispatch(
              fetchKelasMdaAll({
                status: 'Aktif',
                id_tingkat: datas.id_gmapel.id_tingkat
              })
            )
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
        postJadwalPelajaranUpdate({
          id: id,
          params: { ...state, status: state.status.value, hari: state.hari?.value }
        })
      )
    } else {
      dispatch(
        postJadwalPelajaran({
          ...state,
          status: state.status.value,
          hari: state.hari?.value
        })
      )
    }
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
          }),
          onChange: async (value: any) => {
            if (!value.value) return

            dispatch(fetchSemesterAll({ status: 'Aktif', id_tahunajaran: value.value }))
            setValue('id_semester', null)
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_semester',
        label: 'Semester',
        placeholder: 'Pilih Semester',
        required: true,
        options: {
          values: storeSemester.datas.map(r => {
            return {
              label: r.nama_semester,
              value: r.id_semester
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'hari',
        label: 'Hari',
        placeholder: 'Pilih Hari',
        required: true,
        options: hariOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_jam_pelajaran',
        label: 'Jam Pelajaran',
        placeholder: 'Pilih Jam Pelajaran',
        required: true,
        options: {
          values: storeJam.datas.map(r => {
            return {
              label: `${r.mulai?.slice(0, -3)} - ${r.selesai?.slice(0, -3)}`,
              value: r.id_jampel
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_gmapel',
        label: 'Guru Mapel',
        placeholder: 'Pilih Guru Mapel',
        required: true,
        options: {
          values: storeGuru.datas.map(r => {
            return {
              lembaga_type: r.lembaga_type,
              id_tingkat: r.id_tingkat,
              label: `${r.pegawai?.nama_lengkap} - ${r.mata_pelajaran?.nama_mapel}`,
              value: r.id_jenisguru
            }
          }),
          onChange: async (value: any) => {
            if (!value.value) return

            setValue('id_kelas', null)
            setState(state => ({ ...state, id_kelas: null }))

            if (value.lembaga_type == 'FORMAL') {
              dispatch(
                fetchKelasFormalAll({
                  status: 'Aktif',
                  id_tingkat: value.id_tingkat
                })
              )
            } else {
              dispatch(
                fetchKelasMdaAll({
                  status: 'Aktif',
                  id_tingkat: value.id_tingkat
                })
              )
            }
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_kelas',
        label: 'Kelas',
        placeholder: 'Pilih Kelas',
        required: true,
        options: {
          values:
            state.id_gmapel?.lembaga_type == 'FORMAL'
              ? storeKelasFormal.datas.map(r => {
                  return {
                    label: r.nama_kelas,
                    value: r.id_kelas
                  }
                })
              : storeKelasMda.datas.map(r => {
                  return {
                    label: r.nama_kelas_mda,
                    value: r.id_kelas_mda
                  }
                })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_lokasi',
        label: 'Lokasi',
        placeholder: 'Pilih Lokasi',
        required: true,
        options: {
          values: storeLokasi.datas.map(r => {
            return {
              label: r.nama_lokasi,
              value: r.id_lokasi
            }
          })
        },
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
        placeholder: 'Input Keterangan',
        required: false,
        readOnly: Boolean(view)
      }),
      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <CardHeader title='Form Jadwal Pelajaran' />
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
