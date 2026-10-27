import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-beasiswa')

export const request = finance.request
export default finance.reducer
