'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'

import { format } from 'date-fns'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardInfo from '../common/DashboardInfo'
import DashboardLink from '../common/DashboardLink'

import { useAppDispatch } from '@/redux-store/hook'
import { fetchNonFormalLevelTwo } from '../../../slice'
import { dashboardColors, scoreColor } from '../common/dashboardTheme'
import DashboardDonut from '../common/DashboardDonut'
import DashboardStatus from '../common/DashboardStatus'

const programs = [
  [
    'MDA',
    'Madrasah Diniyah Awaliyah',
    'tabler-building-mosque',
    '212',
    '24',
    '12',
    '93,5%',
    '94,2%',
    'Jam Pelajaran 62/66'
  ],
  ['AL-QURAN', 'Tahfidz & Tilawah', 'tabler-book', '212', '12', '14', '95,1%', '95,8%', 'Target Tilawah 92%'],
  ['FASHOLATAN', 'Hafalan & Praktek', 'tabler-pray', '106', '10', '8', '95,1%', '94,6%', 'Target Hafalan 91%'],
  ['BAHASA', 'Arab, Inggris, Jepang', 'tabler-message', '150', '8', '8', '95,0%', '94,5%', 'Target Percakapan 89%'],
  [
    'EKSTRAKURIKULER',
    'Pengembangan Minat & Bakat',
    'tabler-medal',
    '342',
    '8',
    '12',
    '93,2%',
    '96,2%',
    'Program Aktif 8/8'
  ]
]

const kelas: any = {
  MDA: 'Kelas/Group',
  'AL-QURAN': 'Halaqoh',
  FASHOLATAN: 'Kelompok',
  BAHASA: 'Kelas',
  EKSTRAKURIKULER: 'Jenis Ekskul'
}

function Program({ p }: any) {
  return (
    <DashboardCard sx={{ p: 1.05, height: 280, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{p[0]}</Typography>
      <Typography sx={{ fontSize: 11, color: '#667085', minHeight: 18 }}>{p[1]}</Typography>
      <Box
        sx={{
          width: 68,
          height: 68,
          mx: 'auto',
          my: 1.2,
          borderRadius: '50%',
          bgcolor: '#eaf6ef',
          border: '1px solid #cde6d7',
          display: 'grid',
          placeItems: 'center',
          color: '#087443'
        }}
      >
        <i className={p[2]} style={{ fontSize: 30 }} />
      </Box>
      {[
        ['Santri', p[3]],
        [kelas[p[0]], p[4]],
        ['Ustadz/Ustadzah', p[5]],
        ['Absensi Santri', p[6]],
        ['Absensi Ustadz', p[7]],
        ['Target/Program', p[8]]
      ].map(x => (
        <Box
          key={x[0]}
          sx={{ display: 'flex', justifyContent: 'space-between', py: 0.38, borderBottom: '1px solid #f0f1f3' }}
        >
          <Typography sx={{ fontSize: 10 }}>{x[0]}</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: x[0].includes('Absensi') ? '#087443' : '#172033' }}>
            {x[1]}
          </Typography>
        </Box>
      ))}
      <DashboardLink>Lihat Detail</DashboardLink>
    </DashboardCard>
  )
}

