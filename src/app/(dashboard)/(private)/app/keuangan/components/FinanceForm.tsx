'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useForm } from 'react-hook-form'

import { Alert, Card, CardContent, CardHeader, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

import { useAppDispatch } from '@/redux-store/hook'
import { useCan } from '@/hooks/useCan'
import { modules } from '../config'
import { referenceOption } from '../references'
import { buildFinancePayload, dailyBalanceWarnings, scalarValue } from '../validation'
import { errorMessage } from '../api'
import type { FinanceActions } from '../types'
import api from '@/libs/axios'
import { field, fieldBuildSubmit, formColumn } from '@/views/onevour/form/AppFormBuilder'

type Props = { resource: string; actions: Pick<FinanceActions, 'fetchById' | 'create' | 'update' | 'resetRedux'> }

export default function FinanceForm({ resource, actions }: Props) {
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
          : field.dataType === 'integer'
            ? String(field.defaultValue ?? '')
            : field.dataType === 'select'
              ? field.defaultValue
                ? { value: field.defaultValue, label: field.defaultValue }
                : null
              : (field.defaultValue ?? (field.dataType === 'boolean' ? false : ''))
      ])
    )

  const [values, setValues] = useState<Record<string, any>>(defaults)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
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

  const cancel = () => {
    dispatch(actions.resetRedux())
    router.replace(`/app/${resource}/list`)
  }

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      const fields = config.fields.filter(item => item.dataType === 'reference')

      const results = await Promise.allSettled(
        fields.map(async item => {
          const response = await api.get(`/app/${item.source}${item.source === 'santri' ? '' : '/all-data'}`, {
            params: {
              ...item.params,
              ...(['keu-akun', 'keu-kelompok-kas'].includes(item.source!) ? { is_active: true } : {}),
              q: searches[item.key] || '',
              page: 1,
              perPage: 50
            },
            signal: controller.signal
          })

          const data = response.data?.data

          const rows = (Array.isArray(data) ? data : data?.values || []).filter(
            (row: any) =>
              (item.source !== 'keu-import-batch' || row.status_batch !== 'Dibatalkan') &&
              (!['keu-akun', 'keu-kelompok-kas'].includes(item.source!) || row.is_active !== false)
          )

          return [item.key, rows.map((row: any) => referenceOption(item, row))] as const
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
    if (id || !config.batchType || !config.fields.some(field => field.key === 'id_tahunajaran')) return
    const controller = new AbortController()

    api
      .get(`/app/${resource}/form-options`, { signal: controller.signal })
      .then(response => {
        if (controller.signal.aborted) return
        const data = response.data?.data
        const yearField = config.fields.find(field => field.key === 'id_tahunajaran')!
        const years = (data?.tahun_ajaran || []).map((row: any) => referenceOption(yearField, row))

        setReferences(previous => ({ ...previous, id_tahunajaran: years }))
        const selected = years.find((year: any) => year.value === data?.id_tahunajaran_default)

        if (selected && !getValues('id_tahunajaran')) {
          setValue('id_tahunajaran', selected)
          setValues(previous => ({ ...previous, id_tahunajaran: selected }))
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) setReferenceError(errorMessage(error))
      })

    return () => controller.abort()
  }, [id, config, resource, setValue, getValues])

  useEffect(() => {
    if (!id) return
    let active = true
    const task = dispatch(actions.fetchById(id))

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
            if (field.dataType === 'integer') value = String(value)
            if (field.dataType === 'date' && value) value = String(value).slice(0, 10)

            if (field.dataType === 'reference' && value) {
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

              value = referenceOption(field, { ...related, [field.idKey!]: value })
            }

            if (field.dataType === 'select') value = value ? { value, label: value } : null

            return [field.key, value]
          })
        )

        setValues(loaded)
        reset(loaded)
        setAccount(result.data.akun || null)
        setHistorical(Boolean(config.batchType) && result.data.is_current === false)
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
  }, [id, config, dispatch, actions, resource, reset])

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
      const result = await dispatch(id ? actions.update({ id, params: payload }) : actions.create(payload)).unwrap()

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
        : item.dataType === 'reference'
          ? references[item.key] || []
          : (item.options || []).map(value => ({ value, label: value }))

    return field({
      type: item.type || 'text',
      key: item.key,
      label: item.label,
      placeholder: `${item.dataType === 'reference' && item.codeKey ? 'Ketik Kode / Pilih' : item.dataType === 'select' ? 'Pilih' : 'Input'} ${item.label}`,
      required: Boolean(required) && !aggregate,
      readOnly: readOnly || saving || aggregate || Boolean(id && config.master && item.key.startsWith('kode_')),
      tooltip:
        item.dataType === 'money'
          ? 'Nominal maksimal 16 digit bulat dan 2 desimal. Desimal menggunakan titik.'
          : undefined,
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
      ...(item.dataType === 'reference'
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
        {resource === 'keu-anggaran' && (
          <Alert severity='info' sx={{ mb: 4 }}>
            Catat anggaran final yang telah disetujui di luar SADA. Tidak ada pengajuan, persetujuan, atau release di
            sini.
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
