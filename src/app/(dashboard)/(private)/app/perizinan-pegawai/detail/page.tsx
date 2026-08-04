'use client'

import React, { useEffect, useState } from 'react'

// Next / Navigation Imports
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import {
  Typography,
  Button,
  Box,
  Card,
  Chip,
  Skeleton,
  CardContent,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import Grid from '@mui/material/Grid2'

// Third Party Imports
import { toast } from 'react-toastify'

// Components & Redux/Slice Imports
import { useAppDispatch } from '@/redux-store/hook'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import {
  fetchPerizinanSantriById,
  postPerizinanApprove,
  postPerizinanCancel,
  postPerizinanRequestCancellation
} from '../slice'
import { format } from 'date-fns'
import { usePathname } from 'next/navigation'

// ==========================================
// HELPER METHODS (MUI/Vuexy Theme Mapping)
// ==========================================
const getBadgeTheme = (statusIzin: string, isCanceled: boolean, isRequestCanceled: boolean) => {
  let label = statusIzin || 'Menunggu'
  let color: 'warning' | 'success' | 'error' | 'secondary' = 'warning'
  let colorText = 'warning.main'

  if (isCanceled) {
    label = 'Dibatalkan'
    color = 'error'
    colorText = 'error.main'
  } else if (isRequestCanceled) {
    label = 'Menunggu Permintaan Pembatalan'
    colorText = 'warning.main'
  } else if (statusIzin === 'Menunggu') {
    label = 'Menunggu Approval'
    colorText = 'warning.main'
  } else if (statusIzin === 'Disetujui') {
    label = 'Disetujui'
    color = 'success'
    colorText = 'success.main'
  } else if (statusIzin === 'Ditolak') {
    label = 'Ditolak'
    color = 'error'
    colorText = 'error.main'
  }

  return {
    label: label.toUpperCase(),
    color,
    colorText
  }
}

// =========================================================================
// COMPONENT: INFORMASI PENGAJUAN PEGAWAI CARD
// =========================================================================
interface InformasiPengajuanPegawaiCardProps {
  data: any
  onViewFile: (url: string) => void
}

const InformasiPengajuanPegawaiCard = ({ data, onViewFile }: InformasiPengajuanPegawaiCardProps) => (
  <Card sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'none' }}>
    <CardContent sx={{ p: 6 }}>
      <Typography
        variant='h6'
        sx={{ color: 'text.secondary', mb: 5, fontWeight: 500, fontSize: '0.875rem', textTransform: 'uppercase' }}
      >
        Informasi Pengajuan Kepegawaian
      </Typography>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Nama Pegawai
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.pegawai?.nama_lengkap || data?.nama_pegawai || '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            NIP atau Nomor Induk Pegawai
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.pegawai?.nip || data?.nip || '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Lokasi Kerja
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.pegawai?.lokasi_kerja || data?.lokasi_kerja || '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Jenis Izin
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.jenis_izin || '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Tanggal Pelaksanaan Izin
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.tanggal_izin || '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Sumber Pengajuan
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            {data?.sumber_pengajuan || '-'}
          </Typography>
        </Grid>
        {data?.file_izin && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', mb: 1.5 }}>
              Berkas Lampiran Pendukung
            </Typography>
            <Button
              size='small'
              variant='tonal'
              color='primary'
              startIcon={<i className='tabler-file-download' />}
              onClick={() => {
                const fileUrl = data.file_izin.startsWith('http')
                  ? data.file_izin
                  : `${process.env.NEXT_PUBLIC_API_URL || ''}${data.file_izin.startsWith('/') ? '' : '/'}${data.file_izin}`
                onViewFile(fileUrl)
              }}
            >
              Lihat Berkas
            </Button>
          </Grid>
        )}
        {data?.surat_izin?.nomor_surat && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              Nomor Surat Izin Resmi
            </Typography>
            <Typography variant='body1' sx={{ color: 'primary.main', fontWeight: 600 }}>
              {data.surat_izin.nomor_surat}
            </Typography>
          </Grid>
        )}
        <Grid size={12}>
          <Typography variant='body2' sx={{ color: 'text.disabled', mb: 1.5 }}>
            Alasan Pengajuan
          </Typography>
          <Box
            sx={{
              p: 4,
              borderRadius: 1,
              backgroundColor: 'action.hover',
              border: '1px solid var(--mui-palette-divider)',
              fontSize: '0.875rem'
            }}
          >
            {data?.is_request_canceled ? data?.request_canceled_catatan || '-' : data?.alasan || '-'}
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

