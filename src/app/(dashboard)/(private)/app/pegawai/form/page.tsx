'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardHeader, CardContent, Grid, Divider } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { formatDate } from 'date-fns/format'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchPegawaiById, postPegawai, postPegawaiUpdate, resetRedux } from '../slice'
import { fetchOrgUnitPage } from '../../organisasi/slice'
import { fetchJabatanPage } from '../../jabatan/slice'

import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import {
  fetchDistrictsByRegency,
  fetchProvinces,
  fetchRegenciesByProvince,
  fetchSubDistrictsByDistrict
} from '../../areas/slice'

const PegawaiForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.pegawai)

  const [opt, setOpt] = useState<any>({
    units: [],
    jabatans: [],
    gender: [
      { label: 'Laki-laki', value: 'Laki-laki' },
      { label: 'Perempuan', value: 'Perempuan' }
    ],
    status: [
      { label: 'Aktif', value: 'Aktif' },
      { label: 'Tidak Aktif', value: 'Tidak Aktif' },
      { label: 'Pensiun', value: 'Pensiun' }
    ],

    // Tambahan Opsi Wilayah
    provinces: [],
    cities: [],
    districts: [],
    subDistricts: []
  })

  const [state, setState] = useState<any>({
    nama_lengkap: '',
    nik: '',
    nip: '',
    email: '',
    id_orgunit: null,
    id_jabatan: null,
    jenis_kelamin: null,
    status_pegawai: { label: 'Aktif', value: 'Aktif' },
    tanggal_lahir: '',
    umur: 0,

    // Tambahan State Awal sesuai JSON
    tempat_lahir: '',
    no_hp: '',
    alamat: '',
    province_id: null,
    city_id: null,
    district_id: null,
    sub_district_id: null,
    pendidikan: '',
    bidang_ilmu: '',
    foto: '',
    tmt: ''
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ values: state })

  // Fungsi memuat Data Wilayah Berantai (Cascade)
  const loadCities = async (provId: string) => {
    try {
      const res = await dispatch(fetchRegenciesByProvince(provId)).unwrap() // sesuaikan action Anda

      setOpt((prev: any) => ({ ...prev, cities: (res?.data || []).map((i: any) => ({ label: i.name, value: i.id })) }))
    } catch (err) {
      console.error(err)
    }
  }

  const loadDistricts = async (cityId: string) => {
    try {
      const res = await dispatch(fetchDistrictsByRegency(cityId)).unwrap() // sesuaikan action Anda

      setOpt((prev: any) => ({
        ...prev,
        districts: (res?.data || []).map((i: any) => ({ label: i.name, value: i.id }))
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const loadSubDistricts = async (distId: string) => {
    try {
      const res = await dispatch(fetchSubDistrictsByDistrict(distId)).unwrap() // sesuaikan action Anda

      setOpt((prev: any) => ({
        ...prev,
        subDistricts: (res?.data || []).map((i: any) => ({ label: i.name, value: i.id }))
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const initForm = useCallback(async () => {
    try {
      const [resUnit, resJabatan, resProv] = await Promise.all([
        dispatch(fetchOrgUnitPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchJabatanPage({ perPage: 1000 })).unwrap(),
        dispatch(fetchProvinces()).unwrap() // Ambil semua data provinsi awal
      ])

      const unitOpts = (resUnit?.data?.values || []).map((i: any) => ({ label: i.nama_orgunit, value: i.id_orgunit }))
      const jabOpts = (resJabatan?.data?.values || []).map((i: any) => ({ label: i.nama_jabatan, value: i.id_jabatan }))
      const provOpts = (resProv?.data || []).map((i: any) => ({ label: i.name, value: i.id }))

      setOpt((prev: any) => ({ ...prev, units: unitOpts, jabatans: jabOpts, provinces: provOpts }))

      if (id) {
        const resDetail = await dispatch(fetchPegawaiById(id)).unwrap()
        const d = resDetail?.data

        if (d) {
          // Trigger pemuatan data wilayah berdasarkan data detail yang ada
          if (d.province_id) await loadCities(d.province_id)
          if (d.city_id) await loadDistricts(d.city_id)
          if (d.district_id) await loadSubDistricts(d.district_id)

          const formatted = {
            ...d,
            id_orgunit: unitOpts.find((o: any) => o.value === d.id_orgunit) || null,
            id_jabatan: jabOpts.find((o: any) => o.value === d.id_jabatan) || null,
            jenis_kelamin: d.jenis_kelamin ? { label: d.jenis_kelamin, value: d.jenis_kelamin } : null,
            status_pegawai: d.status_pegawai
              ? { label: d.status_pegawai, value: d.status_pegawai }
              : { label: 'Aktif', value: 'Aktif' },

            // Format data select objek wilayah dari detail API
            province_id: d.province ? { label: d.province.name, value: d.province.id } : null,
            city_id: d.city ? { label: d.city.name, value: d.city.id } : null,
            district_id: d.district ? { label: d.district.name, value: d.district.id } : null,
            sub_district_id: d.subDistrict ? { label: d.subDistrict.name, value: d.subDistrict.id } : null
          }

          setState(formatted)
          reset(formatted)
        }
      }
    } catch (err) {
      toast.error('Gagal memuat referensi data')
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    initForm()
  }, [initForm])

  useEffect(() => {
    if (store.crud) {
      if (store.crud.status) {
        toast.success(store.crud.message)
        dispatch(resetRedux())
        router.replace('/app/pegawai/list')
      } else {
        toast.error(store.crud.message)
        dispatch(resetRedux())
      }
    }
  }, [store.crud, dispatch, router])

  const onSubmit = () => {
    const payload = {
      ...state,
      foto: state.foto.includes('uploads/pegawai') ? null : state.foto,
      id_orgunit: state.id_orgunit?.value,
      id_jabatan: state.id_jabatan?.value,
      jenis_kelamin: state.jenis_kelamin?.value,
      status_pegawai: state.status_pegawai?.value,

      // Mapping value id wilayah ke string standar database
      province_id: state.province_id?.value || null,
      city_id: state.city_id?.value || null,
      district_id: state.district_id?.value || null,
      sub_district_id: state.sub_district_id?.value || null,
      tanggal_lahir: state.tanggal_lahir ? formatDate(state.tanggal_lahir, 'yyyy-MM-dd') : null,
      tmt: state.tmt ? formatDate(state.tmt, 'yyyy-MM-dd') : null
    }

    id ? dispatch(postPegawaiUpdate({ id, params: payload })) : dispatch(postPegawai([payload]))
  }

  const fields = () => [
    { section: 'Informasi Pribadi' },
    field({ type: 'text', key: 'nama_lengkap', label: 'Nama Lengkap', required: true, readOnly: !!view }),
    field({ type: 'text', key: 'nik', label: 'NIK', required: true, readOnly: !!view }),
    field({ type: 'text', key: 'nip', label: 'NIP', readOnly: !!view }),
    field({
      type: 'select',
      key: 'jenis_kelamin',
      label: 'Jenis Kelamin',
      options: { values: opt.gender },
      readOnly: !!view
    }),
    field({ type: 'text', key: 'tempat_lahir', label: 'Tempat Lahir', readOnly: !!view }), // <-- Tambah Tempat Lahir
    field({
      type: 'date_custom',
      key: 'tanggal_lahir',
      label: 'Tanggal Lahir',
      readOnly: !!view,
      options: { gridMode: true }
    }),
    field({ type: 'numeral', key: 'umur', label: 'Umur (Otomatis)', readOnly: true }),

    { section: 'Pendidikan & Keahlian' }, // <-- Tambah Section Baru
    field({ type: 'text', key: 'pendidikan', label: 'Pendidikan Terakhir', readOnly: !!view }),
    field({ type: 'text', key: 'bidang_ilmu', label: 'Bidang Ilmu', readOnly: !!view }),

    { section: 'Kontak & Alamat' },
    field({ type: 'text', key: 'email', label: 'Email', readOnly: !!view }),
    field({ type: 'text', key: 'no_hp', label: 'No. HP', readOnly: !!view }),

    // Cascading dropdown untuk data wilayah (Province -> City -> District -> SubDistrict)
    field({
      type: 'select',
      key: 'province_id',
      label: 'Provinsi',
      options: {
        values: opt.provinces,
        onChange: (e: any) => {
          // Reset child fields ketika parent berubah
          setState((prev: any) => ({
            ...prev,
            province_id: e,
            city_id: null,
            district_id: null,
            sub_district_id: null
          }))
          if (e?.value) loadCities(e.value)
        }
      },
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'city_id',
      label: 'Kabupaten/Kota',
      options: {
        values: opt.cities,
        onChange: (e: any) => {
          setState((prev: any) => ({ ...prev, city_id: e, district_id: null, sub_district_id: null }))
          if (e?.value) loadDistricts(e.value)
        }
      },
      readOnly: !state.province_id || !!view
    }),
    field({
      type: 'select',
      key: 'district_id',
      label: 'Kecamatan',
      options: {
        values: opt.districts,
        onChange: (e: any) => {
          setState((prev: any) => ({ ...prev, district_id: e, sub_district_id: null }))
          if (e?.value) loadSubDistricts(e.value)
        }
      },
      readOnly: !state.city_id || !!view
    }),
    field({
      type: 'select',
      key: 'sub_district_id',
      label: 'Kelurahan/Desa',
      options: { values: opt.subDistricts },
      readOnly: !state.district_id || !!view
    }),
    field({ type: 'textarea', key: 'alamat', label: 'Alamat Lengkap', readOnly: !!view }),

    { section: 'Kepegawaian & Foto' },
    field({
      type: 'select',
      key: 'id_orgunit',
      label: 'Unit Organisasi',
      options: { values: opt.units },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'id_jabatan',
      label: 'Jabatan',
      options: { values: opt.jabatans },
      required: true,
      readOnly: !!view
    }),
    field({
      type: 'select',
      key: 'status_pegawai',
      label: 'Status Pegawai',
      options: { values: opt.status },
      readOnly: !!view
    }),
    field({
      type: 'date_custom',
      key: 'tmt',
      label: 'TMT (Terhitung Mulai Tanggal)',
      readOnly: !!view,
      options: { gridMode: true }
    }),

    // Input Image untuk Foto Pegawai
    field({
      type: 'image',
      key: 'foto',
      label: 'Foto Pegawai',
      placeholder: 'Foto',
      urlImage: '/uploads/pegawai/',
      readOnly: !!view
    }),

    fieldBuildSubmit({ onCancel: () => router.push('/app/pegawai/list'), loading: store.loading, disabled: !!view })
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={id ? (view ? 'Detail Pegawai' : 'Edit Pegawai') : 'Tambah Pegawai'} />
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

export default PegawaiForm
