'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardCard from '../common/DashboardCard'
import DashboardLink from '../common/DashboardLink'
import DashboardStatus from '../common/DashboardStatus'

export default function PesantrenUnitCard({unit}:{unit:any}) {
  return (
    <DashboardCard sx={{p:1.15,height:322}}>
      <Box sx={{display:'flex',alignItems:'center',gap:.8}}>
        <i className='tabler-building-mosque' style={{fontSize:22,color:'#087443'}}/>
        <Box>
          <Typography sx={{fontSize:11,fontWeight:800}}>{unit.name}</Typography>
          <Typography sx={{fontSize:7.5,color:'#667085'}}>{unit.subtitle}</Typography>
        </Box>
      </Box>

      <Box sx={{mt:1,p:.6,bgcolor:'#f1f8f4',border:'1px solid #d4eadc',borderRadius:1,display:'flex',justifyContent:'space-between'}}>
        <Typography sx={{fontSize:8,fontWeight:700}}>Performa: <b>{unit.performance}%</b></Typography>
        <DashboardStatus score={unit.performance}/>
      </Box>

      <Typography sx={{fontSize:8,fontWeight:700,mt:1.3}}>Kehadiran</Typography>
      <Box sx={{display:'flex',gap:1.1,alignItems:'center',mt:.5}}>
        <Box sx={{width:70,height:70,borderRadius:'50%',background:`conic-gradient(#087443 ${unit.attendance*3.6}deg,#edf0f2 0deg)`,position:'relative'}}>
          <Box sx={{position:'absolute',inset:9,borderRadius:'50%',bgcolor:'#fff',display:'grid',placeItems:'center',textAlign:'center'}}>
            <Box><Typography sx={{fontSize:14,fontWeight:800}}>{unit.attendance}%</Typography><Typography sx={{fontSize:6.5}}>Hadir</Typography></Box>
          </Box>
        </Box>
        <Box sx={{flex:1}}>
          {unit.absence.map((x:any)=><Box key={x.label} sx={{display:'flex',gap:.5,alignItems:'center',mb:.45}}><Box sx={{width:7,height:7,borderRadius:'50%',bgcolor:x.color}}/><Typography sx={{fontSize:7.1,flex:1}}>{x.label}</Typography><Typography sx={{fontSize:7.1,fontWeight:700}}>{x.value}</Typography></Box>)}
        </Box>
      </Box>

      <Box sx={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:.7,mt:1.25}}>
        {unit.metrics.map((m:any)=><Box key={m.label}><Typography sx={{fontSize:6.8,color:'#667085'}}>{m.label}</Typography><Typography sx={{fontSize:9,fontWeight:800,mt:.2}}>{m.value}</Typography><Box sx={{mt:.35,height:4,bgcolor:'#edf0f2',borderRadius:99}}><Box sx={{width:`${m.progress}%`,height:'100%',bgcolor:'#087443',borderRadius:99}}/></Box></Box>)}
      </Box>
      <DashboardLink>Lihat Detail Unit</DashboardLink>
    </DashboardCard>
  )
}
