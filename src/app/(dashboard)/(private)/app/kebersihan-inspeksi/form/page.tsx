'use client'

// ** React Imports
import React, { useCallback, useEffect, useState, useRef, Fragment } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'

// ** Third Party Imports
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

// ** Styled Component
import { formatDate } from 'date-fns/format'
import { getDay } from 'date-fns'

import { Button } from '@mui/material'

import { useSession } from 'next-auth/react'

import DatePickerWrapper from '@core/styles/libs/react-datepicker'

import { useAppDispatch, useAppSelector } from '@/redux-store/hook'
import {
  fetchKebersihanInspeksiById,
  postKebersihanInspeksi,
  postKebersihanInspeksiUpdate,
  locationQrCodeKebersihanInspeksi,
  locationLatLongKebersihanInspeksi,
  resetRedux
} from '../slice/index'
import { field, fieldBuildSubmit, formColumn, formSingleColumn } from '@views/onevour/form/AppFormBuilder'
import { fetchCabangAll } from '../../cabang/slice'
import { fetchPegawaiAll } from '../../guru-mata-pelajaran/slice'
import { fetchLocationAll } from '../../location/slice'
import { fetchJadwalInspeksiKebersihanAll } from '../../jadwal-inspeksi-kebersihan/slice'
import { fetchMasterSlotWaktuAll } from '../../master-slot-waktu/slice'
import TemuanItemForm from '../../../../../../views/onevour/components/temuan-item-form'
import QRScanner from '@/views/onevour/components/qr-scanner'
import DetectLocation from '@/views/onevour/components/detect-location'
import { postKebersihanScanLog } from '../../kebersihan-scan-log/slice'
import DialogLoading from '@/views/onevour/components/dialog-loading'

const statusOption = {
  values: [
    {
      label: 'BERSIH',
      value: 'BERSIH'
    },
    {
      label: 'KOTOR',
      value: 'KOTOR'
    },
    {
      label: 'RUSAK',
      value: 'RUSAK'
    }
  ]
}

const timeToDate = (time: any) => {
  if (!time) return null

  const [hour, minute] = time.split(':').map(Number)

  const date = new Date()

  date.setHours(hour, minute, 0, 0)

  return date
}

const haris = [
  {
    label: 'Senin',
    value: 1
  },
  {
    label: 'Selasa',
    value: 2
  },
  {
    label: 'Rabu',
    value: 3
  },
  {
    label: 'Kamis',
    value: 4
  },
  {
    label: 'Jumat',
    value: 5
  },
  {
    label: 'Sabtu',
    value: 6
  },
  {
    label: 'Ahad',
    value: 7
  }
]

