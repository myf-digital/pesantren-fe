'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuRekapHarianById, postKeuRekapHarian, postKeuRekapHarianUpdate, resetRedux } from '../slice'

const actions = {
  fetchById: fetchKeuRekapHarianById,
  create: postKeuRekapHarian,
  update: postKeuRekapHarianUpdate,
  resetRedux
}

export default function Page() {
  return <FinanceForm resource='keu-rekap-harian' actions={actions} />
}
