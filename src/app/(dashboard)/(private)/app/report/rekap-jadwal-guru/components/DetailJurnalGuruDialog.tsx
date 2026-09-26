'use strict'

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Divider
} from '@mui/material'
import { format } from 'date-fns'

interface DetailJurnalGuruDialogProps {
  open: boolean
  onClose: () => void
  teacherData: any | null
}

const DetailJurnalGuruDialog: React.FC<DetailJurnalGuruDialogProps> = ({
  open,
  onClose,
  teacherData
}) => {
  if (!teacherData) return null

  const sessions = teacherData.detail_sesi || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Detail Riwayat Mengajar
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {teacherData.nama || teacherData.nama_guru} {teacherData.nip && teacherData.nip !== '-' ? `(NIP: ${teacherData.nip})` : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Quick Summary Badges */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            variant='tonal'
            color='primary'
            label={`Total Sesi: ${teacherData.mengajar || sessions.length} kali`}
            icon={<i className='tabler-book' />}
          />
          <Chip
            variant='tonal'
            color='info'
            label={`Total Durasi: ${Number(teacherData.jam || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jam (${Math.round((teacherData.durasi_menit || 0) / 60)} Jam ${(teacherData.durasi_menit || 0) % 60} Menit)`}
            icon={<i className='tabler-clock' />}
          />
          <Chip
            variant='tonal'
            color='success'
            label={`Jumlah Kelas: ${teacherData.kelas || 0}`}
            icon={<i className='tabler-building' />}
          />
          <Chip
            variant='tonal'
            color='warning'
            label={`Hari Aktif: ${teacherData.hari || 0} hari`}
            icon={<i className='tabler-calendar' />}
          />
        </Box>

        {sessions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <i className='tabler-calendar-off text-4xl mb-2' />
            <Typography variant='body1'>Belum ada rincian sesi mengajar pada periode ini.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 1 }}>
            <Table size='small'>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 40, textAlign: 'center' }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tanggal / Hari</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Jam Pelajaran</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kelas</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mata Pelajaran</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Materi & Catatan</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Durasi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((sesi: any, idx: number) => {
                  const tglDisplay = sesi.tanggal ? format(new Date(sesi.tanggal), 'dd/MM/yyyy') : '-'
                  const jamDisplay = sesi.jam_mulai
                    ? `${String(sesi.jam_mulai).slice(0, 5)} - ${sesi.jam_selesai ? String(sesi.jam_selesai).slice(0, 5) : 'Aktif'}`
                    : '-'

                  return (
                    <TableRow key={sesi.id_jurnal || idx} hover>
                      <TableCell sx={{ textAlign: 'center' }}>{idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {tglDisplay}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {sesi.hari || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {sesi.nama_jampel || '-'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {jamDisplay}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size='small' variant='outlined' label={sesi.nama_kelas || '-'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{sesi.mata_pelajaran || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {sesi.materi && sesi.materi !== '-' ? sesi.materi : 'Belum diisi'}
                        </Typography>
                        {sesi.catatan && sesi.catatan !== '-' && (
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                            Catatan: {sesi.catatan}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size='small'
                          color='primary'
                          variant='tonal'
                          label={`${Number(sesi.jumlah_jampel || 1).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jam`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='contained' color='primary'>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetailJurnalGuruDialog
