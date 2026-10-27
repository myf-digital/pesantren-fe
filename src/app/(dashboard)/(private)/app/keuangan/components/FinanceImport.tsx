'use client'

import { useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Alert, Button } from '@mui/material'
import { toast } from 'react-toastify'

import { useAppDispatch } from '@/redux-store/hook'
import { useCan } from '@/hooks/useCan'
import { useIsMobile } from '@/@core/hooks/useIsMobile'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { modules } from '../config'
import { downloadFinanceFile, errorMessage } from '../api'
import type { createFinanceModule } from '../api'

interface PreviewRow {
  row: number
  valid: boolean
  error: string | null
  warnings?: string[]
  payload: Record<string, any>
}
interface Preview {
  total: number
  valid: number
  invalid: number
  data: PreviewRow[]
}
type Props = { resource: string; request: ReturnType<typeof createFinanceModule>['request'] }

export default function FinanceImport({ resource, request }: Props) {
  const config = modules[resource]
  const dispatch = useAppDispatch()
  const router = useRouter()
  const canImport = useCan('import')
  const isMobile = useIsMobile(1000)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'preview' | 'commit'>('preview')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [directResult, setDirectResult] = useState<{ valid: number; invalid: number } | null>(null)
  const cancel = () => router.replace(`/app/${resource}/list`)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setError('')
    setDirectResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async () => {
    if (!file || !canImport || busy) return
    setBusy(true)
    setError('')

    try {
      const data = new FormData()

      data.append('file_import', file)
      data.append('mode', mode)
      const result = await dispatch(request({ method: 'post', suffix: '/import', data })).unwrap()

      if (mode === 'preview') setPreview(result.data)
      else if (result.data?.invalid) {
        setDirectResult(result.data)
        setError(
          `${result.data.valid} baris disimpan; ${result.data.invalid} baris tidak valid. Perbaiki baris yang ditolak sebelum mengimpor ulang.`
        )
      } else {
        toast.success('Import data berhasil')
        cancel()
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const savePreview = async () => {
    if (!preview?.valid || busy || !canImport) return
    setBusy(true)
    setError('')

    try {
      await dispatch(
        request({
          method: 'post',
          suffix: '/insert',
          data: { data: preview.data.filter(row => row.valid).map(row => row.payload) }
        })
      ).unwrap()
      toast.success('Import data berhasil')
      cancel()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const template = async () => {
    setDownloading(true)

    try {
      await downloadFinanceFile(resource, { template: 1 })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  const display = (value: any) =>
    typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : value == null || value === '' ? '-' : String(value)

  const previewFields = config.fields.filter(field => preview?.data.some(row => row.payload[field.key] != null))

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='mx-auto'>
        <div className='mb-6'>
          <Link
            href={`/app/${resource}/list`}
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'
          >
            <i className='tabler-arrow-back-up' /> Kembali
          </Link>
          <h1 className='text-xl font-semibold mt-2'>Import Excel {config.title}</h1>
        </div>
        <div className='bg-white rounded-xl shadow-sm border p-6 space-y-6'>
          {!canImport ? (
            <Alert severity='warning'>Anda tidak memiliki akses impor.</Alert>
          ) : (
            <>
              <div className='border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-700'>
                <h3 className='font-medium mb-2'>Petunjuk Import</h3>
                <ul className='list-disc list-inside space-y-1'>
                  <li>Format file: Excel atau CSV (encoding UTF-8), sesuai template.</li>
                  <li>Mode Preview: validasi tanpa menyimpan.</li>
                  <li>Mode Commit: validasi dan simpan baris valid.</li>
                  {config.batchType && <li>Isi ID Batch dengan batch {config.batchType} yang belum dibatalkan.</li>}
                  <li>Nominal tanpa pemisah ribuan; gunakan titik untuk desimal.</li>
                  {resource === 'keu-rekap-harian' && (
                    <li>Isi ID Rekap untuk koreksi versi aktif; kosongkan untuk data baru.</li>
                  )}
                </ul>
                <div className='mt-3'>
                  <button
                    type='button'
                    disabled={downloading}
                    className='text-blue-600 underline hover:text-blue-400 cursor-pointer'
                    onClick={template}
                  >
                    <b>{downloading ? 'Mengunduh...' : 'Download Template Excel'}</b>
                  </button>
                </div>
              </div>
              {error && <Alert severity='error'>{error}</Alert>}
              <div>
                <label className='block font-medium mb-2'>Mode Import</label>
                <div className='flex gap-6 text-sm'>
                  {(['preview', 'commit'] as const).map(value => (
                    <label key={value} className='flex items-center gap-2'>
                      <input
                        type='radio'
                        name='mode'
                        value={value}
                        checked={mode === value}
                        disabled={busy || Boolean(preview)}
                        onChange={() => setMode(value)}
                      />
                      {value === 'preview' ? 'Preview (Validasi saja)' : 'Commit (Simpan data)'}
                    </label>
                  ))}
                </div>
              </div>
              {preview ? (
                <div className='space-y-6'>
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {[
                      ['Total Data', preview.total, 'text-gray-800'],
                      ['Valid', preview.valid, 'text-green-600'],
                      ['Invalid', preview.invalid, 'text-red-600']
                    ].map(([label, value, color]) => (
                      <div key={String(label)} className='rounded-lg border p-4'>
                        <div className='text-sm text-gray-500'>{label}</div>
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {isMobile ? (
                    <div className='space-y-3'>
                      {preview.data.map(row => (
                        <div
                          key={row.row}
                          className={`rounded-lg border p-3 text-sm ${row.valid ? 'bg-white' : 'bg-red-50'}`}
                        >
                          <div className='flex justify-between mb-2'>
                            <span className='font-semibold'>Row #{row.row}</span>
                            <span className={row.valid ? 'text-green-600 font-semibold' : 'text-red-600'}>
                              {row.valid ? '✓ Valid' : '✕ Invalid'}
                            </span>
                          </div>
                          <div className='space-y-1'>
                            {previewFields.map(field => (
                              <div key={field.key}>
                                <span className='text-gray-500'>{field.label}</span>
                                <div>{display(row.payload[field.key])}</div>
                              </div>
                            ))}
                            {row.error && <div className='text-red-600 text-xs mt-1'>{row.error}</div>}
                            {row.warnings?.map(warning => (
                              <div key={warning} className='text-orange-600 text-xs'>
                                {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='overflow-x-auto rounded-lg border'>
                      <table className='min-w-full text-sm'>
                        <thead className='bg-gray-100 text-left'>
                          <tr>
                            <th className='px-3 py-2'>#</th>
                            {previewFields.map(field => (
                              <th key={field.key} className='px-3 py-2'>
                                {field.label}
                              </th>
                            ))}
                            <th className='px-3 py-2'>Valid</th>
                            <th className='px-3 py-2'>Peringatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.data.map(row => (
                            <tr key={row.row} className={`border-t ${row.valid ? 'bg-white' : 'bg-red-50'}`}>
                              <td className='px-3 py-2'>{row.row}</td>
                              {previewFields.map(field => (
                                <td key={field.key} className='px-3 py-2'>
                                  {display(row.payload[field.key])}
                                </td>
                              ))}
                              <td className={`px-3 py-2 ${row.valid ? 'text-green-600' : 'text-red-600'}`}>
                                {row.valid ? '✓' : row.error}
                              </td>
                              <td className='px-3 py-2 text-orange-600'>{row.warnings?.join('; ') || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className='flex justify-end gap-3'>
                    <Button
                      size='small'
                      color='warning'
                      variant='contained'
                      disabled={busy}
                      sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                      onClick={reset}
                      startIcon={<i className='tabler-refresh' />}
                    >
                      Reset Data
                    </Button>
                    <Button
                      size='small'
                      variant='contained'
                      disabled={busy || !preview.valid}
                      sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
                      onClick={() => (preview.invalid ? setOpenConfirm(true) : savePreview())}
                      startIcon={<i className='tabler-file-import' />}
                    >
                      {busy ? 'Menyimpan...' : 'Import Data'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className='block font-medium mb-2'>File Excel</label>
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => !busy && fileRef.current?.click()}
                    onKeyDown={event => {
                      if (!busy && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault()
                        fileRef.current?.click()
                      }
                    }}
                    className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition'
                  >
                    <div className='flex flex-col items-center gap-3'>
                      <div className='text-gray-400'>
                        <i className='tabler-arrow-big-up' />
                      </div>
                      <div className='text-sm text-gray-600'>Klik untuk upload file Excel</div>
                      <span className='px-2 py-1 bg-blue-600 text-white rounded-md text-sm'>Pilih File</span>
                      {file && <div className='text-xs text-gray-500 mt-2'>{file.name}</div>}
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type='file'
                    accept='.csv,.xls,.xlsx'
                    className='hidden'
                    disabled={busy}
                    onChange={event => {
                      const selected = event.target.files?.[0] || null

                      setError('')
                      setDirectResult(null)

                      if (selected && !/\.(xlsx|xls|csv)$/i.test(selected.name)) {
                        setFile(null)
                        setError('File harus Excel atau CSV')

                        return
                      }

                      setFile(selected)
                    }}
                  />
                  <Button
                    size='small'
                    fullWidth
                    variant='contained'
                    disabled={busy || !file || Boolean(directResult)}
                    sx={{ height: 32, fontSize: '0.75rem', px: 2, mt: 5 }}
                    onClick={submit}
                    startIcon={<i className='tabler-file-import' />}
                  >
                    {busy ? 'Proses...' : mode === 'preview' ? 'Preview Data' : 'Import & Simpan'}
                  </Button>
                  {directResult && <Button onClick={reset}>Reset Data</Button>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={openConfirm}
        title='Konfirmasi Import'
        confirmText='Ya, Simpan'
        onClose={() => setOpenConfirm(false)}
        onConfirm={savePreview}
        description={
          <>
            Terdapat <b>{preview?.invalid}</b> data invalid.
            <br />
            Apakah akan menyimpan data <b>tanpa data invalid</b>?
          </>
        }
      />
    </div>
  )
}
