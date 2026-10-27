import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-import-batch')

export const request = finance.request
export default finance.reducer
