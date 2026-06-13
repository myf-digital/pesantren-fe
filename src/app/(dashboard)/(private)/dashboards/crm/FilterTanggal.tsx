'use client'

import { forwardRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TextField from '@mui/material/TextField'
import { format } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

export default function FilterTanggal({ currentTanggal }: { currentTanggal: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialDate = currentTanggal ? new Date(currentTanggal) : new Date()
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const params = new URLSearchParams(searchParams.toString())
      params.set('tanggal', formattedDate)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <AppReactDatepicker
      selected={selectedDate}
      onChange={handleDateChange}
      placeholderText='Pilih Tanggal'
      showMonthDropdown
      showYearDropdown
      scrollableYearDropdown
      dropdownMode='select'
      customInput={<PickersComponent label='Tanggal' />}
    />
  )
}
