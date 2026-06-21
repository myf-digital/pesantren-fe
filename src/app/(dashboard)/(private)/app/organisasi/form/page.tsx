'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, Grid } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchOrgUnitById, fetchOrgUnitPage, postOrgUnit, postOrgUnitUpdate, resetRedux } from '../slice/index'
import { fetchCabangPage } from '../../cabang/slice/index'
import { fetchLembagaFormalAll } from '../../lembaga-formal/slice/index'
import { fetchLembagaAll as fetchLembagaKepesantrenanAll } from '../../lembaga-kepesantrenan/slice/index'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'

const OrganizationUnitForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.organisasi_unit)

  const [opt, setOpt] = useState({
    parents: [] as any[],
    cabang: [] as any[],
    lembaga: [] as any[],
    jenis: [
      { label: 'Biro', value: 'Biro' },
      { label: 'Bagian', value: 'Bagian' },
      { label: 'Lembaga', value: 'Lembaga' },
      { label: 'Sub-Unit', value: 'Sub-Unit' },
      { label: 'Umum', value: 'Umum' }
    ]
  })

  const [state, setState] = useState<any>({
    nama_orgunit: '',
    parent_id: null,
    id_cabang: null,
    id_lembaga: null,
    jenis_orgunit: null,
    lembaga_type: null,
    keterangan: ''
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    values: state
  })

  /* -----------------------------------------------------------
     1. Inisialisasi Data Ref & Detail
  ----------------------------------------------------------- */
  const initForm = useCallback(async () => {
    try {
      const [resParent, resCabang, resFormal, resPesantren] = await Promise.all([
        dispatch(fetchOrgUnitPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchCabangPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchLembagaFormalAll({})).unwrap(),
        dispatch(fetchLembagaKepesantrenanAll({})).unwrap()
      ])

      const parentOptions = (resParent?.data?.values || [])
        .filter((item: any) => item.id_orgunit !== id)
        .map((item: any) => ({ label: item.nama_orgunit, value: item.id_orgunit }))

      const cabangOptions = (resCabang?.data?.values || []).map((item: any) => ({
        label: item.nama_cabang,
        value: item.id_cabang
      }))

      const lembagaOptions = [
        ...(resFormal?.data || []).map((item: any) => ({
          label: `[Formal] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'FORMAL',
          id_cabang: item.id_cabang
        })),
        ...(resPesantren?.data || []).map((item: any) => ({
          label: `[Pesantren] ${item.nama_lembaga}`,
          value: item.id_lembaga,
          type: 'PESANTREN',
          id_cabang: item.id_cabang
        }))
      ]

      setOpt(prev => ({ ...prev, parents: parentOptions, cabang: cabangOptions, lembaga: lembagaOptions }))

      if (id) {
        const resDetail = await dispatch(fetchOrgUnitById(id)).unwrap()
        const d = resDetail?.data // Backend mengembalikan objek tunggal (Limit 1)

        if (d) {
          const formatted = {
            ...d,
            jenis_orgunit: d.jenis_orgunit ? { label: d.jenis_orgunit, value: d.jenis_orgunit } : null,
            // Mapping ID Cabang dari nama_cabang BE
            id_cabang: d.id_cabang ? { label: d.nama_cabang, value: d.id_cabang } : null,
            // Mapping Parent ID dari parent_nama BE
            parent_id: d.parent_id ? { label: d.parent_nama, value: d.parent_id } : null,
            // Mapping Lembaga dari json_build_object BE
            id_lembaga: d.lembaga?.id_lembaga
              ? {
                  label: `[${d.lembaga_type}] ${d.lembaga.nama_lembaga}`,
                  value: d.lembaga.id_lembaga,
                  type: d.lembaga_type,
                  id_cabang: d.id_cabang
                }
              : null
          }
          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat referensi data')
    }
  }, [id, dispatch, reset])

  // State untuk menyimpan daftar lembaga yang sudah terfilter
  const [filteredLembaga, setFilteredLembaga] = useState<any[]>([])

  useEffect(() => {
    const selectedCabangId = state.id_cabang?.value

    if (selectedCabangId) {
      const filtered = opt.lembaga.filter((l: any) => l.id_cabang === selectedCabangId)
      setFilteredLembaga(filtered)

      if (state.id_lembaga && state.id_lembaga.id_cabang !== selectedCabangId) {
        setState((prev: any) => ({ ...prev, id_lembaga: null }))
      }
    } else {
      setFilteredLembaga(opt.lembaga)
    }
  }, [state.id_cabang, opt.lembaga])

  useEffect(() => {
    initForm()
  }, [initForm])

  /* -----------------------------------------------------------
     2. Submit & Reset
  ----------------------------------------------------------- */
  useEffect(() => {
    if (store.crud?.status) {
      toast.success(store.crud?.message || 'Berhasil disimpan')
      dispatch(resetRedux())
      router.replace('/app/organisasi/list')
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      jenis_orgunit: state.jenis_orgunit?.value,
      parent_id: state.parent_id?.value || null,
      id_cabang: state.id_cabang?.value || null,
      id_lembaga: state.id_lembaga?.value || null,
      lembaga_type: state.id_lembaga?.type || null // Diambil dari tipe opsi lembaga yang dipilih
    }

    if (id) {
      dispatch(postOrgUnitUpdate({ id, params: payload }))
    } else {
      // Backend create menerima array (bulkCreate)
      dispatch(postOrgUnit([payload]))
    }
  }

  /* -----------------------------------------------------------
     3. Form Fields Configuration (Lengkap)
  ----------------------------------------------------------- */
  const fields = () => [
    field({
      type: 'text',
      key: 'nama_orgunit',
      label: 'Nama Unit Organisasi',
      required: true,
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'jenis_orgunit',
      label: 'Jenis Unit',
      options: { values: opt.jenis },
      required: true,
      readOnly: !!view
    }),

    // --- Hirarki & Level ---
    field({
      type: 'select',
      key: 'parent_id',
      label: 'Induk Organisasi (Parent)',
      options: { values: opt.parents },
      readOnly: !!view,
      placeholder: 'Kosongkan jika ini adalah Root/Pusat'
    }),

    field({
      type: 'numeral',
      key: 'level_orgunit',
      label: 'Level Hirarki',
      readOnly: true, // Auto-calculated oleh sistem
      placeholder: 'Otomatis mengikuti Parent'
    }),

    // --- Lokasi & Relasi ---
    field({
      type: 'select',
      key: 'id_cabang',
      label: 'Kantor Cabang',
      options: { values: opt.cabang },
      readOnly: !!view
    }),

    field({
      type: 'select',
      key: 'id_lembaga',
      label: 'Terikat Lembaga (Sekolah/Pesantren)',
      options: { values: opt.lembaga },
      readOnly: !!view,
      placeholder: 'Wajib diisi jika Jenis Unit adalah "Lembaga"'
    }),

    // --- Informasi Tambahan ---
    field({
      type: 'textarea',
      key: 'keterangan',
      label: 'Keterangan / Deskripsi Unit',
      readOnly: !!view
    }),

    fieldBuildSubmit({
      onCancel: () => router.push('/app/organisasi/list'),
      loading: store.loading,
      disabled: !!view
    })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={id ? (view ? 'Detail Unit' : 'Edit Unit') : 'Tambah Unit'} />
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

export default OrganizationUnitForm
