// MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Type Import
import type { CardStatsVerticalProps } from '@/types/pages/widgetTypes'

// Component Import
import CustomAvatar from '@core/components/mui/Avatar'

const CardStatsVertical = (props: CardStatsVerticalProps) => {
  // Props
  const { stats, title, subtitle, avatarIcon, avatarColor, avatarSize, avatarSkin, chipText, chipColor, chipVariant, href } =
    props

  return (
    <Card className='h-full flex flex-col justify-between'>
      <CardContent className='flex flex-col gap-y-3 items-start w-full'>
        <CustomAvatar variant='rounded' skin={avatarSkin} size={avatarSize} color={avatarColor}>
          <i className={classnames(avatarIcon, 'text-[28px]')} />
        </CustomAvatar>
        <div className='flex flex-col gap-y-1 w-full'>
          <Typography variant='h5'>{title}</Typography>
          <Typography color='text.disabled'>{subtitle}</Typography>
          <Typography color='text.primary'>{stats}</Typography>
        </div>
        {chipText ? (
          <Chip label={chipText} color={chipColor} variant={chipVariant} size='small' />
        ) : (
          <Chip label='Placeholder' size='small' style={{ visibility: 'hidden' }} />
        )}
      </CardContent>
      {href && (
        <div className='px-5 pb-5 w-full flex justify-end mt-auto'>
          <Button
            component={Link}
            href={href}
            variant='text'
            color='primary'
            size='small'
            endIcon={<i className='tabler-chevron-right' />}
            sx={{ p: 0, '&:hover': { background: 'transparent' } }}
          >
            Lihat Detail
          </Button>
        </div>
      )}
    </Card>
  )
}

export default CardStatsVertical
