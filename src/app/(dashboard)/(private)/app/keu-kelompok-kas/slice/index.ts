import { createFinanceModule } from '../../keuangan/api'

const finance = createFinanceModule('keu-kelompok-kas')

export const request = finance.request
export default finance.reducer
