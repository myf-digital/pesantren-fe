'use client'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardDonut from '../common/DashboardDonut'
import DashboardTable from '../common/DashboardTable'
import DashboardLink from '../common/DashboardLink'

const money = (v:number) => `Rp ${v} Jt`

export default function KeuanganDashboard() {
 return <DashboardLayout>
  <DashboardSection>
   <Grid container spacing={1}>
    <Grid size={{xs:12,sm:6,md:2}}><DashboardKpi title='1. Target Pencapaian' value='86,4%' performance progress={86.4} status='Berjalan' footer='Rp 3,24 M / Rp 3,75 M'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Total Pemasukan' value='Rp 3,24 M' subtitle='Bulan Berjalan' icon='tabler-cash' iconColor='#246bc2' valueColor='#087443' footer='↑ 18,7% dari bulan lalu'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Total Pengeluaran' value='Rp 1,78 M' subtitle='Bulan Berjalan' icon='tabler-shopping-cart' iconColor='#dc3030' footer='↑ 12,3% dari bulan lalu'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Sisa Saldo' value='Rp 1,46 M' subtitle='Bulan Berjalan' icon='tabler-file-dollar' iconColor='#7041a5' footer='Saldo Tersedia'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Total Saldo Kas' value='Rp 4,82 M' subtitle='Semua Rekening' icon='tabler-wallet' iconColor='#f28c28' footer='Update per hari ini'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Total Transaksi' value='1.248' subtitle='Bulan Berjalan' icon='tabler-receipt' iconColor='#159ca6' footer='↑ 9,8% dari bulan lalu'/></Grid>
   </Grid>
  </DashboardSection>

  <DashboardSection>
   <Grid container spacing={1}>
    <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.15}}><Typography sx={{fontSize:10,fontWeight:800}}>2. Pembayaran yang Masuk Per Day</Typography><Typography sx={{fontSize:7.5,color:'#667085'}}>Pemasukan Harian Bulan Ini</Typography><DashboardLineChart title='' labels={['26 Jul','27 Jul','28 Jul','29 Jul','30 Jul','31 Jul','1 Agu','2 Agu']} series={[{name:'Pemasukan',color:'#087443',values:[60,145,132,58,102,70,118,185]}]}/><Box sx={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:.6}}>{[['Rata-rata per Hari','Rp 126,8 Juta'],['Tertinggi','Rp 185,45 Juta'],['Terendah','Rp 68,20 Juta']].map(x=><Box key={x[0]} sx={{p:.7,bgcolor:'#fbfcfd',textAlign:'center'}}><Typography sx={{fontSize:6.8}}>{x[0]}</Typography><Typography sx={{fontSize:8,fontWeight:800,mt:.3}}>{x[1]}</Typography></Box>)}</Box></DashboardCard></Grid>
    <Grid size={{xs:12,md:4}}><DashboardDonut title='3. Pengeluaran' total='Rp 1,78 M' totalLabel='Total Pengeluaran' items={[{label:'Belanja Operasional',value:620,color:'#246bc2'},{label:'Belanja Pegawai',value:540,color:'#087443'},{label:'Belanja Sarpras',value:320,color:'#f5c542'},{label:'Belanja Pendidikan',value:200,color:'#dc3030'},{label:'Lain-lain',value:100,color:'#98a2b3'}]}/><DashboardLink>Lihat Detail Pengeluaran</DashboardLink></Grid>
    <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.15,height:'100%'}}><Typography sx={{fontSize:10,fontWeight:800}}>4. Pengajuan Anggaran (Persetujuan)</Typography><Typography sx={{fontSize:7.5,color:'#667085'}}>Status Pengajuan Anggaran</Typography><Grid container spacing={0.6} sx={{mt:1}}>{[['Total Pengajuan','28','#172033'],['Disetujui','16','#087443'],['Proses','8','#f28c28'],['Ditolak','4','#dc3030']].map(x=><Grid key={x[0]} size={3}><Box sx={{p:.7,border:'1px solid #edf0f2',textAlign:'center',borderRadius:1}}><Typography sx={{fontSize:6.8}}>{x[0]}</Typography><Typography sx={{fontSize:17,fontWeight:800,color:x[2],mt:.4}}>{x[1]}</Typography></Box></Grid>)}</Grid><Box sx={{mt:1,p:1,bgcolor:'#fbfcfd'}}><Typography sx={{fontSize:7}}>Total Nilai Pengajuan</Typography><Typography sx={{fontSize:17,fontWeight:800}}>Rp 2,36 M</Typography></Box><DashboardLink>Lihat Detail Pengajuan Anggaran</DashboardLink></DashboardCard></Grid>
   </Grid>
  </DashboardSection>

  <DashboardSection>
   <Grid container spacing={1}>
    <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.2,height:'100%'}}><Typography sx={{fontSize:10,fontWeight:800}}>5. Nilai Beasiswa Tahun Berjalan</Typography><Typography sx={{fontSize:7.5,color:'#667085'}}>Rekapitulasi Nilai Beasiswa</Typography><Box sx={{display:'flex',gap:1.5,alignItems:'center',mt:1.5}}><Box sx={{width:70,height:70,borderRadius:'50%',bgcolor:'#eaf6ef',display:'grid',placeItems:'center',color:'#087443'}}><i className='tabler-school' style={{fontSize:32}}/></Box><Box><Typography sx={{fontSize:7}}>Total Penerima</Typography><Typography sx={{fontSize:17,fontWeight:800}}>324 Santri</Typography></Box><Box><Typography sx={{fontSize:7}}>Total Nilai Beasiswa</Typography><Typography sx={{fontSize:14,fontWeight:800}}>Rp 1,247 M</Typography><Typography sx={{fontSize:7,mt:.5}}>Rata-rata per Santri</Typography><Typography sx={{fontSize:10,fontWeight:800}}>Rp 3,846,913</Typography></Box></Box><DashboardLink>Lihat Detail Beasiswa</DashboardLink></DashboardCard></Grid>
    <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.2,height:'100%'}}><Typography sx={{fontSize:10,fontWeight:800}}>6. Pengajuan Beasiswa / Keringanan</Typography><Typography sx={{fontSize:7.5,color:'#667085'}}>Status Pengajuan Beasiswa & Keringanan</Typography><Grid container spacing={0.6} sx={{mt:1}}>{[['Total Pengajuan','54'],['Disetujui','28'],['Proses','17'],['Ditolak','9']].map(x=><Grid key={x[0]} size={3}><Box sx={{p:.7,border:'1px solid #edf0f2',textAlign:'center',borderRadius:1}}><Typography sx={{fontSize:6.8}}>{x[0]}</Typography><Typography sx={{fontSize:16,fontWeight:800}}>{x[1]}</Typography></Box></Grid>)}</Grid><Box sx={{mt:1,p:1,bgcolor:'#fbfcfd'}}><Typography sx={{fontSize:7}}>Total Nilai Pengajuan</Typography><Typography sx={{fontSize:16,fontWeight:800}}>Rp 386,5 Juta</Typography></Box><DashboardLink>Lihat Detail Pengajuan</DashboardLink></DashboardCard></Grid>
    <Grid size={{xs:12,md:4}}><DashboardDonut title='7. Laporan Transaksi Menyeluruh' total='1.248' totalLabel='Transaksi' items={[{label:'Pemasukan',value:868,color:'#087443'},{label:'Pengeluaran',value:380,color:'#dc3030'}]}/><DashboardLink>Lihat Semua Transaksi</DashboardLink></Grid>
   </Grid>
  </DashboardSection>

  <DashboardSection>
   <DashboardTable title='Transaksi Terbaru' columns={['No','Tanggal','Jenis Transaksi','Kategori','Deskripsi','Pemasukan','Pengeluaran','Metode','Status']} rows={[
    ['1','02/08/2025 09:15','Pemasukan','SPP Bulanan','Pembayaran SPP Santri - Juli 2025','Rp 125.000.000','-','Transfer BSI','Sukses'],
    ['2','02/08/2025 08:42','Pemasukan','Jajan Santri','Top Up Kartu Santri - Jajan','Rp 45.650.000','-','QRIS BSI','Sukses'],
    ['3','02/08/2025 08:30','Pengeluaran','Belanja Operasional','Pembelian Bahan Kebersihan','-','Rp 3.250.000','Transfer BSI','Sukses'],
    ['4','02/08/2025 08:12','Pemasukan','Donasi','Donasi Pembangunan Masjid','Rp 50.000.000','-','Transfer BCA','Sukses'],
    ['5','01/08/2025 17:25','Pengeluaran','Belanja Sarpras','Perbaikan Lampu Asrama Putra','-','Rp 2.850.000','Transfer BSI','Sukses']
   ]}/>
  </DashboardSection>
 </DashboardLayout>
}
