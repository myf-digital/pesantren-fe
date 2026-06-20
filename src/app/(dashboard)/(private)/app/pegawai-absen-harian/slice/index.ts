'use strict'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */
export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  data: any
  datas: any[] // Menampung hasil fetch all jika diperlukan di masa depan
  crud: any
  delete: any
  exportData: any // Menampung link path file excel hasil export ("/excel/...")
  importData: any // Menampung preview object data hasil parser excel
  loading: boolean
}

/* --------------------------
   2. Initial State
--------------------------- */
const initialState: InitialState = {
  dataPage: {
    values: [],
    total: 0
  },
  data: {},
  datas: [],
  crud: null,
  delete: null,
  exportData: null,
  importData: null,
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

// 1. Fetch List Data Absen dengan Pagination & Keyword Filter
export const fetchAbsenHarianPage = createAsyncThunk('absenHarianPegawai/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/pegawai-absen-harian', { params })

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 2. Fetch Detail Absen Berdasarkan ID Absen
export const fetchAbsenHarianById = createAsyncThunk('absenHarianPegawai/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/pegawai-absen-harian/${id}`)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 3. Fetch Data Absen Pegawai Khusus Hari Ini (Baru)
export const fetchAttendanceToday = createAsyncThunk('absenHarianPegawai/fetchToday', async (params: { id_pegawai: string }, thunkAPI) => {
  try {
    const response = await api.get('/app/pegawai-absen-harian/today', { params })

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 4. Post Clock In (Absen Masuk Mobile/App)
export const postAbsenClockIn = createAsyncThunk('absenHarianPegawai/clockIn', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/pegawai-absen-harian/clock-in', params)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 5. Post Clock Out (Absen Pulang Mobile/App)
export const postAbsenClockOut = createAsyncThunk('absenHarianPegawai/clockOut', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/pegawai-absen-harian/clock-out', params)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 6. Delete Log Absen Berdasarkan ID Absen
export const deleteAbsenHarian = createAsyncThunk('absenHarianPegawai/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/pegawai-absen-harian/${id}`)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 7. Export Log Absen Ke File Excel (.xlsx)
export const postAbsenHarianExport = createAsyncThunk<any, any>('absenHarianPegawai/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai-absen-harian/export`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

// 8. Import Preview / Upload File Excel (.xlsx)
export const postAbsenHarianImport = createAsyncThunk<any, any>('absenHarianPegawai/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai-absen-harian/import`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

// 9. Batch Insert / Commit Setelah Preview Selesai Dilakukan
export const postAbsenHarianInsertBatch = createAsyncThunk<any, any>('absenHarianPegawai/insertBatch', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai-absen-harian/insert`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

/* --------------------------
   4. Slice Definition
--------------------------- */
export const absenHarianPegawaiSlice = createSlice({
  name: 'absenHarianPegawai',
  initialState,
  reducers: {
    resetRedux: (state) => {
      state.crud = null
      state.delete = null
      state.exportData = null
      state.importData = null
    }
  },
  extraReducers: builder => {
    // Handle list data terpaginasi
    builder.addCase(fetchAbsenHarianPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    // Handle detail object data
    builder.addCase(fetchAbsenHarianById.fulfilled, (state, action) => {
      state.data = action.payload.data || {}
    })

    // Handle Fetch Absen Hari Ini (Baru)
    builder.addCase(fetchAttendanceToday.fulfilled, (state, action) => {
      state.data = action.payload.data || null
    })
    builder.addCase(fetchAttendanceToday.rejected, (state) => {
      state.data = null
    })

    // Handle Clock In State
    builder.addCase(postAbsenClockIn.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postAbsenClockIn.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // Handle Clock Out State
    builder.addCase(postAbsenClockOut.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postAbsenClockOut.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // Handle Delete State
    builder.addCase(deleteAbsenHarian.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })
    builder.addCase(deleteAbsenHarian.rejected, (state, action: any) => {
      state.delete = { status: false, message: action.payload?.message }
    })

    // Handle Export State
    builder.addCase(postAbsenHarianExport.fulfilled, (state, action) => {
      state.exportData = action.payload.data
    })

    // Handle Import State (Preview & Data Response)
    builder.addCase(postAbsenHarianImport.fulfilled, (state, action) => {
      state.importData = action.payload.data
    })

    // Handle Batch Insert State
    builder.addCase(postAbsenHarianInsertBatch.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postAbsenHarianInsertBatch.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // Global Matcher untuk penanganan Loading indicator otomatis
    builder.addMatcher(a => a.type.endsWith('/pending'), (state) => { state.loading = true })
    builder.addMatcher(a => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'), (state) => { state.loading = false })
  }
})

export const { resetRedux } = absenHarianPegawaiSlice.actions
export default absenHarianPegawaiSlice.reducer
