'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useForm } from 'react-hook-form'

import { Alert, Card, CardContent, CardHeader, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

import { useAppDispatch } from '@/redux-store/hook'
import { useCan } from '@/hooks/useCan'
import { modules } from '../config'
import { buildFinancePayload, dailyBalanceWarnings, scalarValue } from '../validation'
import { errorMessage } from '../api'
import type { createFinanceModule } from '../api'
import api from '@/libs/axios'
import { field, fieldBuildSubmit, formColumn } from '@/views/onevour/form/AppFormBuilder'

type Props = { resource: string; request: ReturnType<typeof createFinanceModule>['request'] }

export default function FinanceForm({ resource, request }: Props) {
  const config = modules[resource]
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')
  const view = params.get('view') === 'true'
  const dispatch = useAppDispatch()
  const canSave = useCan(id ? 'edit' : 'create')

  const defaults = () =>
    Object.fromEntries(
      config.fields.map(field => [
        field.key,
        field.key === 'is_active'
          ? { value: field.defaultValue ?? true, label: field.defaultValue === false ? 'Tidak Aktif' : 'Aktif' }
          : field.type === 'integer'
            ? String(field.defaultValue ?? '')
            : field.type === 'select'
              ? field.defaultValue
                ? { value: field.defaultValue, label: field.defaultValue }
                : null
              : (field.defaultValue ?? (field.type === 'boolean' ? false : ''))
      ])
    )

  const [values, setValues] = useState<Record<string, any>>(defaults)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError: setFieldError,
    clearErrors,
    formState: { errors }
  } = useForm<Record<string, any>>({ defaultValues: defaults() })

  const [references, setReferences] = useState<Record<string, any[]>>({})
  const [searches, setSearches] = useState<Record<string, string>>({})
  const [referenceError, setReferenceError] = useState('')
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [historical, setHistorical] = useState(false)
  const readOnly = view || !canSave || historical
  const cancel = () => router.replace(`/app/${resource}/list`)

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      const fields = config.fields.filter(item => item.type === 'reference')

      const results = await Promise.allSettled(
        fields.map(async item => {
          const response = await api.get(`/app/${item.source}${item.source === 'santri' ? '' : '/all-data'}`, {
            params: { ...item.params, q: searches[item.key] || '', page: 1, perPage: 50 },
            signal: controller.signal
          })

          const data = response.data?.data

          const rows = (Array.isArray(data) ? data : data?.values || []).filter(
            (row: any) => item.source !== 'keu-import-batch' || row.status_batch !== 'Dibatalkan'
          )

          return [
            item.key,
            rows.map((row: any) => ({
              ...row,
              value: row[item.idKey!],
              label: row[item.labelKey!] || row[item.idKey!]
            }))
          ] as const
        })
      )

      if (controller.signal.aborted) return
      setReferences(previous => ({
        ...previous,
        ...Object.fromEntries(results.flatMap(result => (result.status === 'fulfilled' ? [result.value] : [])))
      }))
      setReferenceError(
        results.some(result => result.status === 'rejected')
          ? 'Sebagian pilihan gagal dimuat. Muat ulang halaman untuk mencoba lagi.'
          : ''
      )
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [config, searches])

  useEffect(() => {
    if (!id) return
    let active = true
    const task = dispatch(request({ suffix: `/${id}` }))

    task
      .unwrap()
      .then(result => {
        if (!active) return
        if (!result.data) throw new Error('Data tidak ditemukan')

        const loaded = Object.fromEntries(
          config.fields.map(field => {
            let value =
              field.key === 'per_akun'
                ? Boolean(result.data.id_akun)
                : (result.data[field.key] ?? field.defaultValue ?? '')

            if (field.key === 'is_active') value = { value: Boolean(value), label: value ? 'Aktif' : 'Tidak Aktif' }
            if (field.type === 'integer') value = String(value)
            if (field.type === 'date' && value) value = String(value).slice(0, 10)

            if (field.type === 'reference' && value) {
              const association = (
                {
                  'keu-akun': 'akun',
                  'keu-kelompok-kas': 'kelompok_kas',
                  'tahun-ajaran': 'tahun_ajaran',
                  'jenis-beasiswa': 'jenis_beasiswa',
                  santri: 'santri',
                  'keu-import-batch': 'batch'
                } as Record<string, string>
              )[field.source!]

              const related = result.data[association]

              value = { value, label: related?.[field.labelKey!] || value, ...related }
            }

            if (field.type === 'select') value = value ? { value, label: value } : null

            return [field.key, value]
          })
        )

        setValues(loaded)
        reset(loaded)
        setAccount(result.data.akun || null)
        setHistorical(resource === 'keu-rekap-harian' && result.data.is_current === false)
      })
      .catch(err => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      task.abort()
    }
  }, [id, config, dispatch, request, resource, reset])

  const submit = async () => {
    if (readOnly || saving || loading || (error && id && !values[config.fields[0].key])) return
    setError('')
    clearErrors()
    const { payload, errors: validationErrors } = buildFinancePayload(resource, config, values, account)

    if (Object.keys(validationErrors).length) {
      for (const [key, message] of Object.entries(validationErrors)) setFieldError(key, { type: 'validate', message })
      setError(Object.values(validationErrors)[0])

      return
    }

    setSaving(true)

    try {
      const result = await dispatch(
        request({ method: id ? 'put' : 'post', suffix: id ? `/${id}` : '', data: payload })
      ).unwrap()

      for (const warning of result.data?.warnings || []) toast.warning(warning, { autoClose: false })
      toast.success('Data berhasil disimpan')
      cancel()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<ReturnType<typeof field> | ReturnType<typeof fieldBuildSubmit>> = config.fields.map(item => {
    const scope = scalarValue(values.cakupan_data)
    const aggregate = item.key === 'id_santri' && scope === 'Agregat'

    const required =
      item.required ||
      (item.key === 'id_santri' && scope === 'PerPenerima') ||
      (item.key === 'id_tahunajaran' && Boolean(account?.is_periodik_tahun_ajaran)) ||
      (item.key === 'id_akun' && resource === 'keu-anggaran' && Boolean(values.per_akun))

    const options =
      item.key === 'is_active'
        ? [
            { value: true, label: 'Aktif' },
            { value: false, label: 'Tidak Aktif' }
          ]
        : item.type === 'reference'
          ? references[item.key] || []
          : (item.options || []).map(value => ({ value, label: value }))

    return field({
      type:
        item.key === 'is_active' || item.type === 'reference' || item.type === 'select'
          ? 'select'
          : item.type === 'boolean'
            ? 'checkbox'
            : item.type === 'integer' || item.type === 'money'
              ? resource === 'keu-rekap-harian'
                ? 'numeral'
                : 'text'
              : item.type || 'text',
      key: item.key,
      label: item.label,
      placeholder: `${item.type === 'reference' || item.type === 'select' ? 'Pilih' : 'Input'} ${item.label}`,
      required: Boolean(required) && !aggregate,
      readOnly: readOnly || saving || aggregate,
      tooltip:
        item.type === 'money' ? 'Nominal maksimal 16 digit bulat dan 2 desimal. Desimal menggunakan titik.' : undefined,
      options: {
        values: options,
        onChange: (option: any) => {
          if (item.key === 'id_akun') setAccount(option)
          clearErrors(item.key)

          if (item.key === 'cakupan_data' && option?.value === 'Agregat') {
            setValue('id_santri', null)
            setValues(previous => ({ ...previous, id_santri: null }))
          }
        }
      },
      ...(item.source === 'santri'
        ? {
            onInputChange: (_: any, text: string, reason: string) => {
              if (reason === 'input') setSearches(previous => ({ ...previous, [item.key]: text }))
            }
          }
        : {})
    })
  })

  fields.push(
    fieldBuildSubmit({ onCancel: cancel, loading: saving, disabled: readOnly, submit: 'Submit', cancel: 'Cancel' })
  )

  return (
    <Card>
      <CardHeader title={`Form ${config.title}`} />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {referenceError && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {referenceError}
          </Alert>
        )}
        {historical && (
          <Alert severity='info' sx={{ mb: 4 }}>
            Versi histori hanya dapat dilihat. Koreksi melalui versi aktif.
          </Alert>
        )}
        {resource === 'keu-rekap-harian' && (
          <Alert severity='info' sx={{ mb: 4 }}>
            Koreksi membuat versi baru. Saldo sumber tetap disimpan; selisih perhitungan ditampilkan sebagai peringatan.
          </Alert>
        )}
        {resource === 'keu-rekap-harian' &&
          dailyBalanceWarnings(values).map(warning => (
            <Alert key={warning} severity='warning' sx={{ mb: 4 }}>
              {warning}
            </Alert>
          ))}
        {loading ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSubmit(submit)} autoComplete='off'>
            {formColumn({ control, errors, state: values, setState: setValues, fields })}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
