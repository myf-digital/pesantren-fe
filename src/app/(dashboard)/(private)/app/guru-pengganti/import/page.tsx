'use client'

import { useCallback, useRef, useState } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'
import Button from '@mui/material/Button'

import { useAppDispatch } from '@/redux-store/hook'
import { postBatchGuruPengganti, postExport, postImport, resetRedux } from '../slice'

export interface ImportPayload {
  jadwal: string
  tanggal: string
  guru_asli: string
  guru_pengganti: string
  alasan: string | null
  status_approval: string
}

export interface ImportRow {
  row: number
  valid: boolean
  error: string | null
  payload: ImportPayload
}

export interface ImportPreviewResponse {
  mode: 'preview' | 'commit'
  total: number
  valid: number
  invalid: number
  data: ImportRow[]
}

interface Props {
  result: ImportPreviewResponse
  onCommit: () => void
}

export default function ImportExcelPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<'preview' | 'commit'>('preview')
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [preview, setPreview] = useState<ImportPreviewResponse>()

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/guru-pengganti/list')
  }, [dispatch, router])

  const downloadTemplate = async () => {
    try {
      const res = await dispatch(postExport({ template: 1 })).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')

        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch {
      toast.error('Gagal download template')
    } finally {
    }
  }

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowed.includes(file.type)) {
      toast.warning('File harus Excel atau Excel')
      e.target.value = ''

      return
    }

    setFileName(file.name)
    setFile(file)
  }

  const onSubmit = async () => {
    if (!file) return alert('File belum dipilih')

    const formData = new FormData()

    formData.append('file_import', file)
    formData.append('mode', mode)

    try {
      setLoading(true)
      const res = await dispatch(postImport(formData)).unwrap()
      const { status, message, data } = res

      if (!status) {
        toast.warning(message)

        return
      }

      if (mode == 'preview') {
        setPreview(data)
      } else {
        toast.success('Import data berhasil')
        onCancel()
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal import')
    } finally {
      setLoading(false)
    }
  }

  const handleCommit = async () => {
    const payloads = preview?.data.map(d => {
      const { ...payload } = d.payload

      return payload
    })

    try {
      setLoadingImport(true)
      const res = await dispatch(postBatchGuruPengganti({ data: payloads })).unwrap()
      const { status, message } = res

      if (!status) {
        toast.warning(message)

        return
      }

      toast.success('Import data berhasil')
      onCancel()
    } catch (e) {
      console.error(e)
      toast.error('Gagal import data')
    } finally {
      setLoadingImport(false)
    }
  }

  const SummaryCard = ({
    title,
    value,
    color = 'gray'
  }: {
    title: string
    value: number
    color?: 'gray' | 'green' | 'red'
  }) => {
    const colorMap = {
      gray: 'text-gray-800',
      green: 'text-green-600',
      red: 'text-red-600'
    }

    return (
      <div className='rounded-lg border p-4'>
        <div className='text-sm text-gray-500'>{title}</div>
        <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      </div>
    )
  }

  const ImportPreview = ({ result, onCommit }: Props) => {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-3 gap-4'>
          <SummaryCard title='Total Data' value={result.total} />
          <SummaryCard title='Valid' value={result.valid} color='green' />
          <SummaryCard title='Invalid' value={result.invalid} color='red' />
        </div>

        <div className='overflow-x-auto rounded-lg border'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-100 text-left'>
              <tr>
                <th className='px-3 py-2'>#</th>
                <th className='px-3 py-2'>Jadwal Pelajaran</th>
                <th className='px-3 py-2'>Tanggal</th>
                <th className='px-3 py-2'>Guru Asli</th>
                <th className='px-3 py-2'>Guru Pengganti</th>
                <th className='px-3 py-2'>Alasan</th>
                <th className='px-3 py-2'>Status Approval</th>
                <th className='px-3 py-2'>Valid</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map(row => (
                <tr key={row.row} className={row.valid ? 'border-t bg-white' : 'border-t bg-red-50'}>
                  <td className='px-3 py-2'>{row.row}</td>
                  <td className='px-3 py-2 font-medium text-nowrap'>{row.payload.jadwal}</td>
                  <td className='px-3 py-2 font-medium text-nowrap'>{row.payload.tanggal}</td>
                  <td className='px-3 py-2 font-medium text-nowrap'>{row.payload.guru_asli}</td>
                  <td className='px-3 py-2 font-medium text-nowrap'>{row.payload.guru_pengganti}</td>
                  <td className='px-3 py-2 font-medium text-nowrap'>{row.payload.alasan ?? '-'}</td>
                  <td className='px-3 py-2 font-medium'>{row.payload.status_approval}</td>
                  <td className='px-3 py-2 text-nowrap'>
                    {row.valid ? (
                      <span className='text-green-600 font-semibold'>✓</span>
                    ) : (
                      <span className='text-red-600'>{row.error}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex justify-end gap-3'>
          <Button
            size='small'
            variant='contained'
            sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
            onClick={onCommit}
            disabled={result.invalid > 0 || loadingImport}
            startIcon={<i className='tabler-file-import' />}
          >
            {loadingImport ? 'Menyimpan...' : 'Import Data'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-6'>
          <Link
            href='/app/guru-pengganti/list'
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'
          >
            <i className='tabler-arrow-back-up'></i> Kembali
          </Link>
          <h1 className='text-xl font-semibold mt-2'>Import Excel</h1>
        </div>

        <div className='bg-white rounded-xl shadow-sm border p-6 space-y-6'>
          <div className='border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-700'>
            <h3 className='font-medium mb-2'>Petunjuk Import</h3>
            <ul className='list-disc list-inside space-y-1'>
              <li>Format file: Excel (encoding UTF-8)</li>
              <li>
                Jika <b>Jadwal Pelajaran</b> dan <b>Tanggal</b> kosong → INSERT (data baru)
              </li>
              <li>
                Jika <b>Jadwal Pelajaran</b> dan <b>Tanggal</b> ada → UPDATE (perbarui data)
              </li>
              <li>Mode Preview: hanya validasi tanpa menyimpan</li>
              <li>Mode Commit: validasi dan simpan ke database</li>
            </ul>

            <div className='mt-3'>
              <a className='text-blue-600 underline hover:text-blue-400 cursor-pointer' onClick={downloadTemplate}>
                <b>Download Template Excel</b>
              </a>
            </div>
          </div>

          <div>
            <label className='block font-medium mb-2'>Mode Import</label>
            <div className='flex gap-6 text-sm'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='mode'
                  value='preview'
                  checked={mode === 'preview'}
                  onChange={() => setMode('preview')}
                />
                Preview (Validasi saja)
              </label>

              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='mode'
                  value='commit'
                  checked={mode === 'commit'}
                  onChange={() => setMode('commit')}
                />
                Commit (Simpan data)
              </label>
            </div>
          </div>

          {preview ? (
            <ImportPreview result={preview} onCommit={handleCommit} />
          ) : (
            <div>
              <label className='block font-medium mb-2'>File Excel</label>

              <div
                onClick={() => fileRef.current?.click()}
                className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition'
              >
                <div className='flex flex-col items-center gap-3'>
                  <div className='text-gray-400'>
                    <i className='tabler-arrow-big-up'></i>
                  </div>
                  <div className='text-sm text-gray-600'>Klik untuk upload file Excel</div>

                  <button type='button' className='px-2 py-1 bg-blue-600 text-white rounded-md text-sm'>
                    Pilih File
                  </button>

                  {fileName && <div className='text-xs text-gray-500 mt-2'>{fileName}</div>}
                </div>

                <input ref={fileRef} type='file' accept='.csv,.xls,.xlsx' className='hidden' onChange={onChangeFile} />
              </div>

              <Button
                size='small'
                fullWidth
                variant='contained'
                sx={{ height: 32, fontSize: '0.75rem', px: 2, mt: 5 }}
                onClick={onSubmit}
                startIcon={<i className='tabler-file-import' />}
              >
                {loading ? 'Proses..' : mode == 'preview' ? 'Preview Data' : 'Import & Simpan'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
