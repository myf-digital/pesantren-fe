'use client'

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
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
  activeArea: any
  crud: {
    status: boolean
    message: string | null
    data: any | null
  } | null
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
  activeArea: null,
  crud: null,
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

export const fetchGeoAreaAll = createAsyncThunk('geoArea/fetchAll', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.get(`/app/geo-area/all-data`, { ...params })
    return response.data
  } catch (e: any) {
    console.log('ERROR', e)
    return rejectWithValue(e)
  }
})

export const fetchGeoAreaPage = createAsyncThunk('geoArea/fetchPage', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.get('/app/geo-area', { ...params })
    return response.data
  } catch (e: any) {
    return rejectWithValue(e)
  }
})

export const fetchGeoAreaById = createAsyncThunk('geoArea/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/app/geo-area/${id}`)
    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Detail tidak ditemukan' })
  }
})

export const fetchGeoAreaActive = createAsyncThunk(
  'geoArea/fetchActive',
  async (idLokasi: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/app/geo-area/active/${idLokasi}`)
      return response.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data || { message: 'Area aktif tidak ditemukan' })
    }
  }
)

export const postGeoArea = createAsyncThunk('geoArea/post', async (params: any, { rejectWithValue }) => {
  try {
    const response = await api.post('/app/geo-area', params)
    // Validasi jika server kirim 200 tapi status: false
    if (response.data && response.data.status === false) {
      return rejectWithValue(response.data)
    }
    return response.data
  } catch (e: any) {
    console.log('ERROR', e)
    return rejectWithValue(e.response?.data || { message: 'Gagal menyimpan data' })
  }
})

export const postGeoAreaUpdate = createAsyncThunk(
  'geoArea/update',
  async ({ id, params }: { id: string; params: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/app/geo-area/${id}`, params)
      if (response.data && response.data.status === false) {
        return rejectWithValue(response.data)
      }
      return response.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data || { message: 'Gagal memperbarui data' })
    }
  }
)

export const deleteGeoArea = createAsyncThunk('geoArea/delete', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/app/geo-area/${id}`)
    return response.data
  } catch (e: any) {
    return rejectWithValue(e.response?.data || { message: 'Gagal menghapus data' })
  }
})

/* --------------------------
   4. Slice
--------------------------- */
export const geoAreaSlice = createSlice({
  name: 'geoArea',
  initialState,
  reducers: {
    resetGeoRedux: () => initialState,
    clearCrud: state => {
      state.crud = null
    }
  },
  extraReducers: builder => {
    // --- Fetching Success Handlers ---
    builder.addCase(fetchGeoAreaAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []

      const active = action.payload?.data?.find((item: any) => item.is_active === true)
      state.activeArea = active || null
    })

    builder.addCase(fetchGeoAreaPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchGeoAreaById.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.activeArea = action.payload.data
    })

    builder.addCase(fetchGeoAreaActive.fulfilled, (state, action) => {
      state.activeArea = action.payload.data
    })

    // --- CRUD Success Handlers ---
    builder.addMatcher(
      action =>
        [postGeoArea.fulfilled.type, postGeoAreaUpdate.fulfilled.type, deleteGeoArea.fulfilled.type].includes(
          action.type
        ),
      (state, action: PayloadAction<any>) => {
        state.crud = {
          status: true,
          message: action.payload.message || 'Berhasil memproses data',
          data: action.payload.data
        }
      }
    )

    // --- Loading State Handlers (Global Matcher) ---
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

    // --- Error Handlers (Global Matcher for CRUD) ---
    builder.addMatcher(
      action =>
        [postGeoArea.rejected.type, postGeoAreaUpdate.rejected.type, deleteGeoArea.rejected.type].includes(action.type),
      (state, action: PayloadAction<any>) => {
        state.crud = {
          status: false,
          message: action.payload?.message || 'Terjadi kesalahan sistem',
          data: null
        }
      }
    )
  }
})

export const { resetGeoRedux, clearCrud } = geoAreaSlice.actions
export default geoAreaSlice.reducer
