import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page?: number
  perPage?: number
  q?: string
  parent?: string
  id_lokasi?: string
  id_tahunajaran?: string
  status?: string
  status_santri?: string
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
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export const fetchPenempatanKamarSantriAll = createAsyncThunk<any, FetchParams>(
  'penempatan_kamar_santri/fetchAll',
  async (params, thunkAPI) => {

    try {
      const response = await api.get(`/app/penempatan-kamar-santri/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchPenempatanKamarSantriPage = createAsyncThunk<any, FetchParams>(
  'penempatan_kamar_santri/fetchPage',
  async (params, thunkAPI) => {

    try {
      const response = await api.get(`/app/penempatan-kamar-santri`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchPenempatanKamarSantriById = createAsyncThunk<any, string>(
  'penempatan_kamar_santri/fetchById',
  async (id, thunkAPI) => {

    try {
      const response = await api.get(`/app/penempatan-kamar-santri/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postPenempatanKamarSantri = createAsyncThunk<any, any>(
  'penempatan_kamar_santri/create',
  async (params, thunkAPI) => {

    try {
      const response = await api.post(`/app/penempatan-kamar-santri`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postPenempatanKamarSantriUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'penempatan_kamar_santri/update',
  async ({ id, params }, thunkAPI) => {

    try {
      const response = await api.put(`/app/penempatan-kamar-santri/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deletePenempatanKamarSantri = createAsyncThunk<any, string>(
  'penempatan_kamar_santri/delete',
  async (id, thunkAPI) => {

    try {
      const response = await api.delete(`/app/penempatan-kamar-santri/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postBatch = createAsyncThunk<any, any>(
  'penempatan_kamar_santri/insert',
  async (params, thunkAPI) => {

    try {
      const response = await api.post(`/app/penempatan-kamar-santri/insert`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postImport = createAsyncThunk<any, any>(
  'penempatan_kamar_santri/import',
  async (params, thunkAPI) => {

    try {
      const response = await api.post(`/app/penempatan-kamar-santri/import`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postExport = createAsyncThunk<any, any>(
  'penempatan_kamar_santri/export',
  async (params, thunkAPI) => {

    try {
      const response = await api.post(`/app/penempatan-kamar-santri/export`, params)

      return response.data;
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'penempatan_kamar_santri',
  initialState,
  reducers: {
    resetRedux: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(fetchPenempatanKamarSantriAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchPenempatanKamarSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchPenempatanKamarSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deletePenempatanKamarSantri.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postPenempatanKamarSantri.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatch.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postPenempatanKamarSantriUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postImport.fulfilled, (state, action) => {
      state.import = action.payload
    })

    builder.addCase(postExport.fulfilled, (state, action) => {
      state.export = action.payload
    })
  },
})

export const { resetRedux } = slice.actions
export default slice.reducer
