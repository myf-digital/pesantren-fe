'use client'

import React from 'react'
import { Tooltip, Box, SxProps, Theme } from '@mui/material'
import { toast } from 'react-toastify'

interface CopyToClipboardTooltipProps {
  title: React.ReactNode // Elemen atau teks yang tampil di dalam tabel
  textToCopy: string // Teks murni yang akan disalin ke clipboard
  sx?: SxProps<Theme>
}

const CopyTooltip: React.FC<CopyToClipboardTooltipProps> = ({ title, textToCopy, sx }) => {
  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation() // Mencegah trigger click-row pada tabel
    if (!textToCopy) return

    navigator.clipboard.writeText(textToCopy)
    toast.success(`Berhasil menyalin: ${textToCopy}`)
  }

  return (
    <Box
      onClick={handleCopyText}
      sx={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        '&:hover': {
          color: 'primary.main',
          '& i': { color: 'primary.main' }
        },
        ...sx
      }}
    >
      {title}
      <Tooltip title={textToCopy} placement='top' arrow>
        <i className='tabler-copy' style={{ fontSize: '0.9rem', color: 'var(--mui-palette-text-disabled)' }} />
      </Tooltip>
    </Box>
  )
}

export default CopyTooltip
