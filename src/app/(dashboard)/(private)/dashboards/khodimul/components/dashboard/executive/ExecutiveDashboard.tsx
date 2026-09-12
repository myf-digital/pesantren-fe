'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardCard from '../common/DashboardCard'
import DashboardStatus from '../common/DashboardStatus'
import DashboardInfo from '../common/DashboardInfo'
import { scoreColor } from '../common/dashboardTheme'
import { fetchSummaryExecutive } from '../../../slice'
import { useAppDispatch } from '@/redux-store/hook'

const scores = [
  ['KEPESANTRENAN', 100, 'tabler-building-mosque', 'v_rekap_presensi_santri'],
  ['PENDIDIKAN FORMAL', 91.2, 'tabler-school', 'v_kbm_formal_today'],
  ['PEND. NON-FORMAL', 88.4, 'tabler-book', 'v_kbm_mda_today'],
  ['KERUMAHTANGGAAN', 78, 'tabler-home', 'v_kebersihan_sarpras_log'],
  ['KEUANGAN', 68.5, 'tabler-wallet', 'v_keuangan_inflow_outflow']
]

export default function ExecutiveDashboard() {
  const dispatch = useAppDispatch()

  const [summaryData, setSummaryData] = useState<any>([])

  const getSummaryExecutive = async () => {
    const result = await dispatch(
      fetchSummaryExecutive({
        //tanggal: format(new Date(), 'yyyy-MM-dd')
        tanggal: '2026-09-12'
      })
    ).unwrap()

    const { data } = result

    if (data) {
      setSummaryData(
        data.map((r: any) => {
          let icon = ''

          if (r.kode_pilar === 'KEPESANTRENAN') {
            icon = 'tabler-building-mosque'
          } else if (r.kode_pilar === 'PENDIDIKAN_FORMAL') {
            icon = 'tabler-school'
          } else if (r.kode_pilar === 'PENDIDIKAN_NON_FORMAL') {
            icon = 'tabler-book'
          } else if (r.kode_pilar === 'KERUMAHTANGGAAN') {
            icon = 'tabler-home'
          } else if (r.kode_pilar === 'KEUANGAN') {
            icon = 'tabler-wallet'
          }

          return [r.nama_pilar, r.score, icon, 'vw_executive_scorecard']
        })
      )
    }
  }

  useEffect(() => {
    getSummaryExecutive()
  }, [])

  console.log(summaryData)

  return (
    <DashboardLayout>
      <DashboardSection title=''>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {summaryData.map(([name, score, icon, source]: any) => (
            <Grid key={String(name)} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ cursor: 'pointer' }}>
              <DashboardCard
                sx={{ p: 3, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 31,
                      height: 31,
                      color: scoreColor(Number(score)),
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <i className={String(icon)} style={{ fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 800 }}>{name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: scoreColor(Number(score)),
                      mt: 1
                    }}
                  >
                    {score}%
                  </Typography>
                  <DashboardStatus score={Number(score)} />
                </Box>
                <Box sx={{ mt: 1.25, height: 6, bgcolor: '#edf0f2', borderRadius: 99 }}>
                  <Box
                    sx={{
                      width: `${score}%`,
                      height: '100%',
                      bgcolor: scoreColor(Number(score)),
                      borderRadius: 99
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 10, mt: 1.1, color: '#344054' }}>Score DB: {source}</Typography>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      </DashboardSection>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <DashboardCard sx={{ p: 2, width: { xs: '100%', sm: 210 } }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#183c75', mb: 0.8 }}>KETERANGAN WARNA</Typography>
          {[
            ['Istimewa (100%)', '#087443'],
            ['Baik Sekali (90% - 99,9%)', '#3aaa58'],
            ['Baik (80% - 89,9%)', '#f5c542'],
            ['Cukup (70% - 79,9%)', '#f28c28'],
            ['Kurang Baik (< 70%)', '#dc3030']
          ].map(x => (
            <Box key={x[0]} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: x[1] }} />
              <Typography sx={{ fontSize: 11 }}>{x[0]}</Typography>
            </Box>
          ))}
        </DashboardCard>
      </Box>

      <Box sx={{ p: 2 }}>
        <DashboardInfo>
          Performa indikator dihitung dari rata-rata indikator utama masing-masing pilar operasional.
        </DashboardInfo>
      </Box>
    </DashboardLayout>
  )
}
