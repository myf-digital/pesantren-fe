'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardDonut from '../common/DashboardDonut'
import DashboardTable from '../common/DashboardTable'

import { fetchKeuanganLevelTwo } from '../../../slice'
import { useAppDispatch } from '@/redux-store/hook'

type Numeric = number | string | null | undefined

type FinanceDashboardData = {
  parameter_dashboard: {
    tanggal_dashboard: string | null
    awal_bulan: string | null
    akhir_bulan: string | null
    awal_pembanding: string | null
    akhir_pembanding: string | null
    awal_grafik: string | null
  }
  session_1_target_pencapaian: {
    status_target: string
    komponen_2_pencapaian_akun_bert_target: {
      aktual: Numeric
      target_penuh: Numeric
      pencapaian_target_penuh_persen: Numeric
    }
  }
  session_1_kartu_keuangan: {
    total_pemasukan_mtd: Numeric
    total_pengeluaran_mtd: Numeric
    sisa_saldo_mtd: Numeric
    total_saldo_rekap: Numeric
    jumlah_pos_saldo: Numeric
    tanggal_saldo_terakhir: string | null
    jumlah_baris_rekap_mtd: Numeric
    pertumbuhan_pemasukan_persen: Numeric
    pertumbuhan_pengeluaran_persen: Numeric
  }
  session_2_pembayaran_masuk_per_day: {
    data_harian: { tanggal: string; total_pemasukan: Numeric; ada_data_rekap: boolean }[]
    rata_rata_per_hari_terekap: Numeric
    tertinggi_hari_terekap: Numeric
    terendah_hari_ada_pemasukan: Numeric
    hari_dengan_rekap: Numeric
    hari_ada_pemasukan: Numeric
  }
  session_3_pengeluaran: {
    total_pengeluaran: Numeric
    data_kelompok: { nama_kelompok: string; total_pengeluaran: Numeric }[]
  }
  session_4_anggaran: {
    total_pengajuan: Numeric
    jumlah_disetujui: Numeric
    jumlah_proses_pengajuan: Numeric
    jumlah_ditolak: Numeric
    total_nilai_diajukan: Numeric
  }
  session_5_beasiswa: {
    tahun_ajaran_aktif: string | null
    total_penerima: Numeric
    total_nilai_beasiswa: Numeric
    rata_rata_per_santri: Numeric
  }
  session_6_keringanan: {
    tahun_ajaran_aktif: string | null
    jumlah_total_pengajuan: Numeric
    jumlah_disetujui: Numeric
    jumlah_diajukan: Numeric
    jumlah_ditolak: Numeric
    total_nilai_diajukan: Numeric
  }
  session_7_rekap_transaksi: {
    total_pemasukan_mtd: Numeric
    total_pengeluaran_mtd: Numeric
    jumlah_hari_terekap: Numeric
    jumlah_akun_terlibat: Numeric
  }
  session_8_mutasi_kas_Transaksi_terbaru: {
    data: {
      tanggal: string
      kode_akun: string
      nama_akun: string
      masuk: Numeric
      keluar: Numeric
      saldo_akhir: Numeric
      keterangan: string | null
    }[]
  }
}

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' })
const colors = ['#246bc2', '#087443', '#f5c542', '#dc3030', '#7041a5', '#159ca6']

const money = (value: Numeric) => (value == null ? '–' : rupiah.format(Number(value)))
const count = (value: Numeric) => (value == null ? '–' : decimal.format(Number(value)))
const percent = (value: Numeric) => (value == null ? '–' : `${count(value)}%`)
const date = (value?: string | null) => (value ? dateFormat.format(new Date(value)) : '–')

