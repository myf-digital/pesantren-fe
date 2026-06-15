import { useEffect, useRef, useState } from 'react'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

const InputImage = props => {
  const { data, selected, gridProps, handleChange, className, color = 'primary' } = props

  const { alt, img, value } = data

  const [file, setFile] = useState(null)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [openSourceDialog, setOpenSourceDialog] = useState(false)
  const [openCameraDialog, setOpenCameraDialog] = useState(false)

  const hiddenFileInput = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    setCameraSupported(!!navigator.mediaDevices?.getUserMedia)
  }, [])

  useEffect(() => {
    if (data.img && data.img.includes('placehold')) {
      setFile(null)
    }
  }, [data.img])

  const getBase64 = file => {
    return new Promise(resolve => {
      const reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = () => {
        resolve(reader.result)
      }
    })
  }

  const handleBrowseFile = () => {
    setOpenSourceDialog(false)
    hiddenFileInput.current?.click()
  }

  const handleFileChange = async event => {
    const fileUploaded = event.target.files?.[0]

    if (!fileUploaded) return

    setFile(fileUploaded)

    const base64 = await getBase64(fileUploaded)

    handleChange(base64)

    event.target.value = ''
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      })

      streamRef.current = stream

      setOpenSourceDialog(false)
      setOpenCameraDialog(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (error) {
      console.error(error)
      alert('Tidak dapat mengakses kamera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const closeCameraDialog = () => {
    stopCamera()
    setOpenCameraDialog(false)
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      async blob => {
        if (!blob) return

        const photoFile = new File(
          [blob],

          `camera-${Date.now()}.jpg`,

          {
            type: 'image/jpeg'
          }
        )

        // agar preview sama seperti upload file

        setFile(photoFile)

        // jika handleChange masih membutuhkan base64

        const base64 = await getBase64(photoFile)

        handleChange(base64)

        closeCameraDialog()
      },

      'image/jpeg',

      0.9
    )
  }

  const renderPreview = () => {
    if (file) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )
    }

    return (
      <img
        src={img}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    )
  }

  if (!data) return null

  return (
    <>
      <Grid item {...gridProps} className={className}>
        <Box
          onClick={() => setOpenSourceDialog(true)}
          sx={{
            height: '100%',
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: 1,
            position: 'relative',
            border: theme => `2px solid ${theme.palette.divider}`,
            ...(selected?.includes?.(value)
              ? {
                  borderColor: `${color}.main`
                }
              : {})
          }}
        >
          {renderPreview()}
        </Box>

        <input
          ref={hiddenFileInput}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Grid>

      {/* Dialog Pilih Sumber */}
      <Dialog open={openSourceDialog} onClose={() => setOpenSourceDialog(false)}>
        <DialogTitle>Pilih Gambar</DialogTitle>

        <DialogActions
          sx={{
            p: 3,
            justifyContent: 'center'
          }}
        >
          {cameraSupported && (
            <Button variant='outlined' onClick={startCamera}>
              <i className='tabler-camera' /> Kamera
            </Button>
          )}

          <Button variant='outlined' onClick={handleBrowseFile}>
            <i className='tabler-polaroid' /> Browse File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Kamera */}
      <Dialog open={openCameraDialog} onClose={closeCameraDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Ambil Foto</DialogTitle>

        <DialogContent>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              borderRadius: 8
            }}
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeCameraDialog}>Batal</Button>

          <Button variant='contained' onClick={takePhoto}>
            Ambil Foto
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InputImage
