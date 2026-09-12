'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardCard from './DashboardCard'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DashboardBarChart({
  title,
  items
}: {
  title: string
  items: { label: string; value: number; color?: string }[]
}) {
  const options: any = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: false }
    },
    colors: [items.find(x => x.color)?.color || '#087443'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
        barHeight: '48%'
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 5,
      style: { fontSize: '8px', fontWeight: 700, colors: ['#172033'] },
      formatter: (v: number) => `${v}%`
    },
    xaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: (v: string) => `${v}%`,
        style: { fontSize: '7px', colors: ['#667085'] }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '7px', colors: ['#172033'] }
      }
    },
    grid: {
      borderColor: '#edf0f2',
      strokeDashArray: 2,
      padding: { left: 0, right: 20, top: 0, bottom: 0 }
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (v: number) => `${v}%` }
    }
  }

  return (
    <DashboardCard sx={{ p: 1.25 }}>
      <Typography sx={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase' }}>
        {title}
      </Typography>

      <Box sx={{ mt: .4 }}>
        <Chart
          type='bar'
          height={190}
          options={options}
          series={[{
            name: 'Performa',
            data: items.map(x => x.value)
          }]}
        />
      </Box>
    </DashboardCard>
  )
}
