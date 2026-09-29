'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/libs/axios'

/* --------------------------
  Types
--------------------------- */
export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  data: any
  datas: any[] // Untuk fetch all (kebutuhan dropdown / laporan)
  crud: any
  delete: any // Menggunakan any agar bisa menampung error object atau string
  loading: boolean
}

/* --------------------------
  Initial State
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
  loading: false
}

/* --------------------------
  Async Thunks
--------------------------- */

const BASE_URL = '/app/pelanggaran-remisi-santri'

export const fetchKasusPelanggaranSantriAll = createAsyncThunk<any, any>(
  'kasusPelanggaranSantri/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`${BASE_URL}/all-data`, { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKasusPelanggaranSantriPage = createAsyncThunk(
  'kasusPelanggaranSantri/fetchPage',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.get(BASE_URL, { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchKasusPelanggaranSantriById = createAsyncThunk(
  'kasusPelanggaranSantri/fetchById',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postKasusPelanggaranSantri = createAsyncThunk(
  'kasusPelanggaranSantri/post',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.post(BASE_URL, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postKasusPelanggaranSantriUpdate = createAsyncThunk(
  'kasusPelanggaranSantri/update',
  async ({ id, params }: { id: string; params: any }, thunkAPI) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const deleteKasusPelanggaranSantri = createAsyncThunk(
  'kasusPelanggaranSantri/delete',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postKasusPelanggaranSantriBatch = createAsyncThunk<any, any>(
  'kasusPelanggaranSantri/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`${BASE_URL}/insert`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKasusPelanggaranSantriImport = createAsyncThunk<any, any>(
  'kasusPelanggaranSantri/import',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`${BASE_URL}/import`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postKasusPelanggaranSantriExport = createAsyncThunk<any, any>(
  'kasusPelanggaranSantri/export',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`${BASE_URL}/export`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

/* --------------------------
  Slice & Reducers
--------------------------- */
export const kasusPelanggaranSantriSlice = createSlice({
  name: 'kasusPelanggaranSantri',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    // GET PAGE
    builder.addCase(fetchKasusPelanggaranSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    // GET ALL
    builder.addCase(fetchKasusPelanggaranSantriAll.fulfilled, (state, action) => {
      state.datas = action.payload.data
    })

    // GET BY ID
    builder.addCase(fetchKasusPelanggaranSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    // POST (CREATE)
    builder.addCase(postKasusPelanggaranSantri.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postKasusPelanggaranSantri.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // PUT (UPDATE)
    builder.addCase(postKasusPelanggaranSantriUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postKasusPelanggaranSantriUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // DELETE
    builder.addCase(deleteKasusPelanggaranSantri.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })

    // LOADING STATES
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

export const { resetRedux } = kasusPelanggaranSantriSlice.actions
export default kasusPelanggaranSantriSlice.reducer
