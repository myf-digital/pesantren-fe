import type { ModuleConfig } from './config'

export const scalarValue = (value: any) =>
  value && typeof value === 'object' && !(value instanceof Date) ? value.value : value

function dateOnly(value: unknown): string | null {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('Tanggal tidak valid')

    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error('Format tanggal harus YYYY-MM-DD')
  const parsed = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value)
    throw new Error('Tanggal tidak valid')

  return value
}

const moneyPattern = /^-?\d{1,16}(\.\d{1,2})?$/

const cents = (value: string) => {
  const [whole, fraction = ''] = value.replace(/^-/, '').split('.')

  return (value.startsWith('-') ? -1n : 1n) * (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')))
}

const decimal = (value: bigint) => {
  const amount = value < 0n ? -value : value

  return `${value < 0n ? '-' : ''}${amount / 100n}.${String(amount % 100n).padStart(2, '0')}`
}

export function dailyBalanceWarnings(values: Record<string, any>): string[] {
  const amounts = ['saldo_awal', 'masuk', 'keluar', 'saldo_akhir'].map(key =>
    String(scalarValue(values[key]) ?? '').trim()
  )

  if (amounts.some(value => !moneyPattern.test(value))) return []
  const [awal, masuk, keluar, akhir] = amounts.map(cents)
  const expected = awal + masuk - keluar

  return akhir === expected
    ? []
    : [
        `Saldo akhir sumber ${amounts[3]} berbeda dari perhitungan ${decimal(expected)}; selisih ${decimal(akhir - expected)}. Saldo sumber tetap disimpan.`
      ]
}

export function buildFinancePayload(
  resource: string,
  config: ModuleConfig,
  values: Record<string, any>,
  account?: { is_periodik_tahun_ajaran?: boolean } | null
) {
  const payload: Record<string, any> = {}
  const errors: Record<string, string> = {}

  for (const field of config.fields) {
    let value = scalarValue(values[field.key])

    if (typeof value === 'string') value = value.trim()

    if (field.required && field.type !== 'boolean' && (value == null || value === '')) {
      errors[field.key] = `${field.label} wajib diisi`
      continue
    }

    if (value == null || value === '') {
      if (field.type === 'boolean') errors[field.key] = `${field.label} harus berupa boolean`
      else payload[field.key] = null
      continue
    }

    if (field.maxLength && typeof value === 'string' && value.length > field.maxLength)
      errors[field.key] = `${field.label} maksimal ${field.maxLength} karakter`

    if (field.type === 'integer') {
      const number = Number(value)

      if (
        !/^-?\d+$/.test(String(value)) ||
        !Number.isInteger(number) ||
        number < -2147483648 ||
        number > 2147483647 ||
        (field.key !== 'urutan' && number < (field.key === 'nomor_baris_sumber' ? 1 : 0))
      )
        errors[field.key] = `${field.label} harus bilangan bulat yang valid`
      payload[field.key] = number
    } else if (field.type === 'money') {
      const text = String(value)

      if (!moneyPattern.test(text))
        errors[field.key] = `${field.label}: maksimal 16 digit bulat dan 2 desimal; gunakan titik untuk desimal`
      else if (!field.signed && cents(text) < 0n) errors[field.key] = `${field.label} tidak boleh negatif`
      payload[field.key] = text
    } else if (field.type === 'date') {
      try {
        payload[field.key] = dateOnly(value)
      } catch (error) {
        errors[field.key] = `${field.label}: ${(error as Error).message}`
      }
    } else if (field.type === 'boolean') {
      if (typeof value !== 'boolean') errors[field.key] = `${field.label} harus berupa boolean`
      payload[field.key] = value
    } else {
      if (field.type === 'select' && !field.options?.includes(value)) errors[field.key] = `${field.label} tidak valid`
      if (field.type === 'reference' && typeof value !== 'string')
        errors[field.key] = `${field.label} harus dipilih dari master`
      payload[field.key] = value
    }
  }

  for (const [start, end] of [
    ['periode_mulai', 'periode_selesai'],
    ['periode_awal', 'periode_akhir']
  ]) {
    if (payload[start] && payload[end] && payload[start] > payload[end])
      errors[end] = 'Periode selesai tidak boleh sebelum periode mulai'
  }

  if (
    ['keu-rekap-harian', 'keu-target'].includes(resource) &&
    account?.is_periodik_tahun_ajaran &&
    !payload.id_tahunajaran
  )
    errors.id_tahunajaran = 'Tahun ajaran wajib untuk akun periodik'
  if (resource === 'keu-anggaran' && payload.per_akun && !payload.id_akun)
    errors.id_akun = 'Akun wajib untuk anggaran per akun'

  if (resource === 'keu-beasiswa') {
    if (payload.cakupan_data === 'PerPenerima' && !payload.id_santri)
      errors.id_santri = 'Santri wajib untuk data per penerima'
    if (payload.cakupan_data === 'Agregat') payload.id_santri = null
  }

  const group = values.id_kelompok_kas

  if (resource === 'keu-akun' && group && typeof group === 'object' && group.is_active === false)
    errors.id_kelompok_kas = 'Pilih kelompok kas yang aktif'

  return { payload, errors }
}
