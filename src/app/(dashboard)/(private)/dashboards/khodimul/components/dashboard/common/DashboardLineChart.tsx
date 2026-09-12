'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardCard from './DashboardCard'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type Series = {
  name: string
  values: number[]
  color: string
}

export default function DashboardLineChart({
  title,
  series,
  labels = ['4 Jul', '8 Jul', '12 Jul', '16 Jul', '20 Jul', '24 Jul', '28 Jul', '2 Agu']
}: {
  title: string
  series: Series[]
  labels?: string[]
}) {
  const options: any = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      animations: { enabled: false }
    },
    colors: series.map(s => s.color),
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 2.5,
      strokeWidth: 0,
      hover: { size: 4 }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#edf0f2',
      strokeDashArray: 2,
      padding: { left: 2, right: 4, top: -8, bottom: -4 }
    },
    xaxis: {
      categories: labels,
      labels: {
        style: { fontSize: '8px', colors: '#667085' },
        rotate: 0
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: (v: number) => `${Math.round(v)}%`,
        style: { fontSize: '8px', colors: ['#667085'] }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '8px',
      markers: { width: 7, height: 7, radius: 7 },
      itemMargin: { horizontal: 7, vertical: 0 }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (v: number) => `${v}%`
      }
    }
  }

  const chartSeries = series.map(s => ({
    name: s.name,
    data: s.values
  }))

  return (
    <DashboardCard sx={{ p: 1.1, height: '100%' }}>
      {title && (
        <Typography sx={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', mb: .2 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ width: '100%', height: 205 }}>
        <Chart
          type='line'
          height='100%'
          options={options}
          series={chartSeries}
        />
      </Box>
    </DashboardCard>
  )
}
