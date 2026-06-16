'use client'

import React from 'react'
import { Tooltip, Box } from '@mui/material'
import { toast } from 'react-toastify'

interface CopyToClipboardTooltipProps {
  title: React.ReactNode // Elemen atau teks yang tampil di dalam tabel
  textToCopy: string // Teks murni yang akan disalin ke clipboard
}

const CopyTooltip: React.FC<CopyToClipboardTooltipProps> = ({ title, textToCopy }) => {
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
        }
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
