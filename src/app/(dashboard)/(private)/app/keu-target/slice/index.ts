import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-target')

export const request = finance.request
export default finance.reducer
