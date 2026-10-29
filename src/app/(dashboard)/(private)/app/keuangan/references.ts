import type { Field } from './config'

export function referenceOption(field: Field, row: Record<string, any>) {
  const code = field.codeKey ? row[field.codeKey] : null
  const name = field.labelKey ? row[field.labelKey] : null

  return {
    ...row,
    value: row[field.idKey!],
    label: code ? (name && name !== code ? `${code} — ${name}` : String(code)) : name || 'Kode Belum Tersedia'
  }
}
