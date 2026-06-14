'use client'

import { useCallback, useRef, useState } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'
import Button from '@mui/material/Button'

import { useAppDispatch } from '@/redux-store/hook'
import { postBatch, postExport, postImport, resetRedux } from '../slice'
import { useIsMobile } from '@/@core/hooks/useIsMobile'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'

export interface ImportPayload {
  id_santri: string
  santri: string
  id_kelas_mda: string | null
  nama_kelas_mda: string | null
  id_kelas_formal: string | null
  nama_kelas_formal: string | null
  id_tahun_ajaran: string
  tahun_ajaran: string
  tanggal_masuk: string
  tanggal_keluar: string
  status: 'Aktif' | 'Alumni' | 'Tidak Aktif'
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
  onReset: () => void
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
  const [openConfirm, setOpenConfirm] = useState(false)

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/penempatan-kelas-santri/list')
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
      toast.warning('File harus Excel atau CSV')
      e.target.value = ''

      return
    }

    setFileName(file.name)
    setFile(file)
  }

  const onSubmit = async () => {
    if (!file) return toast.warning('File belum dipilih')

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

  const handleCommit = () => {
    if (preview && preview.invalid > 0) {
      setOpenConfirm(true)

      return
    }

    handleConfirmCommit()
  }

  const handleConfirmCommit = async () => {
    if (!preview) return

    const payloads = preview?.data.filter(d => d.valid)
    .map(d => {
      const { santri, nama_kelas_mda, nama_kelas_formal, tahun_ajaran, ...payload } = d.payload

      return payload
    })
    
    try {
      setLoadingImport(true)
      const res = await dispatch(postBatch({ data: payloads })).unwrap()
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

  const handleReset = () => {
    setFileName(null)
    setFile(null)
    setPreview(undefined)
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
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">{title}</div>
        <div className={`text-2xl font-bold ${colorMap[color]}`}>
          {value}
        </div>
      </div>
    )
  }

  const ImportPreview = ({ result, onCommit, onReset }: Props) => {
    const isMobile = useIsMobile(1000)
    
    return (
      <>
        <div className="space-y-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <SummaryCard title="Total Data" value={result.total} />
            <SummaryCard title="Valid" value={result.valid} color="green" />
            <SummaryCard title="Invalid" value={result.invalid} color="red" />
          </div>

          {isMobile ? (
            <div className="space-y-3">
              {result.data.map((row) => (
                <div
                  key={row.row}
                  className={`rounded-lg border p-3 text-sm ${
                    row.valid ? 'bg-white' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Row #{row.row}</span>
                    {row.valid ? (
                      <span className="text-green-600 font-semibold">✓ Valid</span>
                    ) : (
                      <span className="text-red-600">✕ Invalid</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-500">Santri</span>
                      <div className="font-medium">
                        {row.payload.santri}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Kelas MDA</span>
                      <div className="font-medium">
                        {row.payload.nama_kelas_mda ?? '-'}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Kelas Formal</span>
                      <div className="font-medium">
                        {row.payload.nama_kelas_formal ?? '-'}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Tahun Ajaran</span>
                      <div>{row.payload.tahun_ajaran ?? '-'}</div>
                    </div>

                    <div>
                      <span className="text-gray-500">Masuk</span>
                      <div>{row.payload.tanggal_masuk ?? '-'}</div>
                    </div>

                    <div>
                      <span className="text-gray-500">Keluar</span>
                      <div>{row.payload.tanggal_keluar ?? '-'}</div>
                    </div>

                    <div>
                      <span className="text-gray-500">Status</span>
                      <div>
                        {row.payload.status}
                      </div>
                    </div>

                    {!row.valid && (
                      <div className="text-red-600 text-xs mt-1">
                        {row.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Santri</th>
                    <th className="px-3 py-2">Kelas MDA</th>
                    <th className="px-3 py-2">Kelas Formal</th>
                    <th className="px-3 py-2">Tahun Ajaran</th>
                    <th className="px-3 py-2">Masuk</th>
                    <th className="px-3 py-2">Keluar</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Valid</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row) => (
                    <tr
                      key={row.row}
                      className={
                        row.valid ? 'border-t bg-white' : 'border-t bg-red-50'
                      }
                    >
                      <td className="px-3 py-2">{row.row}</td>
                      <td className="px-3 py-2 font-medium">
                        {row.payload.santri}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {row.payload.nama_kelas_mda ?? '-'}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {row.payload.nama_kelas_formal ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        {row.payload.tahun_ajaran ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        {row.payload.tanggal_masuk ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        {row.payload.tanggal_keluar ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        {row.payload.status}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-red-600">{row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              size="small"
              color="warning"
              variant="contained"
              sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
              onClick={onReset}
              startIcon={<i className="tabler-refresh" />}
            >
              Reset Data
            </Button>
            <Button
              size="small"
              variant="contained"
              sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
              onClick={onCommit}
              disabled={loadingImport}
              startIcon={<i className="tabler-file-import" />}
            >
              {loadingImport ? 'Menyimpan...' : 'Import Data'}
            </Button>
          </div>
        </div>

        <ConfirmDialog
          open={openConfirm}
          title="Konfirmasi Import"
          confirmText="Ya, Simpan"
          onClose={() => setOpenConfirm(false)}
          onConfirm={() => {
            setOpenConfirm(false)
            handleConfirmCommit()
          }}
          description={
            <>
              Terdapat <b>{result.invalid}</b> data invalid.
              <br />
              Apakah akan menyimpan data <b>tanpa data invalid</b>?
            </>
          }
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto">
        <div className="mb-6">
          <Link
            href="/app/penempatan-kelas-santri/list"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <i className='tabler-arrow-back-up'></i> Kembali
          </Link>
          <h1 className="text-xl font-semibold mt-2">
            Import Excel Penempatan Kelas
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <h3 className="font-medium mb-2">Petunjuk Import</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Format file: Excel (encoding UTF-8)</li>
              <li>Jika <b>santri dan tahun ajaran</b> belum ada → INSERT (data baru)</li>
              <li>Jika <b>santri dan tahun ajaran</b> sudah ada → UPDATE (perbarui data)</li>
              <li>Mode Preview: hanya validasi tanpa menyimpan</li>
              <li>Mode Commit: validasi dan simpan ke database</li>
            </ul>

            <div className="mt-3">
              <a
                className="text-blue-600 underline hover:text-blue-400 cursor-pointer"
                onClick={downloadTemplate}
              >
                <b>Download Template Excel</b>
              </a>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Mode Import
            </label>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="preview"
                  checked={mode === 'preview'}
                  onChange={() => setMode('preview')}
                />
                Preview (Validasi saja)
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="commit"
                  checked={mode === 'commit'}
                  onChange={() => setMode('commit')}
                />
                Commit (Simpan data)
              </label>
            </div>
          </div>

          {preview ? (
            <ImportPreview result={preview} onCommit={handleCommit} onReset={handleReset} />
          ) : (
            <div>
              <label className="block font-medium mb-2">
                File Excel
              </label>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="text-gray-400">
                    <i className='tabler-arrow-big-up'></i>
                  </div>
                  <div className="text-sm text-gray-600">
                    Klik untuk upload file Excel
                  </div>

                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm cursor-pointer"
                  >
                    Pilih File
                  </button>

                  {fileName && (
                    <div className="text-xs text-gray-500 mt-2">
                      {fileName}
                    </div>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={onChangeFile}
                />
              </div>

              <Button
                size="small"
                fullWidth
                variant="contained"
                sx={{ height: 32, fontSize: '0.75rem', px: 2, mt: 5 }}
                onClick={onSubmit}
                startIcon={<i className="tabler-file-import" />}
              >
                {loading ? 'Proses..' : (mode == 'preview' ? 'Preview Data' : 'Import & Simpan')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
