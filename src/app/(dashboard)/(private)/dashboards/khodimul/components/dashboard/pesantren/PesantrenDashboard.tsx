'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { format } from 'date-fns'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardDonut from '../common/DashboardDonut'
import DashboardBarChart from '../common/DashboardBarChart'
import DashboardCard from '../common/DashboardCard'
import DashboardLink from '../common/DashboardLink'
import PesantrenUnitCard from './PesantrenUnitCard'
import { dashboardColors, scoreColor } from '../common/dashboardTheme'

import { fetchKepesantrenanLevelTwo } from '../../../slice'
import { useAppDispatch } from '@/redux-store/hook'

const formatNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'number' ? val : Number(val)

  if (isNaN(num)) return String(val)

  return num.toLocaleString('id-ID')
}

export default function PesantrenDashboard() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [summaryData, setSummaryData] = useState<any>({})
  const [units, setUnits] = useState<any>([])
  const [trends, setTrends] = useState<any>([])

  const getKepesantrenanLevelTwo = async () => {
    const result = await dispatch(fetchKepesantrenanLevelTwo({})).unwrap()

    const { data } = result

    if (data) {
      setSummaryData(data)
      setUnits(
        data.per_cabang
          .filter((x: any) => x.id_cabang)
          .map((r: any) => {
            let subtitle = 'Basis Per Kamar'

            if (r.nama_cabang.includes('3 Putra')) {
              subtitle = 'Mantiqoh A, B & C'
            } else if (r.nama_cabang.includes('Dar Asshofa')) {
              subtitle = '(Asshiddiqiyah 5)'
            }

            return {
              name: r.nama_cabang,
              subtitle: subtitle,
              performance: r.performa_total || 0,
              attendance: r.hadir || 0,
              absence: [
                { label: 'Hadir', value: r.hadir || 0, color: '#087443' },
                { label: 'Izin', value: r.izin || 0, color: '#246bc2' },
                { label: 'Sakit UKS', value: r.sakit_uks || 0, color: '#f28c28' },
                { label: 'Sakit Rumah/Rujukan', value: r.sakit_rumah_rujukan || 0, color: '#dc3030' },
                { label: 'Alpha', value: r.alfa || 0, color: '#7041a5' }
              ],
              metrics: [
                {
                  label: 'Kebersihan Kamar',
                  value: `${r.persentase_kebersihan || 0}%`,
                  progress: `${r.persentase_kebersihan || 0}`
                },
                {
                  label: 'Kebersihan Lorong Asrama',
                  value: `${r.persentase_kebersihan || 0}%`,
                  progress: `${r.persentase_kebersihan || 0}`
                },
                { label: 'Kasus Aktif', value: r.kasus_aktif || 0, progress: 20 }
              ]
            }
          })
      )

      const trend = data.trend_kehadiran_30_hari
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
        { name: 'Alpha', color: '#7041a5', values: alpha }
      ]

      setTrends({
        series: series,
        labels: trend.map((x: any) => format(new Date(x.tanggal), 'dd MMM'))
      })
    }
  }

  useEffect(() => {
    getKepesantrenanLevelTwo()
  }, [])

  return (
    <DashboardLayout>
      <DashboardSection>
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
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3.6 }}>
            <DashboardKpi
              title='Performa Indikator Kepesantrenan'
              value={`${summaryData?.performa_kepesantrenan?.performa_total || 0}%`}
              performance
              status={summaryData?.performa_kepesantrenan?.performa_total || 0}
              progress={summaryData?.performa_kepesantrenan?.performa_total || 0}
              valueColor={scoreColor(summaryData?.performa_kepesantrenan?.performa_total || 0)}
              iconColor={scoreColor(summaryData?.performa_kepesantrenan?.performa_total || 0)}
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
                      className={'tabler-building-mosque'}
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
                      label: 'Kehadiran',
                      value: `${summaryData?.performa_kepesantrenan?.kehadiran || 0}%`,
                      weight: `${summaryData?.performa_kepesantrenan?.bobot_kehadiran * 100 || 0}%`,
                      progress: `${summaryData?.performa_kepesantrenan?.kehadiran || 0}`,
                      icon: 'tabler-users',
                      color: '#269be8'
                    },
                    {
                      label: 'Kebersihan',
                      value: `${summaryData?.performa_kepesantrenan?.kebersihan || 0}%`,
                      weight: `${summaryData?.performa_kepesantrenan?.bobot_kebersihan * 100 || 0}%`,
                      progress: `${summaryData?.performa_kepesantrenan?.kebersihan || 0}`,
                      icon: 'tabler-trash',
                      color: '#20b5a5'
                    },
                    {
                      label: 'Kedisiplinan',
                      value: `${summaryData?.performa_kepesantrenan?.kedisiplinan || 0}%`,
                      weight: `${summaryData?.performa_kepesantrenan?.bobot_kedisiplinan * 100 || 0}%`,
                      progress: `${summaryData?.performa_kepesantrenan?.kedisiplinan || 0}`,
                      icon: 'tabler-shield-check',
                      color: '#ff922b'
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
                                color: dashboardColors.green
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
                              bgcolor: dashboardColors.green,
                              borderRadius: 99
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}

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
                        color: dashboardColors.green
                      }}
                    >
                      {`${summaryData?.performa_kepesantrenan?.performa_total || 0}%`}
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
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Total Santri'
              value={formatNumber(summaryData?.total_santri)}
              subtitle={`L ${formatNumber(summaryData?.jumlah_l)}   |   P ${formatNumber(summaryData?.jumlah_p)}`}
              icon='tabler-users'
              iconColor={dashboardColors.green}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Hadir Hari Ini'
              value={formatNumber(summaryData?.hadir)}
              subtitle={`${summaryData?.persentase_hadir}% dari total santri`}
              icon='tabler-circle-check'
              iconColor={dashboardColors.green}
              valueColor={dashboardColors.green}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Izin Aktif'
              value={formatNumber(summaryData?.izin)}
              subtitle={`${summaryData?.persentase_izin}% dari total santri`}
              icon='tabler-file-description'
              iconColor={dashboardColors.blue}
              valueColor={dashboardColors.blue}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Sakit UKS'
              value={formatNumber(summaryData?.sakit_uks)}
              subtitle={`${summaryData?.persentase_sakit_uks}% dari total santri`}
              icon='tabler-heart-rate-monitor'
              iconColor={dashboardColors.orange}
              valueColor={dashboardColors.orange}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Sakit Rumah/Rujukan'
              value={formatNumber(summaryData?.sakit_rumah_rujukan)}
              subtitle={`${summaryData?.persentase_sakit_rumah_rujukan}% dari total santri`}
              icon='tabler-home-heart'
              iconColor={dashboardColors.red}
              valueColor={dashboardColors.red}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Alpha'
              value={formatNumber(summaryData?.alfa)}
              subtitle={`${summaryData?.persentase_alfa}% dari total santri`}
              icon='tabler-user'
              iconColor={dashboardColors.purple}
              valueColor={dashboardColors.purple}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.2 }}>
            <DashboardKpi
              title='Kasus Aktif'
              value={formatNumber(summaryData?.kasus_aktif)}
              subtitle=''
              icon='tabler-alert-triangle'
              iconColor={dashboardColors.red}
              valueColor={dashboardColors.red}
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {units.map((u: any) => (
            <Grid key={u.name} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PesantrenUnitCard unit={u} />
            </Grid>
          ))}
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardLineChart
              title='Trend Kehadiran Santri (30 Hari Terakhir)'
              series={trends?.series || []}
              labels={trends?.labels || []}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardDonut
              title='Komposisi Perizinan Harian'
              total={'0'}
              totalLabel='Santri'
              items={[
                { label: 'Hadir', value: summaryData?.komposisi_harian?.hadir || 0, color: '#087443' },
                { label: 'Izin', value: summaryData?.komposisi_harian?.izin || 0, color: '#246bc2' },
                { label: 'Sakit UKS', value: summaryData?.komposisi_harian?.sakit_uks || 0, color: '#f28c28' },
                {
                  label: 'Sakit Rumah/Rujukan',
                  value: summaryData?.komposisi_harian?.sakit_rumah_rujukan || 0,
                  color: '#dc3030'
                },
                { label: 'Alpha', value: summaryData?.komposisi_harian?.alfa || 0, color: '#7041a5' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardBarChart
              title='Kebersihan Area Asrama'
              items={
                summaryData?.kebersihan_area?.map((r: any) => {
                  return { label: r.area, value: r.persentase || 0 }
                }) || []
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DashboardCard sx={{ p: 1.25, height: '100%' }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase' }}>
                Kasus Santri (Aktif)
              </Typography>
              <Grid container spacing={0.7} sx={{ mt: 0.5 }}>
                {[
                  ['Pelanggaran Ringan', summaryData?.kasus_aktif_json?.pelanggaran_ringan],
                  ['Pelanggaran Sedang', summaryData?.kasus_aktif_json?.pelanggaran_sedang],
                  ['Pelanggaran Berat', summaryData?.kasus_aktif_json?.pelanggaran_berat]
                ].map(x => (
                  <Grid key={x[0]} size={4}>
                    <Box sx={{ p: 0.8, bgcolor: '#fff8ea', border: '1px solid #f5e5bc', borderRadius: 1 }}>
                      <Typography sx={{ fontSize: 11 }}>{x[0]}</Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#c47b13' }}>{x[1]}</Typography>
                      <Typography sx={{ fontSize: 11 }}>Kasus</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 12 }}>Total Kasus Aktif</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                    {summaryData?.kasus_aktif_json?.total_kasus_aktif}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12 }}>Belum Selesai</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                    {summaryData?.kasus_aktif_json?.belum_selesai}
                  </Typography>
                </Box>
              </Box>
              {/* <DashboardLink>Lihat Detail Kasus</DashboardLink> */}
            </DashboardCard>
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard sx={{ p: 1.2 }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>TOP 5 LOKASI PERLU PERHATIAN</Typography>
              {[
                ['Asrama Putra Mantiqoh B - Lorong 2', 'Kebersihan Lorong', '78,0%'],
                ['Asrama Putri - Kamar 17', 'Kebersihan Kamar', '72,3%'],
                ['Asrama Putri - Kamar 05', 'Kebersihan Kamar', '70,2%'],
                ['Asrama 4 Putra - Lorong 1', 'Kebersihan Lorong', '69,0%'],
                ['Asrama 4 Putri - Kamar 09', 'Kebersihan Kamar', '65,5%']
              ].map((x, i) => (
                <Box
                  key={i}
                  sx={{ display: 'flex', gap: 0.6, alignItems: 'center', py: 0.65, borderBottom: '1px solid #f0f1f3' }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#dc3030',
                      color: '#fff',
                      fontSize: 7,
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography sx={{ fontSize: 9, flex: 1 }}>{x[0]}</Typography>
                  <Typography sx={{ fontSize: 9 }}>{x[1]}</Typography>
                  <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#dc3030' }}>{x[2]}</Typography>
                </Box>
              ))}
              <DashboardLink>Lihat Semua Lokasi</DashboardLink>
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard sx={{ p: 1.2 }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>AKSI CEPAT</Typography>
              <Grid container spacing={0.7} sx={{ mt: 0.7 }}>
                {[
                  ['tabler-circle-check', 'Detail Kehadiran'],
                  ['tabler-file', 'Perizinan Santri'],
                  ['tabler-trash', 'Laporan Kebersihan'],
                  ['tabler-alert-circle', 'Kasus Santri'],
                  ['tabler-home', 'Monitoring Asrama'],
                  ['tabler-file-export', 'Export Laporan']
                ].map(x => (
                  <Grid key={x[1]} size={4}>
                    <Box
                      sx={{
                        height: 72,
                        border: '1px solid #e5e7eb',
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        p: 0.5
                      }}
                    >
                      <i className={x[0]} style={{ fontSize: 25, color: '#087443' }} />
                      <Typography sx={{ fontSize: 10 }}>{x[1]}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard sx={{ p: 1.2 }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 800 }}>KRITERIA PERFORMA INDIKATOR</Typography>
              {[
                ['100%', 'ISTIMEWA', '#087443'],
                ['90% - 99,9%', 'BAIK SEKALI', '#3aaa58'],
                ['80% - 89,9%', 'BAIK', '#f5c542'],
                ['75% - 79,9%', 'CUKUP', '#f28c28'],
                ['< 70%', 'KURANG BAIK', '#dc3030']
              ].map(x => (
                <Box key={x[1]} sx={{ display: 'flex', gap: 1, alignItems: 'center', py: 0.6 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: x[2] }} />
                  <Typography sx={{ fontSize: 11, flex: 1 }}>{x[0]}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{x[1]}</Typography>
                </Box>
              ))}
              <Typography sx={{ fontSize: 10, color: '#667085', mt: 1 }}>
                Performa indikator dihitung dari rata-rata indikator utama kepesantrenan berdasarkan standar penilaian
                pondok pesantren.
              </Typography>
            </DashboardCard>
          </Grid>
        </Grid>
      </DashboardSection>
    </DashboardLayout>
  )
}
