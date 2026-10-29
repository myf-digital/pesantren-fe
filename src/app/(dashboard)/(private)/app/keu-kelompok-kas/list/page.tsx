'use client'

import FinanceList from '../../keuangan/components/FinanceList'
import { fetchKeuKelompokKasPage, deleteKeuKelompokKas, postExport, resetRedux } from '../slice'

const actions = { fetchPage: fetchKeuKelompokKasPage, remove: deleteKeuKelompokKas, postExport, resetRedux }

export default function Page() {
  return <FinanceList resource='keu-kelompok-kas' actions={actions} />
}
