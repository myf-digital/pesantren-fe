'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */
export interface InitialState {
  dataPage: {
    values: any[]
    total: number
    summary?: {
      totalScan: number
      totalKeluar: number
      totalMasuk: number
      normal: number
      closed: number
      overdue: number
    }
  }
  data: any // Menyimpan formatted detail data respon endpoint detail /:id
  scanResult: {
    nama_santri: string | null
    nis: string | null
    kamar: string | null
    jenis_izin: string | null
    tanggal_mulai: string | null
    tanggal_selesai: string | null
    status_gate: 'Keluar' | 'Kembali' | null
    waktu_keluar: string | null
    waktu_masuk: string | null
    kondisi: string | null
  } | null // Menyimpan hasil data sirkulasi real-time scan QR gate
  crud: {
    status: boolean
    message: string | null
    data?: any
  } | null
  delete: {
    status: boolean
    message: string | null
  } | null
  loading: boolean
}

/* --------------------------
   2. Initial State
--------------------------- */
const initialState: InitialState = {
  dataPage: {
    values: [],
    total: 0,
    summary: {
      totalScan: 0,
      totalKeluar: 0,
      totalMasuk: 0,
      normal: 0,
      closed: 0,
      overdue: 0
    }
  },
  data: {},
  scanResult: null,
  crud: null,
  delete: null,
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

// [GET] Fetch List Perizinan Santri (Index Page) dengan Multi-Filter & Search Keyword
export const fetchPerizinanSantriPage = createAsyncThunk('perizinanSantri/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/perizinan-santri', { params })
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

// [GET] Fetch Detail Perizinan beserta Dokumen Surat Terkait berdasarkan ID Izin
export const fetchPerizinanSantriById = createAsyncThunk('perizinanSantri/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/perizinan-santri/${id}`)
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

// [POST] Mengajukan Perizinan Baru
export const postPerizinanSantri = createAsyncThunk('perizinanSantri/post', async (payload: any, thunkAPI) => {
  try {
    const formData = new FormData()
    for (const key in payload) {
      if (payload[key] !== undefined && payload[key] !== null) {
        if (key == 'file_izin') {
          if (payload[key] instanceof File) {
            formData.append(key, payload[key])
          }
        } else {
          formData.append(key, payload[key])
        }
      }
    }
    const response = await api.post('/app/perizinan-santri', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

// [PUT] Mengubah Data Pengajuan Perizinan (Kondisi status masih 'Menunggu')
export const putPerizinanSantriUpdate = createAsyncThunk(
  'perizinanSantri/update',
  async ({ id, params }: { id: string; params: any }, thunkAPI) => {
    try {
      const formData = new FormData()
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          if (key == 'file_izin') {
            if (params[key] instanceof File) {
              formData.append(key, params[key])
            }
          } else {
            formData.append(key, params[key])
          }
        }
      }
      const response = await api.put(`/app/perizinan-santri/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Menyetujui atau Menolak Perizinan Santri (Khusus Petugas Kedisiplinan)
export const postPerizinanApprove = createAsyncThunk(
  'perizinanSantri/approve',
  async ({ id, payload }: { id: string; payload: any }, thunkAPI) => {
    try {
      const response = await api.post(`/app/perizinan-santri/approve/${id}`, payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Mengirimkan Permintaan/Request Pembatalan Izin Aktif dari Sisi Santri
export const postPerizinanRequestCancellation = createAsyncThunk(
  'perizinanSantri/requestCancellation',
  async ({ id, payload }: { id: string; payload: any }, thunkAPI) => {
    try {
      const response = await api.post(`/app/perizinan-santri/request-cancellation/${id}`, payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Membatalkan Perizinan Aktif secara Mutlak & Mencabut Dokumen Surat Terkait
export const postPerizinanCancel = createAsyncThunk(
  'perizinanSantri/cancel',
  async ({ id, payload }: { id: string; payload?: any }, thunkAPI) => {
    try {
      const response = await api.post(`/app/perizinan-santri/cancel/${id}`, payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Download Data Logs / Template File Excel Kosongan
export const postPerizinanExport = createAsyncThunk<any, any>('perizinanSantri/export', async (payload, thunkAPI) => {
  try {
    const response = await api.post('/app/perizinan-santri/export', payload)
    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

// [POST] Upload File Berkas Excel untuk Analisis Data & Preview Hasil Import Berkas
export const postPerizinanImport = createAsyncThunk<any, any>('perizinanSantri/import', async (formData, thunkAPI) => {
  try {
    const response = await api.post('/app/perizinan-santri/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

// [POST] Commit Massal / Batch Insert Larik Object Hasil Analisis Valid Validasi Import
export const postPerizinanBatchInsert = createAsyncThunk<any, any>(
  'perizinanSantri/insert',
  async (payload, thunkAPI) => {
    try {
      const response = await api.post('/app/perizinan-santri/insert', payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

// [GET] Fetch List Log Gate Santri (Index Page) dengan Multi-Filter Tanggal & Status
export const fetchLogGateSantriPage = createAsyncThunk(
  'perizinanSantri/fetchLogGatePage',
  async (params: { page: number; perPage: number; date?: string; status?: string; keyword?: string }, thunkAPI) => {
    try {
      const response = await api.get('/app/log-gate-santri', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Export Data Logs / Template File Excel Kosongan Log Gate
export const postLogGateSantriExport = createAsyncThunk(
  'perizinanSantri/logGateExport',
  async (payload: { template?: string; q?: string; date?: string; status?: string }, thunkAPI) => {
    try {
      const response = await api.post('/app/log-gate-santri/export', payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

// [POST] Pemindaian QR Code Gate Keeper (Dinamis Keluar / Kembali)
export const postScanQrGate = createAsyncThunk(
  'perizinanSantri/scanQrGate',
  async (payload: { nomor_kartu_santri: string; keterangan?: string }, thunkAPI) => {
    try {
      const response = await api.post('/app/perizinan-santri/scan-card-gate', payload)
      return response.data // Respon: { status, message, data: { nama_santri, status_gate, kondisi, ... } }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice Definition
--------------------------- */
export const perizinanSantriSlice = createSlice({
  name: 'perizinanSantri',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
      state.scanResult = null // Otomatis bersihkan data hasil scan saat ditutup di komponen UI
    }
  },
  extraReducers: builder => {
    // 1. Fetch Page / History List Utama
    builder.addCase(fetchPerizinanSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0,
        summary: { totalScan: 0, totalKeluar: 0, totalMasuk: 0, normal: 0, closed: 0, overdue: 0 }
      }
    })

    // 2. Fetch Detail Struktur Record By ID
    builder.addCase(fetchPerizinanSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data || {}
    })

    // 3. Post / Mengajukan Perizinan Baru
    builder.addCase(postPerizinanSantri.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message, data: action.payload.data }
    })
    builder.addCase(postPerizinanSantri.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message || 'Gagal mengajukan perizinan' }
    })

    // 4. Put / Update Data Perizinan
    builder.addCase(putPerizinanSantriUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(putPerizinanSantriUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message || 'Gagal mengubah data perizinan' }
    })

    // 5. Post / Approve atau Tolak Perizinan
    builder.addCase(postPerizinanApprove.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postPerizinanApprove.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message || 'Gagal memproses approval perizinan' }
    })

    // 6. Post / Request Pembatalan Izin Aktif
    builder.addCase(postPerizinanRequestCancellation.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postPerizinanRequestCancellation.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message || 'Gagal mengirimkan request pembatalan' }
    })

    // 7. Post / Cancel Mutlak & Penarikan Dokumen
    builder.addCase(postPerizinanCancel.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })
    builder.addCase(postPerizinanCancel.rejected, (state, action: any) => {
      state.delete = { status: false, message: action.payload?.message || 'Gagal membatalkan perizinan santri' }
    })

    // 8. Handle Fetch List & Summary Dashboard Log Gate Santri
    builder.addCase(fetchLogGateSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0,
        summary: action.payload.data?.summary || {
          totalScan: 0,
          totalKeluar: 0,
          totalMasuk: 0,
          normal: 0,
          closed: 0,
          overdue: 0
        }
      }
    })

    // 9. Handle Export Log Gate Santri
    builder.addCase(postLogGateSantriExport.fulfilled, (state, action) => {
      if (action.payload?.status) {
        state.crud = { status: true, message: action.payload.message, data: action.payload.data }
      } else {
        state.crud = { status: false, message: action.payload?.message || 'Gagal mengeksport data excel log gate' }
      }
    })

    // 10. Handle Response Hasil Scan QR Gerbang Masuk/Keluar
    builder.addCase(postScanQrGate.fulfilled, (state, action) => {
      state.scanResult = action.payload.data || null
      // state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postScanQrGate.rejected, (state, action: any) => {
      state.scanResult = null
      // state.crud = { status: false, message: action.payload?.message || 'Proses pemindaian QR Code gagal.' }
    })

    // Matcher Global untuk mengelola status loading state secara terpusat
    builder.addMatcher(
      a => a.type.endsWith('/pending'),
      state => {
        state.loading = true
      }
    )
    builder.addMatcher(
      a => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'),
      state => {
        state.loading = false
      }
    )
  }
})

export const { resetRedux } = perizinanSantriSlice.actions
export default perizinanSantriSlice.reducer
