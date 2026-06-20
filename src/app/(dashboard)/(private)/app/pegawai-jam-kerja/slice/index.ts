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
  datas: any[] // Menampung hasil fetch all (all-data)
  crud: any
  delete: any
  exportData: any // Menampung link path file excel hasil export
  importData: any // Menampung preview data valid/invalid dari excel
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

// 1. Fetch List Data dengan Pagination & Keyword Filter
export const fetchJamKerjaPage = createAsyncThunk('jamKerjaPegawai/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/pegawai-jam-kerja', { params })

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 2. Fetch All Data tanpa Pagination (Kebutuhan Dropdown / List Global)
export const fetchJamKerjaAll = createAsyncThunk('jamKerjaPegawai/fetchAll', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/pegawai-jam-kerja/all-data', { params })

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 3. Fetch Detail Berdasarkan ID Jam Kerja
export const fetchJamKerjaById = createAsyncThunk('jamKerjaPegawai/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/pegawai-jam-kerja/${id}`)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 4. Create Master Jam Kerja Baru
export const postJamKerja = createAsyncThunk('jamKerjaPegawai/post', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/pegawai-jam-kerja', params)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 5. Update Master Jam Kerja Berdasarkan ID
export const postJamKerjaUpdate = createAsyncThunk('jamKerjaPegawai/update', async ({ id, params }: any, thunkAPI) => {
  try {
    const response = await api.put(`/app/pegawai-jam-kerja/${id}`, params)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 6. Delete Master Jam Kerja Berdasarkan ID
export const deleteJamKerja = createAsyncThunk('jamKerjaPegawai/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/pegawai-jam-kerja/${id}`)

    return response.data
  } catch (e: any) { return thunkAPI.rejectWithValue(e.response?.data) }
})

// 7. Export Master Jam Kerja Ke File Excel (.xlsx)
export const postJamKerjaExport = createAsyncThunk<any, any>('jamKerjaPegawai/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai-jam-kerja/export`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

// 8. Import Preview / Upload File Excel (.xlsx)
export const postJamKerjaImport = createAsyncThunk<any, any>('jamKerjaPegawai/import', async (params, thunkAPI) => {
  try {
    // Pastikan params dikirim berupa FormData jika melalui multipart file upload
    const response = await api.post(`/app/pegawai-jam-kerja/import`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

// 9. Batch Insert / Commit Setelah Preview Selesai Dilakukan
export const postJamKerjaInsertBatch = createAsyncThunk<any, any>('jamKerjaPegawai/insertBatch', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai-jam-kerja/insert`, params)

    return response.data
  } catch (e: any) { return thunkAPI.fulfillWithValue(e.response?.data) }
})

/* --------------------------
   4. Slice Definition
--------------------------- */
export const jamKerjaPegawaiSlice = createSlice({
  name: 'jamKerjaPegawai',
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
    builder.addCase(fetchJamKerjaPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    // Handle data murni tanpa paginasi (all-data)
    builder.addCase(fetchJamKerjaAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    // Handle detail object data
    builder.addCase(fetchJamKerjaById.fulfilled, (state, action) => {
      state.data = action.payload.data || {}
    })

    // Handle Create State
    builder.addCase(postJamKerja.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postJamKerja.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // Handle Update State
    builder.addCase(postJamKerjaUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postJamKerjaUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // Handle Delete State
    builder.addCase(deleteJamKerja.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })
    builder.addCase(deleteJamKerja.rejected, (state, action: any) => {
      state.delete = { status: false, message: action.payload?.message }
    })

    // Handle Export State
    builder.addCase(postJamKerjaExport.fulfilled, (state, action) => {
      state.exportData = action.payload.data // menampung path string "/excel/..."
    })

    // Handle Import State (Preview & Data Response)
    builder.addCase(postJamKerjaImport.fulfilled, (state, action) => {
      state.importData = action.payload.data
    })

    // Handle Batch Insert State
    builder.addCase(postJamKerjaInsertBatch.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })

    // Global Matcher untuk penanganan Loading indicator
    builder.addMatcher(a => a.type.endsWith('/pending'), (state) => { state.loading = true })
    builder.addMatcher(a => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'), (state) => { state.loading = false })
  }
})

export const { resetRedux } = jamKerjaPegawaiSlice.actions
export default jamKerjaPegawaiSlice.reducer
