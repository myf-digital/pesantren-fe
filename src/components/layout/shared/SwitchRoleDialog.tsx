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

  return {
    id_resource_role: item.id_resource_role,
    is_default: item.is_default,
    id_lembaga: item.id_lembaga || null,
    role: item.role ? { role_id: item.role.role_id, role_name: item.role.role_name } : null,
    cabang: item.cabang ? { id_cabang: item.cabang.id_cabang, nama_cabang: item.cabang.nama_cabang } : null,
    organizationUnit: item.organizationUnit
      ? { id_orgunit: item.organizationUnit.id_orgunit, nama_orgunit: item.organizationUnit.nama_orgunit }
      : null,
    lembagaPendidikanFormal: item.lembagaPendidikanFormal
      ? {
          id_lembaga_formal: item.lembagaPendidikanFormal.id_lembaga_formal,
          nama_lembaga_formal: item.lembagaPendidikanFormal.nama_lembaga_formal
        }
      : null,
    lembagaPendidikanKepesantrenan: item.lembagaPendidikanKepesantrenan
      ? {
          id_lembaga_kepesantrenan: item.lembagaPendidikanKepesantrenan.id_lembaga_kepesantrenan,
          nama_lembaga_kepesantrenan: item.lembagaPendidikanKepesantrenan.nama_lembaga_kepesantrenan
        }
      : null,
    pegawai: item.pegawai ? { id_pegawai: item.pegawai.id_pegawai, nama_lengkap: item.pegawai.nama_lengkap } : null
  }
}

const sanitizeAvailableRoles = (roles: any[]) => {
  if (!Array.isArray(roles)) return []

  return roles.map(sanitizeRoleItem)
}

export const SwitchRoleDialog: React.FC<SwitchRoleDialogProps> = ({ open, onClose }) => {
  const { data: session, update } = useSession()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const availableRoles: any[] = session?.userdata?.available_roles || []
  const activeResourceRoleId = session?.userdata?.active_role?.id_resource_role

  const handleSelectRole = async (item: any) => {
    try {
      setLoadingId(item.id_resource_role)

      const response = await api.post('/auth/switch-role', {
        id_resource_role: item.id_resource_role
      })

      if (response.data && response.data.status !== false) {
        const { access_token, userdata } = response.data.data

        const activeRole = sanitizeRoleItem(userdata.active_role)
        const newAvailableRoles = sanitizeAvailableRoles(userdata.available_roles || session?.userdata?.available_roles || [])

        await update({
          access_token,
          userdata: {
            username: userdata.username || session?.userdata?.username,
            full_name: userdata.full_name || session?.userdata?.full_name,
            email: userdata.email || session?.userdata?.email,
            role_name: activeRole?.role?.role_name || userdata.role_name || session?.userdata?.role_name,
            pegawai: userdata.pegawai
              ? { id_pegawai: userdata.pegawai.id_pegawai, nama_lengkap: userdata.pegawai.nama_lengkap }
              : session?.userdata?.pegawai,
            active_role: activeRole,
            available_roles: newAvailableRoles
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

        {availableRoles.length === 0 ? (
          <Typography variant='body2' className='text-center py-4 italic' color='text.secondary'>
            Tidak ada pilihan role lain yang tersedia.
          </Typography>
        ) : (
          availableRoles.map((item: any, idx: number) => {
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
                      {item.is_default === 1 && (
                        <Chip label='Default' size='small' color='info' variant='outlined' />
                      )}
                      {isActive && <Chip label='Sedang Aktif' size='small' color='success' />}
                    </Box>

                    <Typography variant='caption' component='div' color='text.secondary' className='flex flex-col gap-0.5'>
                      <span>
                        <strong>Cabang:</strong> {item.cabang?.nama_cabang || '-'}
                      </span>
                      <span>
                        <strong>Org Unit:</strong> {item.organizationUnit?.nama_orgunit || '-'}
                      </span>
                      <span>
                        <strong>Lembaga:</strong>{' '}
                        {item.lembagaPendidikanFormal?.nama_lembaga_formal ||
                          item.lembagaPendidikanKepesantrenan?.nama_lembaga_kepesantrenan ||
                          item.id_lembaga ||
                          '-'}
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
                        startIcon={isCurrentlyLoading ? <CircularProgress size={14} color='inherit' /> : <i className='tabler-switch-horizontal' />}
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
