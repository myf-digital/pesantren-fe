// React Imports
import React from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Component Imports
import FilterTanggal from './FilterTanggal'
import CustomAvatar from '@core/components/mui/Avatar'

// Third-party Imports
import { format, startOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import classnames from 'classnames'

// Server Action Imports
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import { can, normalizeResource } from '@/libs/permission'

const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Box
      sx={{
        display: { xs: 'grid', sm: 'flex' },
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'none' },
        gap: { xs: 4, sm: 6 },
        width: '100%',
        flexWrap: 'wrap',
        '& > *': {
          flex: { sm: '1 1 0px' }
        }
      }}
    >
      {children}
    </Box>
  </Grid>
)

const CRMCard = ({
  title,
  subtitle,
  stats,
  avatarColor,
  avatarIcon,
  avatarSkin,
  avatarSize,
  chipText,
  chipColor,
  chipVariant,
  href
}: any) => {
  const CardWrapper = href ? Link : 'div'

  return (
    <Card
      component={CardWrapper as any}
      href={href}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: href ? 'translateY(-2px)' : 'none',
          boxShadow: href ? 4 : 'none'
        }
      }}
    >
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          p: 2.5,
          gap: 2.5,
          height: '100%'
        }}
      >
        <CustomAvatar
          variant='rounded'
          skin={avatarSkin || 'light'}
          size={32}
          color={avatarColor}
          sx={{ flexShrink: 0 }}
        >
          <i className={classnames(avatarIcon, 'text-[18px]')} />
        </CustomAvatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>
              {stats}
            </Typography>
            {chipText && (
              <Chip
                label={chipText}
                color={chipColor}
                variant={chipVariant || 'tonal'}
                size='small'
                sx={{
                  height: 16,
                  fontSize: '9px',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', p: 5, width: '100%' }}
        >
          <CustomAvatar variant='rounded' skin={avatarSkin || 'light'} size={avatarSize || 44} color={avatarColor}>
            <i className={classnames(avatarIcon, 'text-[24px]')} />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <Typography variant='h5' sx={{ fontSize: '16px', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography color='text.disabled' sx={{ fontSize: '13px' }}>
              {subtitle}
            </Typography>
            <Typography color='text.primary' variant='h4' sx={{ fontWeight: 600, mt: 1 }}>
              {stats}
            </Typography>
          </Box>
          {chipText ? (
            <Chip label={chipText} color={chipColor} variant={chipVariant || 'tonal'} size='small' />
          ) : (
            <Chip label='Placeholder' size='small' sx={{ visibility: 'hidden' }} />
          )}
        </CardContent>
        {href && (
          <Box sx={{ px: 5, pb: 5, width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
            <Button
              variant='text'
              color='primary'
              size='small'
              endIcon={<i className='tabler-chevron-right' />}
              sx={{ p: 0, '&:hover': { background: 'transparent' } }}
            >
              Lihat Detail
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  )
}

const DashboardCRM = async (props: {
  searchParams: Promise<{ tanggal?: string; tanggal_mulai?: string; tanggal_selesai?: string }>
}) => {
  const searchParams = await props.searchParams
  const tanggal_mulai =
    searchParams.tanggal_mulai || searchParams.tanggal || format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const tanggal_selesai = searchParams.tanggal_selesai || searchParams.tanggal || format(new Date(), 'yyyy-MM-dd')

  // Vars
  const session = await getServerSession(authOptions)
  const token = session?.access_token

  const tokenCookies = await getToken({
    req: { cookies: await cookies() } as any,
    secret: process.env.NEXTAUTH_SECRET
  })
  const permissions = tokenCookies?.permissions ?? {}

  const canSantri = can(permissions, normalizeResource('/app/santri/list'), 'view')
  const canPegawai = can(permissions, normalizeResource('/app/pegawai/list'), 'view')
  const canAbsenKamar = can(permissions, normalizeResource('/app/report/absen-harian-santri/list'), 'view')
  const canAbsenKelas = can(permissions, normalizeResource('/app/report/absen-kelas-santri/list'), 'view')
  const canTemuan = can(permissions, normalizeResource('/app/report/kebersihan-temuan/list'), 'view')
  const canPerizinanSantri = can(permissions, normalizeResource('/app/report/perizinan-santri/list'), 'view')
  const canAbsenPegawai = can(permissions, normalizeResource('/app/report/absen-harian-pegawai/list'), 'view')
  const canSesiGuru = can(permissions, normalizeResource('/app/report/jurnal-kelas/list'), 'view')
  const canPetugasInspeksi = can(permissions, normalizeResource('/app/report/kebersihan-petugas/list'), 'view')
  const canPerizinanPegawai = can(permissions, normalizeResource('/app/report/perizinan-pegawai/list'), 'view')

  const hasAnyPermission =
    canSantri ||
    canPegawai ||
    canAbsenKamar ||
    canAbsenKelas ||
    canTemuan ||
    canPerizinanSantri ||
    canAbsenPegawai ||
    canSesiGuru ||
    canPetugasInspeksi ||
    canPerizinanPegawai

  let summaryData = {
    total_santri: { aktif: 0, keseluruhan: 0, persentase: 0 },
    total_guru_aktif: 0,
    total_pegawai_aktif: 0,
    total_absensi: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_absensi_kelas: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_temuan: 0,
    temuan_kotor: 0,
    temuan_rusak: 0,
    total_perizinan: 0,
    perizinan_menunggu: 0,
    perizinan_disetujui: 0,
    perizinan_overdue: 0,
    total_absensi_pegawai: {
      hadir: 0,
      persentase: 0,
      izin: 0,
      persentase_izin: 0,
      sakit: 0,
      persentase_sakit: 0,
      alfa: 0,
      persentase_alfa: 0
    },
    total_sesi_guru: 0,
    total_petugas_inspeksi: 0,
    total_perizinan_pegawai: {
      total: 0,
      menunggu: 0,
      disetujui: 0,
      overdue: 0
    }
  }

  if (token) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/summary?tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        }
      )
      const json = await res.json()
      if (json?.status && json?.data) {
        summaryData = json.data
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }

  return (
    <Grid container spacing={6}>
      {hasAnyPermission && (
        <Grid size={12}>
          <Card sx={{ p: 5, overflow: 'visible' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
            >
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  Dashboard
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Data pesantren per rentang tanggal terpilih
                </Typography>
              </Box>
              <Box sx={{ width: 300 }}>
                <FilterTanggal tanggalMulai={tanggal_mulai} tanggalSelesai={tanggal_selesai} />
              </Box>
            </Box>
          </Card>
        </Grid>
      )}

      {!hasAnyPermission && (
        <Grid size={12}>
          <Card
            sx={{
              p: 6,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'action.selected',
                  color: 'primary.main',
                  flexShrink: 0
                }}
              >
                <i className='tabler-user-shield' style={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant='body2' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                  {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Selamat Datang, {session?.userdata?.full_name || session?.userdata?.username || 'User'}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    mb: 3,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}
                >
                  <Chip
                    label={`Username: ${session?.userdata?.username || '-'}`}
                    color='primary'
                    variant='outlined'
                    size='small'
                  />
                  <Chip
                    label={`Cabang: ${session?.userdata?.pegawai?.organizationUnit?.cabang?.nama_cabang || 'Pusat'}`}
                    color='info'
                    variant='outlined'
                    size='small'
                  />
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      )}

      {canSantri || canPegawai ? (
        <Grid size={12}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Informasi
          </Typography>
        </Grid>
      ) : (
        ''
      )}
      {(canSantri || canPegawai) && (
        <ScrollRow>
          {canSantri && (
            <>
              <CRMCard
                title='Total Santri'
                subtitle='Santri Aktif'
                stats={summaryData.total_santri.aktif.toLocaleString('id-ID')}
                avatarColor='warning'
                avatarIcon='tabler-users'
                avatarSkin='light'
                avatarSize={44}
                chipText={`${summaryData.total_santri.persentase}%`}
                chipColor='warning'
                chipVariant='tonal'
                href={`/app/santri/list?status=1`}
              />
              <CRMCard
                title='Total Guru Aktif'
                subtitle='Guru'
                stats={summaryData.total_guru_aktif.toLocaleString('id-ID')}
                avatarColor='info'
                avatarIcon='tabler-school'
                avatarSkin='light'
                avatarSize={44}
                href={`/app/pegawai/list?status_pegawai=guru`}
              />
            </>
          )}
          {canPegawai && (
            <CRMCard
              title='Total Pegawai Aktif'
              subtitle='Pegawai (Non-Guru)'
              stats={summaryData.total_pegawai_aktif.toLocaleString('id-ID')}
              avatarColor='success'
              avatarIcon='tabler-briefcase'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/pegawai/list?status_pegawai=pegawai`}
            />
          )}
        </ScrollRow>
      )}

      {canTemuan && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Temuan
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Temuan Kotor'
              subtitle='Laporan Kebersihan'
              stats={summaryData.temuan_kotor.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-trash'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/kebersihan-temuan/list?status_kondisi=KOTOR&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Temuan Rusak'
              subtitle='Laporan Kerusakan'
              stats={summaryData.temuan_rusak.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-tool'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/kebersihan-temuan/list?status_kondisi=RUSAK&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}

      {canSesiGuru || canPetugasInspeksi ? (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Akademik & Inspeksi
            </Typography>
          </Grid>
          <ScrollRow>
            {canSesiGuru && (
              <CRMCard
                title='Sesi Guru'
                subtitle='Total Jurnal Mengajar'
                stats={summaryData.total_sesi_guru.toLocaleString('id-ID')}
                avatarColor='info'
                avatarIcon='tabler-school'
                avatarSkin='light'
                avatarSize={44}
                href={`/app/report/jurnal-kelas/list?tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
              />
            )}
            {canPetugasInspeksi && (
              <CRMCard
                title='Petugas Inspeksi'
                subtitle='Petugas Aktif Melakukan Inspeksi'
                stats={summaryData.total_petugas_inspeksi.toLocaleString('id-ID')}
                avatarColor='success'
                avatarIcon='tabler-clipboard-check'
                avatarSkin='light'
                avatarSize={44}
                href={`/app/report/kebersihan-petugas/list?tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
              />
            )}
          </ScrollRow>
        </>
      ) : null}

      {canPerizinanSantri && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Perizinan Santri
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Perizinan Menunggu'
              subtitle='Menunggu Approval'
              stats={summaryData.perizinan_menunggu.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-hourglass'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-santri/list?status=Menunggu&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Perizinan Disetujui'
              subtitle='Telah Disetujui'
              stats={summaryData.perizinan_disetujui.toLocaleString('id-ID')}
              avatarColor='success'
              avatarIcon='tabler-circle-check'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-santri/list?status=Disetujui&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Perizinan Overdue'
              subtitle='Terlambat Kembali'
              stats={summaryData.perizinan_overdue.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-clock'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-santri/list?kondisi=Overdue&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}

      {canPerizinanPegawai && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Perizinan Pegawai
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Perizinan Menunggu'
              subtitle='Menunggu Approval'
              stats={summaryData.total_perizinan_pegawai.menunggu.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-hourglass'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-pegawai/list?status=Menunggu&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Perizinan Disetujui'
              subtitle='Telah Disetujui'
              stats={summaryData.total_perizinan_pegawai.disetujui.toLocaleString('id-ID')}
              avatarColor='success'
              avatarIcon='tabler-circle-check'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-pegawai/list?status=Disetujui&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Perizinan Overdue'
              subtitle='Terlambat Kembali'
              stats={summaryData.total_perizinan_pegawai.overdue.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-clock'
              avatarSkin='light'
              avatarSize={44}
              href={`/app/report/perizinan-pegawai/list?kondisi=Overdue&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}

      {canAbsenKamar && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Absensi Kamar Santri
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Total Absensi'
              subtitle='Kehadiran'
              stats={`${summaryData.total_absensi.persentase}%`}
              avatarColor='success'
              avatarIcon='tabler-calendar-user'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi.hadir.toLocaleString('id-ID')} Hadir`}
              chipColor='success'
              chipVariant='tonal'
              href={`/app/report/absen-harian-santri/list?status=Hadir&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Izin'
              subtitle='Santri Izin'
              stats={summaryData.total_absensi.izin.toLocaleString('id-ID')}
              avatarColor='info'
              avatarIcon='tabler-user-check'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi.persentase_izin}%`}
              chipColor='info'
              chipVariant='tonal'
              href={`/app/report/absen-harian-santri/list?status=Izin&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Sakit'
              subtitle='Santri Sakit'
              stats={summaryData.total_absensi.sakit.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-user-exclamation'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi.persentase_sakit}%`}
              chipColor='warning'
              chipVariant='tonal'
              href={`/app/report/absen-harian-santri/list?status=Sakit&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Alfa'
              subtitle='Santri Alfa'
              stats={summaryData.total_absensi.alfa.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-user-x'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi.persentase_alfa}%`}
              chipColor='error'
              chipVariant='tonal'
              href={`/app/report/absen-harian-santri/list?status=Alfa&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}

      {canAbsenKelas && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Absensi Kelas Santri
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Total Absensi'
              subtitle='Kehadiran'
              stats={`${summaryData.total_absensi_kelas.persentase}%`}
              avatarColor='success'
              avatarIcon='tabler-calendar-user'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_kelas.hadir.toLocaleString('id-ID')} Hadir`}
              chipColor='success'
              chipVariant='tonal'
              href={`/app/report/absen-kelas-santri/list?status=Hadir&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Izin'
              subtitle='Santri Izin'
              stats={summaryData.total_absensi_kelas.izin.toLocaleString('id-ID')}
              avatarColor='info'
              avatarIcon='tabler-user-check'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_kelas.persentase_izin}%`}
              chipColor='info'
              chipVariant='tonal'
              href={`/app/report/absen-kelas-santri/list?status=Izin&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Sakit'
              subtitle='Santri Sakit'
              stats={summaryData.total_absensi_kelas.sakit.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-user-exclamation'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_kelas.persentase_sakit}%`}
              chipColor='warning'
              chipVariant='tonal'
              href={`/app/report/absen-kelas-santri/list?status=Sakit&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Alfa'
              subtitle='Santri Alfa'
              stats={summaryData.total_absensi_kelas.alfa.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-user-x'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_kelas.persentase_alfa}%`}
              chipColor='error'
              chipVariant='tonal'
              href={`/app/report/absen-kelas-santri/list?status=Alfa&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}

      {canAbsenPegawai && (
        <>
          <Grid size={12}>
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
              Absensi Pegawai
            </Typography>
          </Grid>
          <ScrollRow>
            <CRMCard
              title='Total Absensi'
              subtitle='Kehadiran'
              stats={`${summaryData.total_absensi_pegawai.persentase}%`}
              avatarColor='success'
              avatarIcon='tabler-calendar-user'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_pegawai.hadir.toLocaleString('id-ID')} Hadir`}
              chipColor='success'
              chipVariant='tonal'
              href={`/app/report/absen-harian-pegawai/list?status=Hadir&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Izin'
              subtitle='Pegawai Izin'
              stats={summaryData.total_absensi_pegawai.izin.toLocaleString('id-ID')}
              avatarColor='info'
              avatarIcon='tabler-user-check'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_pegawai.persentase_izin}%`}
              chipColor='info'
              chipVariant='tonal'
              href={`/app/report/absen-harian-pegawai/list?status=Izin&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Sakit'
              subtitle='Pegawai Sakit'
              stats={summaryData.total_absensi_pegawai.sakit.toLocaleString('id-ID')}
              avatarColor='warning'
              avatarIcon='tabler-user-exclamation'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_pegawai.persentase_sakit}%`}
              chipColor='warning'
              chipVariant='tonal'
              href={`/app/report/absen-harian-pegawai/list?status=Sakit&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
            <CRMCard
              title='Absensi Alfa'
              subtitle='Pegawai Alfa'
              stats={summaryData.total_absensi_pegawai.alfa.toLocaleString('id-ID')}
              avatarColor='error'
              avatarIcon='tabler-user-x'
              avatarSkin='light'
              avatarSize={44}
              chipText={`${summaryData.total_absensi_pegawai.persentase_alfa}%`}
              chipColor='error'
              chipVariant='tonal'
              href={`/app/report/absen-harian-pegawai/list?status=Alfa&tanggal_mulai=${tanggal_mulai}&tanggal_selesai=${tanggal_selesai}`}
            />
          </ScrollRow>
        </>
      )}
    </Grid>
  )
}

export default DashboardCRM
