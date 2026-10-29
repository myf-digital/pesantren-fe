'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuAkunPage, deleteKeuAkun, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuAkunPage, remove: deleteKeuAkun, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-akun' actions={actions} />
}
