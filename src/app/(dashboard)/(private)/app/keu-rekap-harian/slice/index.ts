import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-rekap-harian')

export const request = finance.request
export default finance.reducer
