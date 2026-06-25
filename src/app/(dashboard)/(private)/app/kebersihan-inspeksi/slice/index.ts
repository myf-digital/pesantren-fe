import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page: number
  perPage: number
  q: string
  id_cabang?: string
  id_lokasi?: string
  status?: string
  tanggal_awal?: string
  tanggal_akhir?: string
}

export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  data: any
  datas: any[]
  crud: any
  delete: string | null
  import: any
  export: any
  location_qrcode: any
  location_latlong: any[]
  loading: boolean
  loadingProgress: number
  dataPagePetugas: {
    values: any[]
    total: number
  }
  exportPetugas: any
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
  location_qrcode: null,
  location_latlong: [],
  loading: false,
  loadingProgress: 0,
  dataPagePetugas: {
    values: [],
    total: 0
  },
  exportPetugas: null
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export interface FetchParamAlls {}

export const fetchKebersihanInspeksiAll = createAsyncThunk<any, FetchParamAlls>(
  'kebersihan-inspeksi/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-inspeksi/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKebersihanInspeksiPage = createAsyncThunk<any, FetchParams>(
  'kebersihan-inspeksi/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-inspeksi`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKebersihanInspeksiById = createAsyncThunk<any, string>(
  'kebersihan-inspeksi/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-inspeksi/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKebersihanInspeksi = createAsyncThunk<any, any>(
  'kebersihan-inspeksi/create',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/kebersihan-inspeksi`, params, {
        onUploadProgress: progressEvent => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))

          thunkAPI.dispatch(setLoadingProgress(percent))
        }
      })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postBatchKebersihanInspeksi = createAsyncThunk<any, any>(
  'kebersihan-inspeksi/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/kebersihan-inspeksi/insert`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKebersihanInspeksiUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'kebersihan-inspeksi/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/kebersihan-inspeksi/${id}`, params, {
        onUploadProgress: progressEvent => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))

          thunkAPI.dispatch(setLoadingProgress(percent))
        }
      })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteKebersihanInspeksi = createAsyncThunk<any, string>(
  'kebersihan-inspeksi/delete',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/app/kebersihan-inspeksi/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postImport = createAsyncThunk<any, any>('kebersihan-inspeksi/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kebersihan-inspeksi/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('kebersihan-inspeksi/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kebersihan-inspeksi/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const locationQrCodeKebersihanInspeksi = createAsyncThunk<any, any>(
  'location-qrcode-kebersihan-inspeksi/create',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/location_qrcode`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const locationLatLongKebersihanInspeksi = createAsyncThunk<any, any>(
  'location-latlong-kebersihan-inspeksi/create',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/location_latlong`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKebersihanPetugasPage = createAsyncThunk<any, FetchParams>(
  'kebersihan-inspeksi-petugas/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-inspeksi-petugas`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postExportPetugas = createAsyncThunk<any, any>(
  'kebersihan-inspeksi-petugas/export',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/kebersihan-inspeksi-petugas/export`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'jadwal_inspeksi_kebersihan',
  initialState,
  reducers: {
    resetRedux: () => initialState,
    setLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchKebersihanInspeksiAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchKebersihanInspeksiPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchKebersihanInspeksiById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteKebersihanInspeksi.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postKebersihanInspeksi.pending, state => {
      state.loading = true
      state.loadingProgress = 0
    })

    builder.addCase(postKebersihanInspeksi.fulfilled, (state, action) => {
      state.loading = false
      state.loadingProgress = 100
      state.crud = action.payload
    })

    builder.addCase(postKebersihanInspeksi.rejected, state => {
      state.loading = false
      state.loadingProgress = 0
    })

    builder.addCase(postBatchKebersihanInspeksi.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postKebersihanInspeksiUpdate.pending, state => {
      state.loading = true
      state.loadingProgress = 0
    })

    builder.addCase(postKebersihanInspeksiUpdate.fulfilled, (state, action) => {
      state.loading = false
      state.loadingProgress = 100
      state.crud = action.payload
    })

    builder.addCase(postKebersihanInspeksiUpdate.rejected, state => {
      state.loading = false
      state.loadingProgress = 0
    })

    builder.addCase(postImport.fulfilled, (state, action) => {
      state.import = action.payload
    })

    builder.addCase(postExport.fulfilled, (state, action) => {
      state.export = action.payload
    })

    builder.addCase(locationQrCodeKebersihanInspeksi.fulfilled, (state, action) => {
      state.location_qrcode = action.payload
    })

    builder.addCase(locationLatLongKebersihanInspeksi.fulfilled, (state, action) => {
      state.location_latlong = action.payload.data
    })

    builder.addCase(fetchKebersihanPetugasPage.fulfilled, (state, action) => {
      state.dataPagePetugas = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(postExportPetugas.fulfilled, (state, action) => {
      state.exportPetugas = action.payload
    })
  }
})

export const { resetRedux } = slice.actions
export const { setLoadingProgress } = slice.actions
export default slice.reducer
