'use client'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardLayout from '../common/DashboardLayout'
import DashboardSection from '../common/DashboardSection'
import DashboardKpi from '../common/DashboardKpi'
import DashboardLineChart from '../common/DashboardLineChart'
import DashboardDonut from '../common/DashboardDonut'
import DashboardBarChart from '../common/DashboardBarChart'
import DashboardCard from '../common/DashboardCard'
import DashboardLink from '../common/DashboardLink'
import PesantrenUnitCard from './PesantrenUnitCard'
import { dashboardColors } from '../common/dashboardTheme'

const units = [
 {name:'Asshiddiqiyah 3 Putra',subtitle:'Mantiqoh A, B & C',performance:95.6,attendance:98.2,absence:[{label:'Izin',value:'12 (0,9%)',color:'#246bc2'},{label:'Sakit UKS',value:'4 (0,3%)',color:'#f28c28'},{label:'Sakit Rumah/Rujukan',value:'8 (0,6%)',color:'#dc3030'},{label:'Alpha',value:'2 (0,1%)',color:'#7041a5'}],metrics:[{label:'Kebersihan Kamar',value:'96,5%',progress:96.5},{label:'Kebersihan Lorong Asrama',value:'94,0%',progress:94},{label:'Kasus Aktif',value:'1',progress:20}]},
 {name:'Asshiddiqiyah 3 Putri',subtitle:'Basis Per Kamar',performance:96.8,attendance:99.1,absence:[{label:'Izin',value:'8 (0,5%)',color:'#246bc2'},{label:'Sakit UKS',value:'2 (0,1%)',color:'#f28c28'},{label:'Sakit Rumah/Rujukan',value:'6 (0,4%)',color:'#dc3030'},{label:'Alpha',value:'1 (0,1%)',color:'#7041a5'}],metrics:[{label:'Kebersihan Kamar',value:'98,0%',progress:98},{label:'Kebersihan Lorong Asrama',value:'97,5%',progress:97.5},{label:'Kasus Aktif',value:'0',progress:0}]},
 {name:'Asshiddiqiyah 4',subtitle:'Basis Per Kamar',performance:92.3,attendance:96.5,absence:[{label:'Izin',value:'10 (0,8%)',color:'#246bc2'},{label:'Sakit UKS',value:'3 (0,2%)',color:'#f28c28'},{label:'Sakit Rumah/Rujukan',value:'5 (0,4%)',color:'#dc3030'},{label:'Alpha',value:'4 (0,3%)',color:'#7041a5'}],metrics:[{label:'Kebersihan Kamar',value:'92,0%',progress:92},{label:'Kebersihan Lorong Asrama',value:'91,5%',progress:91.5},{label:'Kasus Aktif',value:'0',progress:0}]},
 {name:'Dar Ashofa’ wal Wafa’',subtitle:'(Asshiddiqiyah 5)',performance:93.1,attendance:97.8,absence:[{label:'Izin',value:'6 (0,5%)',color:'#246bc2'},{label:'Sakit UKS',value:'0 (0,0%)',color:'#f28c28'},{label:'Sakit Rumah/Rujukan',value:'3 (0,2%)',color:'#dc3030'},{label:'Alpha',value:'2 (0,1%)',color:'#7041a5'}],metrics:[{label:'Kebersihan Kamar',value:'95,0%',progress:95},{label:'Kebersihan Lorong Asrama',value:'93,0%',progress:93},{label:'Kebersihan Lingkungan',value:'96,0%',progress:96}]}
]

