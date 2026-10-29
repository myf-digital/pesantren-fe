'use client'

import FinanceImport from '../../keuangan/components/FinanceImport'
import { postImport, postExport, resetRedux } from '../slice'

const actions = { postImport, postExport, resetRedux }

export default function Page() {
  return <FinanceImport resource='keu-rekap-harian' actions={actions} />
}
