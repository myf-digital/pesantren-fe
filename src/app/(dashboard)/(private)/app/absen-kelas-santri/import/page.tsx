'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Button from '@mui/material/Button'

import { useAppDispatch } from '@/redux-store/hook'
import { postAbsenKelasBatch, postAbsenKelasExport, postAbsenKelasImport, resetRedux } from '../slice'

export interface ImportAbsenPayload {
  id_santri: string
  nis: string
  fullname: string
  tanggal: string
  status_kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'
  keterangan: string
  id_lokasi: string
  id_jam_pelajaran: string
}

export interface ImportAbsenRow {
  row: number
  valid: boolean
  error: string | null
  payload: ImportAbsenPayload
}

export interface ImportAbsenPreviewResponse {
  mode: 'preview' | 'commit'
  total: number
  valid: number
  invalid: number
  data: ImportAbsenRow[]
}

interface Props {
  result: ImportAbsenPreviewResponse
  onCommit: () => void
}

export default function ImportExcelAbsenSantriPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<'preview' | 'commit'>('preview')
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [preview, setPreview] = useState<ImportAbsenPreviewResponse>()

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/absen-kelas-santri/list')
  }, [dispatch, router])

  const downloadTemplate = async () => {
    try {
      const res = await dispatch(postAbsenKelasExport({ template: 1 })).unwrap()
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
      const res = await dispatch(postAbsenKelasImport(formData)).unwrap()
      const { status, message, data } = res

      if (!status) {
        toast.warning(message)
        return
      }

      if (mode === 'preview') {
        setPreview(data)
      } else {
        toast.success('Import data presensi berhasil')
        onCancel()
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal import data presensi')
    } finally {
      setLoading(false)
    }
  }

  const handleCommit = async () => {
    const payloads = preview?.data.map(d => d.payload)

    try {
      setLoadingImport(true)
      const res = await dispatch(postAbsenKelasBatch({ data: payloads })).unwrap()
      const { status, message } = res

      if (!status) {
        toast.warning(message)
        return
      }

      toast.success('Import data presensi santri berhasil')
      onCancel()
    } catch (e) {
      console.error(e)
      toast.error('Gagal simpan batch data presensi')
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
                <th className='px-3 py-2'>NIS</th>
                <th className='px-3 py-2'>Nama Lengkap</th>
                <th className='px-3 py-2'>Tanggal Jurnal</th>
                <th className='px-3 py-2'>ID Kelas</th>
                <th className='px-3 py-2'>ID Jam Pelajaran</th>
                <th className='px-3 py-2'>Status Kehadiran</th>
                <th className='px-3 py-2'>Keterangan Opsional</th>
                <th className='px-3 py-2'>Validasi</th>
                <th className='px-3 py-2'>Error Info</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {result.data.map(row => (
                <tr key={row.row} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                  {/* 1. Nomor Row */}
                  <td className='px-3 py-2'>{row.row}</td>

                  {/* 2. NIS */}
                  <td className='px-3 py-2 font-mono text-[12px] font-semibold'>{row.payload.nis || '-'}</td>

                  {/* 3. Nama Lengkap */}
                  <td className='px-3 py-2 font-medium'>{row.payload.fullname || '-'}</td>

                  {/* 4. Tanggal Jurnal */}
                  <td className='px-3 py-2 font-mono'>{row.payload.tanggal || '-'}</td>

                  {/* 5. ID Kelas */}
                  <td className='px-3 py-2 font-mono text-gray-600'>{row.payload.id_lokasi || '-'}</td>

                  {/* 6. ID Shift Presensi */}
                  <td className='px-3 py-2 font-mono text-gray-600'>{row.payload.id_jam_pelajaran || '-'}</td>

                  {/* 7. Status Kehadiran */}
                  <td className='px-3 py-2'>
                    <span
                      className={`font-bold text-[11px] ${
                        row.payload.status_kehadiran === 'Hadir'
                          ? 'text-green-600'
                          : row.payload.status_kehadiran === 'Alfa'
                            ? 'text-red-600'
                            : 'text-orange-500'
                      }`}
                    >
                      {row.payload.status_kehadiran || '-'}
                    </span>
                  </td>

                  {/* 8. Keterangan */}
                  <td className='px-3 py-2 text-gray-700 max-w-[200px] whitespace-normal leading-tight'>
                    {row.payload.keterangan || '-'}
                  </td>

                  {/* 9. Status Validasi */}
                  <td className='px-3 py-2'>
                    {row.valid ? (
                      <span className='px-2 py-1 bg-green-100 text-green-700 rounded font-bold text-[9px] uppercase'>
                        Valid
                      </span>
                    ) : (
                      <span className='px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-[9px] uppercase'>
                        Tidak Valid
                      </span>
                    )}
                  </td>

                  {/* 10. Error Info */}
                  <td className='px-3 py-2'>
                    <span className='text-red-600 text-[12px] leading-tight block min-w-[250px] whitespace-normal'>
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
            href='/app/absen-kelas-santri/list'
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'
          >
            <i className='tabler-arrow-back-up'></i> Kembali ke Jurnal Presensi
          </Link>
          <h1 className='text-xl font-semibold mt-2'>Import Jurnal Presensi Santri</h1>
        </div>

        <div className='bg-white rounded-xl shadow-sm border p-6 space-y-6'>
          <div className='border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-700'>
            <h3 className='font-medium mb-2 font-bold'>Petunjuk Import Presensi Santri</h3>
            <ul className='list-disc list-inside space-y-1 opacity-90'>
              <li>Gunakan format file Excel (.xlsx) resmi yang disediakan sistem.</li>
              <li>
                Pastikan kolom <b>NIS</b> valid dan terdaftar pada data induk santri aktif.
              </li>
              <li>
                Gunakan format penulisan tanggal berstandar <b>YYYY-MM-DD</b> (Contoh: 2026-05-22).
              </li>
              <li>
                Pilihan Status Kehadiran yang diakui sistem: <b>Hadir, Izin, Sakit, Alfa</b>.
              </li>
              <li>
                Mode <b>Commit</b> akan mengeksekusi penyimpanan langsung jika baris file terverifikasi bersih.
              </li>
            </ul>
            <div className='mt-3'>
              <a className='text-blue-600 underline hover:text-blue-400 cursor-pointer' onClick={downloadTemplate}>
                <b>Download Template Excel Jurnal Presensi</b>
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
                      'Klik atau seret file Excel Presensi ke sini'
                    )}
                  </div>
                  <button type='button' className='px-4 py-1.5 bg-gray-800 text-white rounded-md text-xs'>
                    Pilih File Presensi
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
                  ? 'Sedang Memproses File...'
                  : mode === 'preview'
                    ? 'Lihat Preview Data Jurnal'
                    : 'Proses Import Log Presensi'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
