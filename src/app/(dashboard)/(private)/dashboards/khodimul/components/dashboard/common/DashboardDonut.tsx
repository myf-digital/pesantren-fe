'use client'

import dynamic from 'next/dynamic'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DashboardCard from './DashboardCard'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type Item = {
  label: string
  value: number
  color: string
}

export default function DashboardDonut({
  title,
  total,
  totalLabel,
  items
}: {
  title: string
  total: string
  totalLabel?: string
  items: Item[]
}) {
  const options: any = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      animations: { enabled: true }
    },
    labels: items.map(x => x.label),
    colors: items.map(x => x.color),
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '8px',
              color: '#667085',
              offsetY: -4
            },
            value: {
              show: true,
              fontSize: '17px',
              fontWeight: 800,
              color: '#172033',
              offsetY: 5,
              formatter: () => total
            },
            total: {
              show: true
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (v: number) => v.toLocaleString('id-ID')
      }
    }
  }

  return (
    <DashboardCard sx={{ p: 1.1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{title}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
        <Box sx={{ width: 132, minWidth: 132, height: 155 }}>
          <Chart type='donut' height='100%' options={options} series={items.map(x => x.value)} />
        </Box>

        <Box sx={{ flex: 1 }}>
          {items.map(item => (
            <Box key={item.label} sx={{ display: 'flex', gap: 0.65, alignItems: 'center', mb: 0.65 }}>
              <Box sx={{ width: 7, height: 7, minWidth: 7, borderRadius: '50%', bgcolor: item.color }} />
              <Typography sx={{ fontSize: 10, flex: 1, lineHeight: 1.25 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{item.value.toLocaleString('id-ID')}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {totalLabel && (
        <Typography sx={{ fontSize: 12, color: '#667085', textAlign: 'center', mt: -1 }}>{totalLabel}</Typography>
      )}
    </DashboardCard>
  )
}
