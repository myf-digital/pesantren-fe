'use client'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardCard from '../common/DashboardCard'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardTable from '../common/DashboardTable'
import DashboardLink from '../common/DashboardLink'

const indicators=[
 ['1. Kebersihan Lingkungan','Lingkungan Pesantren','tabler-tree','52','49','3','94,2%'],
 ['2. Kelayakan Sarpras','Semua Kategori','tabler-building','136','129','7','94,8%'],
 ['3. Distribusi Makan','Santri','tabler-tools-kitchen-2','-','-','-','TIDAK ADA DATA'],
 ['4. Peralatan Makan','Santri','tabler-tools-kitchen-2','-','-','-','TIDAK ADA DATA'],
 ['5. Dapur','Kebersihan & Sisa Makanan','tabler-gauge','-','-','-','TIDAK ADA DATA'],
 ['6. Kebersihan Taman','Area Taman','tabler-plant','18','17','1','94,0%'],
 ['7. Kelistrikan','Listrik / Lampu dll','tabler-bolt','314','306','8','97,5%']
]

export default function KerumahtanggaanDashboard() {
 return <DashboardLayout>
  <DashboardSection>
   <Grid container spacing={1}>
    <Grid size={{xs:12,sm:6,md:2}}><DashboardKpi title='Performa Indikator Kerumahtanggaan' value='91,6%' performance status='BAIK SEKALI' progress={91.6} valueColor='#087443' iconColor='#087443' footer='↑ 2,4% dari periode lalu'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Lokasi Inspeksi' value='214' subtitle='Total lokasi diperiksa' icon='tabler-clipboard' iconColor='#246bc2'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Lokasi Bersih' value='198' subtitle='92,5% dari total lokasi' icon='tabler-circle-check' iconColor='#087443' valueColor='#087443'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Temuan Kerusakan' value='16' subtitle='7,5% dari total lokasi' icon='tabler-alert-triangle' iconColor='#f28c28' valueColor='#f28c28'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Progress Perbaikan' value='93,0%' subtitle='Temuan ditindaklanjuti' icon='tabler-progress-check' iconColor='#7041a5' valueColor='#087443'/></Grid>
    <Grid size={{xs:6,md:2}}><DashboardKpi title='Open Temuan' value='5' subtitle='Masih perlu ditindaklanjuti' icon='tabler-clipboard-x' iconColor='#dc3030' valueColor='#dc3030'/></Grid>
   </Grid>
  </DashboardSection>

  <DashboardSection>
   <Box sx={{display:'flex',border:'1px solid #e5e7eb',borderRadius:1,overflow:'hidden',mb:.7}}>{['Semua Cabang','Asshiddiqiyah 3 Putra','Asshiddiqiyah 3 Putri','Asshiddiqiyah 4'].map((x,i)=><Box key={x} sx={{flex:1,textAlign:'center',py:.65,fontSize:7.8,fontWeight:700,bgcolor:i===0?'#087443':'#fff',color:i===0?'#fff':'#172033'}}>{x}</Box>)}</Box>
   <DashboardCard sx={{p:1.1}}><Typography sx={{fontSize:10,fontWeight:800,mb:1}}>INDIKATOR KERUMAHTANGGAAN - Semua Cabang</Typography><Grid container spacing={.8}>{indicators.map((x:any[])=> <Grid key={x[0]} size={{xs:12,sm:6,md:3,lg:1.714}}><DashboardCard sx={{p:.85,height:245,textAlign:'center'}}><Typography sx={{fontSize:7.7,fontWeight:800}}>{x[0]}</Typography><Typography sx={{fontSize:6.8,color:'#667085',mt:.3}}>{x[1]}</Typography><Box sx={{width:52,height:52,mx:'auto',my:1,borderRadius:'50%',bgcolor:'#edf8f1',display:'grid',placeItems:'center',color:'#087443'}}><i className={x[2]} style={{fontSize:25}}/></Box><Box sx={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:.4,textAlign:'left'}}><Typography sx={{fontSize:6.7}}>Lokasi</Typography><Typography sx={{fontSize:6.7,textAlign:'right'}}>{x[3]}</Typography><Typography sx={{fontSize:6.7}}>Bersih</Typography><Typography sx={{fontSize:6.7,textAlign:'right'}}>{x[4]}</Typography><Typography sx={{fontSize:6.7}}>Temuan</Typography><Typography sx={{fontSize:6.7,textAlign:'right'}}>{x[5]}</Typography></Box><Typography sx={{fontSize:8,fontWeight:800,color:x[6].includes('DATA')?'#dc3030':'#087443',mt:1.1}}>{x[6]}</Typography><DashboardLink>Lihat Detail</DashboardLink></DashboardCard></Grid>)}</Grid></DashboardCard>
  </DashboardSection>

  <DashboardSection title='Tren Performa Kerumahtanggaan (30 Hari Terakhir)'>
   <Grid container spacing={1}>{['Asshiddiqiyah 3 Putra','Asshiddiqiyah 3 Putri','Asshiddiqiyah 4'].map((x,i)=><Grid key={x} size={{xs:12,md:4}}><DashboardCard sx={{p:1}}><Typography sx={{fontSize:8.5,fontWeight:800}}>{x}</Typography><DashboardLineChart title='' series={[{name:'Kebersihan Lingkungan',color:'#087443',values:[91+i,93,92,94,93,94,95,94,95,94]},{name:'Sarpras',color:'#246bc2',values:[88,86,89,88,90,89,91,90,91,90]},{name:'Kelistrikan',color:'#f5c542',values:[95,94,96,95,97,96,97,98,97,98]}]}/></DashboardCard></Grid>)}</Grid>
  </DashboardSection>

  <DashboardSection>
   <DashboardTable title='TREUAN TERBARU YANG MEMERLUKAN TINDAK LANJUT' columns={['No','Tanggal','Lokasi','Kategori','Temuan','Status Kondisi','Prioritas','Status','Tindak Lanjut','PIC']} rows={[
    ['1','02/08/2025 08:15','Lorong Asrama A','Kelistrikan','Lampu mati di lorong lantai 2 (3 titik)','RUSAK','Tinggi','Open','Belum ditindaklanjuti','Tim Sarpras'],
    ['2','02/08/2025 07:40','Dapur Pusat','Dapur','Sisa makanan tinggi (18 kg)','KOTOR','Sedang','Proses','Dalam penanganan','Tim Dapur'],
    ['3','01/08/2025 16:20','Kamar Santri 17','Sarpras','Kursi belajar rusak','RUSAK','Sedang','Selesai','Sudah diperbaiki','Tim Sarpras'],
    ['4','01/08/2025 09:10','Taman Barat','Taman','Rumput belum dipotong','KOTOR','Rendah','Open','Menunggu jadwal kerja','Tim Kebersihan'],
    ['5','31/07/2025 15:55','Ruang Kelas 3B','Sarpras','Kipas angin tidak berfungsi','RUSAK','Sedang','Proses','Menunggu suku cadang','Tim Sarpras']
   ]}/>
  </DashboardSection>
 </DashboardLayout>
}
