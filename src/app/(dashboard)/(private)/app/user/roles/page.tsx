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
  Box,
  CircularProgress
} from '@mui/material'
import { toast } from 'react-toastify'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchUserById, postUserRolesUpdate, resetRedux } from '../slice'
import { fetchRoleAll } from '../../role/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchOrgUnitAll } from '../../organisasi/slice'
import { fetchLembagaFormalAll } from '../../lembaga-formal/slice'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../lembaga-kepesantrenan/slice'

interface UserRoleItem {
  id_resource_role?: string
  role_id: { label: string; value: string } | null
  id_pegawai?: { label: string; value: string; raw?: any } | null
  id_cabang?: { label: string; value: string } | null
  id_orgunit?: { label: string; value: string } | null
  id_lembaga?: { label: string; value: string; type?: string } | null
  lembaga_type?: string | null
  is_default: boolean
}

const UserRolesManagement = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.user)

  const [opt, setOpt] = useState<any>({
    roles: [],
    pegawais: [],
    cabangs: [],
    orgunits: [],
    lembagas: []
  })

  const [userRoles, setUserRoles] = useState<UserRoleItem[]>([])
  const [loadingSave, setLoadingSave] = useState(false)

  const initData = useCallback(async () => {
    if (!id) return

    try {
      const [resRoles, resPegawai, resCabang, resOrg, resFormal, resPesantren] = await Promise.all([
        dispatch(fetchRoleAll()).unwrap(),
        dispatch(fetchPegawaiAll({})).unwrap(),
        dispatch(fetchCabangAll({})).unwrap(),
        dispatch(fetchOrgUnitAll({})).unwrap(),
        dispatch(fetchLembagaFormalAll({})).unwrap(),
        dispatch(fetchLembagaKepesantrenanAll({})).unwrap(),
        dispatch(fetchUserById(id)).unwrap()
      ])

      const getList = (res: any) => {
        if (Array.isArray(res)) return res
        if (Array.isArray(res?.data?.values)) return res.data.values
        if (Array.isArray(res?.data)) return res.data
        if (Array.isArray(res?.values)) return res.values
        return []
      }

      const rolesOpt = getList(resRoles).map((m: any) => ({
        label: m.role_name,
        value: m.role_id
      }))

      const pegawaisOpt = getList(resPegawai).map((m: any) => ({
        label: m.nama_lengkap,
        value: m.id_pegawai,
        raw: m
      }))

      const cabangsOpt = getList(resCabang).map((m: any) => ({
        label: m.nama_cabang,
        value: m.id_cabang
      }))

      const orgunitsOpt = getList(resOrg).map((m: any) => ({
        label: m.nama_orgunit,
        value: m.id_orgunit,
        id_cabang: m.id_cabang,
        id_lembaga: m.id_lembaga,
        lembaga_type: m.lembaga_type,
        raw: m
      }))

      const lembagasFormalOpt = getList(resFormal).map((m: any) => ({
        label: `[Formal] ${m.nama_lembaga || ''}`,
        value: m.id_lembaga || m.id_lembaga_formal,
        type: 'FORMAL',
        id_cabang: m.id_cabang,
        raw: m
      }))

      const lembagasPesantrenOpt = getList(resPesantren).map((m: any) => ({
        label: `[Pesantren] ${m.nama_lembaga || ''}`,
        value: m.id_lembaga || m.id_lembaga_kepesantrenan,
        type: 'PESANTREN',
        id_cabang: m.id_cabang,
        raw: m
      }))

      setOpt({
        roles: rolesOpt,
        pegawais: pegawaisOpt,
        cabangs: cabangsOpt,
        orgunits: orgunitsOpt,
        lembagas: [...lembagasFormalOpt, ...lembagasPesantrenOpt]
      })
    } catch (err) {
      console.error('Gagal memuat referensi data:', err)
      toast.error('Gagal memuat referensi data')
    }
  }, [id, dispatch])

  useEffect(() => {
    initData()
  }, [initData])

  useEffect(() => {
    if (store.data && store.data.resource_id === id) {
      const rawUserRoles = store.data.resource_roles || store.data.user_roles || []
      const defaultPegawaiId = store.data.id_eksternal
      const defaultPegawaiOpt = defaultPegawaiId
        ? opt.pegawais.find((p: any) => p.value === defaultPegawaiId) || {
            label: store.data.pegawai?.nama_lengkap || defaultPegawaiId,
            value: defaultPegawaiId
          }
        : null

      if (Array.isArray(rawUserRoles) && rawUserRoles.length > 0) {
        setUserRoles(
          rawUserRoles.map((r: any) => {
            const pegawaiVal = r.id_pegawai || defaultPegawaiId
            const pegawaiOpt = pegawaiVal
              ? opt.pegawais.find((p: any) => p.value === pegawaiVal) || {
                  label: r.pegawai?.nama_lengkap || store.data.pegawai?.nama_lengkap || pegawaiVal,
                  value: pegawaiVal
                }
              : null

            const idLembagaVal =
              r.id_lembaga || r.lembagaPendidikanFormal?.id_lembaga || r.lembagaPendidikanKepesantrenan?.id_lembaga
            const lembagaOpt = idLembagaVal
              ? opt.lembagas?.find((l: any) => l.value === idLembagaVal) || {
                  label:
                    r.lembagaPendidikanFormal?.nama_lembaga ||
                    r.lembagaPendidikanKepesantrenan?.nama_lembaga ||
                    idLembagaVal,
                  value: idLembagaVal,
                  type: r.lembaga_type
                }
              : null

            return {
              id_resource_role: r.id_resource_role,
              role_id: r.role_id
                ? { label: r.role?.role_name || r.role_id, value: r.role_id }
                : r.role?.role_name
                  ? { label: r.role.role_name, value: r.role.role_id }
                  : null,
              id_pegawai: pegawaiOpt,
              id_cabang: r.id_cabang ? { label: r.cabang?.nama_cabang || r.id_cabang, value: r.id_cabang } : null,
              id_orgunit: r.id_orgunit
                ? { label: r.organizationUnit?.nama_orgunit || r.id_orgunit, value: r.id_orgunit }
                : null,
              id_lembaga: lembagaOpt,
              lembaga_type: r.lembaga_type || null,
              is_default: r.is_default === 1 || r.is_default === true
            }
          })
        )
      } else {
        setUserRoles([
          {
            role_id: store.data.role_id
              ? { label: store.data.role?.role_name || store.data.role_id, value: store.data.role_id }
              : null,
            id_pegawai: defaultPegawaiOpt,
            id_cabang: null,
            id_orgunit: null,
            id_lembaga: null,
            lembaga_type: null,
            is_default: true
          }
        ])
      }
    }
  }, [store.data, id, opt.pegawais, opt.lembagas])

  useEffect(() => {
    if (store.crud) {
      setLoadingSave(false)
      if (store.crud.status !== false) {
        toast.success(store.crud.message || 'Berhasil mengupdate roles user')
        dispatch(resetRedux())
        router.replace('/app/user/list')
      } else {
        toast.error(store.crud.message || 'Gagal mengupdate roles user')
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const handleAddUserRole = () => {
    const defaultPegawaiId = store.data?.id_eksternal
    const defaultPegawaiOpt = defaultPegawaiId
      ? opt.pegawais.find((p: any) => p.value === defaultPegawaiId) || {
          label: store.data.pegawai?.nama_lengkap || defaultPegawaiId,
          value: defaultPegawaiId
        }
      : null

    setUserRoles(prev => [
      ...prev,
      {
        role_id: null,
        id_pegawai: defaultPegawaiOpt,
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

  const getFilteredLembagaOptions = (roleRow: any) => {
    const selectedCabangId = roleRow.id_cabang?.value || roleRow.id_cabang
    if (!selectedCabangId) return opt.lembagas || []

    return (opt.lembagas || []).filter((l: any) => {
      const lemCabangId = l.id_cabang || l.raw?.id_cabang
      return !lemCabangId || lemCabangId === selectedCabangId
    })
  }

  const getFilteredOrgUnitOptions = (roleRow: any) => {
    const selectedCabangId = roleRow.id_cabang?.value || roleRow.id_cabang
    const selectedLembagaId = roleRow.id_lembaga?.value || roleRow.id_lembaga

    return (opt.orgunits || []).filter((o: any) => {
      const orgCabangId = o.id_cabang || o.raw?.id_cabang
      const orgLembagaId = o.id_lembaga || o.raw?.id_lembaga

      if (selectedLembagaId) {
        if (orgLembagaId && orgLembagaId !== selectedLembagaId) {
          return false
        }
      }

      if (selectedCabangId) {
        if (orgCabangId && orgCabangId !== selectedCabangId) {
          return false
        }
      }

      return true
    })
  }

  const handleUserRoleChange = (index: number, fieldName: keyof UserRoleItem, value: any) => {
    setUserRoles(prev => {
      const updated = [...prev]
      const currentRow: any = { ...updated[index] }

      currentRow[fieldName] = value

      if (fieldName === 'id_pegawai') {
        if (value && value.raw) {
          const rawPegawai = value.raw

          const targetCabangId =
            rawPegawai.id_cabang ||
            rawPegawai.cabang?.id_cabang ||
            rawPegawai.organizationUnit?.id_cabang ||
            rawPegawai.organizationUnit?.cabang?.id_cabang

          const targetOrgUnitId = rawPegawai.id_orgunit || rawPegawai.organizationUnit?.id_orgunit

          const targetLembagaId =
            rawPegawai.id_lembaga ||
            rawPegawai.organizationUnit?.id_lembaga ||
            rawPegawai.lembaga?.id_lembaga ||
            rawPegawai.lembagaPendidikanFormal?.id_lembaga ||
            rawPegawai.lembagaPendidikanFormal?.id_lembaga_formal ||
            rawPegawai.lembagaPendidikanKepesantrenan?.id_lembaga ||
            rawPegawai.lembagaPendidikanKepesantrenan?.id_lembaga_kepesantrenan

          const targetLembagaType = rawPegawai.lembaga_type || rawPegawai.organizationUnit?.lembaga_type

          if (targetCabangId) {
            const foundCabang = opt.cabangs?.find((c: any) => c.value === targetCabangId)
            if (foundCabang) {
              currentRow.id_cabang = foundCabang
            }
          }

          if (targetOrgUnitId) {
            const foundOrg = opt.orgunits?.find((o: any) => o.value === targetOrgUnitId)
            if (foundOrg) {
              currentRow.id_orgunit = foundOrg
            }
          }

          if (targetLembagaId) {
            const foundLembaga = opt.lembagas?.find((l: any) => l.value === targetLembagaId)
            if (foundLembaga) {
              currentRow.id_lembaga = foundLembaga
              currentRow.lembaga_type = foundLembaga.type || targetLembagaType || null
            } else {
              const labelName =
                rawPegawai.lembagaPendidikanFormal?.nama_lembaga ||
                rawPegawai.lembagaPendidikanKepesantrenan?.nama_lembaga ||
                targetLembagaId
              currentRow.id_lembaga = {
                label: labelName,
                value: targetLembagaId,
                type: targetLembagaType
              }
              currentRow.lembaga_type = targetLembagaType || null
            }
          }
        }
      }

      if (fieldName === 'id_cabang') {
        const newCabangId = value?.value || value
        if (currentRow.id_lembaga) {
          const lemCabangId = currentRow.id_lembaga.id_cabang || currentRow.id_lembaga.raw?.id_cabang
          if (newCabangId && lemCabangId && lemCabangId !== newCabangId) {
            currentRow.id_lembaga = null
            currentRow.lembaga_type = null
          }
        }
        if (currentRow.id_orgunit) {
          const orgCabangId = currentRow.id_orgunit.id_cabang || currentRow.id_orgunit.raw?.id_cabang
          if (newCabangId && orgCabangId && orgCabangId !== newCabangId) {
            currentRow.id_orgunit = null
          }
        }
      }

      if (fieldName === 'id_lembaga') {
        if (value) {
          currentRow.lembaga_type = value.type || value.raw?.lembaga_type || currentRow.lembaga_type || null

          const lemCabangId = value.id_cabang || value.raw?.id_cabang
          if (
            lemCabangId &&
            (!currentRow.id_cabang ||
              (currentRow.id_cabang.value !== lemCabangId && currentRow.id_cabang !== lemCabangId))
          ) {
            const foundCabang = opt.cabangs?.find((c: any) => c.value === lemCabangId)
            if (foundCabang) {
              currentRow.id_cabang = foundCabang
            }
          }

          if (currentRow.id_orgunit) {
            const orgLembagaId = currentRow.id_orgunit.id_lembaga || currentRow.id_orgunit.raw?.id_lembaga
            if (orgLembagaId && orgLembagaId !== value.value) {
              currentRow.id_orgunit = null
            }
          }
        } else {
          currentRow.lembaga_type = null
        }
      }

      if (fieldName === 'id_orgunit') {
        if (value) {
          const orgCabangId = value.id_cabang || value.raw?.id_cabang
          const orgLembagaId = value.id_lembaga || value.raw?.id_lembaga
          const orgLembagaType = value.lembaga_type || value.raw?.lembaga_type

          if (orgCabangId && !currentRow.id_cabang) {
            const foundCabang = opt.cabangs?.find((c: any) => c.value === orgCabangId)
            if (foundCabang) currentRow.id_cabang = foundCabang
          }

          if (orgLembagaId && !currentRow.id_lembaga) {
            const foundLembaga = opt.lembagas?.find((l: any) => l.value === orgLembagaId)
            if (foundLembaga) {
              currentRow.id_lembaga = foundLembaga
              currentRow.lembaga_type = foundLembaga.type || orgLembagaType || null
            }
          }
        }
      }

      updated[index] = currentRow
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

  const handleSubmitRoles = () => {
    if (!id) return

    const formattedUserRoles = userRoles.map((r, idx) => ({
      id_resource_role: r.id_resource_role,
      role_id: r.role_id?.value || r.role_id,
      id_pegawai: r.id_pegawai?.value || r.id_pegawai || null,
      id_cabang: r.id_cabang?.value || r.id_cabang || null,
      id_orgunit: r.id_orgunit?.value || r.id_orgunit || null,
      id_lembaga: r.id_lembaga?.value || r.id_lembaga || null,
      lembaga_type: r.lembaga_type || r.id_lembaga?.type || null,
      is_default: r.is_default ? 1 : idx === 0 ? 1 : 0
    }))

    setLoadingSave(true)
    dispatch(postUserRolesUpdate({ id, user_roles: formattedUserRoles }))
  }

  const userData = store.data || {}

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {/* User Summary Header */}
        <Card className='mb-6'>
          <CardHeader
            title='Manajemen Role & Hak Akses User'
            subheader='Kelola role, cabang, dan unit organisasi untuk pengguna ini'
          />
          <Divider sx={{ m: '0 !important' }} />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant='caption' color='text.secondary'>
                  Nama Lengkap
                </Typography>
                <Typography variant='body1' className='font-semibold'>
                  {userData.full_name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='caption' color='text.secondary'>
                  Username
                </Typography>
                <Typography variant='body1' className='font-semibold'>
                  {userData.username || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='caption' color='text.secondary'>
                  Email
                </Typography>
                <Typography variant='body1' className='font-semibold'>
                  {userData.email || '-'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Roles List Card */}
        <Card className='mb-6'>
          <CardHeader
            title='Pengaturan Role & Cabang'
            subheader='Tambahkan atau hapus hak akses role dan cabang untuk pengguna ini.'
            action={
              <Button
                variant='contained'
                size='small'
                startIcon={<i className='tabler-plus' />}
                onClick={handleAddUserRole}
              >
                Tambah Role & Akses
              </Button>
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
                      {userRoles.length > 1 && (
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
                        renderInput={params => <TextField {...params} label='Cabang' size='small' />}
                      />
                    </Grid>

                    {/* Lembaga Select */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        options={getFilteredLembagaOptions(roleRow)}
                        value={roleRow.id_lembaga}
                        onChange={(_, newValue) => handleUserRoleChange(idx, 'id_lembaga', newValue)}
                        getOptionLabel={(option: any) => option?.label || ''}
                        renderInput={params => <TextField {...params} label='Lembaga' size='small' />}
                      />
                    </Grid>

                    {/* OrgUnit Select */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        options={getFilteredOrgUnitOptions(roleRow)}
                        value={roleRow.id_orgunit}
                        onChange={(_, newValue) => handleUserRoleChange(idx, 'id_orgunit', newValue)}
                        getOptionLabel={(option: any) => option?.label || ''}
                        renderInput={params => <TextField {...params} label='Organization Unit' size='small' />}
                      />
                    </Grid>

                    {/* Default Role Radio */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Radio checked={!!roleRow.is_default} onChange={() => handleSetDefaultUserRole(idx)} />
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

        {/* Form Buttons */}
        <Box className='flex items-center gap-4'>
          <Button
            variant='contained'
            color='primary'
            disabled={loadingSave}
            onClick={handleSubmitRoles}
            startIcon={
              loadingSave ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-device-floppy' />
            }
          >
            Simpan Roles
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => router.push('/app/user/list')}>
            Batal
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}

export default UserRolesManagement
