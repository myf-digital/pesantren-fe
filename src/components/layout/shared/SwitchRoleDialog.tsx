'use client'

import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import api from '@/libs/axios'
import { normalizeAbility } from '@/libs/permission'

interface SwitchRoleDialogProps {
  open: boolean
  onClose: () => void
}

const sanitizeRoleItem = (item: any) => {
  if (!item) return null

  const res: any = { id_resource_role: item.id_resource_role }

  if (item.is_default) res.is_default = item.is_default
  if (item.id_lembaga) res.id_lembaga = item.id_lembaga
  if (item.role?.role_name) res.role = { role_id: item.role.role_id, role_name: item.role.role_name }
  if (item.cabang?.nama_cabang) res.cabang = { id_cabang: item.cabang.id_cabang, nama_cabang: item.cabang.nama_cabang }
  if (item.organizationUnit?.nama_orgunit)
    res.organizationUnit = {
      id_orgunit: item.organizationUnit.id_orgunit,
      nama_orgunit: item.organizationUnit.nama_orgunit
    }
  const formalNama = item.lembagaPendidikanFormal?.nama_lembaga || null
  if (formalNama)
    res.lembagaPendidikanFormal = {
      id_lembaga: item.lembagaPendidikanFormal.id_lembaga || item.id_lembagal,
      nama_lembaga: formalNama
    }
  const pesantrenNama = item.lembagaPendidikanKepesantrenan?.nama_lembaga || null
  if (pesantrenNama)
    res.lembagaPendidikanKepesantrenan = {
      id_lembaga: item.lembagaPendidikanKepesantrenan.id_lembaga || item.id_lembaga,
      nama_lembaga: pesantrenNama
    }
  if (item.pegawai?.nama_lengkap)
    res.pegawai = { id_pegawai: item.pegawai.id_pegawai, nama_lengkap: item.pegawai.nama_lengkap }

  return res
}

const sanitizeAvailableRoles = (roles: any[]) => {
  if (!Array.isArray(roles)) return []

  return roles.map(sanitizeRoleItem)
}

