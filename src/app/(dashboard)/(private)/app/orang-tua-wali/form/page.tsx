'use client'

// ** React Imports
import React, { useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import { fetchOrangTuaWaliById, postOrangTuaWali, postOrangTuaWaliUpdate, resetRedux } from '../slice/index'
import { field, fieldBuildSubmit, formColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchSantriAll } from '../../santri/slice'
import {
  fetchProvinces,
  fetchRegenciesByProvince,
  fetchDistrictsByRegency,
  fetchSubDistrictsByDistrict,
  clearRegencies,
  clearDistricts,
  clearSubDistricts
} from '../../areas/slice'

const hubunganOption = {
  values: [
    {
      label: 'Ayah',
      value: 'Ayah'
    },
    {
      label: 'Ibu',
      value: 'Ibu'
    },
    {
      label: 'Wali',
      value: 'Wali'
    }
  ]
}

const pekerjaanOption = {
  values: [
    {
      label: 'Tidak Bekerja',
      value: 'Tidak Bekerja'
    },
    {
      label: 'Ibu Rumah Tangga',
      value: 'Ibu Rumah Tangga'
    },
    {
      label: 'Petani',
      value: 'Petani'
    },
    {
      label: 'Buruh Harian',
      value: 'Buruh Harian'
    },
    {
      label: 'Nelayan',
      value: 'Nelayan'
    },
    {
      label: 'Wiraswasta',
      value: 'Wiraswasta'
    },
    {
      label: 'Pedagang',
      value: 'Pedagang'
    },
    {
      label: 'Karyawan Swasta',
      value: 'Karyawan Swasta'
    },
    {
      label: 'PNS',
      value: 'PNS'
    },
    {
      label: 'TNI / POLRI',
      value: 'TNI / POLRI'
    },
    {
      label: 'Guru / Dosen',
      value: 'Guru / Dosen'
    },
    {
      label: 'Pekerja Migran',
      value: 'Pekerja Migran'
    },
    {
      label: 'Pensiunan',
      value: 'Pensiunan'
    },
    {
      label: 'Lainnya',
      value: 'Lainnya'
    }
  ]
}

const pendidikanOption = {
  values: [
    {
      label: 'Tidak Sekolah',
      value: 'Tidak Sekolah'
    },
    {
      label: 'SD / MI',
      value: 'SD / MI'
    },
    {
      label: 'SMP / MTs',
      value: 'SMP / MTs'
    },
    {
      label: 'SMA / MA',
      value: 'SMA / MA'
    },
    {
      label: 'SMK',
      value: 'SMK'
    },
    {
      label: 'D1',
      value: 'D1'
    },
    {
      label: 'D2',
      value: 'D2'
    },
    {
      label: 'D3',
      value: 'D3'
    },
    {
      label: 'S1',
      value: 'S1'
    },
    {
      label: 'S2',
      value: 'S2'
    },
    {
      label: 'S3',
      value: 'S3'
    },
    {
      label: 'Lainnya',
      value: 'Lainnya'
    }
  ]
}

const penghasilanOption = {
  values: [
    {
      label: '< 1 juta',
      value: '< 1 juta'
    },
    {
      label: '1–2 juta',
      value: '1–2 juta'
    },
    {
      label: '2–3 juta',
      value: '2–3 juta'
    },
    {
      label: '3–5 juta',
      value: '3–5 juta'
    },
    {
      label: '> 5 juta',
      value: '> 5 juta'
    },
    {
      label: 'Tidak berpenghasilan',
      value: 'Tidak berpenghasilan'
    }
  ]
}

const FormValidationBasic = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const santri = searchParams.get('santri')
  const callback = searchParams.get('callback')

  const dispatch = useAppDispatch()

  const store = useAppSelector(state => state.orang_tua_wali)
  const storeSantri = useAppSelector(state => state.santri)
  const storeAreas = useAppSelector(state => state.areas)

  interface FormData {
    nama_wali: string
    nik: string
    keterangan: string
    id_santri: {
      value: string
      label: string
    } | null
    province_id: {
      value: string
      label: string
    } | null
    city_id: {
      value: string
      label: string
    } | null
    district_id: {
      value: string
      label: string
    } | null
    sub_district_id: {
      value: string
      label: string
    } | null
    pendidikan: {
      value: string
      label: string
    } | null
    pekerjaan: {
      value: string
      label: string
    } | null
    penghasilan: {
      value: string
      label: string
    } | null
    hubungan: {
      value: string
      label: string
    } | null
  }

  const defaultValues = {
    nama_wali: '',
    nik: '',
    keterangan: '',
    id_santri: null,
    province_id: null,
    city_id: null,
    district_id: null,
    sub_district_id: null,
    pendidikan: null,
    pekerjaan: null,
    penghasilan: null,
    hubungan: null
  }

  const [state, setState] = useState<FormData>(defaultValues)
  const [idWali, setIdWali] = useState<string>('')

  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({ defaultValues })

  useEffect(() => {
    dispatch(fetchSantriAll({}))
    dispatch(fetchProvinces())

    if (id) {
      dispatch(fetchOrangTuaWaliById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          if (santri) {
            datas.id_santri = {
              label: santri
            }
          }

          if (datas.hubungan) {
            datas.hubungan = {
              value: datas.hubungan,
              label: datas.hubungan
            }
          }

          if (datas.pendidikan) {
            datas.pendidikan = {
              value: datas.pendidikan,
              label: datas.pendidikan
            }
          }

          if (datas.pekerjaan) {
            datas.pekerjaan = {
              value: datas.pekerjaan,
              label: datas.pekerjaan
            }
          }

          if (datas.penghasilan) {
            datas.penghasilan = {
              value: datas.penghasilan,
              label: datas.penghasilan
            }
          }

          if (datas.province) {
            datas.province_id = {
              value: datas.province?.id,
              label: datas.province?.name
            }
          }

          if (datas.city) {
            datas.city_id = {
              value: datas.city?.id,
              label: datas.city?.name
            }
          }

          if (datas.district) {
            datas.district_id = {
              value: datas.district?.id,
              label: datas.district?.name
            }
          }

          if (datas.sub_district) {
            datas.sub_district_id = {
              value: datas.sub_district?.id,
              label: datas.sub_district?.name
            }
          }

          setState(datas)
          reset(datas)
        }
      })
    }
  }, [dispatch, reset])

  useEffect(() => {
    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      onCancel()
    } else {
      toast.error('Error saved: ' + store.crud.message)

      setLoading(false)
    }
  }, [store])

  const onSubmit = () => {
    if (loading) return
    setLoading(true)

    if (id || idWali) {
      // update
      dispatch(
        postOrangTuaWaliUpdate({
          id: id || idWali,
          param: {
            ...state,
            pendidikan: state.pendidikan?.value,
            pekerjaan: state.pekerjaan?.value,
            penghasilan: state.penghasilan?.value,
            hubungan: state.hubungan?.value
          }
        })
      )
    } else {
      dispatch(
        postOrangTuaWali({
          ...state,
          pendidikan: state.pendidikan?.value,
          pekerjaan: state.pekerjaan?.value,
          penghasilan: state.penghasilan?.value,
          hubungan: state.hubungan?.value
        })
      )
    }
  }

  const onCancel = () => {
    dispatch(resetRedux())
    router.replace(callback ? callback : '/app/orang-tua-wali/list')
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_santri',
        label: 'Santri',
        placeholder: 'Pilih Santri',
        required: true,
        options: {
          values: storeSantri.datas.map(r => {
            return {
              label: r.fullname,
              value: r.id_santri,
              id_wali: r.id_wali
            }
          }),
          onChange: (e: any) => {
            if (!e?.id_wali) return
            dispatch(fetchOrangTuaWaliById(e.id_wali)).then(res => {
              const datas = { ...res?.payload?.data }

              if (datas) {
                setIdWali(e.id_wali)

                datas.id_santri = {
                  value: e.value,
                  label: e.label
                }

                if (datas.hubungan) {
                  datas.hubungan = {
                    value: datas.hubungan,
                    label: datas.hubungan
                  }
                }

                if (datas.pendidikan) {
                  datas.pendidikan = {
                    value: datas.pendidikan,
                    label: datas.pendidikan
                  }
                }

                if (datas.pekerjaan) {
                  datas.pekerjaan = {
                    value: datas.pekerjaan,
                    label: datas.pekerjaan
                  }
                }

                if (datas.penghasilan) {
                  datas.penghasilan = {
                    value: datas.penghasilan,
                    label: datas.penghasilan
                  }
                }

                if (datas.province) {
                  datas.province_id = {
                    value: datas.province?.id,
                    label: datas.province?.name
                  }
                }

                if (datas.city) {
                  datas.city_id = {
                    value: datas.city?.id,
                    label: datas.city?.name
                  }
                }

                if (datas.district) {
                  datas.district_id = {
                    value: datas.district?.id,
                    label: datas.district?.name
                  }
                }

                if (datas.sub_district) {
                  datas.sub_district_id = {
                    value: datas.sub_district?.id,
                    label: datas.sub_district?.name
                  }
                }

                setState(datas)
                reset(datas)
              }
            })
          }
        },
        readOnly: Boolean(view) || Boolean(id)
      }),
      field({
        type: 'text',
        key: 'nama_wali',
        label: 'Nama Wali',
        placeholder: 'Input Nama Wali',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'hubungan',
        label: 'Hubungan',
        placeholder: 'Pilih Hubungan',
        required: true,
        options: hubunganOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'text',
        key: 'nik',
        label: 'Nik',
        placeholder: 'Input Nik',
        required: false,
        readOnly: Boolean(view)
      }),
      field({
        type: 'text',
        key: 'no_hp',
        label: 'No. Hp',
        placeholder: 'Input No. Hp',
        required: false,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'pendidikan',
        label: 'Pendidikan',
        placeholder: 'Pilih Pendidikan',
        required: true,
        options: pendidikanOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'pekerjaan',
        label: 'Pekerjaan',
        placeholder: 'Pilih Pekerjaan',
        required: true,
        options: pekerjaanOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'penghasilan',
        label: 'Penghasilan',
        placeholder: 'Pilih Penghasilan',
        required: true,
        options: penghasilanOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'province_id',
        label: 'Provinsi',
        placeholder: 'Pilih Provinsi',
        required: true,
        options: {
          values: storeAreas.provinces.map(r => {
            return {
              label: r.name,
              value: r.id
            }
          }),
          onChange: (e: any) => {
            if (!e) return
            dispatch(fetchRegenciesByProvince(e.value))
            dispatch(clearRegencies())
            dispatch(clearDistricts())
            dispatch(clearSubDistricts())
            setValue('city_id', null)
            setValue('district_id', null)
            setValue('sub_district_id', null)
            setState(prevState => {
              return {
                ...prevState,
                city_id: null,
                district_id: null,
                sub_district_id: null
              }
            })
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'city_id',
        label: 'Kabupaten/Kota',
        placeholder: 'Pilih Kabupaten/Kota',
        required: true,
        options: {
          values: storeAreas.regencies.map(r => {
            return {
              label: r.name,
              value: r.id
            }
          }),
          onChange: (e: any) => {
            if (!e) return
            dispatch(fetchDistrictsByRegency(e.value))
            dispatch(clearDistricts())
            dispatch(clearSubDistricts())
            setValue('district_id', null)
            setValue('sub_district_id', null)
            setState(prevState => {
              return {
                ...prevState,
                district_id: null,
                sub_district_id: null
              }
            })
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'district_id',
        label: 'Kecamatan',
        placeholder: 'Pilih Kecamatan',
        required: true,
        options: {
          values: storeAreas.districts.map(r => {
            return {
              label: r.name,
              value: r.id
            }
          }),
          onChange: (e: any) => {
            if (!e) return
            dispatch(fetchSubDistrictsByDistrict(e.value))
            dispatch(clearSubDistricts())
            setValue('sub_district_id', null)
            setState(prevState => {
              return {
                ...prevState,
                sub_district_id: null
              }
            })
          }
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'sub_district_id',
        label: 'Kelurahan',
        placeholder: 'Pilih Kelurahan',
        required: true,
        options: {
          values: storeAreas.subdistricts.map(r => {
            return {
              label: r.name,
              value: r.id
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'textarea',
        key: 'alamat',
        label: 'Alamat',
        placeholder: 'Input Alamat',
        required: true,
        readOnly: Boolean(view)
      }),
      field({
        type: 'textarea',
        key: 'keterangan',
        label: 'Keterangan',
        placeholder: 'Input Keterangan',
        required: false,
        readOnly: Boolean(view)
      }),

      fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })
    ]
  }

  return (
    <Card>
      <CardHeader title='Form Orang Tua Wali' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          {formColumn({
            control: control,
            errors: errors,
            state: state,
            setState: setState,
            fields: fields()
          })}
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationBasic
