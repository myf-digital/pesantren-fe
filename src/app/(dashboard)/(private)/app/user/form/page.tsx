'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { formatDate } from 'date-fns/format'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchUserById, postUser, postUserUpdate, resetRedux } from '../slice'
import { fetchRoleAll } from '../../role/slice'
import { fetchProvinces, fetchRegenciesByProvince } from '../../areas/slice'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const UserForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.user)

  const [opt, setOpt] = useState<any>({
    roles: [],
    provinces: [],
    regencies: [],
    status: [
      { label: 'Belum Verifikasi', value: 'NV' },
      { label: 'Aktif', value: 'A' }
    ]
  })

  const [state, setState] = useState<any>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    place_of_birth: '',
    date_of_birth: '',
    telepon: '',
    image_foto: '',
    status: { label: 'Belum Verifikasi', value: 'NV' },
    role_id: null,
    province_id: null,
    regency_id: null
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  const loadRegencies = async (provId: string) => {
    try {
      const res = await dispatch(fetchRegenciesByProvince(provId)).unwrap()
      setOpt((prev: any) => ({
        ...prev,
        regencies: (res?.data || []).map((i: any) => ({ label: i.name, value: i.id }))
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const initForm = useCallback(async () => {
    try {
      const [resRole, resProv] = await Promise.all([
        dispatch(fetchRoleAll()).unwrap(),
        dispatch(fetchProvinces()).unwrap()
      ])

      const roleOpts = (resRole?.data || []).map((i: any) => ({ label: i.role_name, value: i.role_id }))
      const provOpts = (resProv?.data || []).map((i: any) => ({ label: i.name, value: i.id }))

      setOpt((prev: any) => ({ ...prev, roles: roleOpts, provinces: provOpts }))

      if (id) {
        const resDetail = await dispatch(fetchUserById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          if (d.area_province_id) {
            await loadRegencies(d.area_province_id)
          }

          const formatted = {
            ...d,
            role_id: d.role ? { label: d.role.role_name, value: d.role.role_id } : null,
            province_id: d.province ? { label: d.province.name, value: d.province.id } : null,
            regency_id: d.regency ? { label: d.regency.name, value: d.regency.id } : null,
            status: opt.status.find((o: any) => o.value === d.status) || { label: 'Belum Verifikasi', value: 'NV' },
            password: ''
          }

          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat referensi data')
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
        router.replace('/app/user/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      role_id: state.role_id,
      province_id: state.province_id,
      regency_id: state.regency_id,
      status: state.status?.value || 'NV',
      date_of_birth: state.date_of_birth ? formatDate(new Date(state.date_of_birth), 'yyyy-MM-dd') : null
    }

    id ? dispatch(postUserUpdate({ id, params: payload })) : dispatch(postUser(payload))
  }

  const fields = () => [
    { section: 'Informasi Akun' },
    field({ type: 'text', key: 'username', label: 'Username', required: true, readOnly: !!view || !!id }),
    field({ type: 'text', key: 'email', label: 'Email', required: true, readOnly: !!view }),
    field({
      type: 'password',
      key: 'password',
      label: 'Password',
      required: !id,
      readOnly: !!view,
      placeholder: id ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password baru'
    }),

    { section: 'Informasi Pribadi' },
    field({ type: 'text', key: 'full_name', label: 'Nama Lengkap', required: true, readOnly: !!view }),
    field({ type: 'text', key: 'place_of_birth', label: 'Tempat Lahir', readOnly: !!view }),
    field({ type: 'date_custom', key: 'date_of_birth', label: 'Tanggal Lahir', readOnly: !!view }),
    field({ type: 'text', key: 'telepon', label: 'No. Telepon / HP', required: true, readOnly: !!view }),

    { section: 'Hak Akses & Alamat' },
    field({
      type: 'select',
      key: 'role_id',
      label: 'Role / Hak Akses',
      options: { values: opt.roles },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'status',
      label: 'Status User',
      options: { values: opt.status },
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'province_id',
      label: 'Provinsi',
      options: {
        values: opt.provinces,
        onChange: (e: any) => {
          setState((prev: any) => ({
            ...prev,
            province_id: e,
            regency_id: null
          }))
          if (e?.value) loadRegencies(e.value)
        }
      },
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'regency_id',
      label: 'Kabupaten/Kota',
      options: { values: opt.regencies },
      readOnly: !state.province_id || !!view
    }),
    field({
      type: 'image',
      key: 'image_foto',
      label: 'Foto Profil',
      placeholder: 'Foto',
      urlImage: '/uploads/resource/',
      readOnly: !!view
    }),

    fieldBuildSubmit({ onCancel: () => router.push('/app/user/list'), loading: store.loading, disabled: !!view })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={id ? (view ? 'Detail User' : 'Edit User') : 'Tambah User'} />
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

export default UserForm