export const SwitchRoleDialog: React.FC<SwitchRoleDialogProps> = ({ open, onClose }) => {
  const { data: session, update } = useSession()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [fetchingRoles, setFetchingRoles] = useState(false)

  const activeResourceRoleId = session?.userdata?.id_resource_role || session?.userdata?.active_role?.id_resource_role

  React.useEffect(() => {
    if (open) {
      const fetchLatestRoles = async () => {
        try {
          setFetchingRoles(true)
          const resourceId = session?.userdata?.resource_id
          let resData: any = null

          if (resourceId) {
            const res = await api.get(`/app/resource/${resourceId}`)
            resData = res.data?.data || res.data
          }

          if (resData) {
            const fetchedRoles =
              resData.available_roles || resData.user_roles || resData.resource_roles || resData.roles
            if (Array.isArray(fetchedRoles) && fetchedRoles.length > 0) {
              const cleanRoles = sanitizeAvailableRoles(fetchedRoles)
              setRoles(cleanRoles)
            }
          }
        } catch (err) {
          console.error('Fetch latest roles error:', err)
        } finally {
          setFetchingRoles(false)
        }
      }

      fetchLatestRoles()
    }
  }, [open, session?.userdata?.resource_id])

  const handleSelectRole = async (item: any) => {
    try {
      setLoadingId(item.id_resource_role)

      const response = await api.post('/auth/switch-role', {
        id_resource_role: item.id_resource_role
      })

      if (response.data && response.data.status !== false) {
        const { access_token, userdata } = response.data.data

        const rawActiveRole = userdata.active_role
        const activeRoleName = rawActiveRole?.role?.role_name || userdata.role_name || session?.userdata?.role_name
        const activeCabangName = rawActiveRole?.cabang?.nama_cabang || userdata.cabang_name || session?.userdata?.cabang_name

        await update({
          access_token,
          userdata: {
            resource_id: userdata.resource_id || session?.userdata?.resource_id,
            username: userdata.username || session?.userdata?.username,
            full_name: userdata.full_name || session?.userdata?.full_name,
            email: userdata.email || session?.userdata?.email,
            role_name: activeRoleName,
            id_resource_role: item.id_resource_role || rawActiveRole?.id_resource_role || userdata.id_resource_role,
            cabang_name: activeCabangName,
            pegawai: userdata.pegawai
              ? { id_pegawai: userdata.pegawai.id_pegawai, nama_lengkap: userdata.pegawai.nama_lengkap }
              : session?.userdata?.pegawai
          },
          permissions: normalizeAbility(userdata.ability || [])
        })

        toast.success(`Berhasil mengubah role ke ${item.role?.role_name || 'Role baru'}`)
        onClose()
        window.location.reload()
      } else {
        toast.error(response.data?.message || 'Gagal mengubah role')
      }
    } catch (err: any) {
      console.error('Switch Role Error:', err)
      toast.error(err.response?.data?.message || 'Gagal merubah role')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle className='flex items-center justify-between pb-1'>
        <Typography variant='h6' component='span' className='font-bold'>
          Ubah Role & Akses Cabang
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className='space-y-4'>
        <Typography variant='body2' color='text.secondary'>
          Pilih role dan cabang yang ingin Anda aktifkan untuk sesi ini:
        </Typography>

        {fetchingRoles && roles.length === 0 ? (
          <Box className='flex justify-center py-6'>
            <CircularProgress size={24} />
          </Box>
        ) : roles.length === 0 ? (
          <Typography variant='body2' className='text-center py-4 italic' color='text.secondary'>
            Tidak ada pilihan role lain yang tersedia.
          </Typography>
        ) : (
          roles.map((item: any, idx: number) => {
            const isActive = item.id_resource_role === activeResourceRoleId
            const isCurrentlyLoading = loadingId === item.id_resource_role

            return (
              <Card
                key={item.id_resource_role || idx}
                variant='outlined'
                className={`transition-all ${isActive ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
              >
                <CardContent className='p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <Box className='space-y-1.5'>
                    <Box className='flex items-center gap-2 flex-wrap'>
                      <Typography variant='subtitle1' className='font-semibold text-primary'>
                        {item.role?.role_name || 'Role User'}
                      </Typography>
                      {item.is_default === 1 && <Chip label='Default' size='small' color='info' variant='outlined' />}
                      {isActive && <Chip label='Sedang Aktif' size='small' color='success' />}
                    </Box>

                    <Typography
                      variant='caption'
                      component='div'
                      color='text.secondary'
                      className='flex flex-col gap-0.5'
                    >
                      <span>
                        <strong>Cabang:</strong> {item.cabang?.nama_cabang || '-'}
                      </span>
                      <span>
                        <strong>Lembaga:</strong>{' '}
                        {item.lembagaPendidikanFormal?.nama_lembaga ||
                          item.lembagaPendidikanKepesantrenan?.nama_lembaga ||
                          '-'}
                      </span>
                      <span>
                        <strong>Org Unit:</strong> {item.organizationUnit?.nama_orgunit || '-'}
                      </span>
                      {item.pegawai?.nama_lengkap && (
                        <span>
                          <strong>Pegawai:</strong> {item.pegawai.nama_lengkap}
                        </span>
                      )}
                    </Typography>
                  </Box>

                  <Box>
                    {isActive ? (
                      <Button variant='outlined' color='success' size='small' disabled>
                        Aktif
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        size='small'
                        disabled={!!loadingId}
                        onClick={() => handleSelectRole(item)}
                        startIcon={
                          isCurrentlyLoading ? (
                            <CircularProgress size={14} color='inherit' />
                          ) : (
                            <i className='tabler-switch-horizontal' />
                          )
                        }
                      >
                        Pilih
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )
          })
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SwitchRoleDialog