const FormValidationBasic = () => {
  const router = useRouter()

  const { data: session } = useSession()
  const currentUser: any = session?.userdata

  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const view = searchParams.get('view')
  const qrcode = searchParams.get('qrcode')

  const dispatch = useAppDispatch()
  const store = useAppSelector(state => state.kebersihan_inspeksi)
  const storeCabang = useAppSelector(state => state.cabang)
  const storeLokasi = useAppSelector(state => state.location)
  const storePegawai = useAppSelector(state => state.guru_mata_pelajaran)
  const storeJadwal = useAppSelector(state => state.jadwal_inspeksi_kebersihan)
  const storeSlot = useAppSelector(state => state.master_slot_waktu)

  interface FormData {
    id_cabang: {
      value: string
      label: string
    } | null
    id_petugas: {
      value: string
      label: string
    } | null
    id_lokasi: {
      value: string
      label: string
    } | null
    id_jadwal: {
      value: string
      label: string
    } | null
    tanggal: Date
    waktu: Date
    kode_slot: {
      value: string
      label: string
    } | null
    catatan_umum: string
    status_kondisi: {
      value: string
      label: string
    } | null
    temuans: any[]
    latitude: number
    longitude: number
    qr_code: string
    scan_type: string
    distance: number
  }

  const defaultValues = {
    id_cabang: null,
    id_petugas: null,
    id_lokasi: {
      label: '',
      value: ''
    },
    id_jadwal: null,
    tanggal: new Date(),
    waktu: new Date(),
    kode_slot: null,
    catatan_umum: '',
    status_kondisi: null,
    temuans: [],
    latitude: 0,
    longitude: 0,
    qr_code: '',
    scan_type: '',
    distance: 0
  }

  interface FormItemData {
    values: any[]
    element_total: number
  }

  const [state, setState] = useState<FormData>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<FormItemData>({ values: [], element_total: 0 })
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [errorQrScanner, setErrorQrScanner] = useState(false)
  const [foundLocationQrCode, setFoundLocationQrCode] = useState(false)
  const [foundLocation, setFoundLocation] = useState(false)
  const [showGps, setShowGps] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showOption, setShowOption] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const qrCode = useRef(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const onCancel = useCallback(() => {
    dispatch(resetRedux())
    router.replace('/app/kebersihan-inspeksi/list')
  }, [dispatch, router])

  useEffect(() => {
    return () => {
      dispatch(resetRedux())
      setShowQrScanner(false)
      setErrorQrScanner(false)
      setShowOption(false)
      setFoundLocationQrCode(false)
      setFoundLocation(false)
      setShowManual(false)
    }
  }, [dispatch])

  useEffect(() => {
    startGps()

    dispatch(fetchPegawaiAll({}))

    dispatch(fetchCabangAll({}))

    dispatch(fetchLocationAll({}))

    dispatch(fetchMasterSlotWaktuAll({ is_active: true }))

    if (id) {
      setShowForm(true)

      dispatch(fetchKebersihanInspeksiById(id)).then(res => {
        const datas = { ...res?.payload?.data }

        if (datas) {
          datas.status_kondisi = statusOption.values.find(r => r.value === datas.status_kondisi)
          datas.kode_slot = {
            value: datas.kode_slot,
            label: datas.kode_slot
          }
          datas.waktu = datas.waktu ? timeToDate(datas.waktu) : null
          datas.id_cabang = {
            value: datas.cabang?.id_cabang,
            label: datas.cabang?.nama_cabang
          }
          datas.id_lokasi = {
            value: datas.lokasi?.id_lokasi,
            label: datas.lokasi?.nama_lokasi
          }
          datas.id_petugas = {
            value: datas.pegawai?.id_pegawai,
            label: datas.pegawai?.nama_lengkap
          }

          if (datas.jadwal_inspeksi_kebersihan) {
            datas.id_jadwal = {
              value: datas.jadwal_inspeksi_kebersihan?.id_jadwal,
              label: `${haris.find(d => d.value === datas.jadwal_inspeksi_kebersihan?.hari)?.label?.toUpperCase()} ${datas.jadwal_inspeksi_kebersihan?.kode_slot}`
            }
          }

          setItem({
            values: datas.temuans,
            element_total: datas.temuans.length
          })

          // get jadwal sesuai petugas
          dispatch(fetchJadwalInspeksiKebersihanAll({ is_active: 'true', id_petugas: datas.id_petugas.value }))

          setState(datas)
          reset(datas)
        }
      })
    } else {
      if (qrcode) {
        setShowOption(false)
        handleScan(qrcode)
      } else {
        setShowOption(true)
      }
    }
  }, [dispatch, id, reset])

  useEffect(() => {
    if (store.location_qrcode) {
      if (store.location_qrcode.data) {
        setFoundLocationQrCode(true)
        setShowQrScanner(false)
        setValue('id_lokasi', {
          value: store.location_qrcode.data.id_lokasi,
          label: `${store.location_qrcode.data.parent ? `${store.location_qrcode.data.parent.nama_lokasi} / ` : ''}${store.location_qrcode.data.nama_lokasi}`
        })
        setState(prevState => {
          return {
            ...prevState,
            id_lokasi: {
              value: store.location_qrcode.data.id_lokasi,
              label: `${store.location_qrcode.data.parent ? `${store.location_qrcode.data.parent.nama_lokasi} / ` : ''}${store.location_qrcode.data.nama_lokasi}`
            }
          }
        })
      } else {
        qrCode.current = null
        setShowQrScanner(false)
        setErrorQrScanner(true)
      }
    }

    if (!store.crud) return

    if (store.crud.status) {
      toast.success('Success saved')
      onCancel()
    } else {
      toast.error('Error saved: ' + store.crud.message)

      setLoading(false)
    }
  }, [onCancel, store])

  useEffect(() => {
    if (storeCabang.datas.length > 0 && !Boolean(id)) {
      if (currentUser?.pegawai) {
        const findCabang = storeCabang.datas.find(
          cabang => cabang.id_cabang === currentUser?.pegawai?.organizationUnit?.cabang?.id_cabang
        )

        if (findCabang) {
          setValue('id_cabang', {
            value: findCabang.id_cabang,
            label: findCabang.nama_cabang
          } as any)
          setState(prevState => {
            return {
              ...prevState,
              id_cabang: {
                value: findCabang.id_cabang,
                label: findCabang.nama_cabang
              }
            }
          })
        }
      }
    }
  }, [storeCabang.datas])

  useEffect(() => {
    if (storePegawai.pegawai.length > 0 && !Boolean(id)) {
      if (currentUser?.pegawai) {
        const findPegawai = storePegawai.pegawai.find(
          pegawai => pegawai.id_pegawai === currentUser?.pegawai?.id_pegawai
        )

        if (findPegawai) {
          handleJadwal({
            value: findPegawai.id_pegawai,
            label: findPegawai.nama_lengkap
          })
          setValue('id_petugas', {
            value: findPegawai.id_pegawai,
            label: findPegawai.nama_lengkap
          } as any)
          setState(prevState => {
            return {
              ...prevState,
              id_petugas: {
                value: findPegawai.id_pegawai,
                label: findPegawai.nama_lengkap
              }
            }
          })
        }
      }
    }
  }, [storePegawai.pegawai])

  useEffect(() => {
    if (storeSlot.datas.length > 0 && !Boolean(id)) {
      const timeNow = formatDate(state.waktu, 'HH:mm')

      const findSlot = storeSlot.datas.find(slot => timeNow >= slot.jam_mulai && timeNow < slot.jam_selesai)

      if (findSlot) {
        setValue('kode_slot', {
          value: findSlot.kode_slot,
          label: findSlot.kode_slot
        } as any)
        setState(prevState => {
          return {
            ...prevState,
            kode_slot: {
              value: findSlot.kode_slot,
              label: findSlot.kode_slot
            }
          }
        })
      }
    }
  }, [storeSlot.datas])

  const onSubmit = () => {
    if (loading) return

    setLoading(true)

    if (id) {
      // update
      dispatch(
        postKebersihanInspeksiUpdate({
          id: id,
          params: {
            ...state,
            status_kondisi: state.status_kondisi?.value,
            kode_slot: state.kode_slot?.value,
            waktu: formatDate(state.waktu, 'HH:mm'),
            temuans: item.values.map(r => {
              return {
                kategori: r.kategori,
                tingkat: r.tingkat?.value ?? r.tingkat,
                perlu_tindak_lanjut: r.perlu_tindak_lanjut,
                deskripsi: r.deskripsi,
                foto_path: r.foto_path,
                foto_path_tindakan: r.foto_path_tindakan,
                status: r.status
              }
            })
          }
        })
      )
    } else {
      dispatch(
        postKebersihanInspeksi({
          ...state,
          status_kondisi: state.status_kondisi?.value,
          kode_slot: state.kode_slot?.value,
          waktu: formatDate(state.waktu, 'HH:mm'),
          temuans: item.values.map(r => {
            return {
              kategori: r.kategori,
              tingkat: r.tingkat?.value ?? r.tingkat,
              perlu_tindak_lanjut: r.perlu_tindak_lanjut,
              deskripsi: r.deskripsi,
              foto_path: r.foto_path,
              foto_path_tindakan: r.foto_path_tindakan,
              status: r.status
            }
          })
        })
      ).then(res => {
        const result = { ...res?.payload }

        if (result?.status) {
          dispatch(
            postKebersihanScanLog({
              id_inspeksi: {
                value: result.data?.id_inspeksi
              },
              id_lokasi: state.id_lokasi,
              id_petugas: state.id_petugas,
              qr_code: state.qr_code,
              scan_latitude: state.latitude,
              scan_longitude: state.longitude,
              jarak_meter: state.distance,
              valid_qr: state.scan_type === 'QR',
              valid_geo: state.scan_type === 'GPS',
              metode_scan: state.scan_type,
              scan_source: isPWA() ? 'PWA' : 'WEB',
              keterangan: 'Inspeksi'
            })
          )
        }
      })
    }
  }

  const handleJadwal = (e: any) => {
    if (!e) return
    setValue('id_jadwal', null)
    setState(prevState => ({
      ...prevState,
      id_jadwal: null
    }))
    dispatch(fetchJadwalInspeksiKebersihanAll({ is_active: 'true', id_petugas: e.value })).then(res => {
      const {
        payload: { data }
      } = res

      if (data && data.length > 0) {
        const day = getDay(state.tanggal) != 0 ? getDay(state.tanggal) : 7
        const timeNow = formatDate(state.waktu, 'HH:mm')

        const findSlot = data.find(
          (slot: any) =>
            day == slot?.hari &&
            timeNow >= slot?.master_slot_waktu?.jam_mulai &&
            timeNow < slot?.master_slot_waktu?.jam_selesai
        )

        if (findSlot) {
          setValue('id_jadwal', {
            value: findSlot.id_jadwal,
            label: `${haris.find(d => d.value === findSlot.hari)?.label?.toUpperCase()} ${findSlot.kode_slot}`
          } as any)
          setState(prevState => {
            return {
              ...prevState,
              id_jadwal: {
                value: findSlot.id_jadwal,
                label: `${haris.find(d => d.value === findSlot.hari)?.label?.toUpperCase()} ${findSlot.kode_slot}`
              }
            }
          })
        }
      }
    })
  }

  const fields = () => {
    return [
      field({
        type: 'select',
        key: 'id_cabang',
        label: 'Cabang',
        placeholder: 'Pilih Cabang',
        required: true,
        options: {
          values: storeCabang.datas.map(r => {
            return {
              label: r.nama_cabang,
              value: r.id_cabang
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_lokasi',
        label: 'Lokasi',
        placeholder: 'Pilih Lokasi',
        required: true,
        options: {
          values: storeLokasi.datas.map(r => {
            return {
              label: `${r.parent ? `${r.parent.nama_lokasi} / ` : ''}${r.nama_lokasi}`,
              value: r.id_lokasi
            }
          })
        },
        readOnly: Boolean(view) || foundLocationQrCode || foundLocation || Boolean(id)
      }),
      field({
        type: 'select',
        key: 'id_petugas',
        label: 'Petugas',
        placeholder: 'Pilih Petugas',
        required: true,
        options: {
          values: storePegawai.pegawai.map(r => {
            return {
              label: r.nama_lengkap,
              value: r.id_pegawai
            }
          }),
          onChange: handleJadwal
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'id_jadwal',
        label: 'Jadwal',
        placeholder: 'Pilih Jadwal',
        required: false,
        options: {
          values: storeJadwal.datas.map(r => {
            return {
              label: `${haris.find(d => d.value === r.hari)?.label?.toUpperCase()} ${r.kode_slot}`,
              value: r.id_jadwal
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({
        type: 'select',
        key: 'kode_slot',
        label: 'Slot',
        placeholder: 'Pilih Slot',
        required: true,
        options: {
          values: storeSlot.datas.map(r => {
            return {
              label: r.kode_slot,
              value: r.kode_slot
            }
          })
        },
        readOnly: Boolean(view)
      }),
      field({ type: 'date', key: 'tanggal', label: 'Tanggal', required: true, readOnly: true }),
      field({ type: 'time', key: 'waktu', label: 'Waktu', required: true, readOnly: true }),
      field({
        type: 'select',
        key: 'status_kondisi',
        label: 'Status Kondisi',
        placeholder: 'Pilih Status Kondisi',
        required: true,
        options: statusOption,
        readOnly: Boolean(view)
      }),
      field({
        type: 'textarea',
        key: 'catatan_umum',
        label: 'Catatan Umum',
        placeholder: 'Input Catatan Umum',
        required: false,
        readOnly: Boolean(view)
      })
    ]
  }

  const onAddTemuanDetail = (row: any) => {
    let values = [...item.values]

    if (row.edit) {
      values = values.filter(r => r.temuan_id !== row.temuan_id)
      values.push(row)
      setItem({
        values: values,
        element_total: values.length
      })
    } else {
      values.push(row)
      setItem({
        values: values,
        element_total: values.length
      })
    }
  }

  const onDeleteTemuanDetail = (id: string) => {
    const values = [...item.values]

    const index = values.findIndex(o => {
      return o.id === id
    })

    values.splice(index, 1)
    setItem({
      values: values,
      element_total: values.length
    })
  }

  const handleScan = (data: any) => {
    if (qrCode.current === data) return
    qrCode.current = data
    dispatch(
      locationQrCodeKebersihanInspeksi({
        qr_code: data
      })
    ).then(res => {
      const result = { ...res?.payload }

      if (result?.status) {
        dispatch(
          postKebersihanScanLog({
            qr_code: state.qr_code,
            scan_latitude: state.latitude,
            scan_longitude: state.longitude,
            valid_qr: true,
            metode_scan: 'QR',
            scan_source: isPWA() ? 'PWA' : 'WEB',
            keterangan: 'QR Code dikenali'
          })
        )
      } else {
        dispatch(
          postKebersihanScanLog({
            qr_code: state.qr_code,
            scan_latitude: state.latitude,
            scan_longitude: state.longitude,
            valid_qr: false,
            metode_scan: 'QR',
            scan_source: isPWA() ? 'PWA' : 'WEB',
            keterangan: 'QR Code tidak terdaftar'
          })
        )
      }
    })
    setState(prevState => {
      return {
        ...prevState,
        qr_code: data
      }
    })
  }

  const handleLocation = (data: any) => {
    dispatch(locationLatLongKebersihanInspeksi({ latitude: data.lat, longitude: data.lng })).then(res => {
      const result = { ...res?.payload }

      if (result?.data.length > 0) {
        dispatch(
          postKebersihanScanLog({
            id_lokasi: {
              value: result.data[0].id_lokasi
            },
            scan_latitude: state.latitude,
            scan_longitude: state.longitude,
            jarak_meter: result.data[0].distance,
            valid_geo: true,
            metode_scan: 'GPS',
            scan_source: isPWA() ? 'PWA' : 'WEB',
            keterangan: 'Lokasi di temukan'
          })
        )
        setState(prevState => {
          return {
            ...prevState,
            distance: result.data[0].distance
          }
        })
      } else {
        dispatch(
          postKebersihanScanLog({
            scan_latitude: state.latitude,
            scan_longitude: state.longitude,
            valid_geo: false,
            metode_scan: 'GPS',
            scan_source: isPWA() ? 'PWA' : 'WEB',
            keterangan: 'Lokasi tidak ditemukan'
          })
        )
      }
    })
  }

  const handleSelectLocation = (data: any) => {
    setFoundLocation(true)
    setShowForm(true)
    setShowGps(false)
    setValue('id_lokasi', data)
    setState(prevState => {
      return {
        ...prevState,
        id_lokasi: data
      }
    })
  }

  const handleBack = () => {
    setShowOption(true)
    setShowQrScanner(false)
    setShowGps(false)
    setShowManual(false)
  }

  const startGps = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser')

      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setState(prevState => {
          return {
            ...prevState,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        })
      },
      err => {
        console.log(err.message)
      }
    )
  }

  const isPWA = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    )
  }

  return (
    <DatePickerWrapper>
      <DialogLoading open={store.loading} loadingProgress={store.loadingProgress} />
      <Card>
        {showForm && <CardHeader title='Form Kebersihan Inspeksi' />}
        <CardContent>
          {!showForm && showOption && (
            <Grid container spacing={6} sx={{ marginBottom: 5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size='small'>
                  {formSingleColumn({
                    control: control,
                    errors: errors,
                    state: state,
                    setState: setState,
                    field: field({
                      type: 'button',
                      key: 'qr',
                      label: 'Scan QR Inspeksi',
                      placeholder: 'Scan QR Inspeksi',
                      options: {
                        onClick: (e: any) => {
                          setShowGps(false)
                          setShowQrScanner(true)
                          setShowOption(false)
                          setState(prevState => {
                            return {
                              ...prevState,
                              scan_type: 'QR'
                            }
                          })
                        }
                      }
                    })
                  })}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size='small'>
                  {formSingleColumn({
                    control: control,
                    errors: errors,
                    state: state,
                    setState: setState,
                    field: field({
                      type: 'button',
                      key: 'gps',
                      label: 'Deteksi GPS',
                      placeholder: 'Deteksi GPS',
                      options: {
                        onClick: (e: any) => {
                          setShowQrScanner(false)
                          setShowGps(true)
                          setShowOption(false)
                          setState(prevState => {
                            return {
                              ...prevState,
                              scan_type: 'GPS'
                            }
                          })
                        }
                      }
                    })
                  })}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size='small'>
                  {formSingleColumn({
                    control: control,
                    errors: errors,
                    state: state,
                    setState: setState,
                    field: field({
                      type: 'button',
                      key: 'manual',
                      label: 'Manual',
                      placeholder: 'Manual',
                      options: {
                        onClick: (e: any) => {
                          setShowGps(false)
                          setShowQrScanner(false)
                          setShowOption(false)
                          setShowManual(true)
                          setState(prevState => {
                            return {
                              ...prevState,
                              scan_type: 'MANUAL'
                            }
                          })
                        }
                      }
                    })
                  })}
                </FormControl>
              </Grid>
            </Grid>
          )}
          {showForm ? (
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              {formColumn({
                control: control,
                errors: errors,
                state: state,
                setState: setState,
                fields: fields()
              })}
              <TemuanItemForm
                temuanDetailsSelected={item.values}
                onAddTemuanDetail={onAddTemuanDetail}
                onDeleteTemuanDetail={onDeleteTemuanDetail}
              />
              {formColumn({
                control: control,
                errors: errors,
                state: state,
                setState: setState,
                fields: [fieldBuildSubmit({ onCancel: onCancel, loading: loading, disabled: Boolean(view) })]
              })}
            </form>
          ) : (
            <Grid container spacing={0}>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                {showQrScanner && (
                  <Fragment>
                    <h4 className='mb-3'>Arahkan Camera ke QR Code Lokasi</h4>
                    <QRScanner result={handleScan} active={showQrScanner} />
                    <Button size='small' variant='outlined' color='primary' className='mt-3' onClick={handleBack}>
                      Kembali
                    </Button>
                  </Fragment>
                )}
                {errorQrScanner && (
                  <Fragment>
                    <h4 className='mb-3 mt-3'>QR Code tidak terdaftar</h4>
                    <Button
                      size='small'
                      variant='outlined'
                      color='primary'
                      className='mt-3'
                      onClick={() => {
                        setErrorQrScanner(false)
                        setShowQrScanner(true)
                        dispatch(resetRedux())
                      }}
                    >
                      Ulangi Scan
                    </Button>
                  </Fragment>
                )}
                {foundLocationQrCode && (
                  <Fragment>
                    <h4 className='mb-3 mt-3'>QR Code dikenali</h4>
                    <h4 className='mb-3 mt-3'>
                      Lokasi :{' '}
                      {store.location_qrcode?.data?.parent
                        ? `${store.location_qrcode?.data?.parent.nama_lokasi} / `
                        : ''}
                      {store.location_qrcode?.data?.nama_lokasi}
                    </h4>
                    <Button
                      size='small'
                      variant='outlined'
                      color='primary'
                      className='mt-3'
                      onClick={() => {
                        setShowForm(true)
                      }}
                    >
                      Lanjut Inspeksi
                    </Button>
                  </Fragment>
                )}
              </Grid>
              <Grid size={12}>
                <DetectLocation
                  result={handleLocation}
                  active={showGps}
                  locations={store.location_latlong}
                  selected={handleSelectLocation}
                  back={handleBack}
                />
                {showManual && (
                  <Fragment>
                    <FormControl fullWidth size='small'>
                      {formSingleColumn({
                        control: control,
                        errors: errors,
                        state: state,
                        setState: setState,
                        field: field({
                          type: 'select',
                          key: 'id_lokasi',
                          label: 'Lokasi',
                          placeholder: 'Input Lokasi',
                          required: true,
                          options: {
                            values: storeLokasi.datas.map(r => {
                              return {
                                label: `${r.parent ? `${r.parent.nama_lokasi} / ` : ''}${r.nama_lokasi}`,
                                value: r.id_lokasi
                              }
                            })
                          }
                        })
                      })}
                    </FormControl>
                    <div className='flex justify-between'>
                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        className='mt-3'
                        onClick={() => {
                          if (state.id_lokasi?.value) {
                            setShowForm(true)
                            setFoundLocation(true)
                            dispatch(
                              postKebersihanScanLog({
                                id_lokasi: {
                                  value: state.id_lokasi?.value
                                },
                                scan_latitude: state.latitude,
                                scan_longitude: state.longitude,
                                metode_scan: 'MANUAL',
                                scan_source: isPWA() ? 'PWA' : 'WEB',
                                keterangan: 'Manual'
                              })
                            )
                          } else {
                            toast.error('Pilih Lokasi terlebih dahulu')
                          }
                        }}
                      >
                        Lanjut Inspeksi
                      </Button>
                      <Button size='small' variant='outlined' color='primary' className='mt-3' onClick={handleBack}>
                        Kembali
                      </Button>
                    </div>
                  </Fragment>
                )}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </DatePickerWrapper>
  )
}

export default FormValidationBasic
