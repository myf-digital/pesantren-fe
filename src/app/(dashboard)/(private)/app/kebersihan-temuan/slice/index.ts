import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page: number
  perPage: number
  q: string
  tanggal_awal?: string
  tanggal_akhir?: string
  id_cabang?: string
  id_lokasi?: string
  id_petugas?: string
  status?: number | string
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
  loading: boolean
  loadingProgress: number
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
  loading: false,
  loadingProgress: 0
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export interface FetchParamAlls {}

export const fetchKebersihanTemuanAll = createAsyncThunk<any, FetchParamAlls>(
  'kebersihan-temuan/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-temuan/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKebersihanTemuanPage = createAsyncThunk<any, FetchParams>(
  'kebersihan-temuan/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-temuan`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKebersihanTemuanById = createAsyncThunk<any, string>(
  'kebersihan-temuan/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/kebersihan-temuan/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKebersihanTemuan = createAsyncThunk<any, any>('kebersihan-temuan/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kebersihan-temuan`, params, {
      onUploadProgress: progressEvent => {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))

        thunkAPI.dispatch(setLoadingProgress(percent))
      }
    })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatchKebersihanTemuan = createAsyncThunk<any, any>(
  'kebersihan-temuan/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/kebersihan-temuan/insert`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKebersihanTemuanUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'kebersihan-temuan/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/kebersihan-temuan/${id}`, params, {
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

export const deleteKebersihanTemuan = createAsyncThunk<any, string>(
  'kebersihan-temuan/delete',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/app/kebersihan-temuan/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postImport = createAsyncThunk<any, any>('kebersihan-temuan/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kebersihan-temuan/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('kebersihan-temuan/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kebersihan-temuan/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'kebersihan_temuan',
  initialState,
  reducers: {
    resetRedux: () => initialState,
    setLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchKebersihanTemuanAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchKebersihanTemuanPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchKebersihanTemuanById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteKebersihanTemuan.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postKebersihanTemuan.pending, state => {
      state.loading = true
      state.loadingProgress = 0
    })

    builder.addCase(postKebersihanTemuan.fulfilled, (state, action) => {
      state.loading = false
      state.loadingProgress = 100
      state.crud = action.payload
    })

    builder.addCase(postKebersihanTemuan.rejected, state => {
      state.loading = false
      state.loadingProgress = 0
    })

    builder.addCase(postKebersihanTemuanUpdate.pending, state => {
      state.loading = true
      state.loadingProgress = 0
    })

    builder.addCase(postKebersihanTemuanUpdate.fulfilled, (state, action) => {
      state.loading = false
      state.loadingProgress = 100
      state.crud = action.payload
    })

    builder.addCase(postKebersihanTemuanUpdate.rejected, state => {
      state.loading = false
      state.loadingProgress = 0
    })

    builder.addCase(postBatchKebersihanTemuan.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postImport.fulfilled, (state, action) => {
      state.import = action.payload
    })

    builder.addCase(postExport.fulfilled, (state, action) => {
      state.export = action.payload
    })
  }
})

export const { resetRedux } = slice.actions
export const { setLoadingProgress } = slice.actions
export default slice.reducer
