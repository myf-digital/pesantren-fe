'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuImportBatchById, postKeuImportBatch, postKeuImportBatchUpdate, resetRedux } from '../slice'

const actions = {
  fetchById: fetchKeuImportBatchById,
  create: postKeuImportBatch,
  update: postKeuImportBatchUpdate,
  resetRedux
}

export default function Page() {
  return <FinanceForm resource='keu-import-batch' actions={actions} />
}
