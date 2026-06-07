// // MUI Imports
// import Grid from '@mui/material/Grid2'

// // Component Imports
// import TableInspeksi from '@/app/(dashboard)/(private)/app/kebersihan-inspeksi/list/page'
// import TableTemuan from '@/app/(dashboard)/(private)/app/kebersihan-temuan/list/page'

// const DashboardCRM = async () => {
//   // Vars
//   return (
//     <Grid container spacing={6}>
//       <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//         <TableInspeksi />
//       </Grid>
//       <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//         <TableTemuan />
//       </Grid>
//     </Grid>
//   )
// }

// export default DashboardCRM

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import DistributedBarChartOrder from '@views/dashboards/crm/DistributedBarChartOrder'
import LineAreaYearlySalesChart from '@views/dashboards/crm/LineAreaYearlySalesChart'
import CardStatVertical from '@/components/card-statistics/Vertical'
import BarChartRevenueGrowth from '@views/dashboards/crm/BarChartRevenueGrowth'
import TableTemuan from '@/app/(dashboard)/(private)/app/report/kebersihan-temuan/list/page'
import AbsenHarian from '@/app/(dashboard)/(private)/app/report/absen-harian-santri/list/page'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const DashboardCRM = async () => {
  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Santri'
          subtitle='Santri Aktif'
          stats='1,250'
          avatarColor='success'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
          chipText='+4.2%'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Absensi'
          subtitle='Kehadiran Hari Ini'
          stats='98.4%'
          avatarColor='warning'
          avatarIcon='tabler-calendar-user'
          avatarSkin='light'
          avatarSize={44}
          chipText='+1.8%'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Temuan'
          subtitle='Temuan Kebersihan'
          stats='18'
          avatarColor='error'
          avatarIcon='tabler-alert-triangle'
          avatarSkin='light'
          avatarSize={44}
          chipText='Aktif'
          chipColor='error'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Perizinan'
          subtitle='Izin Santri Hari Ini'
          stats='24'
          avatarColor='info'
          avatarIcon='tabler-file-description'
          avatarSkin='light'
          avatarSize={44}
          chipText='Menunggu'
          chipColor='info'
          chipVariant='tonal'
        />
      </Grid>
       <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
         <AbsenHarian />
       </Grid>
       <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
         <TableTemuan />
       </Grid>
    </Grid>
  )
}

export default DashboardCRM

