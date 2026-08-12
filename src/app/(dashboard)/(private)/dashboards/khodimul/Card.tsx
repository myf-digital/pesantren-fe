import Link from 'next/link'

import { Card, Box, Typography, Chip, CardContent, Button } from '@mui/material'

import classnames from 'classnames'

import CustomAvatar from '@/@core/components/mui/Avatar'

const CRMCard = ({
  title,
  stats,
  subtitle,
  avatarColor,
  avatarIcon,
  avatarSkin,
  avatarSize,
  chipText,
  chipColor,
  chipVariant,
  href,
  progressBar
}: any) => {
  const CardWrapper = href ? Link : 'div'

  return (
    <Card
      component={CardWrapper as any}
      href={href}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: href ? 'translateY(-2px)' : 'none',
          boxShadow: href ? 4 : 'none'
        }
      }}
    >
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          p: 2.5,
          gap: 2.5,
          height: '100%'
        }}
      >
        <CustomAvatar
          variant='rounded'
          skin={avatarSkin || 'light'}
          size={32}
          color={avatarColor}
          sx={{ flexShrink: 0 }}
        >
          <i className={classnames(avatarIcon, 'text-[18px]')} />
        </CustomAvatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>
              {stats}
            </Typography>
            {chipText && (
              <Chip
                label={chipText}
                color={chipColor}
                variant={chipVariant || 'tonal'}
                size='small'
                sx={{
                  height: 16,
                  fontSize: '9px',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
          {progressBar && (
            <Box sx={{ width: '100%', mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '9px' }}>
                  {`${progressBar.actual} / ${progressBar.target}`}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '9px' }}>
                  {`${Math.round(progressBar.target > 0 ? Math.min((progressBar.actual / progressBar.target) * 100, 100) : 0)}%`}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#FF6B00',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: `${progressBar.target > 0 ? Math.min((progressBar.actual / progressBar.target) * 100, 100) : 0}%`,
                    height: '100%',
                    backgroundColor: '#0066FF',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1
        }}
      >
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', p: 5, width: '100%' }}
        >
          <CustomAvatar variant='rounded' skin={avatarSkin || 'light'} size={avatarSize || 44} color={avatarColor}>
            <i className={classnames(avatarIcon, 'text-[24px]')} />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <Typography variant='h5' sx={{ fontSize: '16px', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography color='text.disabled' sx={{ fontSize: '13px' }}>
              {subtitle}
            </Typography>
            <Typography color='text.primary' variant='h4' sx={{ fontWeight: 600, mt: 1 }}>
              {stats}
            </Typography>
            {progressBar && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                    {`${progressBar.actual} / ${progressBar.target}`}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                    {`${Math.round(progressBar.target > 0 ? Math.min((progressBar.actual / progressBar.target) * 100, 100) : 0)}%`}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#FF6B00',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      width: `${progressBar.target > 0 ? Math.min((progressBar.actual / progressBar.target) * 100, 100) : 0}%`,
                      height: '100%',
                      backgroundColor: '#0066FF',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
          {chipText ? (
            <Chip label={chipText} color={chipColor} variant={chipVariant || 'tonal'} size='small' />
          ) : (
            <Chip label='Placeholder' size='small' sx={{ visibility: 'hidden' }} />
          )}
        </CardContent>
        {href && (
          <Box sx={{ px: 5, pb: 5, width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
            <Button
              variant='text'
              color='primary'
              size='small'
              endIcon={<i className='tabler-chevron-right' />}
              sx={{ p: 0, '&:hover': { background: 'transparent' } }}
            >
              Lihat Detail
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  )
}

export default CRMCard
