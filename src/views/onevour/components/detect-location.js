import { Fragment, useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'

import { useForm } from 'react-hook-form'

import { Button, Typography } from '@mui/material'

import { field, formSingleColumn } from '../form/AppFormBuilder'

export default function GetLocation({ result, active, locations, selected, back }) {
  const defaultValues = {
    latitude: null,
    longitude: null
  }

  const [state, setState] = useState(defaultValues)
  const [error, setError] = useState(null)
  const [jarak, setJarak] = useState('-')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({ defaultValues })

  useEffect(() => {
    setError(null)

    if (active) {
      startGps()
    }

    return () => {
      setError(null)
    }
  }, [active])

  useEffect(() => {
    if (locations.length > 0) {
      setValue('location', {
        label: `${locations[0].nama_lokasi_parent ? `${locations[0].nama_lokasi_parent} / ` : ''}${locations[0].nama_lokasi}`,
        value: locations[0].id_lokasi
      })
      setState(prevState => {
        return {
          ...prevState,
          location: {
            label: `${locations[0].nama_lokasi_parent ? `${locations[0].nama_lokasi_parent} / ` : ''}${locations[0].nama_lokasi}`,
            value: locations[0].id_lokasi
          }
        }
      })
      setJarak(locations[0].distance?.toFixed(2))
      setError(null)
    } else {
      setError('Di luar area lokasi')
    }
  }, [locations])

  const startGps = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')

      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        result({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setState(prevState => {
          return {
            ...prevState,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        })
      },
      err => {
        setError(err.message)
      }
    )
  }

  return (
    <Grid container spacing={2}>
      {active && (
        <Fragment>
          <Grid size={12}>
            <h4>Lokasi Anda :</h4>
            <h4>Lat : {state?.latitude}</h4>
            <h4>Lng : {state?.longitude}</h4>
            <h4 className='mt-1'>Radius Valid : 50 m</h4>
            <h4>Jarak Anda : {jarak} m</h4>
          </Grid>
          <Grid size={12}>
            {formSingleColumn({
              control: control,
              errors: errors,
              state: state,
              setState: setState,
              field: field({
                type: 'select',
                key: 'location',
                label: 'Lokasi',
                placeholder: 'Input Lokasi',
                required: true,
                options: {
                  values: locations.map(r => {
                    return {
                      label: `${r.nama_lokasi_parent ? `${r.nama_lokasi_parent} / ` : ''}${r.nama_lokasi}`,
                      value: r.id_lokasi
                    }
                  })
                }
              })
            })}
          </Grid>
          <Grid size={12}>
            {error && (
              <Fragment>
                <h4 className='mb-3'>{error}</h4>
                <Typography variant='body2' color='text.secondary'>
                  Alasan: Di luar radius toleransi, Lokasi tidak akurat? Hubungi Admin.
                </Typography>
              </Fragment>
            )}
          </Grid>
          <Grid size={12} className='flex justify-between'>
            {error ? (
              <Button
                size='small'
                variant='outlined'
                color='primary'
                onClick={() => {
                  startGps()
                }}
              >
                Re-Scan Lokasi
              </Button>
            ) : (
              <Button
                size='small'
                variant='outlined'
                color='primary'
                onClick={() => {
                  selected(state.location)
                }}
              >
                Lanjut Inspeksi
              </Button>
            )}
            <Button
              size='small'
              variant='outlined'
              color='primary'
              onClick={() => {
                back()
              }}
            >
              Kembali
            </Button>
          </Grid>
        </Fragment>
      )}
    </Grid>
  )
}
