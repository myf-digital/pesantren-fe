'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'

// Import Slice Kasus (Sesuaikan Path)
import {
  fetchKasusPelanggaranSantriById,
  postKasusPelanggaranSantri,
  postKasusPelanggaranSantriUpdate,
  resetRedux
} from '../slice'

// Import Slice Relasi (Sesuaikan Path)
import { fetchMasterPelanggaranRemisiPage } from '../../pelanggaran-remisi-master/slice'
import { fetchSantriPage } from '../../santri/slice'
import { fetchLocationPage } from '../../location/slice'
import { fetchPegawaiPage } from '../../pegawai/slice'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { useSession } from 'next-auth/react'
// Hook kustom untuk Debounce (Mencegah spam API saat mengetik)
const useDebounceSearch = (callback: (val: string) => void, delay = 500) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  return (val: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      callback(val)
    }, delay)
  }
}

const KasusPelanggaranSantriForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')

  // Tipe form: 'pelanggaran' atau 'remisi' (default: pelanggaran)
  const type = searchParams.get('type') || 'pelanggaran'
  const isRemisi = type === 'remisi'

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.pelanggaran_remisi_santri)

  const [opt, setOpt] = useState<any>({
    santri: [],
    master: [],
    lokasi: [],
    pegawai: [],
    level_sp: [
      { label: 'Tanpa SP', value: '' },
      { label: 'SP 1', value: 'SP1' },
      { label: 'SP 2', value: 'SP2' },
      { label: 'SP 3', value: 'SP3' }
    ],
    status: isRemisi
      ? [
          { label: 'Selesai', value: 'Selesai' },
          { label: 'Batal', value: 'Batal' }
        ]
      : [
          { label: 'Proses', value: 'Proses' },
          { label: 'Selesai', value: 'Selesai' },
          { label: 'Batal', value: 'Batal' }
        ]
  })

  const { data: session } = useSession()
  const currentUser: any = session?.userdata
  console.log(currentUser)

  const [state, setState] = useState<any>({
    nomor_kasus: '',
    tanggal_kejadian: new Date(),
    id_santri: null,
    id_pelanggaran_remisi: null,
    id_lokasi: null,

    // Auto-filled dari master
    kategori: '',
    skor_master_snapshot: 0,

    skor_diberikan: 0,
    alasan_penyesuaian_skor: '',
    kronologi: '',
    punishment_detail: '',
    foto_bukti: '',

    level_sp: null,
    nomor_surat_sp: '',
    foto_dokumen_sp: '',

    status_progress: isRemisi ? { label: 'Selesai', value: 'Selesai' } : { label: 'Proses', value: 'Proses' },
    id_petugas_pelapor: currentUser?.pegawai
      ? { label: currentUser.pegawai.nama_lengkap, value: currentUser.pegawai.id_pegawai }
      : null,
    id_petugas_penanggung_jawab: currentUser?.pegawai
      ? { label: currentUser.pegawai.nama_lengkap, value: currentUser.pegawai.id_pegawai }
      : null
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  // =========================================================================
  // FUNGSI PENCARIAN (ASYNC SEARCH)
  // =========================================================================

  const searchSantri = useDebounceSearch(async (keyword: string) => {
    try {
      const res = await dispatch(fetchSantriPage({ perPage: 10, keyword })).unwrap()
      const opts = (res?.data?.values || []).map((i: any) => ({
        label: `${i.fullname} (${i.nis})`,
        value: i.id_santri
      }))
      setOpt((prev: any) => ({ ...prev, santri: opts }))
    } catch (err) {}
  })

  const searchLokasi = useDebounceSearch(async (keyword: string) => {
    try {
      const res = await dispatch(fetchLocationPage({ perPage: 10, keyword })).unwrap()
      const opts = (res?.data?.values || []).map((i: any) => ({ label: i.nama_lokasi, value: i.id_lokasi }))
      setOpt((prev: any) => ({ ...prev, lokasi: opts }))
    } catch (err) {}
  })

  const searchPegawai = useDebounceSearch(async (keyword: string) => {
    try {
      const res = await dispatch(fetchPegawaiPage({ perPage: 10, keyword, status_pegawai: 'Aktif' })).unwrap()
      const opts = (res?.data?.values || []).map((i: any) => ({ label: i.nama_lengkap, value: i.id_pegawai }))
      setOpt((prev: any) => ({ ...prev, pegawai: opts }))
    } catch (err) {}
  })

  // =========================================================================

  // Inisialisasi dropdown referensi saat Load Pertama
  const loadDependencies = useCallback(async () => {
    try {
      // Default initial fetch hanya 10 data untuk (Santri, Lokasi, Pegawai)
      const [resSantri, resMaster, resLokasi, resPegawai] = await Promise.all([
        dispatch(fetchSantriPage({ perPage: 10 })).unwrap(),

        // Master tetap direkomendasikan load all (atau limit besar) karena dropdown jenis pelanggaran butuh dikelompokkan/dicari cepat
        dispatch(
          fetchMasterPelanggaranRemisiPage({
            perPage: 1000,
            jenis: isRemisi ? 'Remisi' : 'Pelanggaran',
            is_active: true
          })
        ).unwrap(),
        dispatch(fetchLocationPage({ perPage: 10 })).unwrap(),
        dispatch(fetchPegawaiPage({ perPage: 10, status_pegawai: 'Aktif' })).unwrap()
      ])

      const santriOpts = (resSantri?.data?.values || []).map((i: any) => ({
        label: `${i.fullname} (${i.nis})`,
        value: i.id_santri
      }))
      const masterOpts = (resMaster?.data?.values || []).map((i: any) => ({
        label: i.nama_pelanggaran,
        value: i.id_pelanggaran_remisi,
        kategori: i.kategori,
        skor: i.skor
      }))
      const lokasiOpts = (resLokasi?.data?.values || []).map((i: any) => ({ label: i.nama_lokasi, value: i.id_lokasi }))
      const pegawaiOpts = (resPegawai?.data?.values || []).map((i: any) => ({
        label: i.nama_lengkap,
        value: i.id_pegawai
      }))

      setOpt((prev: any) => ({
        ...prev,
        santri: santriOpts,
        master: masterOpts,
        lokasi: lokasiOpts,
        pegawai: pegawaiOpts
      }))

      return { santriOpts, masterOpts, lokasiOpts, pegawaiOpts }
    } catch (err) {
      toast.error('Gagal memuat referensi data')
      return {}
    }
  }, [dispatch, isRemisi])

  const initForm = useCallback(async () => {
    const opts = await loadDependencies()

    if (id) {
      try {
        const resDetail = await dispatch(fetchKasusPelanggaranSantriById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          // Extract data detail menjadi object {label, value} langsung dari relasi DB
          // Tujuannya agar saat Edit, opsi tetap muncul walaupun data tidak termasuk di dalam fetch initial limit 10
          const selectedSantri =
            d.id_santri && d.santri ? { label: `${d.santri.fullname} (${d.santri.nis})`, value: d.id_santri } : null
          const selectedLokasi = d.id_lokasi && d.lokasi ? { label: d.lokasi.nama_lokasi, value: d.id_lokasi } : null
          const selectedPelapor =
            d.id_petugas_pelapor && d.pelapor ? { label: d.pelapor.nama_lengkap, value: d.id_petugas_pelapor } : null
          const selectedPj =
            d.id_petugas_penanggung_jawab && d.penanggung_jawab
              ? { label: d.penanggung_jawab.nama_lengkap, value: d.id_petugas_penanggung_jawab }
              : null

          // Push opsi terpilih ke dalam dropdown agar label tampil (jika belum ada)
          setOpt((prev: any) => {
            const uniquePegawai = [...prev.pegawai, selectedPelapor, selectedPj]
              .filter(Boolean)
              .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
            return {
              ...prev,
              santri:
                selectedSantri && !prev.santri.find((x: any) => x.value === selectedSantri.value)
                  ? [selectedSantri, ...prev.santri]
                  : prev.santri,
              lokasi:
                selectedLokasi && !prev.lokasi.find((x: any) => x.value === selectedLokasi.value)
                  ? [selectedLokasi, ...prev.lokasi]
                  : prev.lokasi,
              pegawai: uniquePegawai
            }
          })

          const formatted = {
            ...d,
            tanggal_kejadian: d.tanggal_kejadian ? new Date(d.tanggal_kejadian) : null,
            id_santri: selectedSantri,
            id_pelanggaran_remisi: opts.masterOpts?.find((o: any) => o.value === d.id_pelanggaran_remisi) || null,
            id_lokasi: selectedLokasi,
            level_sp: d.level_sp ? { label: d.level_sp, value: d.level_sp } : null,
            status_progress: d.status_progress ? { label: d.status_progress, value: d.status_progress } : null,
            id_petugas_pelapor: selectedPelapor,
            id_petugas_penanggung_jawab: selectedPj,
            kategori: d.master_pelanggaran?.kategori || ''
          }
          setState(formatted)
          reset(formatted)
        }
      } catch (err) {
        toast.error('Gagal memuat detail kasus')
      }
    }
  }, [id, dispatch, reset, loadDependencies])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message)
        dispatch(resetRedux())
        router.replace('/app/pelanggaran-remisi-santri/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      jenis: isRemisi ? 'Remisi' : 'Pelanggaran',
      tanggal_kejadian: state.tanggal_kejadian ? format(state.tanggal_kejadian, 'yyyy-MM-dd HH:mm:ss') : null,
      id_santri: state.id_santri?.value || null,
      id_pelanggaran_remisi: state.id_pelanggaran_remisi?.value || null,
      id_lokasi: state.id_lokasi?.value || null,
      level_sp: state.level_sp?.value || null,
      status_progress: state.status_progress?.value || null,
      id_petugas_pelapor: state.id_petugas_pelapor?.value || null,
      id_petugas_penanggung_jawab: state.id_petugas_penanggung_jawab?.value || null,
      skor_master_snapshot: Number(state.skor_master_snapshot),
      skor_diberikan: Number(state.skor_diberikan),

      foto_bukti: state.foto_bukti?.includes('uploads/') ? null : state.foto_bukti,
      foto_dokumen_sp: state.foto_dokumen_sp?.includes('uploads/') ? null : state.foto_dokumen_sp
    }

    if (isRemisi) {
      payload.level_sp = null
      payload.nomor_surat_sp = null
      payload.foto_dokumen_sp = null
      payload.punishment_detail = null
    }

    id
      ? dispatch(postKasusPelanggaranSantriUpdate({ id, params: payload }))
      : dispatch(postKasusPelanggaranSantri(payload))
  }

  const fields = () => {
    const formFields: any = [
      { section: isRemisi ? 'Informasi Transaksi Remisi' : 'Informasi Kasus Pelanggaran' },
      field({
        type: 'text',
        key: 'nomor_kasus',
        label: isRemisi ? 'Nomor Transaksi' : 'Nomor Kasus',
        readOnly: !!view || !!id,
        placeholder: 'Dibuat otomatis oleh sistem jika dikosongkan'
      }),
      field({
        type: 'date_custom',
        key: 'tanggal_kejadian',
        label: isRemisi ? 'Tanggal Remisi' : 'Tanggal Kejadian',
        required: true,
        readOnly: !!view,
        options: { gridMode: true }
      }),
      field({
        type: 'select',
        key: 'id_santri',
        label: 'Santri',
        options: {
          values: opt.santri,
          onChange: (_: any, value: string) => {
            if (value !== undefined && value !== null) searchSantri(value)
          }
        },
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'select',
        key: 'id_lokasi',
        label: isRemisi ? 'Lokasi (Tempat/Instansi)' : 'Lokasi Kejadian',
        options: {
          values: opt.lokasi,
          onChange: (_: any, value: string) => {
            if (value !== undefined && value !== null) searchLokasi(value)
          }
        },
        required: true,
        readOnly: !!view
      }),

      { section: isRemisi ? 'Detail Remisi & Skor' : 'Detail Pelanggaran & Skor' },
      field({
        type: 'select',
        key: 'id_pelanggaran_remisi',
        label: isRemisi ? 'Master Remisi' : 'Jenis Kasus (Master)',
        options: {
          values: opt.master,
          onChange: (selected: any) => {
            if (selected) {
              setState((prev: any) => ({
                ...prev,
                id_pelanggaran_remisi: selected,
                kategori: selected.kategori || 'Tanpa Kategori',
                skor_master_snapshot: selected.skor,
                skor_diberikan: selected.skor
              }))
            }
          }
        },
        required: true,
        readOnly: !!view
      }),

      ...(isRemisi
        ? []
        : [
            field({
              type: 'text',
              key: 'kategori',
              label: 'Kategori Master',
              readOnly: true,
              placeholder: 'Otomatis terisi'
            })
          ]),

      field({
        type: 'numeral',
        key: 'skor_master_snapshot',
        label: 'Skor Master (Sistem)',
        readOnly: true
      }),
      field({
        type: 'numeral',
        key: 'skor_diberikan',
        label: 'Skor Akhir / Diberikan',
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'textarea',
        key: 'alasan_penyesuaian_skor',
        label: 'Alasan Penyesuaian Skor',
        readOnly: !!view,
        placeholder: 'Wajib diisi jika skor diberikan berbeda dari skor sistem'
      }),

      { section: isRemisi ? 'Keterangan & Bukti' : 'Kronologi & Hukuman' },
      field({
        type: 'textarea',
        key: 'kronologi',
        label: isRemisi ? 'Prestasi / Alasan Remisi' : 'Kronologi Kejadian',
        readOnly: !!view
      }),
      field({
        type: 'image',
        key: 'foto_bukti',
        label: isRemisi ? 'Upload File Pendukung' : 'Upload Bukti Pelanggaran',
        placeholder: 'Pilih File',
        urlImage: '/uploads/kasus-pelanggaran/',
        readOnly: !!view
      })
    ]

    if (!isRemisi) {
      formFields.push(
        field({
          type: 'textarea',
          key: 'punishment_detail',
          label: 'Detail Hukuman / Pembinaan',
          readOnly: !!view
        }),
        { section: 'Tindakan Surat Peringatan (SP)' },
        field({
          type: 'select',
          key: 'level_sp',
          label: 'Level SP (Opsional)',
          options: { values: opt.level_sp },
          readOnly: !!view
        }),
        field({
          type: 'text',
          key: 'nomor_surat_sp',
          label: 'Nomor Surat SP',
          readOnly: !!view || !state.level_sp?.value,
          placeholder: 'Wajib jika SP dipilih'
        }),
        field({
          type: 'image',
          key: 'foto_dokumen_sp',
          label: 'Upload Dokumen SP',
          placeholder: 'Pilih Dokumen',
          urlImage: '/uploads/kasus-pelanggaran/',
          readOnly: !!view || !state.level_sp?.value
        })
      )
    }

    formFields.push(
      { section: 'Status & Petugas Terkait' },
      field({
        type: 'select',
        key: 'status_progress',
        label: isRemisi ? 'Status Remisi' : 'Status Progress',
        options: { values: opt.status },
        required: true,
        readOnly: !!view
      }),
      field({
        type: 'select',
        key: 'id_petugas_pelapor',
        label: isRemisi ? 'Petugas Pengusul' : 'Petugas Pelapor',
        options: {
          values: opt.pegawai,
          onChange: (_: any, value: string) => {
            if (value !== undefined && value !== null) searchPegawai(value)
          }
        },
        readOnly: !!view
      }),
      field({
        type: 'select',
        key: 'id_petugas_penanggung_jawab',
        label: 'Penanggung Jawab',
        options: {
          values: opt.pegawai,
          onChange: (_: any, value: string) => {
            if (value !== undefined && value !== null) searchPegawai(value)
          }
        },
        readOnly: !!view
      }),

      fieldBuildSubmit({
        onCancel: () => router.push('/app/pelanggaran-remisi-santri/list'),
        loading: store.loading,
        disabled: !!view
      })
    )

    return formFields
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              id
                ? view
                  ? `Detail ${isRemisi ? 'Remisi' : 'Kasus'}`
                  : `Edit ${isRemisi ? 'Remisi' : 'Kasus'}`
                : `Tambah ${isRemisi ? 'Remisi / Penghargaan' : 'Kasus Pelanggaran'}`
            }
          />
          <Divider sx={{ m: '0 !important' }} />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {formColumn({ control, errors, state, setState, fields: fields() })}
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default KasusPelanggaranSantriForm
