'use client'

import FinanceForm from '../../keuangan/components/FinanceForm'
import { fetchKeuKelompokKasById, postKeuKelompokKas, postKeuKelompokKasUpdate, resetRedux } from '../slice'

const actions = {
  fetchById: fetchKeuKelompokKasById,
  create: postKeuKelompokKas,
  update: postKeuKelompokKasUpdate,
  resetRedux
}

export default function Page() {
  return <FinanceForm resource='keu-kelompok-kas' actions={actions} />
}
