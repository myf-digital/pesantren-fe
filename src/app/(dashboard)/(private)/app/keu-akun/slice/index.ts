import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-akun')

export const request = finance.request
export default finance.reducer
