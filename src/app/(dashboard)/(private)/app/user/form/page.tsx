'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Divider,
  Button,
  Typography,
  IconButton,
  Radio,
  FormControlLabel,
  Autocomplete,
  TextField,
  Box
} from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { formatDate } from 'date-fns/format'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchUserById, postUser, postUserUpdate, resetRedux } from '../slice'
import { fetchRoleAll } from '../../role/slice'
import { fetchProvinces, fetchRegenciesByProvince } from '../../areas/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchOrgUnitAll } from '../../organisasi/slice'
import { fetchLocationAll } from '../../location/slice'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

interface UserRoleItem {
  id_resource_role?: string
  role_id: { label: string; value: string } | null
  id_pegawai?: { label: string; value: string } | null
  id_cabang?: { label: string; value: string } | null
  id_orgunit?: { label: string; value: string } | null
  id_lembaga?: string | null
  lembaga_type?: string | null
  is_default: boolean
}

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
    pegawais: [],
    cabangs: [],
    orgunits: [],
    lokasis: [],
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
    status: { label: 'Aktif', value: 'A' },
    role_id: null,
    province_id: null,
    regency_id: null,
    id_eksternal: null
  })

  const [userRoles, setUserRoles] = useState<UserRoleItem[]>([
    {
      role_id: null,
      id_pegawai: null,
      id_cabang: null,
      id_orgunit: null,
      id_lembaga: null,
      lembaga_type: null,
      is_default: true
    }
  ])

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
      const [resRole, resProv, resPegawai, resCabang, resOrgUnit, resLokasi] = await Promise.all([
        dispatch(fetchRoleAll()).unwrap(),
        dispatch(fetchProvinces()).unwrap(),
        dispatch(fetchPegawaiAll({})).unwrap(),
        dispatch(fetchCabangAll({})).unwrap(),
        dispatch(fetchOrgUnitAll({})).unwrap(),
        dispatch(fetchLocationAll({})).unwrap()
      ])

      const roleOpts = (resRole?.data || []).map((i: any) => ({ label: i.role_name, value: i.role_id }))
      const provOpts = (resProv?.data || []).map((i: any) => ({ label: i.name, value: i.id }))
      const pegawaiOpts = (resPegawai?.data || []).map((i: any) => ({ label: i.nama_lengkap, value: i.id_pegawai }))
      const cabangOpts = (resCabang?.data || []).map((i: any) => ({ label: i.nama_cabang, value: i.id_cabang }))
      const orgUnitOpts = (resOrgUnit?.data || []).map((i: any) => ({ label: i.nama_orgunit, value: i.id_orgunit }))
      const lokasiOpts = (resLokasi?.data || []).map((i: any) => ({ label: i.nama_lokasi, value: i.id_lokasi }))

      setOpt((prev: any) => ({
        ...prev,
        roles: roleOpts,
        provinces: provOpts,
        pegawais: pegawaiOpts,
        cabangs: cabangOpts,
        orgunits: orgUnitOpts,
        lokasis: lokasiOpts
      }))

      if (id) {
        const resDetail = await dispatch(fetchUserById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          if (d.area_province_id) {
            await loadRegencies(d.area_province_id)
          }

          const matchedPegawai = (resPegawai?.data || []).find((p: any) => p.id_pegawai === d.id_eksternal)

          const formatted = {
            ...d,
            role_id: d.role ? { label: d.role.role_name, value: d.role.role_id } : null,
            province_id: d.province ? { label: d.province.name, value: d.province.id } : null,
            regency_id: d.regency ? { label: d.regency.name, value: d.regency.id } : null,
            id_eksternal: matchedPegawai
              ? { label: matchedPegawai.nama_lengkap, value: matchedPegawai.id_pegawai }
              : d.pegawai
                ? { label: d.pegawai.nama_lengkap, value: d.pegawai.id_pegawai }
                : null,
            status: opt.status.find((o: any) => o.value === d.status) || { label: 'Aktif', value: 'A' },
            password: ''
          }

          setState(formatted)
          reset(formatted)

          // Load user_roles if available
          if (Array.isArray(d.user_roles) && d.user_roles.length > 0) {
            const mappedRoles: UserRoleItem[] = d.user_roles.map((r: any) => ({
              id_resource_role: r.id_resource_role,
              role_id: r.role ? { label: r.role.role_name, value: r.role.role_id } : null,
              id_pegawai: r.pegawai ? { label: r.pegawai.nama_lengkap, value: r.pegawai.id_pegawai } : null,
              id_cabang: r.cabang ? { label: r.cabang.nama_cabang, value: r.cabang.id_cabang } : null,
              id_orgunit: r.organizationUnit
                ? { label: r.organizationUnit.nama_orgunit, value: r.organizationUnit.id_orgunit }
                : null,
              id_lembaga: r.id_lembaga || null,
              lembaga_type: r.lembaga_type || null,
              is_default: r.is_default === 1
            }))

            setUserRoles(mappedRoles)
          } else if (d.role) {
            setUserRoles([
              {
                role_id: { label: d.role.role_name, value: d.role.role_id },
                id_pegawai: matchedPegawai
                  ? { label: matchedPegawai.nama_lengkap, value: matchedPegawai.id_pegawai }
                  : null,
                id_cabang: null,
                id_orgunit: null,
                id_lembaga: null,
                lembaga_type: null,
                is_default: true
              }
            ])
          }
        }
      }
    } catch (err) {
      console.error(err)
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

  const handleAddUserRole = () => {
    setUserRoles(prev => [
      ...prev,
      {
        role_id: null,
        id_pegawai: state.id_eksternal || null,
        id_cabang: null,
        id_orgunit: null,
        id_lembaga: null,
        lembaga_type: null,
        is_default: prev.length === 0
      }
    ])
  }

  const handleRemoveUserRole = (index: number) => {
    setUserRoles(prev => {
      const updated = prev.filter((_, idx) => idx !== index)

      if (updated.length > 0 && !updated.some(r => r.is_default)) {
        updated[0].is_default = true
      }

      return updated
    })
  }

  const handleUserRoleChange = (index: number, fieldName: keyof UserRoleItem, value: any) => {
    setUserRoles(prev => {
      const updated = [...prev]

      updated[index] = { ...updated[index], [fieldName]: value }

      return updated
    })
  }

  const handleSetDefaultUserRole = (index: number) => {
    setUserRoles(prev =>
      prev.map((item, idx) => ({
        ...item,
        is_default: idx === index
      }))
    )
  }

  const onSubmit = () => {
    if (!id) {
      const formattedUserRoles = userRoles.map((r, idx) => ({
        id_resource_role: r.id_resource_role,
        role_id: r.role_id?.value || r.role_id,
        id_pegawai: r.id_pegawai?.value || r.id_pegawai || state.id_eksternal?.value || null,
        id_cabang: r.id_cabang?.value || r.id_cabang || null,
        id_orgunit: r.id_orgunit?.value || r.id_orgunit || null,
        id_lembaga: r.id_lembaga || null,
        lembaga_type: r.lembaga_type || null,
        is_default: r.is_default ? 1 : idx === 0 ? 1 : 0
      }))

      const payload = {
        ...state,
        role_id: userRoles[0]?.role_id || state.role_id,
        province_id: state.province_id,
        regency_id: state.regency_id,
        id_eksternal: state.id_eksternal?.value || null,
        user_roles: formattedUserRoles,
        status: state.status?.value || 'NV',
        date_of_birth: state.date_of_birth ? formatDate(new Date(state.date_of_birth), 'yyyy-MM-dd') : null
      }

      dispatch(postUser(payload))
    } else {
      const payload = {
        ...state,
        province_id: state.province_id,
        regency_id: state.regency_id,
        id_eksternal: state.id_eksternal?.value || null,
        status: state.status?.value || 'NV',
        date_of_birth: state.date_of_birth ? formatDate(new Date(state.date_of_birth), 'yyyy-MM-dd') : null
      }

      dispatch(postUserUpdate({ id, params: payload }))
    }
  }

  const fields = () => [
    field({ type: 'separator', label: 'Informasi Akun' }),
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

    field({ type: 'separator', label: 'Informasi Pribadi' }),
    field({ type: 'text', key: 'full_name', label: 'Nama Lengkap', required: true, readOnly: !!view }),
    field({ type: 'text', key: 'telepon', label: 'No. Telepon / HP', required: true, readOnly: !!view }),
    field({ type: 'text', key: 'place_of_birth', label: 'Tempat Lahir', readOnly: !!view }),
    field({ type: 'date', key: 'date_of_birth', label: 'Tanggal Lahir', readOnly: !!view }),

    field({ type: 'separator', label: 'Status & Alamat' }),
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
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className='mb-6'>
            <CardHeader title={id ? (view ? 'Detail User' : 'Edit User') : 'Tambah User'} />
            <Divider sx={{ m: '0 !important' }} />
            <CardContent>{formColumn({ control, errors, state, setState, fields: fields() })}</CardContent>
          </Card>

          {/* Multi Role & Akses Cabang Section (Hanya untuk Tambah User) */}
          {!id && (
            <Card className='mb-6'>
              <CardHeader
                title='Pengaturan Role & Cabang'
                subheader='Kelola satu atau beberapa hak akses role, cabang, dan unit organisasi untuk pengguna ini.'
                action={
                  !view && (
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<i className='tabler-plus' />}
                      onClick={handleAddUserRole}
                    >
                      Tambah Role & Akses
                    </Button>
                  )
                }
              />
              <Divider sx={{ m: '0 !important' }} />
              <CardContent className='space-y-4'>
                {userRoles.length === 0 ? (
                  <Typography variant='body2' className='text-center py-4 italic' color='text.secondary'>
                    Belum ada role yang ditambahkan. Klik tombol "Tambah Role & Akses" untuk menambahkan role.
                  </Typography>
                ) : (
                  userRoles.map((roleRow, idx) => (
                    <Card key={idx} variant='outlined' className='p-4 bg-background-paper border border-gray-200'>
                      <Grid container spacing={4} alignItems='center'>
                        <Grid item xs={12} className='flex items-center justify-between border-b pb-2 mb-2'>
                          <Typography variant='subtitle2' className='font-bold text-primary'>
                            Akses #{idx + 1} {roleRow.is_default ? '(Role Utama / Default)' : ''}
                          </Typography>
                          {!view && userRoles.length > 1 && (
                            <IconButton size='small' color='error' onClick={() => handleRemoveUserRole(idx)}>
                              <i className='tabler-trash' />
                            </IconButton>
                          )}
                        </Grid>

                        {/* Role Select */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            options={opt.roles}
                            value={roleRow.role_id}
                            onChange={(_, newValue) => handleUserRoleChange(idx, 'role_id', newValue)}
                            getOptionLabel={(option: any) => option?.label || ''}
                            disabled={!!view}
                            renderInput={params => <TextField {...params} label='Role / Hak Akses *' size='small' />}
                          />
                        </Grid>

                        {/* Pegawai Select */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            options={opt.pegawais}
                            value={roleRow.id_pegawai}
                            onChange={(_, newValue) => handleUserRoleChange(idx, 'id_pegawai', newValue)}
                            getOptionLabel={(option: any) => option?.label || ''}
                            disabled={!!view}
                            renderInput={params => <TextField {...params} label='Pegawai Terkait' size='small' />}
                          />
                        </Grid>

                        {/* Cabang Select */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            options={opt.cabangs}
                            value={roleRow.id_cabang}
                            onChange={(_, newValue) => handleUserRoleChange(idx, 'id_cabang', newValue)}
                            getOptionLabel={(option: any) => option?.label || ''}
                            disabled={!!view}
                            renderInput={params => <TextField {...params} label='Cabang' size='small' />}
                          />
                        </Grid>

                        {/* OrgUnit Select */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Autocomplete
                            options={opt.orgunits}
                            value={roleRow.id_orgunit}
                            onChange={(_, newValue) => handleUserRoleChange(idx, 'id_orgunit', newValue)}
                            getOptionLabel={(option: any) => option?.label || ''}
                            disabled={!!view}
                            renderInput={params => <TextField {...params} label='Organization Unit' size='small' />}
                          />
                        </Grid>

                        {/* Default Role Radio */}
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={!!roleRow.is_default}
                                onChange={() => handleSetDefaultUserRole(idx)}
                                disabled={!!view}
                              />
                            }
                            label='Default Saat Login'
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Action Buttons */}
          {formColumn({
            control,
            errors,
            state,
            setState,
            fields: [
              fieldBuildSubmit({
                onCancel: () => router.push('/app/user/list'),
                loading: store.loading,
                disabled: !!view
              })
            ]
          })}
        </form>
      </Grid>
    </Grid>
  )
}

export default UserForm
