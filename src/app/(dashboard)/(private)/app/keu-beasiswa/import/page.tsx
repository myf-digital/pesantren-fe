'use client'

import FinanceImport from '../../keuangan/components/FinanceImport'
import { request } from '../slice'

export default function Page() {
  return <FinanceImport resource='keu-beasiswa' request={request} />
}
