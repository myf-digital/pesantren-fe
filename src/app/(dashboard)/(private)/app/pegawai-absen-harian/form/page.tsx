'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { resetRedux } from '../slice/index'
import { fetchJamKerjaById, postJamKerja, postJamKerjaUpdate } from '../../pegawai-jam-kerja/slice/index'
import { fetchPegawaiPage } from '../../pegawai/slice/index'
import { fetchLocationPage } from '../../location/slice/index'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const JamKerjaForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.jam_kerja_pegawai)

  const [opt, setOpt] = useState<any>({
    pegawais: [],
    lokasis: [],
    status: [
      { label: 'Aktif', value: true },
      { label: 'Tidak Aktif', value: false }
    ]
  })

  const [state, setState] = useState<any>({
    id_pegawai: null,
    id_lokasi: null,
    waktu_mulai: '',
    waktu_selesai: '',
    keterangan: '',
    is_active: { label: 'Aktif', value: true }
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  const initForm = useCallback(async () => {
    try {
      // Mengambil referensi data All Pegawai & All Lokasi Kerja global tanpa paginasi
      const [resPegawai, resLokasi] = await Promise.all([
        dispatch(fetchPegawaiPage({ perPage: 1000, status_pegawai: 'Aktif' })).unwrap(),
        dispatch(fetchLocationPage({ perPage: 1000 })).unwrap()
      ])

      const pegawaiOpts = (resPegawai?.data?.values || []).map((i: any) => ({
        label: `${i.nama_lengkap} (NIK: ${i.nik || '-'})`,
        value: i.id_pegawai
      }))

      const lokasiOpts = (resLokasi?.data?.values || []).map((i: any) => ({
        label: `${i.nama_lokasi}`,
        value: i.id_lokasi
      }))

      setOpt((prev: any) => ({ ...prev, pegawais: pegawaiOpts, lokasis: lokasiOpts }))

      if (id) {
        const resDetail = await dispatch(fetchJamKerjaById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          const formatTimeForInput = (timeString: string) => {
            if (!timeString) return null

            const [hours, minutes] = timeString.split(':')

            // Buat objek Date tiruan menggunakan tanggal hari ini namun dengan Jam & Menit yang sesuai
            const dummyDate = new Date()
            dummyDate.setHours(parseInt(hours, 10))
            dummyDate.setMinutes(parseInt(minutes, 10))
            dummyDate.setSeconds(0)
            dummyDate.setMilliseconds(0)

            return dummyDate
          }

          const formatted = {
            ...d,
            id_pegawai: pegawaiOpts.find((o: any) => o.value === d.id_pegawai) || null,
            id_lokasi: lokasiOpts.find((o: any) => o.value === d.id_lokasi) || null,
            waktu_mulai: formatTimeForInput(d.waktu_mulai),
            waktu_selesai: formatTimeForInput(d.waktu_selesai),
            is_active:
              d.is_active !== undefined
                ? d.is_active
                  ? { label: 'Aktif', value: true }
                  : { label: 'Tidak Aktif', value: false }
                : { label: 'Aktif', value: true }
          }

          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat referensi data jam kerja')
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message)
        dispatch(resetRedux())
        router.replace('/app/pegawai-jam-kerja/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const timeToDate = (time: any) => {
    if (!time) return null

    const [hour, minute] = time.split(':').map(Number)

    const date = new Date()

    date.setHours(hour, minute, 0, 0)

    return date
  }

  const onSubmit = (data: any) => {
    const formatTimeToString = (timeValue: any) => {
      if (!timeValue) return null

      if (timeValue instanceof Date) {
        const hours = String(timeValue.getHours()).padStart(2, '0')
        const minutes = String(timeValue.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }

      if (typeof timeValue === 'string') {
        return timeValue.substring(0, 5)
      }

      return null
    }

    const payload = {
      ...data,
      id_pegawai: data.id_pegawai?.value || null,
      id_lokasi: data.id_lokasi?.value || null,
      is_active: data.is_active?.value,
      waktu_mulai: formatTimeToString(data.waktu_mulai),
      waktu_selesai: formatTimeToString(data.waktu_selesai),
      keterangan: data.keterangan || ''
    }

    id ? dispatch(postJamKerjaUpdate({ id, params: payload })) : dispatch(postJamKerja([payload])) // API batch insert format array
  }

  const fields = () => [
    { section: 'Penempatan Pegawai & Lokasi' },
    field({
      type: 'select',
      key: 'id_pegawai',
      label: 'Pegawai',
      options: { values: opt.pegawais },
      required: true,
      readOnly: !!view || !!id
    }),
    field({
      type: 'select',
      key: 'id_lokasi',
      label: 'Lokasi Kerja Penugasan',
      options: { values: opt.lokasis },
      required: true,
      readOnly: !!view
    }),

    { section: 'Konfigurasi Waktu Operasional' },
    // Menggunakan type 'text' dengan placeholder format jam jika komponen clock khusus belum di-binding global
    field({
      type: 'time',
      key: 'waktu_mulai',
      label: 'Jam Masuk Kerja (Contoh: 08:00)',
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'time',
      key: 'waktu_selesai',
      label: 'Jam Pulang Kerja (Contoh: 17:00)',
      required: true,
      readOnly: !!view
    }),

    { section: 'Informasi Tambahan' },
    field({
      type: 'select',
      key: 'is_active',
      label: 'Status Jam Kerja',
      options: { values: opt.status },
      readOnly: !!view
    }),
    field({
      type: 'textarea',
      key: 'keterangan',
      label: 'Keterangan / Memo Operasional',
      readOnly: !!view
    }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/pegawai-jam-kerja/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={id ? (view ? 'Detail Acuan Jam Kerja' : 'Edit Acuan Jam Kerja') : 'Tambah Acuan Jam Kerja'}
          />
          <Divider sx={{ m: '0 !important' }} />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {formColumn({ control, errors, state, setState, fields: fields() })}
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default JamKerjaForm