// =========================================================================
// COMPONENT: STATUS PROSES PEGAWAI CARD
// =========================================================================
const StatusProsesPegawaiCard = ({
  data,
  isCanceled,
  isRequestCanceled
}: {
  data: any
  isCanceled: boolean
  isRequestCanceled: boolean
}) => {
  // Simulasi penentuan warna teks status untuk kepegawaian
  let statusLabel = data?.status_izin || 'Menunggu'
  let colorText = '#FFA200'

  if (isCanceled) {
    statusLabel = 'Dibatalkan'
    colorText = '#D32F2F'
  } else if (isRequestCanceled) {
    statusLabel = 'Menunggu Pembatalan'
    colorText = '#FFA200'
  } else if (statusLabel === 'Disetujui') {
    colorText = '#007A53'
  } else if (statusLabel === 'Ditolak') {
    colorText = '#D32F2F'
  }

  return (
    <Card sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'none' }}>
      <CardContent sx={{ p: 6 }}>
        <Typography
          variant='h6'
          sx={{ color: 'text.secondary', mb: 5, fontWeight: 500, fontSize: '0.875rem', textTransform: 'uppercase' }}
        >
          Status dan Proses Peninjauan
        </Typography>
        <Grid container spacing={5}>
          <Grid size={12}>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              Status Approval
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 600, color: colorText }}>
              {statusLabel}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              Petugas Approver
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {data?.petugas_approval || '-'}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant='body2' sx={{ color: 'text.disabled', mb: 1.5 }}>
              Catatan Approval/Pembatalan
            </Typography>
            <Box
              sx={{
                p: 4,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                border: '1px solid var(--mui-palette-divider)',
                fontSize: '0.875rem'
              }}
            >
              {data?.catatan_approval || '-'}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// =========================================================================
// COMPONENT: FORM EVALUASI DAN APPROVAL KEPEGAWAIAN CARD (HIJAU SOLID)
// =========================================================================
interface ApprovalKepegawaianCardProps {
  data: any
  isCanceled: boolean
  isRequestCanceled: boolean
  catatanKedisiplinan: string
  setCatatanKedisiplinan: (val: string) => void
  onApprove: () => void
  onReject: () => void
  submitting: boolean
  onBack: () => void
  onViewFile: (url: string) => void
}

