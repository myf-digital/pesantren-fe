import React, { useRef, useState } from 'react'
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { alpha } from '@mui/material/styles'

const getFileIcon = fileName => {
  if (!fileName) return 'tabler-file'
  const ext = String(fileName).toLowerCase().split('.').pop()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'tabler-file-image'
  if (ext === 'pdf') return 'tabler-file-type-pdf'
  if (['doc', 'docx'].includes(ext)) return 'tabler-file-word'
  if (['xls', 'xlsx'].includes(ext)) return 'tabler-file-spreadsheet'
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'tabler-file-zip'
  
  return 'tabler-file'
}

const getIconColor = fileName => {
  if (!fileName) return 'primary'
  const ext = String(fileName).toLowerCase().split('.').pop()
  if (ext === 'pdf') return 'error'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'success'
  if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) return 'info'
  
  return 'primary'
}

const isImageFile = fileName => {
  if (!fileName) return false
  const ext = String(fileName).toLowerCase().split('.').pop()
  
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
}

const FileUpload = props => {
  const { selected, handleChange, handleClear, url, accept, helperText, previewTitle, readOnly } = props
  const fileInputRef = useRef(null)
  const [openPdf, setOpenPdf] = useState(false)

  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      handleChange(file)
    }
  }

  const handleUrl = () => {
    if (url) {
      setOpenPdf(true)
    }
  }

  const onDragOver = e => {
    e.preventDefault()
  }

  const onDrop = e => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleChange(file)
    }
  }

  const fileName = typeof selected === 'string' ? selected.split('/').pop() : selected?.name || 'File'
  const fileIcon = getFileIcon(fileName)
  const themeColor = getIconColor(fileName)

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {selected ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: 'background.paper',
            gap: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: theme => alpha(theme.palette[themeColor]?.main || theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${themeColor}.main`,
                flexShrink: 0
              }}
            >
              <i className={fileIcon} style={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap>
                {fileName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                File
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            {url && (
              <IconButton size='small' color='primary' onClick={handleUrl} title='Lihat File'>
                <i className='tabler-eye' style={{ fontSize: 18 }} />
              </IconButton>
            )}
            {!readOnly && (
              <IconButton size='small' color='error' onClick={handleClear} title='Hapus File'>
                <i className='tabler-trash' style={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      ) : (
        readOnly ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 4,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'action.hover',
              justifyContent: 'center'
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Tidak ada file yang diunggah
            </Typography>
          </Box>
        ) : (
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'action.hover',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.selected'
              }
            }}
          >
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept || '*/*'}
              style={{ display: 'none' }}
            />
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                mb: 3
              }}
            >
              <i className='tabler-upload' style={{ fontSize: 24 }} />
            </Box>
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
              Klik untuk unggah atau seret berkas ke sini
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {helperText || 'Dukungan berkas umum'}
            </Typography>
          </Box>
        )
      )}

      <Dialog open={openPdf} onClose={() => setOpenPdf(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{previewTitle || 'Pratinjau Berkas'}</span>
          <IconButton onClick={() => setOpenPdf(false)}>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: isImageFile(fileName) ? 2 : 0, height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: isImageFile(fileName) ? 'action.hover' : 'inherit' }}>
          {url ? (
            isImageFile(fileName) ? (
              <img src={url} alt='Pratinjau' style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <iframe src={url} width='100%' height='100%' style={{ border: 'none' }} title='PDF Preview' />
            )
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPdf(false)} color='secondary' variant='tonal'>
            Tutup
          </Button>
          <Button
            onClick={() => window.open(url, '_blank')}
            color='primary'
            variant='contained'
            startIcon={<i className='tabler-external-link' />}
          >
            Buka di Tab Baru
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FileUpload
