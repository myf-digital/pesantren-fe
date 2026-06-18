// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

import api from '@/libs/axios'
import { mapMenu } from '@/@core/utils/menuHelpers'

export const verticalMenuData = async (
  onSuccess?: (others: any) => void
): Promise<VerticalMenuDataType[]> => {
  try {
    const res = await api.get(`/navigation`)
    const { status, data, others } = res.data

    if (status) {
      if (others && onSuccess) {
        onSuccess(others)
      }
      return data.map((menu: any) => mapMenu(menu))
    }

    return []
  } catch (error) {
    return []
  }
}

export default verticalMenuData
