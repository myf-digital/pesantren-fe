'use client'

import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'

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
import { fetchKelasList, fetchMatchingJamPelajaran } from '@/app/(dashboard)/(private)/app/absen-kelas-santri/slice'
import { fetchLocationPage } from '@/app/(dashboard)/(private)/app/location/slice'
import { usePermissionContext } from '@/contexts/PermissionContext'
import { can, normalizeResource } from '@/libs/permission'
import type { VerticalMenuDataType } from '@/types/menuTypes'

interface ShiftOption {
  id_shift: string
  nama_shift: string
}

interface KamarOption {
  id_lokasi: string
  nama_lokasi: string
}

interface KelasOption {
  id_kelas: string
  nama_kelas: string
}

interface JamPelOption {
  id_jampel: string
  nama_jampel: string
}

const getSidebarMenuIcon = (
  items: VerticalMenuDataType[] | undefined,
  targetHref: string,
  fallbackIcon: string
): string => {
  if (!Array.isArray(items) || items.length === 0) return fallbackIcon

  const normalizedTarget = normalizeResource(targetHref)

  const search = (nodes: VerticalMenuDataType[], parentIcon?: string): string | null => {
    for (const node of nodes) {
      const nodeIcon = (node as any).icon
      const validNodeIcon = nodeIcon && nodeIcon !== 'tabler-circle' ? nodeIcon : undefined
      const effectiveIcon = parentIcon || validNodeIcon

      const nodeHref = (node as any).href

      if (
        nodeHref &&
        (nodeHref === targetHref || normalizeResource(nodeHref) === normalizedTarget)
      ) {
        return effectiveIcon || null
      }

      const children = (node as any).children

      if (Array.isArray(children) && children.length > 0) {
        const found = search(children, effectiveIcon)

        if (found) return found
      }
    }

    return null
  }

  return search(items) || fallbackIcon
}

