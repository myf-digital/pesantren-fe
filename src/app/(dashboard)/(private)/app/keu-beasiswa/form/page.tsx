'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuBeasiswaById, postKeuBeasiswa, postKeuBeasiswaUpdate, resetRedux } from '../slice'

const actions = { fetchById: fetchKeuBeasiswaById, create: postKeuBeasiswa, update: postKeuBeasiswaUpdate, resetRedux }

export default function Page() {
  return <FinanceForm resource='keu-beasiswa' actions={actions} />
}