const ApprovalKepegawaianCard = ({
  data,
  isCanceled,
  isRequestCanceled,
  catatanKedisiplinan,
  setCatatanKedisiplinan,
  onApprove,
  onReject,
  submitting,
  onBack,
  onViewFile
}: ApprovalKepegawaianCardProps) => {
  const isPendingApproval = data?.status_izin === 'Menunggu' && !isCanceled
  return (
    <Card sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'none', overflow: 'hidden' }}>
      <Box sx={{ backgroundColor: '#007A53', p: 4, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ color: '#fff', fontWeight: 600 }}>
          EVALUASI DAN KEPUTUSAN PERIZINAN PEGAWAI
        </Typography>
      </Box>
      <CardContent sx={{ p: 6 }}>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
              Profil Karyawan atau Pegawai
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  Nama Lengkap
                </Typography>
                <Typography variant='body2'>: {data?.pegawai?.nama_lengkap || data?.nama_pegawai || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  NIP
                </Typography>
                <Typography variant='body2'>: {data?.pegawai?.nip || data?.nip || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  Lokasi Kerja
                </Typography>
                <Typography variant='body2'>: {data?.pegawai?.lokasi_kerja || data?.lokasi_kerja || '-'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={12}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
              Rincian Pengajuan Izin
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  Jenis Izin Kerja
                </Typography>
                <Typography variant='body2'>: {data?.jenis_izin || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  Sumber Pengajuan
                </Typography>
                <Typography variant='body2'>: {data?.sumber_pengajuan || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                  Tanggal
                </Typography>
                <Typography variant='body2'>: {data?.tanggal_izin || '-'}</Typography>
              </Box>
              {data?.file_izin && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ width: 150, color: 'text.secondary' }}>
                    Dokumen Lampiran
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2'>:</Typography>
                    <Button
                      size='small'
                      variant='tonal'
                      color='primary'
                      startIcon={<i className='tabler-file-download' />}
                      onClick={() => {
                        const fileUrl = data.file_izin.startsWith('http')
                          ? data.file_izin
                          : `${process.env.NEXT_PUBLIC_API_URL || ''}${data.file_izin.startsWith('/') ? '' : '/'}${data.file_izin}`
                        onViewFile(fileUrl)
                      }}
                      sx={{ py: 0.5, px: 2, height: 26, fontSize: '0.75rem', ml: 1 }}
                    >
                      Lihat Berkas
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
              Alasan
            </Typography>
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                border: '1px solid var(--mui-palette-divider)',
                backgroundColor: 'action.hover'
              }}
            >
              {isPendingApproval ? data?.alasan || '-' : data?.request_canceled_catatan || '-'}
            </Box>
          </Grid>
          <Grid size={12}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
              Status Saat Ini
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{ p: 3, borderRadius: 1, backgroundColor: '#FFFDF0', border: '1px solid #FBEF96', color: '#7A6400' }}
            >
              <Typography variant='body2'>
                <strong>Kondisi Pengajuan:</strong>{' '}
                {isCanceled ? 'DIBATALKAN' : (data?.status_izin || 'MENUNGGU').toUpperCase()}{' '}
                {data?.status_izin === 'Menunggu' &&
                  !isCanceled &&
                  (isRequestCanceled ? 'PERMINTAAN PEMBATALAN AKTIF' : 'PROSES PERSETUJUAN UTAMA')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              Catatan Kedisiplinan <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder='Masukkan catatan peninjauan kedisiplinan karyawan...'
              variant='outlined'
              value={catatanKedisiplinan}
              onChange={e => setCatatanKedisiplinan(e.target.value)}
              disabled={!isPendingApproval}
            />
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 3,
                mt: 2
              }}
            >
              <Button
                variant='outlined'
                color='secondary'
                onClick={onBack}
                disabled={submitting}
                sx={{ px: 5, width: { xs: '100%', sm: 'auto' } }}
              >
                KEMBALI
              </Button>
              {isPendingApproval && (
                <>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={onReject}
                    disabled={submitting}
                    startIcon={<i className='tabler-x' />}
                    sx={{ backgroundColor: '#D32F2F', px: 5, width: { xs: '100%', sm: 'auto' } }}
                  >
                    TOLAK IZIN PEGAWAI
                  </Button>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={onApprove}
                    disabled={submitting}
                    startIcon={<i className='tabler-check' />}
                    sx={{
                      backgroundColor: '#007A53',
                      px: 5,
                      '&:hover': { backgroundColor: '#005F40' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    SETUJUI IZIN PEGAWAI
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// =========================================================================
// COMPONENT: FORM EVALUASI PERMINTAAN PEMBATALAN IZIN PEGAWAI
// =========================================================================
interface RequestCancellationApprovalPegawaiCardProps {
  data: any
  catatanKedisiplinan: string
  setCatatanKedisiplinan: (val: string) => void
  onApproveCancel: () => void
  onRejectCancel: () => void
  submitting: boolean
  onBack: () => void
  onViewFile: (url: string) => void
}

const RequestCancellationApprovalPegawaiCard = ({
  data,
  catatanKedisiplinan,
  setCatatanKedisiplinan,
  onApproveCancel,
  onRejectCancel,
  submitting,
  onBack,
  onViewFile
}: RequestCancellationApprovalPegawaiCardProps) => {
  return (
    <Card
      sx={{
        border: '1px solid var(--mui-palette-divider)',
        boxShadow: 'none',
        overflow: 'hidden',
        backgroundColor: '#fafafa'
      }}
    >
      <Box sx={{ p: 5, borderBottom: '1px solid var(--mui-palette-divider)', backgroundColor: '#fff' }}>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
          Evaluasi Permintaan Pembatalan Izin Pegawai
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label='STATUS AWAL: DISETUJUI' color='success' size='small' sx={{ borderRadius: 1, fontWeight: 600 }} />
          <Chip
            label='TINDAKAN: PERMINTAAN PEMBATALAN KARYAWAN'
            color='warning'
            size='small'
            sx={{ borderRadius: 1, fontWeight: 600 }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* 1. Informasi Pegawai */}
        <Box sx={{ p: 4, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3 }}>
            1. Profil Identitas Pegawai
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Nama Lengkap Pegawai
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.pegawai?.nama_lengkap || data?.nama_pegawai || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                NIP
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.pegawai?.nip || data?.nip || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Loakasi Kerja
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.pegawai?.lokasi_kerja || data?.lokasi_kerja || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Jabatan atau Golongan
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.pegawai?.jabatan || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* 2. Informasi Izin */}
        <Box sx={{ p: 4, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3 }}>
            2. Detail Rencana Perizinan
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Jenis Izin Absensi Kerja
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.jenis_izin || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Tanggal Penyelenggaraan
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.tanggal_izin || '-'}
              </Typography>
            </Grid>
            {data?.file_izin && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Berkas Lampiran Penjelas
                </Typography>
                <Button
                  size='small'
                  variant='tonal'
                  color='primary'
                  startIcon={<i className='tabler-file-download' />}
                  onClick={() => {
                    const fileUrl = data.file_izin.startsWith('http')
                      ? data.file_izin
                      : `${process.env.NEXT_PUBLIC_API_URL || ''}${data.file_izin.startsWith('/') ? '' : '/'}${data.file_izin}`
                    onViewFile(fileUrl)
                  }}
                  sx={{ py: 0.5, px: 2, height: 26, fontSize: '0.75rem' }}
                >
                  Lihat Berkas
                </Button>
              </Grid>
            )}
            <Grid size={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Alasan Izin Semula
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f9f9f9',
                  fontSize: '0.875rem'
                }}
              >
                {data?.alasan || '-'}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* 3. Informasi Legalitas Surat */}
        <Box sx={{ p: 4, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3 }}>
            3. Legalitas Dokumen Surat Izin Karyawan
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Nomor Surat Keputusan Izin
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.surat_izin?.nomor_surat || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Tanggal Penerbitan Sistem
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.surat_izin?.tanggal_cetak || '-'}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                Kondisi Keaktifan Surat
              </Typography>
              <Chip
                label={data?.surat_izin?.status_surat || 'TERDAFTAR AKTIF'}
                color='success'
                size='small'
                sx={{ borderRadius: 1, fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* 4. Informasi Permintaan Pembatalan */}
        <Box
          sx={{
            p: 4,
            backgroundColor: '#fff',
            borderRadius: 1,
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #FFA200'
          }}
        >
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3 }}>
            4. Riwayat Pengajuan Pembatalan Izin Kerja
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Pemohon Pembatalan
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.sumber_pengajuan || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Waktu Kirim Permintaan
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {data?.request_canceled_at || '-'}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Pesan atau Justifikasi Tambahan Pegawai
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #FBEF96',
                  backgroundColor: '#FFFDF0',
                  color: '#665200',
                  fontSize: '0.875rem',
                  fontStyle: 'italic'
                }}
              >
                "{data?.request_canceled_catatan || 'Tidak ada pesan khusus dari karyawan terkait.'}"
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* 5. Keputusan Kedisiplinan */}
        <Box sx={{ p: 4, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
            5. Catatan Kedisiplinan <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder='Masukkan alasan persetujuan atau penolakan pembatalan izin dinas...'
            variant='outlined'
            value={catatanKedisiplinan}
            onChange={e => setCatatanKedisiplinan(e.target.value)}
            helperText='Catatan wajib diisi dan akan dicatat sebagai alasan keputusan pembatalan'
            sx={{ backgroundColor: '#fafafa', mt: 1 }}
          />
        </Box>

        {/* Action Toolbar Bottom */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Button
            variant='outlined'
            color='secondary'
            onClick={onBack}
            disabled={submitting}
            sx={{ px: 4, width: { xs: '100%', sm: 'auto' } }}
          >
            Kembali
          </Button>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Button
              variant='contained'
              color='error'
              onClick={onRejectCancel}
              disabled={submitting}
              startIcon={<i className='tabler-x' />}
              sx={{ backgroundColor: '#D32F2F', px: 4, width: { xs: '100%', sm: 'auto' } }}
            >
              Tolak Permintaan Pembatalan
            </Button>
            <Button
              variant='contained'
              color='success'
              onClick={onApproveCancel}
              disabled={submitting}
              startIcon={<i className='tabler-check' />}
              sx={{
                backgroundColor: '#007A53',
                px: 4,
                '&:hover': { backgroundColor: '#005F40' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Setujui Pencabutan Izin
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// =========================================================================
// COMPONENT DIALOG: PREVIEW DAN LAYOUT PRINT SURAT THERMAL (image_1931d9.jpg)
// =========================================================================
interface SuratDialogProps {
  open: boolean
  data: any
  onClose: () => void
}

const SuratIzinThermalDialog = ({ open, data, onClose }: SuratDialogProps) => {
  if (!data) return null

  // Memisahkan tanggal jika formatnya menggunakan kata penghubung " sampai dengan " atau sejenisnya
  const pemisahTgl = data.tanggal_izin?.includes(' s d ')
    ? ' s d '
    : data.tanggal_izin?.includes(' sampai ')
      ? ' sampai '
      : ''

  const tglMulai = pemisahTgl ? data.tanggal_izin.split(pemisahTgl)[0] : data.tanggal_izin || '-'
  const tglSelesai = pemisahTgl ? data.tanggal_izin.split(pemisahTgl)[1] : ''

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogContent sx={{ p: 4, backgroundColor: '#f4f5f7', display: 'flex', justifyContent: 'center' }}>
        {/* Kertas Mockup Thermal */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '320px',
            backgroundColor: '#fff',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
            p: '20px 15px',
            color: '#000'
          }}
        >
          {/* Wrapper Area yang di-print (Id disesuaikan dengan handler kepegawaian) */}
          <div
            id='thermal-print-content-pegawai'
            style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', color: '#000' }}
          >
            {/* Header Konten Kepegawaian */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>
                DIVISI SUMBER DAYA MANUSIA
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>MANAJEMEN HRD KORPORASI</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>UNIT PELAYANAN INTERNAL</div>
              <div style={{ fontSize: '12px' }}>JAKARTA HEAD OFFICE</div>
            </div>

            {/* Double Divider Line ===== */}
            <div
              style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', height: '2px', margin: '6px 0' }}
            ></div>

            {/* No Surat & NIP */}
            <div style={{ display: 'flex', marginBottom: '2px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>No SK Izin</span>
              <span>: {data.surat_izin?.nomor_surat || '-'}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>NIP Karyawan</span>
              <span>: {data?.pegawai?.nip || data?.nip || '-'}</span>
            </div>

            {/* Single Divider Line ----- */}
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

            <div style={{ marginBottom: '6px' }}>Dengan ini menerangkan bahwa:</div>

            {/* Biodata Pegawai Section */}
            <div style={{ display: 'flex', marginBottom: '3px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>Nama</span>
              <span>: {data?.pegawai?.nama_lengkap || data?.nama_pegawai || '-'}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '3px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>Lokasi Kerja</span>
              <span>: {data?.lokasi_kerja || '-'}</span>
            </div>
            {/* <div style={{ display: 'flex', marginBottom: '3px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>Jabatan</span>
              <span>: {data?.pegawai?.jabatan || '-'}</span>
            </div> */}
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '95px', flexShrink: 0 }}>Jenis Izin</span>
              <span>: {data.jenis_izin}</span>
            </div>

            {/* Single Divider Line ----- */}
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

            {/* Tanggal detail layout */}
            <div>
              <div>Masa Berlaku Izin :</div>
              <div style={{ paddingLeft: '45px', fontWeight: 'bold' }}>{tglMulai}</div>
              {tglSelesai && (
                <>
                  <div style={{ paddingLeft: '45px' }}>sampai dengan</div>
                  <div style={{ paddingLeft: '45px', fontWeight: 'bold' }}>{tglSelesai}</div>
                </>
              )}
            </div>

            <div style={{ marginTop: '10px', marginBottom: '6px' }}>
              Telah diberikan izin resmi sesuai regulasi kedisiplinan kerja perusahaan.
            </div>

            {/* Divider sebelum signature */}
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

            {/* Blok Tanda Tangan Otoritas HRD */}
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <div style={{ fontSize: '12px' }}>------- Pejabat HRD -------</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', margin: '6px 0' }}>
                {data.petugas_approval || 'Manajer Personalia'}
              </div>
              <div style={{ fontSize: '12px' }}>---------------------------</div>
            </div>

            {/* QR Code Verifikasi */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Scan QR untuk verifikasi sistem</div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(data.surat_izin?.qrcode_token || 'VALID-PEGAWAI')}`}
                alt='QR Verification'
                style={{ width: '110px', height: '110px', display: 'inline-block' }}
              />
            </div>
          </div>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, backgroundColor: '#fff' }}>
        <Button onClick={onClose} color='secondary' variant='outlined'>
          Tutup
        </Button>
        <Button
          onClick={() => {
            const printContent = document.getElementById('thermal-print-content-pegawai')
            if (printContent) {
              const windowUrl = 'about:blank'
              const uniqueName = new Date().getTime()
              const printWindow = window.open(windowUrl, uniqueName.toString(), 'left=5000,top=5000,width=0,height=0')
              printWindow?.document.write(
                `<html><head><style>@page { size: 80mm auto; margin: 0; } body { font-family: "Courier New", monospace; width: 72mm; margin: 0 auto; padding: 10px; font-size: 13px; } * { -webkit-print-color-adjust: exact; }</style></head><body>${printContent.innerHTML}<script>window.onload = function() { window.print(); window.close(); };</script></body></html>`
              )
              printWindow?.document.close()
            }
          }}
          color='success'
          variant='contained'
          startIcon={<i className='tabler-printer' />}
          sx={{ backgroundColor: '#007A53', '&:hover': { backgroundColor: '#005F40' } }}
        >
          Cetak Sekarang
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DetailPerizinanPegawaiPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const idIzin = searchParams.get('id')
  const isViewOnly = searchParams.get('view') === 'true'

  const redirectBackUrl =
    searchParams.get('from') == 'kedisiplinan'
      ? '/app/perizinan-pegawai/kedisiplinan'
      : '/app/perizinan-pegawai/kewaliasuhan'

  // State Utama
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // State Dialog Konfirmasi Workflow Pembatalan & Approval
  const [openConfirmCancel, setOpenConfirmCancel] = useState<boolean>(false)
  const [openConfirmReject, setOpenConfirmReject] = useState<boolean>(false)
  const [openConfirmApproveCancel, setOpenConfirmApproveCancel] = useState<boolean>(false)
  const [openConfirmRejectCancel, setOpenConfirmRejectCancel] = useState<boolean>(false)
  const [openSuratDialog, setOpenSuratDialog] = useState<boolean>(false)

  // State PDF Preview Modal Dokumen / Surat Keterangan Pendukung
  const [openPdf, setOpenPdf] = useState<boolean>(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfTitle, setPdfTitle] = useState<string>('')

  const handleViewFile = (url: string) => {
    setPdfUrl(url)
    setPdfTitle(`Berkas Izin ${data?.pegawai?.nama_lengkap || 'Pegawai'} - ${data?.jenis_izin || 'Izin'}`)
    setOpenPdf(true)
  }

  // State Form Input Catatan Evaluasi Internal
  const [alasanRequestPembatalan, setAlasanRequestPembatalan] = useState<string>('')
  const [catatanManajemen, setCatatanManajemen] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Fetch data detail pengajuan berdasarkan ID izin
  useEffect(() => {
    if (!idIzin) {
      setLoading(false)
      return
    }

    setLoading(true)
    dispatch(fetchPerizinanSantriById(idIzin))
      .unwrap()
      .then((res: any) => {
        setData(res.data)
      })
      .catch((err: any) => {
        toast.error(err || 'Gagal mengambil data detail perizinan pegawai')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [idIzin, dispatch])

  if (loading) {
    return (
      <Box sx={{ p: 6 }}>
        <Skeleton variant='rectangular' height={60} sx={{ mb: 4, borderRadius: 1 }} />
        <Skeleton variant='rectangular' height={250} sx={{ mb: 4, borderRadius: 1 }} />
        <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 1 }} />
      </Box>
    )
  }

  if (!idIzin || !data) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ mb: 4 }}>
          Data pengajuan perizinan pegawai tidak ditemukan atau ID tidak valid.
        </Typography>
        <Button variant='contained' onClick={() => router.push(redirectBackUrl)}>
          Kembali ke Daftar Perizinan
        </Button>
      </Box>
    )
  }

  const isAgreed = data.status_izin == 'Disetujui'
  const isCanceled = data.status_izin === 'Dibatalkan' || data.petugas_yang_membatalkan !== '-'
  const isRequestCanceled = data.is_request_canceled
  const { label: badgeLabel, color: badgeColor } = getBadgeTheme(data.status_izin, isCanceled, isRequestCanceled)

  const showCancelButton =
    (data.status_izin === 'Menunggu' || data.status_izin === 'Disetujui') && !isCanceled && !isRequestCanceled

  // Handler Print Langsung
  const handlePrintSuratDirect = () => {
    setOpenSuratDialog(true)
    setTimeout(() => {
      // Menargetkan container khusus struk dokumen perizinan kepegawaian
      const printContent = document.getElementById('thermal-print-content-pegawai')
      if (printContent) {
        const windowUrl = 'about:blank'
        const uniqueName = new Date().getTime()
        const printWindow = window.open(windowUrl, uniqueName.toString(), 'left=5000,top=5000,width=0,height=0')

        printWindow?.document.write(`
        <html>
          <head>
            <title>Cetak Dokumen Surat Izin Pegawai</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              body {
                font-family: "Courier New", Courier, monospace;
                width: 72mm;
                margin: 0 auto;
                padding: 10px 2px;
                background-color: #fff;
                color: #000;
                font-size: 13px;
                line-height: 1.3;
              }
              .text-center { text-align: center; }
              .fw-bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .double-divider { border-top: 1px double #000; border-bottom: 1px double #000; height: 2px; margin: 6px 0; }
              .flex-container { display: flex; }
              .label { width: 100px; flex-shrink: 0; }
              .qr-container { text-align: center; margin-top: 12px; }
              .qr-container img { width: 130px; height: 130px; display: inline-block; }

              /* Memastikan hasil cetak latar belakang bersih dan teks tajam */
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `)
        printWindow?.document.close()
        printWindow?.focus()
      }
    }, 250)
  }

  // Handler Pembatalan dari Sisi Pemohon / Pegawai (?view=true)
  const handleExecutePembatalan = async () => {
    try {
      if (!alasanRequestPembatalan) return

      if (data.status_izin === 'Menunggu') {
        await dispatch(postPerizinanCancel({ id: idIzin })).unwrap()
      } else {
        await dispatch(
          postPerizinanRequestCancellation({
            id: idIzin,
            payload: {
              is_request_canceled: 'true',
              request_canceled_catatan: alasanRequestPembatalan,
              request_canceled_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            }
          })
        ).unwrap()
      }

      toast.success(
        data.status_izin === 'Menunggu'
          ? 'Pengajuan izin pegawai berhasil dibatalkan secara langsung'
          : 'Permintaan pembatalan perizinan pegawai berhasil dikirim ke HRD'
      )
      router.push(redirectBackUrl)
    } catch (err: any) {
      toast.error(err || 'Gagal memproses pembatalan izin pegawai')
    }
  }

  // Handler Aksi Workflow Approval Pengajuan Normal dari Sisi HRD / Atasan
  const handleTriggerReject = () => {
    if (!catatanManajemen.trim()) {
      toast.error('Catatan evaluasi manajemen wajib diisi!')
      return
    }
    setOpenConfirmReject(true)
  }

  const handleProcessApproval = async (status: 'Disetujui' | 'Ditolak') => {
    setOpenConfirmReject(false)
    setSubmitting(true)
    try {
      await dispatch(
        postPerizinanApprove({
          id: idIzin,
          payload: {
            status_approval: status,
            catatan_approval: catatanManajemen,
            is_pegawai: true
          }
        })
      ).unwrap()

      toast.success(`Pengajuan izin pegawai berhasil dikonfirmasi sebagai: ${status}`)
      router.push(redirectBackUrl)
    } catch (err: any) {
      toast.error(err || 'Gagal memproses keputusan perizinan pegawai')
    } finally {
      setSubmitting(false)
    }
  }

  // Handler Aksi Workflow Evaluasi Request Pembatalan oleh Otoritas HRD
  const handleTriggerApproveCancellation = () => {
    if (!catatanManajemen.trim()) {
      toast.error('Catatan keputusan pembatalan wajib diisi!')
      return
    }
    setOpenConfirmApproveCancel(true)
  }

  const handleTriggerRejectCancellation = () => {
    if (!catatanManajemen.trim()) {
      toast.error('Catatan keputusan pembatalan wajib diisi!')
      return
    }
    setOpenConfirmRejectCancel(true)
  }

  const handleExecuteApproveCancellation = async () => {
    setOpenConfirmApproveCancel(false)
    setSubmitting(true)
    try {
      await dispatch(
        postPerizinanCancel({
          id: idIzin,
          payload: { alasan_penutupan: catatanManajemen, is_pegawai: true }
        })
      ).unwrap()

      toast.success('Permintaan pembatalan disetujui, perizinan dinas pegawai resmi dicabut.')
      router.push(redirectBackUrl)
    } catch (err: any) {
      toast.error(err || 'Gagal menyetujui pembatalan izin pegawai')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExecuteRejectCancellation = async () => {
    setOpenConfirmRejectCancel(false)
    setSubmitting(true)
    try {
      await dispatch(
        postPerizinanApprove({
          id: idIzin,
          payload: {
            status_approval: 'Disetujui',
            catatan_approval: catatanManajemen,
            is_pegawai: true
          }
        })
      ).unwrap()

      toast.success('Permintaan pembatalan ditolak. Surat izin kerja pegawai tetap aktif.')
      router.push(redirectBackUrl)
    } catch (err: any) {
      toast.error(err || 'Gagal menolak pembatalan izin pegawai')
    } finally {
      setSubmitting(false)
    }
  }

  /* =========================================================================
     RENDER 1: MODE VIEW ONLY (Dari Sisi Pegawai / Dashboard Monitoring Umum)
     ========================================================================= */
  if (isViewOnly) {
    return (
      <Box sx={{ p: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 4,
            mb: 6
          }}
        >
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 500, mb: 1 }}>
              Detail Log Perizinan Pegawai
            </Typography>
          </Box>
          <Chip label={badgeLabel} color={badgeColor} variant='tonal' size='medium' sx={{ fontWeight: 500, px: 2 }} />
        </Box>

        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 7 }}>
            <InformasiPengajuanPegawaiCard data={data} onViewFile={handleViewFile} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <StatusProsesPegawaiCard data={data} isCanceled={isCanceled} isRequestCanceled={isRequestCanceled} />
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Button
            onClick={() => router.push(redirectBackUrl)}
            variant='outlined'
            color='secondary'
            startIcon={<i className='tabler-arrow-left' />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Kembali
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {isAgreed && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Button
                  onClick={() => setOpenSuratDialog(true)}
                  variant='contained'
                  color='primary'
                  startIcon={<i className='tabler-file-text' />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Lihat Surat
                </Button>

                <Button
                  onClick={handlePrintSuratDirect}
                  variant='contained'
                  color='secondary'
                  startIcon={<i className='tabler-printer' />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Cetak
                </Button>
              </Box>
            )}

            {showCancelButton && (
              <Button
                onClick={() => setOpenConfirmCancel(true)}
                variant='contained'
                color='error'
                startIcon={<i className='tabler-trash-x' />}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Batalkan Pengajuan
              </Button>
            )}
          </Box>
        </Box>

        <ConfirmDialog
          open={openConfirmCancel}
          title={
            data.status_izin === 'Menunggu' ? 'Batalkan Pengajuan Izin Pegawai?' : 'Ajukan Permintaan Pembatalan Izin?'
          }
          description={
            data.status_izin === 'Menunggu'
              ? 'Apakah Anda yakin ingin membatalkan pengajuan izin ini? Tindakan ini menghapus permohonan aktif Anda.'
              : 'Pembatalan izin yang sudah disetujui memerlukan peninjauan dari pimpinan sekolah. Tuliskan alasan pembatalan Anda.'
          }
          inputs={[
            {
              name: 'alasan',
              label: 'Alasan Pembatalan',
              required: true,
              value: alasanRequestPembatalan,
              onChange: setAlasanRequestPembatalan
            }
          ]}
          confirmText='Ya, Proses'
          cancelText='Kembali'
          confirmVariant='danger'
          onClose={() => setOpenConfirmCancel(false)}
          onConfirm={handleExecutePembatalan}
        />

        <SuratIzinThermalDialog open={openSuratDialog} data={data} onClose={() => setOpenSuratDialog(false)} />

        {/* COMPONENT PREVIEW MODAL FILE PENDUKUNG */}
        <Dialog
          open={openPdf}
          onClose={() => {
            setOpenPdf(false)
            setPdfUrl('')
          }}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{pdfTitle}</span>
            <IconButton
              onClick={() => {
                setOpenPdf(false)
                setPdfUrl('')
              }}
            >
              <i className='tabler-x' />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, height: '650px' }}>
            {pdfUrl ? (
              <iframe src={pdfUrl} width='100%' height='100%' style={{ border: 'none' }} title='PDF Preview' />
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenPdf(false)
                setPdfUrl('')
              }}
              color='secondary'
              variant='tonal'
            >
              Tutup
            </Button>
            <Button
              onClick={() => window.open(pdfUrl, '_blank')}
              color='primary'
              variant='contained'
              startIcon={<i className='tabler-external-link' />}
            >
              Buka di Tab Baru
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  /* =========================================================================
     RENDER 2: MODE APPROVAL EVALUASI (Dari Sisi Atasan / Admin HRD)
     ========================================================================= */
  return (
    <Box sx={{ p: { xs: 4, md: 6 } }}>
      {isRequestCanceled ? (
        <RequestCancellationApprovalPegawaiCard
          data={data}
          catatanKedisiplinan={catatanManajemen}
          setCatatanKedisiplinan={setCatatanManajemen}
          onApproveCancel={handleTriggerApproveCancellation}
          onRejectCancel={handleTriggerRejectCancellation}
          submitting={submitting}
          onBack={() => router.push(redirectBackUrl)}
          onViewFile={handleViewFile}
        />
      ) : (
        <ApprovalKepegawaianCard
          data={data}
          isCanceled={isCanceled}
          isRequestCanceled={isRequestCanceled}
          catatanKedisiplinan={catatanManajemen}
          setCatatanKedisiplinan={setCatatanManajemen}
          onApprove={() => handleProcessApproval('Disetujui')}
          onReject={handleTriggerReject}
          submitting={submitting}
          onBack={() => router.push(redirectBackUrl)}
          onViewFile={handleViewFile}
        />
      )}

      {/* PORTAL EVALUASI PERIZINAN NORMAL */}
      <ConfirmDialog
        open={openConfirmReject}
        title='Tolak Pengajuan Izin Pegawai?'
        description='Apakah anda yakin berkas izin pegawai ini DITOLAK? Tindakan keputusan ini akan menutup form pengajuan.'
        confirmText='Ya, Tolak'
        cancelText='Kembali'
        confirmVariant='danger'
        onClose={() => setOpenConfirmReject(false)}
        onConfirm={() => handleProcessApproval('Ditolak')}
      />

      {/* PORTAL EVALUASI REQ CANCELLATION */}
      <ConfirmDialog
        open={openConfirmApproveCancel}
        title='Setujui Pembatalan Izin Kerja?'
        description='Status perizinan pegawai akan resmi dibatalkan dan dianggap absen dinas. Lanjutkan keputusan?'
        confirmText='Ya, Batalkan'
        cancelText='Kembali'
        confirmVariant='danger'
        onClose={() => setOpenConfirmApproveCancel(false)}
        onConfirm={handleExecuteApproveCancellation}
      />

      <ConfirmDialog
        open={openConfirmRejectCancel}
        title='Tolak Permintaan Pembatalan?'
        description='Permintaan pembatalan akan ditolak oleh manajemen, sehingga izin dinas pegawai tetap berlaku sah. Lanjutkan?'
        confirmText='Ya, Tolak Permintaan'
        cancelText='Kembali'
        confirmVariant='primary'
        onClose={() => setOpenConfirmRejectCancel(false)}
        onConfirm={handleExecuteRejectCancellation}
      />

      {/* GLOBAL PDF PREVIEW MODAL */}
      <Dialog
        open={openPdf}
        onClose={() => {
          setOpenPdf(false)
          setPdfUrl('')
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{pdfTitle}</span>
          <IconButton
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '650px' }}>
          {pdfUrl ? (
            <iframe src={pdfUrl} width='100%' height='100%' style={{ border: 'none' }} title='PDF Preview' />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPdf(false)
              setPdfUrl('')
            }}
            color='secondary'
            variant='tonal'
          >
            Tutup
          </Button>
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            color='primary'
            variant='contained'
            startIcon={<i className='tabler-external-link' />}
          >
            Buka di Tab Baru
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DetailPerizinanPegawaiPage
