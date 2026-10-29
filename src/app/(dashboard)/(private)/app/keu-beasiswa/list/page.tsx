'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuBeasiswaPage, deleteKeuBeasiswa, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuBeasiswaPage, remove: deleteKeuBeasiswa, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-beasiswa' actions={actions} />
}
