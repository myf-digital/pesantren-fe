'use client'

import type { PayloadAction } from '@reduxjs/toolkit'
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
  datas: any[]
  crud: {
    status: boolean
    message: string | null
    data: any | null
  } | null
  delete: string | null // Tetap dipertahankan
  import: any
  export: any
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
  import: null,
  export: null,
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

export const fetchLocationAll = createAsyncThunk('location/fetchAll', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.get(`/app/location/all-data`, { params })

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal mengambil data' })
  }
})

export const fetchLocationPage = createAsyncThunk('location/fetchPage', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.get('/app/location', { params })

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal mengambil data halaman' })
  }
})

export const fetchLocationById = createAsyncThunk('location/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/app/location/${id}`)

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Detail tidak ditemukan' })
  }
})

export const postLocation = createAsyncThunk('location/post', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.post('/app/location', params)

    if (response.data && response.data.status === false) return rejectWithValue(response.data)

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal menyimpan data' })
  }
})

export const postLocationUpdate = createAsyncThunk(
  'location/update',
  async ({ id, params }: { id: string; params: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/app/location/${id}`, params)

      if (response.data && response.data.status === false) return rejectWithValue(response.data)

      return response.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data || { message: 'Gagal memperbarui data' })
    }
  }
)

export const deleteLocation = createAsyncThunk('location/delete', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/app/location/${id}`)

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal menghapus data' })
  }
})

export const postImportLocation = createAsyncThunk(
  'location/import',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/app/location/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data || { message: 'Gagal import data' })
    }
  }
)

export const postExportLocation = createAsyncThunk('location/export', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.post('/app/location/export', params)

    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal export data' })
  }
})

export const postBatch = createAsyncThunk<any, any>('location/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/location/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice
--------------------------- */
export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    resetRedux: () => initialState,
    clearCrud: state => {
      state.crud = null
    },
    clearImport: state => {
      state.import = null
    }
  },
  extraReducers: builder => {
    // --- Fetching ---
    builder.addCase(fetchLocationAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchLocationPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })
    builder.addCase(fetchLocationById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    // --- Delete ---
    builder.addCase(deleteLocation.fulfilled, (state, action) => {
      state.delete = action.payload.message || 'Deleted'
      state.crud = {
        status: true,
        message: action.payload.message || 'Berhasil menghapus data',
        data: null
      }
    })

    // --- Import & Export ---
    builder.addCase(postImportLocation.fulfilled, (state, action) => {
      state.import = action.payload
    })
    builder.addCase(postExportLocation.fulfilled, (state, action) => {
      state.export = action.payload
    })

    // --- CRUD Success (Post & Update) ---
    builder.addMatcher(
      action => [postLocation.fulfilled.type, postLocationUpdate.fulfilled.type].includes(action.type),
      (state, action: PayloadAction<any>) => {
        state.crud = {
          status: true,
          message: action.payload.message || 'Berhasil',
          data: action.payload.data
        }
      }
    )

    // --- Global Loading ---
    builder.addMatcher(
      action => action.type.endsWith('/pending'),
      state => {
        state.loading = true
      }
    )
    builder.addMatcher(
      action => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
      state => {
        state.loading = false
      }
    )

    // --- Global Error Matcher (Termasuk Delete) ---
    builder.addMatcher(
      action =>
        [
          postLocation.rejected.type,
          postLocationUpdate.rejected.type,
          deleteLocation.rejected.type,
          postImportLocation.rejected.type
        ].includes(action.type),
      (state, action: PayloadAction<any>) => {
        state.crud = {
          status: false,
          message: action.payload?.message || 'Terjadi kesalahan sistem',
          data: null
        }
        state.delete = null
      }
    )
  }
})

export const { resetRedux, clearCrud, clearImport } = locationSlice.actions
export default locationSlice.reducer
