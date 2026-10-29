'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuAnggaranById, postKeuAnggaran, postKeuAnggaranUpdate, resetRedux } from '../slice'

const actions = { fetchById: fetchKeuAnggaranById, create: postKeuAnggaran, update: postKeuAnggaranUpdate, resetRedux }

export default function Page() {
  return <FinanceForm resource='keu-anggaran' actions={actions} />
}
