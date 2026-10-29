'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuAnggaranPage, deleteKeuAnggaran, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuAnggaranPage, remove: deleteKeuAnggaran, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-anggaran' actions={actions} />
}