const NavigationSpacer = ({ showLabel, selected, value, onChange, ...rest }: any) => {
  return <Box {...rest} />
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isBelowMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const { permissions, menuData } = usePermissionContext()

  const canAbsenHarian = can(permissions, '/app/absen-harian-santri/list', 'view')
  const canAbsenKelas = can(permissions, '/app/absen-kelas-santri/list', 'view')
  const canAbsenPegawai = can(permissions, '/app/pegawai-absen-harian/list', 'view')

  const canKebersihan = can(permissions, '/app/kebersihan-inspeksi/list', 'view')
  const canPerizinanPegawai =
    can(permissions, '/app/perizinan-pegawai/kewaliasuhan', 'view') ||
    can(permissions, '/app/perizinan-pegawai', 'view')
  const canKesehatanPegawai = can(permissions, '/app/kesehatan-pegawai/list', 'view')

  const absensiNav = useMemo(() => {
    if (canAbsenHarian) {
      const href = '/app/absen-harian-santri/list'

      return {
        label: 'Absensi',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-clipboard-check')
      }
    }

    if (canAbsenKelas) {
      const href = '/app/absen-kelas-santri/list'

      return {
        label: 'Absensi',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-clipboard-check')
      }
    }

    if (canAbsenPegawai) {
      const href = '/app/pegawai-absen-harian/list'

      return {
        label: 'Absensi',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-clipboard-check')
      }
    }

    if (canPerizinanPegawai) {
      const href = '/app/perizinan-pegawai/kewaliasuhan'

      return {
        label: 'Perizinan',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-door-exit')
      }
    }

    if (canKesehatanPegawai) {
      const href = '/app/kesehatan-pegawai/list'

      return {
        label: 'Kesehatan',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-stethoscope')
      }
    }

    const fallbackHref = '/app/absen-harian-santri/list'

    return {
      label: 'Absensi',
      href: fallbackHref,
      icon: getSidebarMenuIcon(menuData, fallbackHref, 'tabler-clipboard-check')
    }
  }, [canAbsenHarian, canAbsenKelas, canAbsenPegawai, canPerizinanPegawai, canKesehatanPegawai, menuData])

  const secondaryNav = useMemo(() => {
    if (canKebersihan && absensiNav.href !== '/app/kebersihan-inspeksi/list') {
      const href = '/app/kebersihan-inspeksi/list'

      return {
        label: 'Kebersihan',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-vacuum-cleaner')
      }
    }

    if (canPerizinanPegawai && absensiNav.href !== '/app/perizinan-pegawai/kewaliasuhan') {
      const href = '/app/perizinan-pegawai/kewaliasuhan'

      return {
        label: 'Perizinan',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-door-exit')
      }
    }

    if (canKesehatanPegawai && absensiNav.href !== '/app/kesehatan-pegawai/list') {
      const href = '/app/kesehatan-pegawai/list'

      return {
        label: 'Kesehatan',
        href,
        icon: getSidebarMenuIcon(menuData, href, 'tabler-stethoscope')
      }
    }

    const fallbackHref = '/app/kebersihan-inspeksi/list'

    return {
      label: 'Kebersihan',
      href: fallbackHref,
      icon: getSidebarMenuIcon(menuData, fallbackHref, 'tabler-vacuum-cleaner')
    }
  }, [canKebersihan, canPerizinanPegawai, canKesehatanPegawai, absensiNav.href, menuData])

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

  // State untuk Presensi Kelas di Scanner
  const [listKelas, setListKelas] = useState<KelasOption[]>([])
  const [listJamPel, setListJamPel] = useState<JamPelOption[]>([])
  const [loadingKelas, setLoadingKelas] = useState(false)
  const [loadingJamPel, setLoadingJamPel] = useState(false)
  const [selectedKelas, setSelectedKelas] = useState<KelasOption | null>({ id_kelas: '', nama_kelas: 'Semua' })
  const [selectedJamPel, setSelectedJamPel] = useState<JamPelOption | null>({ id_jampel: '', nama_jampel: 'Semua' })
  const selectedKelasRef = useRef(selectedKelas)
  const selectedJamPelRef = useRef(selectedJamPel)

  const hasAnyScannerAccess = canKebersihan || canAbsenHarian || canAbsenKelas

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

    if (scannerType && scannerType === 'presensi_kelas') {
      if (selectedKelasRef.current?.id_kelas && selectedJamPelRef.current?.id_jampel) {
        const tgl = format(new Date(), 'yyyy-MM-dd')

        handleCloseScanner()
        router.replace(
          `/app/absen-kelas-santri/form?mode=scan_qr&tanggal=${tgl}&id_kelas=${selectedKelasRef.current?.id_kelas}&id_jam_pelajaran=${selectedJamPelRef.current?.id_jampel}&nama_jampel=${selectedJamPelRef.current?.nama_jampel}&nama_kelas=${selectedKelasRef.current?.nama_kelas}&qrcode=${data}`
        )
      } else {
        toast.error('Silakan pilih Kelas dan Jam Pelajaran terlebih dahulu')
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

  // Ambil Master Data Kelas & Jam Pelajaran untuk Presensi Kelas
  useEffect(() => {
    const getKelasDanJamPelMaster = async () => {
      try {
        setLoadingKelas(true)
        setLoadingJamPel(true)
        const waktuSekarang = format(new Date(), 'HH:mm')
        const [resKelas, resJam] = await Promise.all([
          dispatch(fetchKelasList({})).unwrap(),
          dispatch(fetchMatchingJamPelajaran({ waktu_absen: waktuSekarang })).unwrap()
        ])

        const valuesKelas = resKelas?.data || resKelas || []
        const formattedKelas = Array.isArray(valuesKelas)
          ? valuesKelas.map((c: any) => ({ id_kelas: c.id_kelas, nama_kelas: c.nama_kelas }))
          : []

        setListKelas([{ id_kelas: '', nama_kelas: 'Semua' }, ...formattedKelas])

        const rawJam = resJam?.data || (Array.isArray(resJam) ? resJam : [])

        if (Array.isArray(rawJam)) {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }, ...rawJam])
        } else {
          setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
        }
      } catch {
        setListKelas([{ id_kelas: '', nama_kelas: 'Semua' }])
        setListJamPel([{ id_jampel: '', nama_jampel: 'Semua' }])
      } finally {
        setLoadingKelas(false)
        setLoadingJamPel(false)
      }
    }

    if (scannerType === 'presensi_kelas') {
      getKelasDanJamPelMaster()
    }
  }, [dispatch, scannerType])

  useEffect(() => {
    selectedKamarRef.current = selectedKamar
  }, [selectedKamar])

  useEffect(() => {
    selectedShiftRef.current = selectedShift
  }, [selectedShift])

  useEffect(() => {
    selectedKelasRef.current = selectedKelas
  }, [selectedKelas])

  useEffect(() => {
    selectedJamPelRef.current = selectedJamPel
  }, [selectedJamPel])

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
            value='/dashboards/khodimul'
            icon={<i className='tabler-home' />}
            component={Link}
            href='/dashboards/khodimul'
            onClick={handleCloseSidebar}
          />

          <BottomNavigationAction
            label={absensiNav.label}
            value={absensiNav.href}
            icon={<i className={absensiNav.icon} />}
            component={Link}
            href={absensiNav.href}
            onClick={handleCloseSidebar}
          />

          {/* Spacer Tengah Menjaga Keseimbangan Layout */}
          <NavigationSpacer sx={{ flex: 1, minWidth: 50, display: 'flex', justifyContent: 'center' }} />

          <BottomNavigationAction
            label={secondaryNav.label}
            value={secondaryNav.href}
            icon={<i className={secondaryNav.icon} />}
            component={Link}
            href={secondaryNav.href}
            onClick={handleCloseSidebar}
          />

          {/* Menu Dots Tiga memicu Popup */}
          <BottomNavigationAction
            label='Profile'
            icon={<i className='tabler-user' />}
            onClick={handleClick}
          />
        </BottomNavigation>
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
                {scannerType
                  ? `Scan ${scannerType === 'presensi_kelas' ? 'Presensi Kelas' : scannerType.charAt(0).toUpperCase() + scannerType.slice(1)}`
                  : 'Pilih Scanner'}
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
              !hasAnyScannerAccess ? (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    maxWidth: 360,
                    width: '100%'
                  }}
                >
                  <i className='tabler-lock text-5xl mb-3 text-secondary' />
                  <Typography variant='h6' sx={{ mb: 1 }}>
                    Tidak Memiliki Akses
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Anda tidak memiliki akses ke fitur Scan QR Inspeksi maupun Presensi.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                  {canKebersihan && (
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
                  )}

                  {canAbsenHarian && (
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
                        <Typography variant='h6'>{canAbsenKelas ? 'Presensi Kamar' : 'Presensi'}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Scan QR presensi kamar
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {canAbsenKelas && (
                    <Grid size={{ xs: 6 }}>
                      <Paper
                        elevation={2}
                        onClick={() => setScannerType('presensi_kelas')}
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
                        <Typography variant='h6'>{canAbsenHarian ? 'Presensi Kelas' : 'Presensi'}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Scan QR presensi kelas
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )
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

                  {scannerType === 'presensi_kelas' && (
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
                      {/* SELECTABLE SEARCH: KELAS */}
                      <Grid size={{ xs: 12, sm: 2.4 }}>
                        <Autocomplete
                          size='small'
                          options={listKelas}
                          loading={loadingKelas}
                          value={selectedKelas}
                          onChange={(_, newValue) => setSelectedKelas(newValue)}
                          getOptionLabel={option => option.nama_kelas || ''}
                          isOptionEqualToValue={(option, value) => option.id_kelas === value?.id_kelas}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Kelas'
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingKelas ? <CircularProgress color='inherit' size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* SELECTABLE SEARCH: JAM PELAJARAN */}
                      <Grid size={{ xs: 12, sm: 2.4 }}>
                        <Autocomplete
                          size='small'
                          options={listJamPel}
                          loading={loadingJamPel}
                          value={selectedJamPel}
                          onChange={(_, newValue) => setSelectedJamPel(newValue)}
                          getOptionLabel={option => option.nama_jampel || ''}
                          isOptionEqualToValue={(option, value) => option.id_jampel === value?.id_jampel}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Jam Pelajaran'
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingJamPel ? <CircularProgress color='inherit' size={20} /> : null}
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
