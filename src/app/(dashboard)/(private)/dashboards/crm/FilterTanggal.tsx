'use client'

import { forwardRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TextField from '@mui/material/TextField'
import { format } from 'date-fns'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const PickersComponent = forwardRef(({ ...props }: any, ref) => {
  return <TextField inputRef={ref} fullWidth size='small' {...props} />
})

export default function FilterTanggal({
  tanggalMulai,
  tanggalSelesai
}: {
  tanggalMulai: string
  tanggalSelesai: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState<Date | null>(tanggalMulai ? new Date(tanggalMulai) : null)
  const [endDate, setEndDate] = useState<Date | null>(tanggalSelesai ? new Date(tanggalSelesai) : null)

  useEffect(() => {
    setStartDate(tanggalMulai ? new Date(tanggalMulai) : null)
    setEndDate(tanggalSelesai ? new Date(tanggalSelesai) : null)
  }, [tanggalMulai, tanggalSelesai])

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)

    if (start && end) {
      const formattedStart = format(start, 'yyyy-MM-dd')
      const formattedEnd = format(end, 'yyyy-MM-dd')
      const params = new URLSearchParams(searchParams.toString())
      params.set('tanggal_mulai', formattedStart)
      params.set('tanggal_selesai', formattedEnd)
      params.delete('tanggal')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <AppReactDatepicker
      selectsRange
      startDate={startDate || undefined}
      endDate={endDate || undefined}
      selected={startDate || undefined}
      onChange={handleDateChange}
      placeholderText='Pilih Rentang Tanggal'
      dateFormat='dd/MM/yyyy'
      showMonthDropdown
      showYearDropdown
      scrollableYearDropdown
      dropdownMode='select'
      customInput={<PickersComponent label='Rentang Tanggal' />}
    />
  )
}
