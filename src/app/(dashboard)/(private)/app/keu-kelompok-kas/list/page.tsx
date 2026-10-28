'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { request } from '../slice'

export default function Page() {
  return <FinanceList resource='keu-kelompok-kas' request={request} />
}
