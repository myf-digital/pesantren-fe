// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import emailReducer from './slices/email'
import kanbanReducer from './slices/kanban'
import role from '@/app/(dashboard)/(private)/app/role/slice/index'
import menu from '@/app/(dashboard)/(private)/app/menu/slice/index'
import tahun_ajaran from '@/app/(dashboard)/(private)/app/tahun-ajaran/slice/index'
import semester from '@/app/(dashboard)/(private)/app/semester/slice/index'
import tingkat from '@/app/(dashboard)/(private)/app/tingkat/slice/index'
import tahun_angkatan from '@/app/(dashboard)/(private)/app/tahun-angkatan/slice/index'
import status_awal_santri from '@/app/(dashboard)/(private)/app/status-awal-santri/slice/index'
import jenis_beasiswa from '@/app/(dashboard)/(private)/app/jenis-beasiswa/slice/index'
import program_pesantren from '@/app/(dashboard)/(private)/app/program-pesantren/slice/index'
import param_global from '@/app/(dashboard)/(private)/app/param-global/slice/index'
import kelompok_pelajaran from '@/app/(dashboard)/(private)/app/kelompok-pelajaran/slice/index'
import orang_tua_wali from '@/app/(dashboard)/(private)/app/orang-tua-wali/slice/index'
import kelas_mda from '@/app/(dashboard)/(private)/app/kelas-mda/slice/index'
import kelas_formal from '@/app/(dashboard)/(private)/app/kelas-formal/slice/index'
import jenis_jam_pelajaran from '@/app/(dashboard)/(private)/app/jenis-jam-pelajaran/slice/index'
import mata_pelajaran from '@/app/(dashboard)/(private)/app/mata-pelajaran/slice/index'
import jam_pelajaran from '@/app/(dashboard)/(private)/app/jam-pelajaran/slice/index'
import guru_mata_pelajaran from '@/app/(dashboard)/(private)/app/guru-mata-pelajaran/slice/index'
import cabang from '@/app/(dashboard)/(private)/app/cabang/slice/index'
import areas from '@/app/(dashboard)/(private)/app/areas/slice/index'
import location from '@/app/(dashboard)/(private)/app/location/slice/index'
import lembaga_kepesantrenan from '@/app/(dashboard)/(private)/app/lembaga-kepesantrenan/slice/index'
import lembaga_formal from '@/app/(dashboard)/(private)/app/lembaga-formal/slice/index'
import organisasi_unit from '@/app/(dashboard)/(private)/app/organisasi/slice/index'
import jabatan from '@/app/(dashboard)/(private)/app/jabatan/slice/index'
import pegawai from '@/app/(dashboard)/(private)/app/pegawai/slice/index'
import jenis_penilaian from '@/app/(dashboard)/(private)/app/jenis-penilaian/slice/index'
import jenis_penilaian_bobot from '@/app/(dashboard)/(private)/app/jenis-penilaian-bobot/slice/index'
import jadwal_pelajaran from '@/app/(dashboard)/(private)/app/jadwal-pelajaran/slice/index'
import shift_presensi from '@/app/(dashboard)/(private)/app/shift-presensi/slice/index'
import master_slot_waktu from '@/app/(dashboard)/(private)/app/master-slot-waktu/slice/index'
import geo_areas from '@/app/(dashboard)/(private)/app/location/slice/geoAreaSlice'

import jadwal_inspeksi_kebersihan from '@/app/(dashboard)/(private)/app/jadwal-inspeksi-kebersihan/slice/index'
import kebersihan_inspeksi from '@/app/(dashboard)/(private)/app/kebersihan-inspeksi/slice/index'
import santri from '@/app/(dashboard)/(private)/app/santri/slice/index'
import kebersihan_temuan from '@/app/(dashboard)/(private)/app/kebersihan-temuan/slice/index'
import absen_harian_santri from '@/app/(dashboard)/(private)/app/absen-harian-santri/slice/index'
import user from '@/app/(dashboard)/(private)/app/user/slice/index'
import kebersihan_scan_log from '@/app/(dashboard)/(private)/app/kebersihan-scan-log/slice/index'
import penempatan_kamar_santri from '@/app/(dashboard)/(private)/app/penempatan-kamar-santri/slice/index'
import perizinan_santri from '@/app/(dashboard)/(private)/app/perizinan-santri/slice/index'

export const store = configureStore({
  reducer: {
    emailReducer,
    kanbanReducer,
    role,
    menu,
    areas,
    cabang,
    location,
    lembaga_kepesantrenan,
    lembaga_formal,
    organisasi_unit,
    jabatan,
    pegawai,
    tahun_ajaran,
    semester,
    tingkat,
    tahun_angkatan,
    status_awal_santri,
    jenis_beasiswa,
    program_pesantren,
    param_global,
    kelompok_pelajaran,
    orang_tua_wali,
    kelas_mda,
    kelas_formal,
    jenis_jam_pelajaran,
    mata_pelajaran,
    jam_pelajaran,
    guru_mata_pelajaran,
    jenis_penilaian,
    jenis_penilaian_bobot,
    jadwal_pelajaran,
    shift_presensi,
    master_slot_waktu,
    geo_areas,
    jadwal_inspeksi_kebersihan,
    kebersihan_inspeksi,
    santri,
    kebersihan_temuan,
    absen_harian_santri,
    user,
    kebersihan_scan_log,
    penempatan_kamar_santri,
    perizinan_santri
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
