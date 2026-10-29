'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuImportBatchPage, deleteKeuImportBatch, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuImportBatchPage, remove: deleteKeuImportBatch, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-import-batch' actions={actions} />
}