function Unit({ u }: any) {
  return (
    <DashboardCard sx={{ p: 1.1, height: 300 }}>
      <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center', mb: 1 }}>
        <i className='tabler-school' style={{ fontSize: 25, color: '#087443' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{u.name}</Typography>
      </Box>
      <Grid container spacing={0.8}>
        {u.items.map((x: any[]) => (
          <Grid key={x[0]} size={12}>
            <DashboardCard sx={{ p: 0.75, height: 240, bgcolor: '#fbfcfd' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{x[0]}</Typography>
              <Typography sx={{ fontSize: 10, color: '#667085', mt: 0.6 }}>Performa</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: scoreColor(Number(x[1].replace('%', ''))) }}>
                {x[1]}
              </Typography>
              <DashboardStatus score={parseFloat(x[1])} />
              {[
                ['Santri', x[2]],
                ['Kelas', x[3]],
                ['Guru', x[4]],
                ['Absensi Santri', x[5]],
                ['Absensi Guru', x[6]],
                ['Jam Pelajaran', x[7]]
              ].map(m => (
                <Box key={m[0]} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                  <Typography sx={{ fontSize: 11 }}>{m[0]}</Typography>
                  <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{m[1]}</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 1, height: 10, bgcolor: '#edf0f2', borderRadius: 99 }}>
                <Box
                  sx={{
                    width: x[1],
                    height: '100%',
                    bgcolor: scoreColor(Number(x[1].replace('%', ''))),
                    borderRadius: 99
                  }}
                />
              </Box>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>
      <DashboardLink>Lihat Detail Unit</DashboardLink>
    </DashboardCard>
  )
}

const formatNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'number' ? val : Number(val)

  if (isNaN(num)) return String(val)

  return num.toLocaleString('id-ID')
}

export default function NonFormalDashboard() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [selected, setSelected] = useState<number>(0)

  const branchStats = [
    ['Asshiddiqiyah 3 Putra', '612', '24', '26', '94,1%', '95,0%', '188/200'],
    ['Asshiddiqiyah 3 Putri', '584', '22', '28', '95,3%', '95,7%', '184/176'],
    ['Asshiddiqiyah 4', '988', '18', '44', '92,8%', '94,8%', '144/152']
  ]

  const [summaryData, setSummaryData] = useState<any>({})

  const [units, setUnits] = useState<any>([])
  const [trends, setTrends] = useState<any>([])

  const getNonFormalLevelTwo = async () => {
    const result = await dispatch(fetchNonFormalLevelTwo({})).unwrap()

    const { data } = result

    if (data) {
      setSummaryData(data)

      setUnits(
        data.unit_pendidikan_mda?.map((x: any) => {
          return {
            name: x.nama_cabang.replace('Pondok Pesantren ', ''),
            items: x.lembaga_mda.map((r: any) => {
              return [
                r.label_lembaga_mda,
                `${r.performa || 0}%`,
                `${r.santri || 0}`,
                `${r.kelas || 0}`,
                `${r.guru || 0}`,
                `${r.absensi_santri || 0}%`,
                `${r.absensi_guru || 0}%`,
                `${r.jp_terlaksana || 0}/${r.jp_terjadwal || 0}`
              ]
            })
          }
        })
      )

      const trend = data.trend_absensi_santri_30_hari
      const hadir = []
      const izin = []
      const sakit = []
      const alpha = []

      for (let i = 0; i < trend.length; i++) {
        hadir.push(trend[i].hadir)
        izin.push(trend[i].izin)
        sakit.push(trend[i].sakit)
        alpha.push(trend[i].alfa)
      }

      const series = [
        { name: 'Hadir', color: '#087443', values: hadir },
        { name: 'Izin', color: '#246bc2', values: izin },
        { name: 'Sakit', color: '#f28c28', values: sakit },
        { name: 'Alpha', color: '#dc3030', values: alpha }
      ]

      setTrends({
        series: series,
        labels: trend.map((x: any) => format(new Date(x.tanggal), 'dd MMM'))
      })
    }
  }

  useEffect(() => {
    getNonFormalLevelTwo()
  }, [])

  return (
    <DashboardLayout>
      <Grid container spacing={4} sx={{ p: 2 }}>
        <Button
          variant='contained'
          size='small'
          color='primary'
          startIcon={<i className='tabler-chevron-left' />}
          onClick={() => router.push('/dashboards/khodimul')}
        >
          Back
        </Button>
      </Grid>
      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3.6 }}>
            <DashboardKpi
              title='Performa Indikator Pendidikan Non Formal'
              value={`${summaryData?.performa_pendidikan_mda?.performa_total || 0}%`}
              performance
              status={summaryData?.performa_pendidikan_mda?.performa_total || 0}
              progress={summaryData?.performa_pendidikan_mda?.performa_total || 0}
              valueColor={scoreColor(summaryData?.performa_pendidikan_mda?.performa_total || 0)}
              iconColor={scoreColor(summaryData?.performa_pendidikan_mda?.performa_total || 0)}
              performanceDetail={
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: 1,
                      py: 0.6,
                      borderRadius: 1,
                      bgcolor: '#eef8f2',
                      flexShrink: 0,
                      mb: 1
                    }}
                  >
                    <i
                      className={'tabler-school'}
                      style={{
                        fontSize: 30,
                        color: dashboardColors.green,
                        flexShrink: 0
                      }}
                    />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          lineHeight: 1.2
                        }}
                      >
                        PERFORMA PENDIDIKAN NON FORMAL
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 9,
                          color: 'text.secondary',
                          lineHeight: 1.2,
                          mt: 0.2
                        }}
                      >
                        Rekapitulasi indikator utama aktivitas santri
                      </Typography>
                    </Box>
                  </Box>
                  {[
                    {
                      label: 'Kehadiran Santri',
                      value: `${summaryData?.performa_pendidikan_mda?.kehadiran_santri || 0}%`,
                      weight: `${summaryData?.performa_pendidikan_mda?.bobot_kehadiran_santri * 100 || 0}%`,
                      progress: `${summaryData?.performa_pendidikan_mda?.kehadiran_santri || 0}`,
                      icon: 'tabler-users',
                      color: '#20b5a5'
                    },
                    {
                      label: 'Kehadiran Guru',
                      value: `${summaryData?.performa_pendidikan_mda?.kehadiran_guru || 0}%`,
                      weight: `${summaryData?.performa_pendidikan_mda?.bobot_kehadiran_guru * 100 || 0}%`,
                      progress: `${summaryData?.performa_pendidikan_mda?.kehadiran_guru || 0}`,
                      icon: 'tabler-user',
                      color: '#269be8'
                    }
                  ].map(item => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '32px minmax(0, 1fr)',
                        gap: 0.8,
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      {/* ICON */}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className={item.icon} style={{ fontSize: 17 }} />
                      </Box>

                      {/* CONTENT */}
                      <Box sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 0.5
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 10,
                              fontWeight: 800
                            }}
                          >
                            {item.label}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 0.4
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: scoreColor(Number(item.progress))
                              }}
                            >
                              {item.value}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 9,
                                color: 'text.secondary'
                              }}
                            >
                              (Bobot {item.weight})
                            </Typography>
                          </Box>
                        </Box>

                        {/* PROGRESS */}
                        <Box
                          sx={{
                            mt: 0.45,
                            height: 7,
                            bgcolor: '#e8eaed',
                            borderRadius: 99,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${item.progress}%`,
                              height: '100%',
                              bgcolor: scoreColor(Number(item.progress)),
                              borderRadius: 99
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}

                  {/* SESI MENGAJAR */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 8, mb: 1 }}>
                    <i className={'tabler-calendar-week'} style={{ fontSize: 17 }} />
                    <Typography variant='body2' sx={{ fontSize: 9 }}>
                      Sesi Mengajar{' '}
                      {`${summaryData?.kpi_utama?.sesi_terlaksana}/${summaryData?.kpi_utama?.sesi_terjadwal}`}{' '}
                      Terlaksana ({summaryData?.kpi_utama?.persen_sesi_mengajar}%)
                    </Typography>
                  </Box>

                  {/* TOTAL */}
                  <Box
                    sx={{
                      mt: 0.3,
                      px: 1,
                      py: 0.65,
                      borderRadius: 1,
                      bgcolor: '#eef8f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6
                      }}
                    >
                      <i
                        className='tabler-chart-bar-popular'
                        style={{
                          fontSize: 17,
                          color: dashboardColors.green
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 9,
                          fontWeight: 800
                        }}
                      >
                        PERFORMA TOTAL
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: scoreColor(Number(summaryData?.performa_pendidikan_mda?.performa_total || 0))
                      }}
                    >
                      {`${summaryData?.performa_pendidikan_mda?.performa_total || 0}%`}
                    </Typography>
                  </Box>
                </Box>
              }
              footer={
                <Box sx={{ bgcolor: '#f1f8f4', p: 1, borderRadius: 1, m: 1 }}>
                  {[
                    ['100%', 'Istimewa', dashboardColors.green],
                    ['90% - 99,9%', 'Baik Sekali', dashboardColors.green2],
                    ['80% - 89,9%', 'Baik', dashboardColors.green3],
                    ['75% - 79,9%', 'Cukup', dashboardColors.yellow],
                    ['< 70%', 'Kurang Baik', dashboardColors.red]
                  ].map(([range, label, color]) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 0.2
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: color,
                          flexShrink: 0
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 8,
                          flex: 1,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {range}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 8,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Total Santri Non Formal'
              value={formatNumber(summaryData?.kpi_utama?.total_santri)}
              subtitle={`L ${formatNumber(summaryData?.kpi_utama?.santri_l)} | P ${formatNumber(summaryData?.kpi_utama?.santri_p)}`}
              icon='tabler-users'
              iconColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Total Kelas MDA'
              value={formatNumber(summaryData?.kpi_utama?.total_kelas)}
              subtitle={summaryData?.kpi_utama?.distribusi_lembaga_mda
                ?.map((x: any) => `${x.label_lembaga_mda} ${formatNumber(x.jumlah_kelas)}`)
                .join(' | ')}
              icon='tabler-book-2'
              iconColor='#246bc2'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Total Ustadz/Ustadzah'
              value={formatNumber(summaryData?.kpi_utama?.total_guru)}
              subtitle={`L ${formatNumber(summaryData?.kpi_utama?.guru_l)} | P ${formatNumber(summaryData?.kpi_utama?.guru_p)} `}
              icon='tabler-user-star'
              iconColor='#7041a5'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Absensi Santri Hari Ini'
              value={`${Math.round((summaryData?.kpi_utama?.absensi_santri / summaryData?.kpi_utama?.total_santri) * 100)}%`}
              subtitle={`${formatNumber(summaryData?.kpi_utama?.absensi_santri)} dari ${formatNumber(summaryData?.kpi_utama?.total_santri)} hadir`}
              icon='tabler-circle-check'
              iconColor='#087443'
              valueColor={scoreColor(summaryData?.kpi_utama?.absensi_santri)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Absensi Ustadz Hari Ini'
              value={`${Math.round((summaryData?.kpi_utama?.absensi_guru / summaryData?.kpi_utama?.total_guru) * 100)}%`}
              subtitle={`${formatNumber(summaryData?.kpi_utama?.absensi_guru)} dari ${formatNumber(summaryData?.kpi_utama?.total_guru)} hadir`}
              icon='tabler-user-check'
              iconColor='#f28c28'
              valueColor={scoreColor(summaryData?.kpi_utama?.absensi_guru)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Jam Pelajaran Hari Ini'
              value={formatNumber(summaryData?.kpi_utama?.jp_terjadwal)}
              subtitle={`Terlaksana ${formatNumber(summaryData?.kpi_utama?.jp_terlaksana)} (${summaryData?.kpi_utama?.persentase_jp_terlaksana}%)`}
              icon='tabler-clock'
              iconColor='#dc3030'
            />
          </Grid>
        </Grid>
      </DashboardSection>

      {/* <DashboardSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.7, p: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>Pendidikan Non Formal</Typography>
          <Box sx={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
            {['Asshiddiqiyah 3 Putra', 'Asshiddiqiyah 3 Putri', 'Asshiddiqiyah 4'].map((x, i) => (
              <Box
                onClick={() => setSelected(i)}
                key={x}
                sx={{
                  px: 1.3,
                  py: 0.65,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: i === selected ? '#087443' : '#fff',
                  color: i === selected ? '#fff' : '#172033',
                  cursor: 'pointer'
                }}
              >
                {x}
              </Box>
            ))}
          </Box>
        </Box>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {programs.map(p => (
            <Grid key={p[0]} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Program p={p} />
            </Grid>
          ))}
        </Grid>
      </DashboardSection> */}

      {/* <DashboardSection title='Kehadiran Santri Non Formal (30 Hari Terakhir)'>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {branchStats.map((b: any[]) => (
            <Grid key={b[0]} size={{ xs: 12, md: 4 }}>
              <DashboardCard sx={{ p: 1.05 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{b[0]}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#087443', fontWeight: 800 }}>Rata-rata {b[4]}</Typography>
                </Box>
                <DashboardLineChart
                  title=''
                  series={[
                    { name: 'Hadir', color: '#087443', values: [98, 97, 98, 97, 98, 97, 99, 98, 98, 97] },
                    { name: 'Izin', color: '#246bc2', values: [20, 21, 19, 20, 21, 20, 19, 21, 20, 20] },
                    { name: 'Sakit', color: '#f28c28', values: [5, 5, 6, 5, 4, 5, 5, 4, 5, 4] },
                    { name: 'Alpha', color: '#dc3030', values: [2, 2, 1, 2, 2, 1, 2, 1, 2, 1] }
                  ]}
                />
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      </DashboardSection> */}

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {units.map((u: any) => (
            <Grid key={u.name} size={{ xs: 12, lg: 4 }}>
              <Unit u={u} />
            </Grid>
          ))}
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardLineChart
              title='Tren Absensi Santri di Kelas (30 Hari Terakhir)'
              series={trends?.series || []}
              labels={trends?.labels || []}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardDonut
              title='Absensi Santri Hari Ini (Total)'
              total='2.184'
              totalLabel='Santri'
              items={[
                { label: 'Hadir', value: summaryData?.absensi_santri_hari_ini?.hadir || 0, color: '#087443' },
                { label: 'Izin', value: summaryData?.absensi_santri_hari_ini?.izin || 0, color: '#246bc2' },
                { label: 'Sakit', value: summaryData?.absensi_santri_hari_ini?.sakit || 0, color: '#f28c28' },
                { label: 'Alpha', value: summaryData?.absensi_santri_hari_ini?.alfa || 0, color: '#dc3030' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardDonut
              title='Absensi Guru Hari Ini (Total)'
              total='146'
              totalLabel='Guru'
              items={[
                { label: 'Hadir', value: summaryData?.absensi_guru_hari_ini?.hadir || 0, color: '#087443' },
                { label: 'Izin', value: summaryData?.absensi_guru_hari_ini?.izin || 0, color: '#246bc2' },
                { label: 'Sakit', value: summaryData?.absensi_guru_hari_ini?.sakit || 0, color: '#f28c28' },
                { label: 'Alpha', value: summaryData?.absensi_guru_hari_ini?.alfa || 0, color: '#dc3030' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardCard sx={{ p: 1.2, height: '100%' }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>AKSI CEPAT</Typography>
              <Grid container spacing={0.7} sx={{ mt: 1 }}>
                {[
                  ['tabler-users', 'Absensi Santri di Kelas'],
                  ['tabler-user-check', 'Absensi Guru'],
                  ['tabler-calendar', 'Jadwal Pelajaran'],
                  ['tabler-file-report', 'Nilai Akademik'],
                  ['tabler-file', 'Rapor Santri']
                ].map(x => (
                  <Grid key={x[1]} size={6}>
                    <Box
                      sx={{
                        height: 66,
                        border: '1px solid #e5e7eb',
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        p: 0.5
                      }}
                    >
                      <i className={x[0]} style={{ fontSize: 25, color: '#087443' }} />
                      <Typography sx={{ fontSize: 11 }}>{x[1]}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DashboardCard>
          </Grid>
        </Grid>
      </DashboardSection>
      <DashboardInfo>
        Performa dihitung dari rata-rata indikator utama pendidikan non formal berdasarkan standar penilaian pondok
        pesantren.
      </DashboardInfo>
    </DashboardLayout>
  )
}
