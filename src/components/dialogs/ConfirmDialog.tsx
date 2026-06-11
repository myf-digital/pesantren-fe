import { createPortal } from 'react-dom'
import React from 'react'

type ConfirmInput = {
  name: string
  label?: string
  type?: 'text' | 'number' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  inputs?: ConfirmInput[]
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  open,
  title = 'Konfirmasi',
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmVariant = 'primary',
  inputs,
  onClose,
  onConfirm
}: ConfirmDialogProps) => {
  if (!open) return null

  const confirmClass = confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'

  // handle confirm, cek required
  const handleConfirm = () => {
    if (inputs?.some(input => input.required && !input.value.trim())) {
      alert('Harap isi semua field yang wajib diisi.')
      return
    }
    onConfirm()
    onClose()
  }

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-sm rounded-lg bg-white p-5 shadow-lg'>
        {/* Title */}
        <h3 className='font-semibold mb-2'>{title}</h3>

        {/* Description */}
        {description && <div className='text-sm text-gray-600 mb-4'>{description}</div>}

        {/* Inputs */}
        {inputs?.length ? (
          <div className='flex flex-col gap-3 mb-4'>
            {inputs.map(input => (
              <div key={input.name} className='flex flex-col gap-1'>
                {input.label && (
                  <label className='text-xs text-gray-600'>
                    {input.label} {input.required && <span className='text-red-500'>*</span>}
                  </label>
                )}
                <input
                  type={input.type || 'text'}
                  value={input.value}
                  placeholder={input.placeholder}
                  onChange={e => input.onChange(e.target.value)}
                  className='w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Buttons */}
        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50'>
            {cancelText}
          </button>

          <button onClick={handleConfirm} className={`px-3 py-1.5 text-sm rounded-md text-white ${confirmClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