export default function KeuanganDashboard() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [summaryData, setSummaryData] = useState<FinanceDashboardData | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const request = dispatch(fetchKeuanganLevelTwo({}))
    let cancelled = false

    const getKeuanganLevelTwo = async () => {
      try {
        const result = await request.unwrap()
        const { data } = result ?? {}

        if (cancelled) return

        if (data?.parameter_dashboard) {
          setSummaryData(data)
        } else {
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    void getKeuanganLevelTwo()

    return () => {
      cancelled = true
      request.abort()
    }
  }, [dispatch, attempt])

  const period = summaryData?.parameter_dashboard
  const target = summaryData?.session_1_target_pencapaian
  const targetValues = target?.komponen_2_pencapaian_akun_bert_target
  const progress = targetValues?.pencapaian_target_penuh_persen
  const cards = summaryData?.session_1_kartu_keuangan
  const hasMonthlyData = Number(cards?.jumlah_baris_rekap_mtd) > 0
  const daily = summaryData?.session_2_pembayaran_masuk_per_day
  const hasDailyData = Number(daily?.hari_dengan_rekap) > 0
  const dailyRows = daily?.data_harian ?? []

  const trends = {
    labels: dailyRows.map(row => date(row.tanggal)),
    series: [
      {
        name: 'Pemasukan',
        color: '#087443',
        values: dailyRows.map(row =>
          row.ada_data_rekap && row.total_pemasukan != null ? Number(row.total_pemasukan) : null
        )
      }
    ]
  }

  const expenses = summaryData?.session_3_pengeluaran

  const expenseItems = (expenses?.data_kelompok ?? []).map((group, index) => ({
    label: group.nama_kelompok,
    value: Number(group.total_pengeluaran),
    color: colors[index % colors.length]
  }))

  const budget = summaryData?.session_4_anggaran
  const scholarship = summaryData?.session_5_beasiswa
  const aid = summaryData?.session_6_keringanan
  const recap = summaryData?.session_7_rekap_transaksi
  const recent = summaryData?.session_8_mutasi_kas_Transaksi_terbaru?.data ?? []

  const growth = (value: Numeric) =>
    value == null
      ? undefined
      : `${percent(value)} dibanding ${date(period?.awal_pembanding)} – ${date(period?.akhir_pembanding)}`

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
      {error ? (
        <Alert
          severity='error'
          sx={{ m: 2 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => {
                setError(false)
                setAttempt(current => current + 1)
              }}
            >
              Coba lagi
            </Button>
          }
        >
          Data dashboard keuangan gagal dimuat.
        </Alert>
      ) : !summaryData ? (
        <Alert severity='info' sx={{ m: 2 }}>
          Memuat data dashboard keuangan…
        </Alert>
      ) : (
        <>
          <Typography sx={{ mx: 2, mb: 1 }}>
            {period?.tanggal_dashboard
              ? `Periode rekap bulan berjalan ${date(period.awal_bulan)} – ${date(period.akhir_bulan)}`
              : 'Belum ada tanggal rekap keuangan.'}
          </Typography>
          <DashboardSection>
            <Grid container spacing={4} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <DashboardKpi
                  title='1. Target Pencapaian'
                  value={percent(progress)}
                  performance
                  progress={progress == null ? undefined : Math.max(0, Number(progress))}
                  status={target?.status_target === 'BELUM_ADA_TARGET' ? 'Belum ada target' : undefined}
                  footer={
                    progress == null
                      ? undefined
                      : `${money(targetValues?.aktual)} / ${money(targetValues?.target_penuh)} (target penuh)`
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <DashboardKpi
                  title='Total Pemasukan'
                  value={money(hasMonthlyData ? cards?.total_pemasukan_mtd : null)}
                  subtitle='Bulan Berjalan'
                  icon='tabler-cash'
                  iconColor='#246bc2'
                  valueColor='#087443'
                  footer={hasMonthlyData ? growth(cards?.pertumbuhan_pemasukan_persen) : undefined}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <DashboardKpi
                  title='Total Pengeluaran'
                  value={money(hasMonthlyData ? cards?.total_pengeluaran_mtd : null)}
                  subtitle='Bulan Berjalan'
                  icon='tabler-shopping-cart'
                  iconColor='#dc3030'
                  footer={hasMonthlyData ? growth(cards?.pertumbuhan_pengeluaran_persen) : undefined}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <DashboardKpi
                  title='Selisih Mutasi'
                  value={money(hasMonthlyData ? cards?.sisa_saldo_mtd : null)}
                  subtitle='Bulan Berjalan'
                  icon='tabler-file-dollar'
                  iconColor='#7041a5'
                  footer='Pemasukan dikurangi pengeluaran'
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <DashboardKpi
                  title='Total Saldo Kas'
                  value={money(Number(cards?.jumlah_pos_saldo) > 0 ? cards?.total_saldo_rekap : null)}
                  subtitle='Saldo terakhir per akun dan tahun ajaran'
                  icon='tabler-wallet'
                  iconColor='#f28c28'
                  footer={
                    cards?.tanggal_saldo_terakhir ? `Rekap terakhir ${date(cards.tanggal_saldo_terakhir)}` : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <DashboardKpi
                  title='Jumlah Baris Rekap'
                  value={count(cards?.jumlah_baris_rekap_mtd)}
                  subtitle='Bulan Berjalan'
                  icon='tabler-receipt'
                  iconColor='#159ca6'
                />
              </Grid>
            </Grid>
          </DashboardSection>

          <DashboardSection>
            <Grid container spacing={4} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <DashboardCard sx={{ p: 1.15 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>2. Pemasukan Harian</Typography>
                  <Typography sx={{ fontSize: 10, color: '#667085' }}>
                    {period?.awal_grafik
                      ? `${date(period.awal_grafik)} – ${date(period.tanggal_dashboard)} · ${count(daily?.hari_dengan_rekap)} hari dengan rekap`
                      : 'Belum ada rekap harian'}
                  </Typography>
                  {hasDailyData && <DashboardLineChart title='' formatValue={money} {...trends} />}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0.6 }}>
                    {[
                      ['Rata-rata Hari Terekap', money(hasDailyData ? daily?.rata_rata_per_hari_terekap : null)],
                      ['Tertinggi', money(hasDailyData ? daily?.tertinggi_hari_terekap : null)],
                      [
                        'Terendah dengan Pemasukan',
                        money(Number(daily?.hari_ada_pemasukan) > 0 ? daily?.terendah_hari_ada_pemasukan : null)
                      ]
                    ].map(x => (
                      <Box key={x[0]} sx={{ p: 0.7, bgcolor: '#fbfcfd', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 10 }}>{x[0]}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, mt: 0.3 }}>{x[1]}</Typography>
                      </Box>
                    ))}
                  </Box>
                </DashboardCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {expenseItems.length > 0 ? (
                  <DashboardDonut
                    title='3. Pengeluaran'
                    total={money(expenses?.total_pengeluaran)}
                    totalLabel='Total Pengeluaran'
                    items={expenseItems}
                    formatValue={money}
                  />
                ) : (
                  <DashboardCard sx={{ p: 1.15 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 800 }}>3. Pengeluaran</Typography>
                    <Typography sx={{ fontSize: 10 }}>
                      {hasMonthlyData ? 'Tidak ada pengeluaran pada periode ini.' : 'Belum ada rekap pengeluaran.'}
                    </Typography>
                  </DashboardCard>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DashboardCard sx={{ p: 1.15, height: '100%' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>4. Pengajuan Anggaran (Persetujuan)</Typography>
                  <Typography sx={{ fontSize: 10, color: '#667085' }}>Status Pengajuan Anggaran</Typography>
                  <Grid container spacing={0.6} sx={{ mt: 1 }}>
                    {[
                      ['Total Pengajuan', count(budget?.total_pengajuan), '#172033'],
                      ['Disetujui', count(budget?.jumlah_disetujui), '#087443'],
                      ['Proses', count(budget?.jumlah_proses_pengajuan), '#f28c28'],
                      ['Ditolak', count(budget?.jumlah_ditolak), '#dc3030']
                    ].map(x => (
                      <Grid key={x[0]} size={3}>
                        <Box sx={{ p: 0.7, border: '1px solid #edf0f2', textAlign: 'center', borderRadius: 1 }}>
                          <Typography sx={{ fontSize: 10 }}>{x[0]}</Typography>
                          <Typography sx={{ fontSize: 17, fontWeight: 800, color: x[2], mt: 0.4 }}>{x[1]}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#fbfcfd' }}>
                    <Typography sx={{ fontSize: 10 }}>Total Nilai Pengajuan</Typography>
                    <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
                      {money(budget?.total_nilai_diajukan)}
                    </Typography>
                  </Box>
                </DashboardCard>
              </Grid>
            </Grid>
          </DashboardSection>

          <DashboardSection>
            <Grid container spacing={4} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <DashboardCard sx={{ p: 1.2, height: '100%' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>5. Nilai Beasiswa Tahun Berjalan</Typography>
                  <Typography sx={{ fontSize: 10, color: '#667085' }}>
                    {scholarship?.tahun_ajaran_aktif ?? 'Tahun ajaran aktif belum tersedia'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1.5 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: '#eaf6ef',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#087443'
                      }}
                    >
                      <i className='tabler-school' style={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10 }}>Total Penerima</Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
                        {scholarship?.tahun_ajaran_aktif ? `${count(scholarship.total_penerima)} Santri` : '–'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10 }}>Total Nilai Beasiswa</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                        {money(scholarship?.tahun_ajaran_aktif ? scholarship.total_nilai_beasiswa : null)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, mt: 0.5 }}>Rata-rata per Santri</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 800 }}>
                        {money(Number(scholarship?.total_penerima) > 0 ? scholarship?.rata_rata_per_santri : null)}
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DashboardCard sx={{ p: 1.2, height: '100%' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>6. Pengajuan Beasiswa / Keringanan</Typography>
                  <Typography sx={{ fontSize: 10, color: '#667085' }}>
                    {aid?.tahun_ajaran_aktif ?? 'Tahun ajaran aktif belum tersedia'}
                  </Typography>
                  <Grid container spacing={0.6} sx={{ mt: 1 }}>
                    {[
                      ['Total Pengajuan', count(aid?.jumlah_total_pengajuan)],
                      ['Disetujui', count(aid?.jumlah_disetujui)],
                      ['Diajukan', count(aid?.jumlah_diajukan)],
                      ['Ditolak', count(aid?.jumlah_ditolak)]
                    ].map(x => (
                      <Grid key={x[0]} size={3}>
                        <Box sx={{ p: 0.7, border: '1px solid #edf0f2', textAlign: 'center', borderRadius: 1 }}>
                          <Typography sx={{ fontSize: 10 }}>{x[0]}</Typography>
                          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                            {aid?.tahun_ajaran_aktif ? x[1] : '–'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#fbfcfd' }}>
                    <Typography sx={{ fontSize: 10 }}>Total Nilai Pengajuan</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                      {money(aid?.tahun_ajaran_aktif ? aid.total_nilai_diajukan : null)}
                    </Typography>
                  </Box>
                </DashboardCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DashboardCard sx={{ p: 1.2, height: '100%' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>7. Rekap Mutasi per Akun</Typography>
                  {[
                    ['Pemasukan', money(hasMonthlyData ? recap?.total_pemasukan_mtd : null)],
                    ['Pengeluaran', money(hasMonthlyData ? recap?.total_pengeluaran_mtd : null)],
                    ['Hari Terekap', count(recap?.jumlah_hari_terekap)],
                    ['Akun Terlibat', count(recap?.jumlah_akun_terlibat)]
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 1 }}>
                      <Typography sx={{ fontSize: 10 }}>{label}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{value}</Typography>
                    </Box>
                  ))}
                </DashboardCard>
              </Grid>
            </Grid>
          </DashboardSection>

          <DashboardSection sx={{ m: 2 }}>
            {recent.length > 0 ? (
              <DashboardTable
                title='Mutasi Kas Terbaru'
                columns={[
                  'No',
                  'Tanggal',
                  'Kode Akun',
                  'Nama Akun',
                  'Keterangan',
                  'Pemasukan',
                  'Pengeluaran',
                  'Saldo Akhir'
                ]}
                rows={recent.map((row, index) => [
                  String(index + 1),
                  date(row.tanggal),
                  row.kode_akun,
                  row.nama_akun,
                  row.keterangan || '–',
                  money(row.masuk),
                  money(row.keluar),
                  money(row.saldo_akhir)
                ])}
              />
            ) : (
              <Alert severity='info'>Belum ada mutasi kas terbaru.</Alert>
            )}
          </DashboardSection>
        </>
      )}
    </DashboardLayout>
  )
}
