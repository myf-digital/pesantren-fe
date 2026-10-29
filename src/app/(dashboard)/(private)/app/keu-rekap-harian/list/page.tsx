'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuRekapHarianPage, deleteKeuRekapHarian, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuRekapHarianPage, remove: deleteKeuRekapHarian, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-rekap-harian' actions={actions} />
}
