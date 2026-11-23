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

const formatAmount = (value: bigint) => {
  const amount = value < 0n ? -value : value

  return `${value < 0n ? '-' : ''}${(amount / 100n).toLocaleString('id-ID')},${String(amount % 100n).padStart(2, '0')}`
}

export function calculateDailyBalance(values: Record<string, any>): string {
  const amounts = ['saldo_awal', 'masuk', 'keluar'].map(key => String(scalarValue(values[key]) ?? '').trim() || '0')

  if (amounts.some(value => !moneyPattern.test(value))) return ''
  const [awal, masuk, keluar] = amounts.map(cents)
  const balance = awal + masuk - keluar
  const amount = balance < 0n ? -balance : balance

  return `${balance < 0n ? '-' : ''}${amount / 100n}.${String(amount % 100n).padStart(2, '0')}`
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
        `Saldo akhir sumber ${formatAmount(akhir)} berbeda dari perhitungan ${formatAmount(expected)}; selisih ${formatAmount(akhir - expected)}. Saldo sumber tetap disimpan.`
      ]
}

export function budgetRemaining(values: Record<string, any>): string | null {
  const status = scalarValue(values.status_sumber)

  if (status !== 'Disetujui' && status !== 'Realisasi') return null
  const approved = String(scalarValue(values.nilai_disetujui) ?? '').trim()
  const realized = String(scalarValue(values.nilai_realisasi) ?? '').trim() || '0'

  if (!moneyPattern.test(approved) || !moneyPattern.test(realized)) return null
  const approval = cents(approved)
  const realization = cents(realized)

  if (approval <= 0n || realization < 0n || realization > approval) return null

  return formatAmount(approval - realization)
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

    if (field.required && field.dataType !== 'boolean' && (value == null || value === '')) {
      errors[field.key] = `${field.label} wajib diisi`
      continue
    }

    if (value == null || value === '') {
      if (field.dataType === 'boolean') errors[field.key] = `${field.label} harus berupa boolean`
      else payload[field.key] = null
      continue
    }

    if (field.maxLength && typeof value === 'string' && value.length > field.maxLength)
      errors[field.key] = `${field.label} maksimal ${field.maxLength} karakter`

    if (field.dataType === 'integer') {
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
    } else if (field.dataType === 'money') {
      const text = String(value)

      if (!moneyPattern.test(text))
        errors[field.key] = `${field.label}: maksimal 16 digit bulat dan 2 desimal; gunakan titik untuk desimal`
      else if (!field.signed && cents(text) < 0n) errors[field.key] = `${field.label} tidak boleh negatif`
      payload[field.key] = text
    } else if (field.dataType === 'date') {
      try {
        payload[field.key] = dateOnly(value)
      } catch (error) {
        errors[field.key] = `${field.label}: ${(error as Error).message}`
      }
    } else if (field.dataType === 'boolean') {
      if (typeof value !== 'boolean') errors[field.key] = `${field.label} harus berupa boolean`
      payload[field.key] = value
    } else {
      if (field.dataType === 'select' && !field.options?.includes(value))
        errors[field.key] = `${field.label} tidak valid`
      if (field.dataType === 'reference' && typeof value !== 'string')
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
  if (resource === 'keu-anggaran') {
    if (payload.per_akun && !payload.id_akun) errors.id_akun = 'Akun wajib untuk anggaran per akun'

    const proposed = errors.nilai_diajukan ? null : cents(payload.nilai_diajukan)
    const approved = errors.nilai_disetujui ? null : cents(payload.nilai_disetujui ?? '0')
    const realized = errors.nilai_realisasi ? null : cents(payload.nilai_realisasi ?? '0')

    if (proposed === 0n) errors.nilai_diajukan = 'Nilai diajukan harus lebih besar dari 0'

    if (!errors.status_sumber) {
      const hasApproval = payload.status_sumber === 'Disetujui' || payload.status_sumber === 'Realisasi'
      const hasRealization = payload.status_sumber === 'Realisasi'

      if (approved !== null && approved > 0n !== hasApproval)
        errors.nilai_disetujui = hasApproval
          ? 'Nilai disetujui harus lebih besar dari 0'
          : 'Nilai disetujui harus 0 atau kosong untuk status ini'
      else if (approved !== null && proposed !== null && approved > proposed)
        errors.nilai_disetujui = 'Nilai disetujui tidak boleh melebihi nilai diajukan'

      if (realized !== null && realized > 0n !== hasRealization)
        errors.nilai_realisasi = hasRealization
          ? 'Nilai realisasi harus lebih besar dari 0'
          : 'Nilai realisasi harus 0 atau kosong untuk status ini'
      else if (realized !== null && approved !== null && realized > approved)
        errors.nilai_realisasi = 'Nilai realisasi tidak boleh melebihi nilai disetujui'
    }
  }

  if (resource === 'keu-beasiswa') {
    if (payload.cakupan_data === 'PerPenerima' && !payload.id_santri)
      errors.id_santri = 'Santri wajib untuk data per penerima'
    if (payload.cakupan_data === 'Agregat') payload.id_santri = null
  }

  for (const field of config.fields) {
    const selected = values[field.key]

    if (
      field.dataType === 'reference' &&
      ['keu-akun', 'keu-kelompok-kas'].includes(field.source!) &&
      selected &&
      typeof selected === 'object' &&
      selected.is_active === false
    )
      errors[field.key] = `Pilih ${field.label.toLowerCase()} yang aktif`
  }

  const group = values.id_kelompok_kas

  if (resource === 'keu-akun' && group && typeof group === 'object' && group.is_active === false)
    errors.id_kelompok_kas = 'Pilih kelompok kas yang aktif'

  return { payload, errors }
}
