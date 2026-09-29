'use client'

import React, { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import { Box, Tabs, Tab, Paper } from '@mui/material'
import Button from '@mui/material/Button'

import { toast } from 'react-toastify'

import { useAppDispatch } from '@/redux-store/hook'
import { postExport } from '../slice/index'
import { useCan } from '@/hooks/useCan'
import GuruAccordionList from '../components/GuruAccordionList'
import MatriksJadwalKelas from '../components/MatriksJadwalKelas'
import QuickJadwalDialog from '../components/QuickJadwalDialog'

const JadwalPelajaranPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const canCreate = useCan('create')
  const canImport = useCan('import')
  const canExport = useCan('export')

  const [activeTab, setActiveTab] = useState<number>(0)
  const [quickDialogOpen, setQuickDialogOpen] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [guruFilters, setGuruFilters] = useState<Record<string, any>>({})
  const [matrixFilters, setMatrixFilters] = useState<Record<string, any>>({})

  const [targetClassForMatrix, setTargetClassForMatrix] = useState<{
    idKelas: string | null
    lembagaType: string
  }>({ idKelas: null, lembagaType: 'FORMAL' })

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'matrix') {
      setActiveTab(1)
    }
  }, [searchParams])

  const onAddForm = () => {
    setQuickDialogOpen(true)
  }

  const onImport = () => {
    router.replace('/app/jadwal-pelajaran/import')
  }

  const onExport = async () => {
    try {
      setLoadingExport(true)
      const currentFilters = activeTab === 0 ? guruFilters : matrixFilters
      const res = await dispatch(postExport(currentFilters || {})).unwrap()

      if (res?.status && res?.data) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${res.data}`
        const link = document.createElement('a')

        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        toast.info(res?.message || 'Tidak ada data jadwal untuk diexport sesuai filter yang dipilih')
      }
    } catch {
      toast.error('Gagal export data')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleOpenClassMatrix = (idKelas: string, lembagaType: string = 'FORMAL') => {
    setTargetClassForMatrix({ idKelas, lembagaType })
    setActiveTab(1)
  }

  return (
    <Grid container spacing={6} sx={{ width: '100%' }}>
      <Grid size={12}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor='primary'
            indicatorColor='primary'
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minHeight: 44,
                gap: 1.5
              }
            }}
          >
            <Tab
              icon={<i className='tabler-users' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Jadwal Mengajar Guru'
            />
            <Tab
              icon={<i className='tabler-layout-grid' style={{ fontSize: '1.2rem' }} />}
              iconPosition='start'
              label='Matriks Jadwal Kelas'
            />
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {canCreate && (
              <Button
                size='small'
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={onAddForm}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Tambah Jadwal
              </Button>
            )}

            {canImport && (
              <Button
                size='small'
                color='success'
                variant='outlined'
                startIcon={<i className='tabler-file-import' />}
                onClick={onImport}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Import Excel
              </Button>
            )}

            {canExport && (
              <Button
                size='small'
                color='warning'
                variant='outlined'
                startIcon={<i className='tabler-file-export' />}
                onClick={onExport}
                disabled={loadingExport}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {loadingExport ? 'Proses...' : 'Export Excel'}
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {activeTab === 0 && (
        <Grid size={12}>
          <GuruAccordionList
            onOpenClassMatrix={handleOpenClassMatrix}
            onAddSchedule={onAddForm}
            onFilterChange={setGuruFilters}
          />
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid size={12}>
          <MatriksJadwalKelas
            initialKelasId={targetClassForMatrix.idKelas}
            initialLembagaType={targetClassForMatrix.lembagaType}
            onFilterChange={setMatrixFilters}
          />
        </Grid>
      )}

      <QuickJadwalDialog
        open={quickDialogOpen}
        onClose={() => setQuickDialogOpen(false)}
        onSuccess={() => {}}
      />
    </Grid>
  )
}

export default JadwalPelajaranPage
