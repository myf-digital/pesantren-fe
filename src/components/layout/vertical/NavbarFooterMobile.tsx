'use client'

import Link from 'next/link'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'

import { signOut, useSession } from 'next-auth/react'

import { ListItemText } from '@mui/material'

import { useSettings } from '@core/hooks/useSettings'

import useVerticalNav from '../../../@menu/hooks/useVerticalNav'
import { useState } from 'react'
import SwitchRoleDialog from '../shared/SwitchRoleDialog'

export default function NavbarFooterMobile() {
  const { data: session } = useSession()
  const { updateSettings } = useSettings()
  const { isToggled, toggleVerticalNav } = useVerticalNav()
  const [switchRoleOpen, setSwitchRoleOpen] = useState(false)

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
      updateSettings({ layout: 'vertical' })
    } catch (error) {
      console.error(error)
    }
  }

  const handleCloseSidebar = () => {
    if (isToggled) {
      toggleVerticalNav()
    }
  }

  return (
    <Box
      sx={{
        borderTop: theme => `1px solid ${theme.palette.divider}`,
        p: 3,
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2
        }}
      >
        <div className='flex items-center pl-2 gap-2' tabIndex={-1}>
          <Avatar alt={session?.userdata?.full_name || ''} src={session?.userdata?.image || ''} />
          <div className='flex items-start flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {session?.userdata?.full_name || ''}
            </Typography>
            <Typography variant='caption'>{session?.userdata?.email || ''}</Typography>
          </div>
        </div>
      </Box>

      <List dense>
        <ListItem disablePadding sx={{ marginBottom: 3 }}>
          <ListItemButton component={Link} href='/pages/user-profile' onClick={handleCloseSidebar}>
            <ListItemIcon>
              <i className='tabler-user' />
            </ListItemIcon>

            <ListItemText primary='Profile' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ marginBottom: 3 }}>
          <ListItemButton
            onClick={() => {
              handleCloseSidebar()
              setSwitchRoleOpen(true)
            }}
          >
            <ListItemIcon>
              <i className='tabler-switch-horizontal' />
            </ListItemIcon>

            <ListItemText primary='Ubah Role' />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleUserLogout}
            sx={{
              color: 'error.main'
            }}
          >
            <ListItemIcon
              sx={{
                color: 'error.main'
              }}
            >
              <i className='tabler-logout' />
            </ListItemIcon>

            <ListItemText primary='Logout' />
          </ListItemButton>
        </ListItem>
      </List>

      <SwitchRoleDialog open={switchRoleOpen} onClose={() => setSwitchRoleOpen(false)} />
    </Box>
  )
}
