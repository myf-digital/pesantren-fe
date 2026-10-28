import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-anggaran')

export const request = finance.request
export default finance.reducer
