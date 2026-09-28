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
  datas: any[] // Untuk fetch all (kebutuhan dropdown)
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

const BASE_URL = '/app/pelanggaran-remisi-master'

export const fetchMasterPelanggaranRemisiAll = createAsyncThunk<any, any>(
  'masterPelanggaranRemisi/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`${BASE_URL}/all-data`, { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchMasterPelanggaranRemisiPage = createAsyncThunk(
  'masterPelanggaranRemisi/fetchPage',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.get(BASE_URL, { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchMasterPelanggaranRemisiById = createAsyncThunk(
  'masterPelanggaranRemisi/fetchById',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postMasterPelanggaranRemisi = createAsyncThunk(
  'masterPelanggaranRemisi/post',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.post(BASE_URL, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postMasterPelanggaranRemisiUpdate = createAsyncThunk(
  'masterPelanggaranRemisi/update',
  async ({ id, params }: { id: string; params: any }, thunkAPI) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const deleteMasterPelanggaranRemisi = createAsyncThunk(
  'masterPelanggaranRemisi/delete',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postMasterPelanggaranRemisiBatch = createAsyncThunk<any, any>(
  'masterPelanggaranRemisi/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`${BASE_URL}/insert`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postMasterPelanggaranRemisiImport = createAsyncThunk<any, any>(
  'masterPelanggaranRemisi/import',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`${BASE_URL}/import`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postMasterPelanggaranRemisiExport = createAsyncThunk<any, any>(
  'masterPelanggaranRemisi/export',
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
export const masterPelanggaranRemisiSlice = createSlice({
  name: 'masterPelanggaranRemisi',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    // GET PAGE
    builder.addCase(fetchMasterPelanggaranRemisiPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    // GET ALL
    builder.addCase(fetchMasterPelanggaranRemisiAll.fulfilled, (state, action) => {
      state.datas = action.payload.data
    })

    // GET BY ID
    builder.addCase(fetchMasterPelanggaranRemisiById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    // POST (CREATE)
    builder.addCase(postMasterPelanggaranRemisi.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postMasterPelanggaranRemisi.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // PUT (UPDATE)
    builder.addCase(postMasterPelanggaranRemisiUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postMasterPelanggaranRemisiUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    // DELETE
    builder.addCase(deleteMasterPelanggaranRemisi.fulfilled, (state, action) => {
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

export const { resetRedux } = masterPelanggaranRemisiSlice.actions
export default masterPelanggaranRemisiSlice.reducer
