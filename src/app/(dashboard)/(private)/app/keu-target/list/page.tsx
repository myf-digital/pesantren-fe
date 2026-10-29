'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuTargetPage, deleteKeuTarget, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuTargetPage, remove: deleteKeuTarget, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-target' actions={actions} />
}
