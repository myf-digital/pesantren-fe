'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Card, CardHeader, CardContent } from '@mui/material'
import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import { useSession } from 'next-auth/react'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchRoleMenuById, postRoleMenu, resetRedux, setNavigation } from '../slice'
import { field, fieldBuildSubmit, formColumn } from '@/views/onevour/form/AppFormBuilder'
import { fetchMenuAll } from '../../menu/slice'
import { buildMenuTree } from '@/@core/utils/menuHelpers'
import { normalizeResource } from '@/libs/permission'
import { useIsMobile } from "@core/hooks/useIsMobile"
import { usePermissionContext } from '@/contexts/PermissionContext'
import type { PermissionMap } from '@/types/permission'

const actions = ['view', 'create', 'edit', 'delete', 'import', 'export'] as const

type ActionType = (typeof actions)[number]

interface MenuItem {
  menu_id: string
  menu_name: string
  module_name: string
  menu_icon: string
  children?: MenuItem[]
}

interface MenuPermission {
  menu_id: string
  module_name: string
  view: number
  create: number
  edit: number
  delete: number
  import: number
  export: number
  status: number
  children?: MenuPermission[]
}

interface RoleOption {
  value: string
  label: string
}

interface RoleMenuUpdate {
  role_id: RoleOption
  menu: MenuPermission[]
}

type PermissionMapAccess = Record<string, MenuPermission>

interface FormData {
  role_id: string
  role_name: string
  menu: MenuPermission[]
}

const defaultValues: FormData = {
  role_id: '',
  role_name: '',
  menu: [],
}

