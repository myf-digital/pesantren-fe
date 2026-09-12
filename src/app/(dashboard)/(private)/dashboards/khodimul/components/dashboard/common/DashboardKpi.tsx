'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { dashboardColors } from './dashboardTheme'
import DashboardCard from './DashboardCard'

type Props = {
  title: string
  value: string
  subtitle?: string
  icon?: string
  iconColor?: string
  valueColor?: string
  performance?: boolean
  status?: string
  progress?: number
  footer?: string
  height?: number
}

export default function DashboardKpi({
  title,
  value,
  subtitle,
  icon,
  iconColor = dashboardColors.green,
  valueColor = dashboardColors.text,
  performance,
  status,
  progress,
  footer,
  height = 140
}: Props) {
  return (
    <DashboardCard sx={{ height, p: 1.25 }}>
      {performance ? (
        <>
          <Typography sx={{ fontSize: 9.5, fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 27, fontWeight: 800, lineHeight: 1, color: valueColor, textAlign: 'center', mt: 1 }}>
            {value}
          </Typography>
          {status && (
            <Box sx={{ width: 'fit-content', mx: 'auto', mt: .8, px: 1.1, py: .35, borderRadius: 1, bgcolor: '#e9f6ee', color: iconColor, fontSize: 8.5, fontWeight: 800 }}>
              {status}
            </Box>
          )}
          {progress !== undefined && (
            <Box sx={{ mt: 1.15, height: 5, bgcolor: '#edf0f2', borderRadius: 99 }}>
              <Box sx={{ width: `${Math.min(progress,100)}%`, height: '100%', bgcolor: iconColor, borderRadius: 99 }} />
            </Box>
          )}
          {footer && <Typography sx={{ fontSize: 7.8, color: dashboardColors.secondary, mt: .75, textAlign: 'center' }}>{footer}</Typography>}
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {icon && (
              <Box sx={{ width: 36, height: 36, minWidth: 36, borderRadius: 1, bgcolor: iconColor, color: '#fff', display: 'grid', placeItems: 'center' }}>
                <i className={icon} style={{ fontSize: 18 }} />
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 8.8, fontWeight: 650, lineHeight: 1.35 }}>{title}</Typography>
              <Typography sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.1, mt: .6, color: valueColor }}>{value}</Typography>
            </Box>
          </Box>
          {subtitle && <Typography sx={{ fontSize: 7.9, color: dashboardColors.secondary, mt: 1.45 }}>{subtitle}</Typography>}
          {progress !== undefined && (
            <Box sx={{ mt: 1, height: 5, bgcolor: '#edf0f2', borderRadius: 99 }}>
              <Box sx={{ width: `${Math.min(progress,100)}%`, height: '100%', bgcolor: iconColor, borderRadius: 99 }} />
            </Box>
          )}
          {footer && <Typography sx={{ fontSize: 7.8, color: dashboardColors.secondary, mt: .8 }}>{footer}</Typography>}
        </>
      )}
    </DashboardCard>
  )
}
