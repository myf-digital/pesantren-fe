'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { request } from '../slice'

export default function Page() {
  return <FinanceForm resource='keu-anggaran' request={request} />
}
