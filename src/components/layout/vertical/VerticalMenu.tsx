'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSession } from 'next-auth/react'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu } from '@menu/vertical-menu'

import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { usePermissionContext } from '@/contexts/PermissionContext'
import { normalizeAbility } from '@/libs/permission'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
import { verticalMenuData } from '@/data/navigation/verticalMenuData'
import type { VerticalMenuDataType } from '@/types/menuTypes'
import NavbarFooterMobile from './NavbarFooterMobile'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {

  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({  scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const [menuData, setMenuData] = useState<VerticalMenuDataType[]>([])
  const { update } = useSession()
  const { permissions, setPermissions } = usePermissionContext()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  useEffect(() => {
    const loadMenu = async () => {
      const data = await verticalMenuData((others) => {
        const normalized = normalizeAbility(others)
        
        // Compare new permissions with existing ones to avoid infinite loop
        const currentKeys = Object.keys(permissions || {})
        const newKeys = Object.keys(normalized || {})
        const hasChanged =
          currentKeys.length !== newKeys.length ||
          currentKeys.some((key) => permissions[key] !== normalized[key])

        if (hasChanged) {
          setPermissions(normalized)
          update({ permissions: normalized })
        }
      })
      
      setMenuData(data)
    }

    loadMenu()
  }, [update, setPermissions, permissions])

  return (
    <div className='flex flex-col h-full pb-20'>
      <ScrollWrapper
        {...(isBreakpointReached
          ? {
              className: 'flex-1 overflow-y-auto overflow-x-hidden',
              onScroll: container => scrollMenu(container, false)
            }
          : {
              options: {
                wheelPropagation: false,
                suppressScrollX: true
              },
              onScrollY: container => scrollMenu(container, true)
            })}
      >
        <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => (
            <RenderExpandIcon
              open={open}
              transitionDuration={transitionDuration}
            />
          )}
          renderExpandedMenuItemIcon={{
            icon: <i className='tabler-circle text-xs' />
          }}
          menuSectionStyles={menuSectionStyles(
            verticalNavOptions,
            theme
          )}
        >
          <GenerateVerticalMenu menuData={menuData} />
        </Menu>
      </ScrollWrapper>

      {/* FOOTER */}
      {isBreakpointReached ? (<NavbarFooterMobile />) : null}
    </div>
  )
}

export default VerticalMenu
