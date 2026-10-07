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
import DashboardDonut from '../common/DashboardDonut'
import DashboardTable from '../common/DashboardTable'
import DashboardLink from '../common/DashboardLink'
import DashboardStatus from '../common/DashboardStatus'

import { fetchFormalLevelTwo } from '../../../slice'
import { useAppDispatch } from '@/redux-store/hook'
import { dashboardColors, scoreColor } from '../common/dashboardTheme'

const units = [
  {
    name: 'Asshiddiqiyah 3 Putra',
    items: [
      ['MTs', '93,6%', '612', '24', '41', '94,1%', '95,0%', '188/200'],
      ['MA', '92,1%', '594', '24', '39', '93,2%', '94,1%', '176/192']
    ]
  },
  {
    name: 'Asshiddiqiyah 3 Putri',
    items: [
      ['MTs', '94,2%', '548', '24', '34', '95,3%', '95,7%', '164/176'],
      ['MA', '93,0%', '534', '22', '32', '93,1%', '94,2%', '156/168']
    ]
  },
  {
    name: 'Asshiddiqiyah 4',
    items: [
      ['SMP', '91,4%', '434', '16', '28', '92,0%', '93,5%', '126/136'],
      ['SMK', '90,2%', '476', '18', '32', '90,5%', '92,2%', '136/152']
    ]
  }
]

