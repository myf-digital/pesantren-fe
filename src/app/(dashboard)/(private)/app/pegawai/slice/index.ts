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
  }
  data: any
  datas: any[] // Untuk fetch all (kebutuhan dropdown)
  crud: any
  delete: any // Menggunakan any agar bisa menampung error object atau string
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
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

export const fetchPegawaiAll = createAsyncThunk<any, any>('pegawai/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/pegawai/all-data`, { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const fetchPegawaiPage = createAsyncThunk('pegawai/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/pegawai', { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchPegawaiById = createAsyncThunk('pegawai/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/pegawai/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postPegawai = createAsyncThunk('pegawai/post', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/pegawai', params)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postPegawaiUpdate = createAsyncThunk('pegawai/update', async ({ id, params }: any, thunkAPI) => {
  try {
    const response = await api.put(`/app/pegawai/${id}`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const deletePegawai = createAsyncThunk('pegawai/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/pegawai/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postBatch = createAsyncThunk<any, any>('pegawai/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('pegawai/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('pegawai/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/pegawai/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const pegawaiSlice = createSlice({
  name: 'pegawai',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchPegawaiPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })
    builder.addCase(fetchPegawaiAll.fulfilled, (state, action) => {
      state.datas = action.payload.data
    })
    builder.addCase(fetchPegawaiById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postPegawai.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postPegawai.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })
    builder.addCase(postPegawaiUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postPegawaiUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })
    builder.addCase(deletePegawai.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })

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

export const { resetRedux } = pegawaiSlice.actions
export default pegawaiSlice.reducer
