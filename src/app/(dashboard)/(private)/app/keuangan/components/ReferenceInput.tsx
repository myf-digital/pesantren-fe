'use client'

import { useEffect, useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'

import api from '@/libs/axios'
import type { Field } from '../config'

export default function ReferenceInput({
  field,
  value,
  disabled,
  required,
  onChange,
  onResolve
}: {
  field: Field
  value: string
  disabled?: boolean
  required?: boolean
  onChange: (value: string) => void
  onResolve?: (row: any) => void
}) {
  const [options, setOptions] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const idKey = field.idKey!
  const label = (row: any) => String(row?.[field.labelKey!] || row?.[idKey] || '')

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)

      try {
        const res = await api.get(`/app/${field.source}${field.source === 'santri' ? '' : '/all-data'}`, {
          params: { ...field.params, q: search, page: 1, perPage: 50 },
          signal: controller.signal
        })

        const rows = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.values || []

        if (!controller.signal.aborted) {
          setOptions(
            rows.filter((row: any) => field.source !== 'keu-import-batch' || row.status_batch !== 'Dibatalkan')
          )
          setError('')
        }
      } catch {
        if (!controller.signal.aborted) setError('Gagal memuat pilihan. Ketik untuk mencoba lagi.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [field, search])

  useEffect(() => {
    if (!value) {
      setSelected(null)

      return
    }

    const found = options.find(row => row[idKey] === value)

    if (found) {
      setSelected(found)
      onResolve?.(found)

      return
    }

    const controller = new AbortController()

    api
      .get(`/app/${field.source}/${value}`, { signal: controller.signal })
      .then(res => {
        if (res.data?.data && !controller.signal.aborted) {
          setSelected(res.data.data)
          onResolve?.(res.data.data)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setSelected({ [idKey]: value })
      })

    return () => controller.abort()

    // Resolution depends on the reference ID and loaded options, not the callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options, field.source, idKey])

  return (
    <Autocomplete
      options={options}
      value={selected}
      disabled={disabled}
      loading={loading}
      filterOptions={rows => rows}
      getOptionLabel={label}
      isOptionEqualToValue={(a, b) => a[idKey] === b[idKey]}
      onInputChange={(_, text, reason) => {
        if (reason === 'input') setSearch(text)
      }}
      onChange={(_, row) => {
        setSelected(row)
        onChange(row?.[idKey] || '')
        onResolve?.(row)
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={field.label}
          required={required}
          error={Boolean(error)}
          helperText={error || (field.source === 'santri' ? 'Ketik nama untuk mencari santri' : undefined)}
        />
      )}
    />
  )
}