function Unit({ u }: any) {
  return (
    <DashboardCard sx={{ p: 1.1, height: 300 }}>
      <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center', mb: 1 }}>
        <i className='tabler-school' style={{ fontSize: 25, color: '#087443' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{u.name}</Typography>
      </Box>
      <Grid container spacing={0.8}>
        {u.items.map((x: any[]) => (
          <Grid key={x[0]} size={6}>
            <DashboardCard sx={{ p: 0.75, height: 240, bgcolor: '#fbfcfd' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{x[0]}</Typography>
              <Typography sx={{ fontSize: 10, color: '#667085', mt: 0.6 }}>Performa</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#087443' }}>{x[1]}</Typography>
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
                <Box sx={{ width: x[1], height: '100%', bgcolor: '#087443', borderRadius: 99 }} />
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

export default function FormalDashboard() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [summaryData, setSummaryData] = useState<any>({})

  //const [units, setUnits] = useState<any>([])
  const [trends, setTrends] = useState<any>([])

  const getFormalLevelTwo = async () => {
    const result = await dispatch(fetchFormalLevelTwo({})).unwrap()

    const { data } = result

    if (data) {
      setSummaryData(data)

      console.log(data?.unit_pendidikan_formal, '-->')

      // setUnits(
      //   data.per_cabang
      //     .filter((x: any) => x.id_cabang)
      //     .map((r: any) => {
      //       let subtitle = 'Basis Per Kamar'

      //       if (r.nama_cabang.includes('3 Putra')) {
      //         subtitle = 'Mantiqoh A, B & C'
      //       } else if (r.nama_cabang.includes('Dar Asshofa')) {
      //         subtitle = '(Asshiddiqiyah 5)'
      //       }

      //       return {
      //         name: r.nama_cabang,
      //         subtitle: subtitle,
      //         performance: r.performa_total || 0,
      //         attendance: r.hadir || 0,
      //         absence: [
      //           { label: 'Hadir', value: r.hadir || 0, color: '#087443' },
      //           { label: 'Izin', value: r.izin || 0, color: '#246bc2' },
      //           { label: 'Sakit UKS', value: r.sakit_uks || 0, color: '#f28c28' },
      //           { label: 'Sakit Rumah/Rujukan', value: r.sakit_rumah_rujukan || 0, color: '#dc3030' },
      //           { label: 'Alpha', value: r.alfa || 0, color: '#7041a5' }
      //         ],
      //         metrics: [
      //           {
      //             label: 'Kebersihan Kamar',
      //             value: `${r.persentase_kebersihan || 0}%`,
      //             progress: `${r.persentase_kebersihan || 0}`
      //           },
      //           {
      //             label: 'Kebersihan Lorong Asrama',
      //             value: `${r.persentase_kebersihan || 0}%`,
      //             progress: `${r.persentase_kebersihan || 0}`
      //           },
      //           { label: 'Kasus Aktif', value: r.kasus_aktif || 0, progress: 20 }
      //         ]
      //       }
      //     })
      // )

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
    getFormalLevelTwo()
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
              title='Performa Indikator Pendidikan Formal'
              value={`${summaryData?.performa_pendidikan_formal?.performa_total || 0}%`}
              performance
              status={summaryData?.performa_pendidikan_formal?.performa_total || 0}
              progress={summaryData?.performa_pendidikan_formal?.performa_total || 0}
              valueColor={scoreColor(summaryData?.performa_pendidikan_formal?.performa_total || 0)}
              iconColor={scoreColor(summaryData?.performa_pendidikan_formal?.performa_total || 0)}
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
                        PERFORMA KEPESANTRENAN
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
                      value: `${summaryData?.performa_pendidikan_formal?.kehadiran_santri || 0}%`,
                      weight: `${summaryData?.performa_pendidikan_formal?.bobot_kehadiran_santri * 100 || 0}%`,
                      progress: `${summaryData?.performa_pendidikan_formal?.kehadiran_santri || 0}`,
                      icon: 'tabler-users',
                      color: '#20b5a5'
                    },
                    {
                      label: 'Kehadiran Guru',
                      value: `${summaryData?.performa_pendidikan_formal?.kehadiran_guru || 0}%`,
                      weight: `${summaryData?.performa_pendidikan_formal?.bobot_kehadiran_guru * 100 || 0}%`,
                      progress: `${summaryData?.performa_pendidikan_formal?.kehadiran_guru || 0}`,
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
                        color: scoreColor(Number(summaryData?.performa_pendidikan_formal?.performa_total || 0))
                      }}
                    >
                      {`${summaryData?.performa_pendidikan_formal?.performa_total || 0}%`}
                    </Typography>
                  </Box>
                </Box>
              }
              footer={
                <Box sx={{ bgcolor: '#f1f8f4', p: 1, borderRadius: 1, m: 1 }}>
                  {[
                    ['100%', 'Istimewa', '#087443'],
                    ['90% - 99,9%', 'Baik Sekali', '#3aaa58'],
                    ['80% - 89,9%', 'Baik', '#b2cf32'],
                    ['75% - 79,9%', 'Cukup', '#f5c542'],
                    ['< 70%', 'Kurang Baik', '#dc3030']
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
              title='Total Santri Formal'
              value={formatNumber(summaryData?.kpi_utama?.total_santri)}
              subtitle={`L ${formatNumber(summaryData?.kpi_utama?.santri_l)} | P ${formatNumber(summaryData?.kpi_utama?.santri_p)}`}
              icon='tabler-users'
              iconColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Total Kelas'
              value={formatNumber(summaryData?.kpi_utama?.total_kelas)}
              subtitle={`MTs ${formatNumber(summaryData?.kpi_utama?.kelas_mts)} | MA ${formatNumber(summaryData?.kpi_utama?.kelas_ma)} | SMP ${formatNumber(summaryData?.kpi_utama?.kelas_smp)} | SMK ${formatNumber(summaryData?.kpi_utama?.kelas_smk)}`}
              icon='tabler-book-2'
              iconColor='#246bc2'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Total Guru'
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
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Absensi Guru Hari Ini'
              value={`${Math.round((summaryData?.kpi_utama?.absensi_guru / summaryData?.kpi_utama?.total_guru) * 100)}%`}
              subtitle={`${formatNumber(summaryData?.kpi_utama?.absensi_guru)} dari ${formatNumber(summaryData?.kpi_utama?.total_guru)} hadir`}
              icon='tabler-user-check'
              iconColor='#f28c28'
              valueColor='#087443'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.4 }}>
            <DashboardKpi
              title='Jam Pelajaran Hari Ini'
              value={formatNumber(summaryData?.kpi_utama?.total_menit_terjadwal)}
              subtitle={`Terlaksana ${formatNumber(summaryData?.kpi_utama?.total_menit_terlaksana)} (${Math.round((summaryData?.kpi_utama?.total_menit_terlaksana / summaryData?.kpi_utama?.total_menit_terjadwal) * 100)}%)`}
              icon='tabler-clock'
              iconColor='#dc3030'
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {units.map(u => (
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

      <DashboardSection title='Kelengkapan Raport'>
        <DashboardTable
          title='Status upload raport tahun ajaran 2025/2026 - semester genap'
          columns={['JENJANG', 'ASSHIDDIQIYAH 3 PUTRA', 'ASSHIDDIQIYAH 3 PUTRI', 'ASSHIDDIQIYAH 4']}
          rows={[
            ['MTs', '20/24 • 83,3%', '21/22 • 95,5%', 'SMP • 15/16 • 93,8%'],
            ['MA', '18/24 • 75,0%', '20/22 • 90,9%', 'SMK • 18/18 • 100%']
          ]}
        />
      </DashboardSection>
    </DashboardLayout>
  )
}
