'use client'

import React, { Fragment, useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Fab from '@mui/material/Fab'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import Grid from '@mui/material/Grid2'
import {
  Dialog,
  Typography,
  IconButton,
  DialogContent,
  Menu,
  MenuItem,
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material'

import { toast } from 'react-toastify'

import useVerticalNav from '../../../@menu/hooks/useVerticalNav'
import QRScanner from '@/views/onevour/components/qr-scanner'
import { locationQrCodeKebersihanInspeksi } from '@/app/(dashboard)/(private)/app/kebersihan-inspeksi/slice'
import { useAppDispatch } from '@/redux-store/hook'
import { format } from 'date-fns'
import { fetchMatchingShiftAsrama } from '@/app/(dashboard)/(private)/app/absen-harian-santri/slice'
import { fetchLocationPage } from '@/app/(dashboard)/(private)/app/location/slice'

interface ShiftOption {
  id_shift: string
  nama_shift: string
}

interface KamarOption {
  id_lokasi: string
  nama_lokasi: string
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isBelowMdScreen = useMediaQuery(theme.breakpoints.down('md'))

  // State untuk QR Scanner
  const [scannerType, setScannerType] = useState<string | null>(null)
  const [showQrScanner, setShowQrScanner] = useState(false)

  // State untuk Popup Menu (Dots Tiga)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const [listShift, setListShift] = useState<ShiftOption[]>([])
  const [listKamar, setListKamar] = useState<KamarOption[]>([])
  const [loadingShift, setLoadingShift] = useState(false)
  const [loadingKamar, setLoadingKamar] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>({ id_shift: '', nama_shift: 'Semua' })
  const [selectedKamar, setSelectedKamar] = useState<KamarOption | null>({ id_lokasi: '', nama_lokasi: 'Semua' })
  const selectedKamarRef = useRef(selectedKamar)
  const selectedShiftRef = useRef(selectedShift)

  const { isToggled, toggleVerticalNav } = useVerticalNav()

  const handleClick = () => {
    toggleVerticalNav()
  }

  const handleCloseSidebar = () => {
    if (isToggled) {
      toggleVerticalNav()
    }
  }

  const handleBackCategory = () => {
    setScannerType(null)
  }

  const handleOpenScanner = () => {
    handleCloseSidebar()
    setScannerType(null)
    setShowQrScanner(true)
  }

  const handleCloseScanner = () => {
    setShowQrScanner(false)
    setScannerType(null)
  }

  // Handler Popup Menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleScan = (data: any) => {
    toast.success(`Kode: ${data}`)

    if (scannerType && scannerType === 'inspeksi') {
      dispatch(
        locationQrCodeKebersihanInspeksi({
          qr_code: data
        })
      ).then(res => {
        const result = { ...res?.payload }

        if (result?.status) {
          handleCloseScanner()
          router.replace(`/app/kebersihan-inspeksi/form?qrcode=${data}`)
        } else {
          toast.error('QR Code tidak dikenali')
        }
      })
      handleBackCategory()
    }

    if (scannerType && scannerType === 'presensi') {
      //toast.warning('Maaf, fitur Presensi akan segera datang!!!')
      if (selectedKamarRef.current?.id_lokasi && selectedShiftRef.current?.id_shift) {
        handleCloseScanner()
        router.replace(
          `/app/absen-harian-santri/form?mode=scan_qr&id_lokasi_kamar=${selectedKamarRef.current?.id_lokasi}&id_shift_presensi=${selectedShiftRef.current?.id_shift}&nama_shift=${selectedShiftRef.current?.nama_shift}&nama_lokasi=${selectedKamarRef.current?.nama_lokasi}&qrcode=${data}`
        )
      } else {
        toast.error('Silakan pilih Shift dan Lokasi terlebih dahulu')
      }
      handleBackCategory()
    }
  }

  // Ambil Master Data Shift via fetchMatchingShiftAsrama
  useEffect(() => {
    const getShiftMaster = async () => {
      try {
        setLoadingShift(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const res = await dispatch(fetchMatchingShiftAsrama({ waktu_absen: waktuSekarang })).unwrap()

        if (res?.status && res?.data) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res.data])
        } else if (Array.isArray(res)) {
          setListShift([{ id_shift: '', nama_shift: 'Semua' }, ...res])
        }
      } catch {
        setListShift([{ id_shift: '', nama_shift: 'Semua' }])
      } finally {
        setLoadingShift(false)
      }
    }

    if (scannerType == 'presensi') {
      getShiftMaster()
    }
  }, [dispatch, scannerType])

  // Ambil Master Data Lokasi Kamar via fetchLocationPage
  useEffect(() => {
    const getKamarMaster = async () => {
      try {
        setLoadingKamar(true)
        const res = await dispatch(fetchLocationPage({ page: 1, perPage: 50, keyword: 'kamar' })).unwrap()

        const valuesData = res?.data?.values || res?.values || []
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }, ...valuesData])
      } catch {
        setListKamar([{ id_lokasi: '', nama_lokasi: 'Semua' }])
      } finally {
        setLoadingKamar(false)
      }
    }
    if (scannerType == 'presensi') {
      getKamarMaster()
    }
  }, [dispatch, scannerType])

  useEffect(() => {
    selectedKamarRef.current = selectedKamar
  }, [selectedKamar])

  useEffect(() => {
    selectedShiftRef.current = selectedShift
  }, [selectedShift])

  return isBelowMdScreen ? (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: '1px solid #eee',
        overflow: 'visible'
      }}
      elevation={8}
    >
      <Box sx={{ position: 'relative' }}>
        {/* FAB SCANNER BUTTON */}
        <Fab
          onClick={handleOpenScanner}
          sx={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            width: 64,
            height: 64,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.background.default}`,
            boxShadow: theme.shadows[4],
            '&:hover': {
              backgroundColor: theme.palette.background.paper
            }
          }}
        >
          <i className='tabler-qrcode text-2xl' />
        </Fab>

        {/* NAVIGATION SYSTEM */}
        <BottomNavigation
          showLabels
          value={pathname}
          sx={{
            height: 70,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              flex: 1,
              padding: '6px 0'
            }
          }}
        >
          <BottomNavigationAction
            label='Home'
            value='/dashboards/crm'
            icon={<i className='tabler-home' />}
            component={Link}
            href='/dashboards/crm'
            onClick={handleCloseSidebar}
          />

          <BottomNavigationAction
            label='Absensi'
            value='/app/absen-harian-santri/list'
            icon={<i className='tabler-calendar-user' />}
            component={Link}
            href='/app/absen-harian-santri/list'
            onClick={handleCloseSidebar}
          />

          {/* Spacer Tengah Menjaga Keseimbangan Layout */}
          <Box sx={{ flex: 1, minWidth: 50, display: 'flex', justifyContent: 'center' }} />

          <BottomNavigationAction
            label='Kebersihan'
            value='/app/kebersihan-inspeksi/list'
            icon={<i className='tabler-vacuum-cleaner' />}
            component={Link}
            href='/app/kebersihan-inspeksi/list'
            onClick={handleCloseSidebar}
          />

          {/* Menu Dots Tiga memicu Popup */}
          <BottomNavigationAction
            label='Lainnya'
            icon={<i className='tabler-dots-vertical' />}
            onClick={handleOpenMenu}
          />
        </BottomNavigation>

        {/* POPUP MENU CONTEXTUAL */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 160,
                boxShadow: theme.shadows[3],
                marginBottom: '10px'
              }
            }
          }}
        >
          {/* Menu Kebersihan */}
          <MenuItem
            component={Link}
            href='/app/santri/list'
            onClick={() => {
              handleCloseMenu()
              handleCloseSidebar()
            }}
            sx={{ gap: 1.5 }}
          >
            <i className='tabler-users text-xl' />
            <Typography variant='body2'>Santri</Typography>
          </MenuItem>

          {/* Menu Profile */}
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              handleClick()
            }}
            sx={{ gap: 1.5 }}
          >
            <i className='tabler-user text-xl' />
            <Typography variant='body2'>Profile</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* DIALOG POPUP SCANNER */}
      {showQrScanner && (
        <Dialog open={showQrScanner} onClose={handleCloseScanner} fullScreen>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {scannerType && (
                <IconButton onClick={handleBackCategory}>
                  <i className='tabler-arrow-left' />
                </IconButton>
              )}
              <Typography variant='h6'>
                {scannerType ? `Scan ${scannerType.charAt(0).toUpperCase() + scannerType.slice(1)}` : 'Pilih Scanner'}
              </Typography>
            </Box>

            <IconButton onClick={handleCloseScanner}>
              <i className='tabler-x' />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              p: 2,
              backgroundColor: scannerType ? 'black' : 'background.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!scannerType ? (
              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={2}
                    onClick={() => setScannerType('inspeksi')}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      cursor: 'pointer',
                      textAlign: 'center',
                      height: '100%',
                      transition: '0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <i className='tabler-vacuum-cleaner text-4xl mb-2' />
                    <Typography variant='h6'>Inspeksi</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Scan QR inspeksi
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    elevation={2}
                    onClick={() => setScannerType('presensi')}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      cursor: 'pointer',
                      textAlign: 'center',
                      height: '100%',
                      transition: '0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <i className='tabler-qrcode text-4xl mb-2' />
                    <Typography variant='h6'>Presensi</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Scan QR presensi
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Fragment>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <QRScanner result={handleScan} active={showQrScanner} />
                  {scannerType == 'presensi' && (
                    <Grid
                      container
                      spacing={4}
                      sx={{
                        p: 3,
                        backgroundColor: 'white',
                        width: '100%',
                        borderRadius: 2,
                        m: 2
                      }}
                    >
                      {/* SELECTABLE SEARCH: SHIFT PRESENSI */}
                      <Grid size={{ xs: 12, sm: 2.4 }}>
                        <Autocomplete
                          size='small'
                          options={listShift}
                          loading={loadingShift}
                          value={selectedShift}
                          onChange={(_, newValue) => setSelectedShift(newValue)}
                          getOptionLabel={option => option.nama_shift || ''}
                          isOptionEqualToValue={(option, value) => option.id_shift === value?.id_shift}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Shift'
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingShift ? <CircularProgress color='inherit' size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* SELECTABLE SEARCH: LOKASI KAMAR */}
                      <Grid size={{ xs: 12, sm: 2.4 }}>
                        <Autocomplete
                          size='small'
                          options={listKamar}
                          loading={loadingKamar}
                          value={selectedKamar}
                          onChange={(_, newValue) => setSelectedKamar(newValue)}
                          getOptionLabel={option => option.nama_lokasi || ''}
                          isOptionEqualToValue={(option, value) => option.id_lokasi === value?.id_lokasi}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Lokasi / Kamar'
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingKamar ? <CircularProgress color='inherit' size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Fragment>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Paper>
  ) : (
    ''
  )
}