const FormValidationBasic = () => {
  const router = useRouter()

  const { update } = useSession()

  const submittedMenuRef = useRef<RoleMenuUpdate>({
    role_id: { value: "", label: "" },
    menu: [],
  })

  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.role)
  const navigation = useAppSelector(state => state.role.navigation)
  const isMobile = useIsMobile(1000);

  const [state, setState] = useState<FormData>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [roleMenus, setRoleMenus] = useState<MenuPermission[]>([])
  const { setPermissions } = usePermissionContext()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({defaultValues})

  const leafMenuIds = useMemo(() => {
    const ids = new Set<string>()
    const walk = (items: MenuItem[]) => {
      items.forEach(item => {
        if (!item.children || item.children.length === 0) {
          ids.add(item.menu_id)
        } else {
          walk(item.children)
        }
      })
    }
    walk(navigation)
    return ids
  }, [navigation])

  const leafMenus = useMemo(() => {
    return state.menu.filter(m => leafMenuIds.has(m.menu_id))
  }, [state.menu, leafMenuIds])

  const getDescendantIds = useCallback((menuId: string, items: MenuItem[]): string[] => {
    const ids: string[] = []
    const findAndAdd = (nodes: MenuItem[], found = false) => {
      nodes.forEach(node => {
        const isCurrent = node.menu_id === menuId
        if (found || isCurrent) {
          if (!isCurrent) ids.push(node.menu_id)
          if (node.children) {
            findAndAdd(node.children, true)
          }
        } else if (node.children) {
          findAndAdd(node.children, false)
        }
      })
    }
    findAndAdd(items)
    return ids
  }, [])

  const adjustParentPermissions = useCallback((menuList: MenuPermission[], nav: MenuItem[]): MenuPermission[] => {
    const parentMap: Record<string, string> = {}
    const allParentMenuIds = new Set<string>()

    const walk = (items: MenuItem[], parentId?: string) => {
      items.forEach(item => {
        if (parentId) {
          parentMap[item.menu_id] = parentId
        }
        if (item.children && item.children.length > 0) {
          allParentMenuIds.add(item.menu_id)
          walk(item.children, item.menu_id)
        }
      })
    }
    walk(nav)

    const activeMenuIds = new Set<string>()
    menuList.forEach(m => {
      if (actions.some(act => m[act] === 1)) {
        activeMenuIds.add(m.menu_id)
      }
    })

    const parentIdsToActivate = new Set<string>()
    activeMenuIds.forEach(id => {
      let currentId = id
      while (parentMap[currentId]) {
        const parentId = parentMap[currentId]
        parentIdsToActivate.add(parentId)
        currentId = parentId
      }
    })

    return menuList.map(m => {
      if (allParentMenuIds.has(m.menu_id)) {
        const shouldBeActive = parentIdsToActivate.has(m.menu_id)
        return {
          ...m,
          view: shouldBeActive ? 1 : 0,
          create: 0,
          edit: 0,
          delete: 0,
          import: 0,
          export: 0
        }
      }
      return m
    })
  }, [])

  useEffect(() => {
    dispatch(fetchMenuAll({})).then(res => {
      const datas = res?.payload?.data

      if (!Array.isArray(datas)) return

      const tree = buildMenuTree(datas)
      
      dispatch(setNavigation(tree))
    })

    if (!id) return

    dispatch(fetchRoleMenuById(id)).then(res => {
      const datas = res?.payload?.data

      if (!datas) return

      setState(prev => ({
        ...prev,
        role_id: datas.role_id,
        role_name: datas.role_name
      }))

      reset({
        role_id: datas.role_id,
        role_name: datas.role_name
      })

      setRoleMenus(datas.menu ?? [])
    })

  }, [dispatch, id, reset])


  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/role/list')
  }, [dispatch, router])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')

      const permissions = submittedMenuRef.current?.menu.reduce((acc, m) => {
      const key = normalizeResource(m.module_name)

      acc[key] = (
        (m.view ? 1 : 0) +
        (m.create ? 2 : 0) +
        (m.edit ? 4 : 0) +
        (m.delete ? 8 : 0) +
        (m.import ? 16 : 0) +
        (m.export ? 32 : 0)
      )

      return acc
    }, {} as PermissionMap)

      setPermissions(permissions)

      update({ permissions })

      onCancel()
    } else {
      toast.error('Error saved: ' + store.crud.message)

      setLoading(false)
    }
  }, [onCancel, setPermissions, store.crud, update])

  const permissionMap = useMemo(() => {
    const map: PermissionMapAccess = {}

    state.menu.forEach(p => {
      map[p.menu_id] = p
    })
    
    return map
  }, [state.menu])

  const roleMenusSafe = useMemo(
    () => Array.isArray(roleMenus) ? roleMenus : [],
    [roleMenus]
  )

  const buildDefaultPermissions = (items: MenuItem[]) => {
    const result: MenuPermission[] = []

    const walk = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        result.push({
          menu_id: menu.menu_id,
          module_name: menu.module_name,
          view: 0,
          create: 0,
          edit: 0,
          delete: 0,
          import: 0,
          export: 0,
          status: 1
        })

        if (Array.isArray(menu.children)) {
          walk(menu.children)
        }
      })
    }

    walk(items)
    
    return result
  }

  const mergePermissions = (
    defaults: MenuPermission[],
    roleMenus: MenuPermission[]
  ) => {
    const map = new Map(roleMenus.map(m => [m.menu_id, m]))

    return defaults.map(def =>
      map.has(def.menu_id)
        ? { ...def, ...map.get(def.menu_id)! }
        : def
    )
  }

  useEffect(() => {
    if (!navigation.length) return

    const defaults = buildDefaultPermissions(navigation)

    const merged = mergePermissions(
      defaults,
      roleMenusSafe
    )

    const adjusted = adjustParentPermissions(merged, navigation)

    setState(prev => ({
      ...prev,
      menu: adjusted
    }))
  }, [navigation, roleMenusSafe, adjustParentPermissions])

  const isAllChecked = (action: ActionType) =>
    leafMenus.length > 0 &&
    leafMenus.every(menu => menu[action] === 1)

  const isSomeChecked = (action: ActionType) =>
    leafMenus.some(menu => menu[action] === 1) &&
    !isAllChecked(action)

  const onCheckAll = (action: ActionType, value: boolean) => {
    setState(prev => {
      const updatedMenu = prev.menu.map(m => {
        const isLeaf = leafMenuIds.has(m.menu_id)
        if (isLeaf) {
          return {
            ...m,
            [action]: value ? 1 : 0
          }
        }
        return m
      })
      return {
        ...prev,
        menu: adjustParentPermissions(updatedMenu, navigation)
      }
    })
  }

  const resetActionsExceptView = (menu: MenuPermission): MenuPermission => ({
    ...menu,
    create: 0,
    edit: 0,
    delete: 0,
    import: 0,
    export: 0,
    children: menu.children?.map(resetActionsExceptView)
  })

  const togglePermission = (
    menuId: string,
    action: ActionType,
    checked: boolean
  ) => {
    const descendantIds = getDescendantIds(menuId, navigation)
    const isParent = descendantIds.length > 0

    setState(prev => {
      const updatedMenu = prev.menu.map(menu => {
        if (isParent && descendantIds.includes(menu.menu_id)) {
          if (action === 'view') {
            if (checked) {
              return {
                ...menu,
                view: 1
              }
            } else {
              return {
                ...menu,
                view: 0,
                create: 0,
                edit: 0,
                delete: 0,
                import: 0,
                export: 0
              }
            }
          }
        }

        if (menu.menu_id === menuId) {
          if (action === 'view' && !checked) {
            return {
              ...resetActionsExceptView(menu),
              view: 0
            }
          }

          if (action !== 'view' && checked) {
            return {
              ...menu,
              view: 1,
              [action]: 1
            }
          }

          return {
            ...menu,
            [action]: checked ? 1 : 0
          }
        }

        return menu
      })

      return {
        ...prev,
        menu: adjustParentPermissions(updatedMenu, navigation)
      }
    })
  }

  const renderMenu = (items: MenuItem[], level = 0) =>
  items.map(item => (
    <Fragment key={item.menu_id}>
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-2">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: level * 20 }}
          >
            {item.menu_icon && <i className={item.menu_icon} />}
            <span className={level === 0 ? 'font-semibold' : ''}>
              {item.menu_name}
            </span>
          </div>
        </td>

        {actions.map(action => {
          const isParent = Array.isArray(item.children) && item.children.length > 0
          const checked = isParent
            ? (action === 'view' && permissionMap[item.menu_id]?.view === 1)
            : (permissionMap[item.menu_id]?.[action] === 1)

          const disabled = isParent
            ? (action !== 'view')
            : (action !== 'view' && permissionMap[item.menu_id]?.view === 0)

          return (
            <td key={action} className="px-3 py-2 text-center">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={checked}
                disabled={disabled}
                onChange={e =>
                  togglePermission(item.menu_id, action, e.target.checked)
                }
              />
            </td>
          )
        })}
      </tr>

      {Array.isArray(item.children) &&
        renderMenu(item.children, level + 1)}
    </Fragment>
  ))

  const renderMenuMobile = (items: MenuItem[], level = 0) =>
  items.map(item => (
    <div
      key={item.menu_id}
      className="border rounded-lg p-3 bg-white shadow-sm"
      style={{ marginLeft: level * 12 }}
    >
      <div className="flex items-center gap-2 mb-2">
        {item.menu_icon && <i className={item.menu_icon} />}
        <span className={level === 0 ? 'font-semibold' : 'font-medium'}>
          {item.menu_name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => {
          const isParent = Array.isArray(item.children) && item.children.length > 0
          const checked = isParent
            ? (action === 'view' && permissionMap[item.menu_id]?.view === 1)
            : (permissionMap[item.menu_id]?.[action] === 1)

          const disabled = isParent
            ? (action !== 'view')
            : (action !== 'view' && permissionMap[item.menu_id]?.view === 0)

          return (
            <label
              key={action}
              className={`flex items-center justify-between text-xs border rounded px-2 py-1
                ${disabled ? 'opacity-50' : ''}`}
            >
              <span className="capitalize">{action}</span>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={checked}
                disabled={disabled}
                onChange={e =>
                  togglePermission(item.menu_id, action, e.target.checked)
                }
              />
            </label>
          )
        })}
      </div>

      {Array.isArray(item.children) && item.children.length > 0 && (
        <div className="mt-3 space-y-2 border-l pl-3">
          {renderMenuMobile(item.children, level + 1)}
        </div>
      )}
    </div>
  ))

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    const payload = {
      role_id: {
        value: state.role_id,
        label: state.role_name,
      },
      menu: state.menu.filter(menu =>
        actions.some(action => menu[action] === 1)
      ),
    }

    submittedMenuRef.current = payload

    dispatch(postRoleMenu([payload]))
  }

  const fields = () => [
    field({
      type: 'text',
      key: 'role_name',
      label: 'Role Name',
      placeholder: 'Input role name',
      required: true,
      readOnly: true,
    }),
    field({
      type: 'custom',
      key: 'menu',
      render: () => (
        isMobile ? (
          <div className="space-y-3">
            {renderMenuMobile(navigation)}
          </div>
          ) : (
          <table className="table w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">Menu</th>
                {actions.map(action => (
                  <th key={action} className="px-3 py-2 text-center">
                    <div className="capitalize">{action}</div>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={isAllChecked(action)}
                      ref={el => {
                        if (el) el.indeterminate = isSomeChecked(action)
                      }}
                      onChange={e => onCheckAll(action, e.target.checked)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderMenu(navigation)}
            </tbody>
          </table>
        )
      )
    }),
    fieldBuildSubmit({ onCancel, loading })
  ]

  return (
    <Card>
      <CardHeader title="Form Role" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {formColumn({
            control,
            errors,
            state,
            setState,
            fields: fields()
          })}
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationBasic
