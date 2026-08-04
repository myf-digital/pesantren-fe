import type { Ability, AbilityItem, PermissionMap, Resource } from '@/types/permission';

export function can(
  permissions: PermissionMap | null | undefined,
  resource: Resource,
  abilities: Ability | Ability[]
): boolean {
  if (!permissions) return false;

  const key = normalizeResource(resource);
  const permission = Number(permissions[key]) || 0;

  if (!permission) return false;

  const abilityMap: Record<Ability, number> = {
    view: 1,
    create: 2,
    edit: 4,
    delete: 8,
    import: 16,
    export: 32,
    approve: 64
  };

  const required = Array.isArray(abilities)
    ? abilities
    : [abilities];

  return required.every(
    (ability) => (permission & abilityMap[ability]) !== 0
  );
}

export const cannot = (
  permissions: PermissionMap | null | undefined,
  resource: Resource,
  abilities: Ability | Ability[]
) => !can(permissions, resource, abilities);

/** old: object<string, boolean> */
// export function normalizeAbility(
//   abilities: AbilityItem[]
// ): PermissionMap {
//   return abilities.reduce<PermissionMap>((acc, item) => {
//     const key = normalizeResource(item.module_name);

//     acc[key] = {
//       view: item.role_menu_view === 1,
//       create: item.role_menu_create === 1,
//       edit: item.role_menu_edit === 1,
//       delete: item.role_menu_delete === 1,
//       import: item.role_menu_import === 1,
//       export: item.role_menu_export === 1,
//     };

//     return acc;
//   }, {});
// }

/** new: bitmask */
export function normalizeAbility(abilities: AbilityItem[]) {
  return abilities.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeResource(item.module_name)

    acc[key] = (
      (item.role_menu_view ? 1 : 0) +
      (item.role_menu_create ? 2 : 0) +
      (item.role_menu_edit ? 4 : 0) +
      (item.role_menu_delete ? 8 : 0) +
      (item.role_menu_import ? 16 : 0) +
      (item.role_menu_export ? 32 : 0) +
      (item.role_menu_approve ? 64 : 0)
    )

    return acc
  }, {})
}

export function normalizeResource(path: string): string {
  return path
    .toLowerCase()
    .split('?')[0]
    .replace(/\/(list|form|edit|detail|access|import|approve)[^\/]*(\/.*)?$/, '')
    .replace(/\/$/, '');
}
