'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuAkunById, postKeuAkun, postKeuAkunUpdate, resetRedux } from '../slice'

const actions = { fetchById: fetchKeuAkunById, create: postKeuAkun, update: postKeuAkunUpdate, resetRedux }

export default function Page() {
  return <FinanceForm resource='keu-akun' actions={actions} />
}