export default function PesantrenDashboard() {
 return <DashboardLayout>
   <DashboardSection>
    <Grid container spacing={1}>
      <Grid size={{xs:12,sm:6,md:3,lg:1.5}}><DashboardKpi title='Performa Indikator Kepesantrenan' value='94,5%' performance status='ISTIMEWA' progress={94.5} valueColor={dashboardColors.green} iconColor={dashboardColors.green} footer='↑ 2,8% dari periode lalu'/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Total Santri' value='3.462' subtitle='L 1.876   |   P 1.586' icon='tabler-users' iconColor={dashboardColors.green}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Hadir Hari Ini' value='3.210' subtitle='92,7% dari total santri' icon='tabler-circle-check' iconColor={dashboardColors.green} valueColor={dashboardColors.green}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Izin Aktif' value='67' subtitle='1,9% dari total santri' icon='tabler-file-description' iconColor={dashboardColors.blue} valueColor={dashboardColors.blue}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Sakit UKS' value='18' subtitle='0,5% dari total santri' icon='tabler-heart-rate-monitor' iconColor={dashboardColors.orange} valueColor={dashboardColors.orange}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Sakit Rumah/Rujukan' value='21' subtitle='0,6% dari total santri' icon='tabler-home-heart' iconColor={dashboardColors.red} valueColor={dashboardColors.red}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Alpha' value='39' subtitle='1,2% dari total santri' icon='tabler-user' iconColor={dashboardColors.purple} valueColor={dashboardColors.purple}/></Grid>
      <Grid size={{xs:6,sm:6,md:3,lg:1.5}}><DashboardKpi title='Kasus Aktif' value='19' subtitle='0,5% dari total santri' icon='tabler-alert-triangle' iconColor={dashboardColors.red} valueColor={dashboardColors.red}/></Grid>
    </Grid>
   </DashboardSection>

   <DashboardSection>
    <Grid container spacing={1}>
      {units.map(u=><Grid key={u.name} size={{xs:12,sm:6,lg:3}}><PesantrenUnitCard unit={u}/></Grid>)}
    </Grid>
   </DashboardSection>

   <DashboardSection>
    <Grid container spacing={1}>
      <Grid size={{xs:12,md:3}}><DashboardLineChart title='Trend Kehadiran Santri (30 Hari Terakhir)' series={[
        {name:'Hadir',color:'#087443',values:[97,98,96,97,98,97,98,98,97,98]},
        {name:'Izin',color:'#246bc2',values:[20,21,20,22,20,21,19,20,21,20]},
        {name:'Sakit UKS',color:'#f28c28',values:[7,8,7,6,8,7,6,7,7,6]},
        {name:'Sakit Rumah/Rujukan',color:'#dc3030',values:[4,4,5,4,4,5,4,4,3,4]},
        {name:'Alpha',color:'#7041a5',values:[2,2,2,1,2,2,1,2,2,2]}
      ]}/></Grid>
      <Grid size={{xs:12,md:3}}><DashboardDonut title='Komposisi Perizinan Harian' total='3.462' totalLabel='Santri' items={[
        {label:'Hadir',value:3210,color:'#087443'},{label:'Izin',value:67,color:'#246bc2'},{label:'Sakit UKS',value:18,color:'#f28c28'},{label:'Sakit Rumah/Rujukan',value:21,color:'#dc3030'},{label:'Alpha',value:39,color:'#7041a5'}
      ]}/></Grid>
      <Grid size={{xs:12,md:3}}><DashboardBarChart title='Kebersihan Area Asrama' items={[{label:'Kebersihan Kamar',value:95.9},{label:'Kebersihan Lorong Asrama',value:94},{label:'Kebersihan Lingkungan',value:96}]}/></Grid>
      <Grid size={{xs:12,md:3}}><DashboardCard sx={{p:1.25,height:'100%'}}><Typography sx={{fontSize:9.5,fontWeight:800,textTransform:'uppercase'}}>Kasus Santri (Aktif)</Typography><Grid container spacing={.7} sx={{mt:.5}}>{[['Pelanggaran Ringan','12'],['Pelanggaran Sedang','5'],['Pelanggaran Berat','2']].map(x=><Grid key={x[0]} size={4}><Box sx={{p:.8,bgcolor:'#fff8ea',border:'1px solid #f5e5bc',borderRadius:1}}><Typography sx={{fontSize:7.2}}>{x[0]}</Typography><Typography sx={{fontSize:19,fontWeight:800,color:'#c47b13'}}>{x[1]}</Typography><Typography sx={{fontSize:7}}>Kasus</Typography></Box></Grid>)}</Grid><Box sx={{display:'flex',justifyContent:'space-between',mt:2}}><Box><Typography sx={{fontSize:7}}>Total Kasus Aktif</Typography><Typography sx={{fontSize:18,fontWeight:800}}>19</Typography></Box><Box><Typography sx={{fontSize:7}}>Belum Selesai</Typography><Typography sx={{fontSize:18,fontWeight:800}}>4</Typography></Box></Box><DashboardLink>Lihat Detail Kasus</DashboardLink></DashboardCard></Grid>
    </Grid>
   </DashboardSection>

   <DashboardSection>
    <Grid container spacing={1}>
      <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.2}}><Typography sx={{fontSize:9.5,fontWeight:800}}>TOP 5 LOKASI PERLU PERHATIAN</Typography>{[['Asrama Putra Mantiqoh B - Lorong 2','Kebersihan Lorong','78,0%'],['Asrama Putri - Kamar 17','Kebersihan Kamar','72,3%'],['Asrama Putri - Kamar 05','Kebersihan Kamar','70,2%'],['Asrama 4 Putra - Lorong 1','Kebersihan Lorong','69,0%'],['Asrama 4 Putri - Kamar 09','Kebersihan Kamar','65,5%']].map((x,i)=><Box key={i} sx={{display:'flex',gap:.6,alignItems:'center',py:.65,borderBottom:'1px solid #f0f1f3'}}><Box sx={{width:16,height:16,borderRadius:'50%',bgcolor:'#dc3030',color:'#fff',fontSize:7,display:'grid',placeItems:'center'}}>{i+1}</Box><Typography sx={{fontSize:7.1,flex:1}}>{x[0]}</Typography><Typography sx={{fontSize:7.1}}>{x[1]}</Typography><Typography sx={{fontSize:7.1,fontWeight:800,color:'#dc3030'}}>{x[2]}</Typography></Box>)}<DashboardLink>Lihat Semua Lokasi</DashboardLink></DashboardCard></Grid>
      <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.2}}><Typography sx={{fontSize:9.5,fontWeight:800}}>AKSI CEPAT</Typography><Grid container spacing={.7} sx={{mt:.7}}>{[['tabler-circle-check','Detail Kehadiran'],['tabler-file','Perizinan Santri'],['tabler-broom','Laporan Kebersihan'],['tabler-alert-circle','Kasus Santri'],['tabler-home','Monitoring Asrama'],['tabler-file-export','Export Laporan']].map(x=><Grid key={x[1]} size={4}><Box sx={{height:72,border:'1px solid #e5e7eb',borderRadius:1,display:'grid',placeItems:'center',textAlign:'center',p:.5}}><i className={x[0]} style={{fontSize:20,color:'#087443'}}/><Typography sx={{fontSize:7}}>{x[1]}</Typography></Box></Grid>)}</Grid></DashboardCard></Grid>
      <Grid size={{xs:12,md:4}}><DashboardCard sx={{p:1.2}}><Typography sx={{fontSize:9.5,fontWeight:800}}>KRITERIA PERFORMA INDIKATOR</Typography>{[['100%','ISTIMEWA','#087443'],['90% - 99,9%','BAIK SEKALI','#3aaa58'],['80% - 89,9%','BAIK','#f5c542'],['75% - 79,9%','CUKUP','#f28c28'],['< 70%','KURANG BAIK','#dc3030']].map(x=><Box key={x[1]} sx={{display:'flex',gap:1,alignItems:'center',py:.6}}><Box sx={{width:12,height:12,borderRadius:'50%',bgcolor:x[2]}}/><Typography sx={{fontSize:7.7,flex:1}}>{x[0]}</Typography><Typography sx={{fontSize:7.7,fontWeight:800}}>{x[1]}</Typography></Box>)}<Typography sx={{fontSize:7.3,color:'#667085',mt:1}}>Performa indikator dihitung dari rata-rata indikator utama kepesantrenan berdasarkan standar penilaian pondok pesantren.</Typography></DashboardCard></Grid>
    </Grid>
   </DashboardSection>
 </DashboardLayout>
}
