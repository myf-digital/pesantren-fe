'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuTargetById, postKeuTarget, postKeuTargetUpdate, resetRedux } from '../slice'

const actions = { fetchById: fetchKeuTargetById, create: postKeuTarget, update: postKeuTargetUpdate, resetRedux }

export default function Page() {
  return <FinanceForm resource='keu-target' actions={actions} />
}
