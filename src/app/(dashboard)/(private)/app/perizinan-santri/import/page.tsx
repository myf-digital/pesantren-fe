'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Button from '@mui/material/Button'

import { useAppDispatch } from '@/redux-store/hook'
import { postPerizinanBatchInsert, postPerizinanExport, postPerizinanImport, resetRedux } from '../slice'

// Interface penyesuaian payload berdasar data JSON response perizinan
export interface ImportPerizinanPayload {
  id_izin: string
  id_santri: string
  id_lokasi_kamar: string
  sumber_pengajuan: string
  jenis_izin: 'Izin' | 'Sakit'
  kondisi: string
  tanggal_pengajuan: string
  tanggal_mulai: string
  tanggal_selesai: string
  alasan: string
  status_approval: 'Menunggu' | 'Disetujui' | 'Ditolak'
  created_by: string
  kode_unit: string
}

export interface ImportPerizinanRow {
  row: number
  valid: boolean
  error: string | null
  payload: ImportPerizinanPayload
}

export interface ImportPerizinanPreviewResponse {
  mode: 'preview' | 'commit'
  total: number
  valid: number
  invalid: number
  data: ImportPerizinanRow[]
}

interface Props {
  result: ImportPerizinanPreviewResponse
  onCommit: () => void
}

export default function ImportExcelPerizinanSantriPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<'preview' | 'commit'>('preview')
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [preview, setPreview] = useState<ImportPerizinanPreviewResponse>()

  /** Navigasi kembali ke list riwayat perizinan santri */
  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/perizinan-santri/list')
  }, [dispatch, router])

  const downloadTemplate = async () => {
    try {
      const res = await dispatch(postPerizinanExport({ template: 1 })).unwrap()
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
      toast.error('Gagal download template perizinan')
    }
  }

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

    if (!allowed.includes(file.type)) {
      toast.warning('File harus berformat Excel (.xls, .xlsx)')
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
      const res = await dispatch(postPerizinanImport(formData)).unwrap()
      const { status, message, data } = res

      if (!status) {
        toast.warning(message)
        return
      }

      if (mode === 'preview') {
        setPreview(data)
      } else {
        toast.success('Import data pengajuan perizinan berhasil')
        onCancel()
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal import data perizinan')
    } finally {
      setLoading(false)
    }
  }

  const handleCommit = async () => {
    const payloads = preview?.data.map(d => d.payload)

    try {
      setLoadingImport(true)
      const res = await dispatch(postPerizinanBatchInsert({ data: payloads })).unwrap()
      const { status, message } = res

      if (!status) {
        toast.warning(message)
        return
      }

      toast.success('Batch import data perizinan santri berhasil disimpan')
      onCancel()
    } catch (e) {
      console.error(e)
      toast.error('Gagal simpan batch data perizinan')
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
    const colorMap = { gray: 'text-gray-800', green: 'text-green-600', red: 'text-red-600' }
    return (
      <div className='rounded-lg border p-4 bg-white'>
        <div className='text-sm text-gray-500'>{title}</div>
        <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      </div>
    )
  }

  const ImportPreview = ({ result, onCommit }: Props) => {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-3 gap-4'>
          <SummaryCard title='Total Baris' value={result.total} />
          <SummaryCard title='Valid' value={result.valid} color='green' />
          <SummaryCard title='Invalid' value={result.invalid} color='red' />
        </div>

        <div className='overflow-x-auto rounded-lg border bg-white'>
          <table className='min-w-full text-xs whitespace-nowrap'>
            <thead className='bg-gray-100 text-left border-b'>
              <tr>
                <th className='px-3 py-2'>#</th>
                <th className='px-3 py-2'>ID Santri</th>
                <th className='px-3 py-2'>ID Kamar</th>
                <th className='px-3 py-2'>Sumber</th>
                <th className='px-3 py-2'>Jenis Izin</th>
                <th className='px-3 py-2'>Mulai</th>
                <th className='px-3 py-2'>Selesai</th>
                <th className='px-3 py-2'>Alasan / Deskripsi</th>
                <th className='px-3 py-2'>Status Approval</th>
                <th className='px-3 py-2'>Unit</th>
                <th className='px-3 py-2'>Validasi</th>
                <th className='px-3 py-2'>Error Info</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {result.data.map(row => (
                <tr key={row.row} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                  {/* 1. Nomor Row */}
                  <td className='px-3 py-2'>{row.row}</td>

                  {/* 2. ID Santri */}
                  <td className='px-3 py-2 font-mono text-[11px] text-gray-600'>{row.payload.id_santri || '-'}</td>

                  {/* 3. ID Lokasi Kamar */}
                  <td className='px-3 py-2 font-mono text-[11px] text-gray-600'>
                    {row.payload.id_lokasi_kamar || '-'}
                  </td>

                  {/* 4. Sumber Pengajuan */}
                  <td className='px-3 py-2 font-medium'>{row.payload.sumber_pengajuan || '-'}</td>

                  {/* 5. Jenis Izin */}
                  <td className='px-3 py-2'>
                    <span
                      className={`font-semibold ${
                        row.payload.jenis_izin === 'Izin' ? 'text-blue-600' : 'text-orange-500'
                      }`}
                    >
                      {row.payload.jenis_izin || '-'}
                    </span>
                  </td>

                  {/* 6. Tanggal Mulai */}
                  <td className='px-3 py-2 font-mono'>{row.payload.tanggal_mulai || '-'}</td>

                  {/* 7. Tanggal Selesai */}
                  <td className='px-3 py-2 font-mono'>{row.payload.tanggal_selesai || '-'}</td>

                  {/* 8. Alasan */}
                  <td className='px-3 py-2 text-gray-700 max-w-[220px] whitespace-normal leading-tight'>
                    {row.payload.alasan || '-'}
                  </td>

                  {/* 9. Status Approval */}
                  <td className='px-3 py-2'>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.payload.status_approval === 'Disetujui'
                          ? 'bg-green-100 text-green-700'
                          : row.payload.status_approval === 'Ditolak'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-warning-100 text-warning-700 bg-orange-100 text-orange-700'
                      }`}
                    >
                      {row.payload.status_approval || '-'}
                    </span>
                  </td>

                  {/* 10. Kode Unit */}
                  <td className='px-3 py-2 font-mono'>{row.payload.kode_unit || '-'}</td>

                  {/* 11. Status Validasi Intern */}
                  <td className='px-3 py-2'>
                    {row.valid ? (
                      <span className='px-2 py-1 bg-green-100 text-green-700 rounded font-bold text-[9px] uppercase'>
                        Valid
                      </span>
                    ) : (
                      <span className='px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-[9px] uppercase'>
                        Invalid
                      </span>
                    )}
                  </td>

                  {/* 12. Error Info Validation Message */}
                  <td className='px-3 py-2'>
                    <span className='text-red-600 text-[11px] leading-tight block min-w-[250px] whitespace-normal'>
                      {row.error || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex justify-end gap-3'>
          <Button size='small' variant='contained' onClick={onCommit} disabled={result.invalid > 0 || loadingImport}>
            {loadingImport ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <Link
            href='/app/perizinan-santri/list'
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'
          >
            <i className='tabler-arrow-back-up'></i> Kembali ke Riwayat Perizinan
          </Link>
          <h1 className='text-xl font-semibold mt-2'>Import Batch Perizinan Santri</h1>
        </div>

        <div className='bg-white rounded-xl shadow-sm border p-6 space-y-6'>
          <div className='border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-700'>
            <h3 className='font-medium mb-2 font-bold'>Petunjuk Import Log Perizinan</h3>
            <ul className='list-disc list-inside space-y-1 opacity-90'>
              <li>Gunakan format berkas Excel (.xlsx) resmi yang disediakan platform.</li>
              <li>
                Sistem akan memverifikasi duplikasi pengajuan yang berstatus <b>Menunggu / Disetujui</b> pada rentang
                tanggal yang sama.
              </li>
              <li>
                Format parameter penulisan tanggal wajib menggunakan standar ISO atau text <b>YYYY-MM-DD</b>.
              </li>
              <li>
                Opsi <b>Jenis Izin</b> yang valid: <b>Izin, Sakit</b>.
              </li>
              <li>
                Opsi <b>Status Approval</b> yang diakui: <b>Menunggu, Disetujui, Ditolak</b>.
              </li>
            </ul>
            <div className='mt-3'>
              <a className='text-blue-600 underline hover:text-blue-400 cursor-pointer' onClick={downloadTemplate}>
                <b>Download Template Excel Perizinan Santri</b>
              </a>
            </div>
          </div>

          <div>
            <label className='block font-medium mb-2 text-sm'>Pilih Mode Eksploitasi File</label>
            <div className='flex gap-6 text-sm'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='radio' checked={mode === 'preview'} onChange={() => setMode('preview')} />
                Preview (Cek Validitas)
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='radio' checked={mode === 'commit'} onChange={() => setMode('commit')} />
                Commit (Langsung Simpan)
              </label>
            </div>
          </div>

          {preview ? (
            <ImportPreview result={preview} onCommit={handleCommit} />
          ) : (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                className='border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 transition bg-gray-50'
              >
                <div className='flex flex-col items-center gap-3'>
                  <i className='tabler-file-spreadsheet text-4xl text-gray-400'></i>
                  <div className='text-sm text-gray-600'>
                    {fileName ? (
                      <b className='text-blue-600'>{fileName}</b>
                    ) : (
                      'Klik atau seret file Excel Perizinan ke sini'
                    )}
                  </div>
                  <button type='button' className='px-4 py-1.5 bg-gray-800 text-white rounded-md text-xs'>
                    Pilih File Perizinan
                  </button>
                </div>
                <input ref={fileRef} type='file' accept='.xlsx,.xls' className='hidden' onChange={onChangeFile} />
              </div>

              <Button
                size='small'
                fullWidth
                variant='contained'
                sx={{ height: 40, mt: 5 }}
                onClick={onSubmit}
                disabled={loading || !file}
              >
                {loading
                  ? 'Sedang Menganalisis File...'
                  : mode === 'preview'
                    ? 'Lihat Preview Analisis Data'
                    : 'Proses Import Pengajuan Perizinan'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
