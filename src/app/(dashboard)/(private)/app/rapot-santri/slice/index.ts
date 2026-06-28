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
  datas: any[]
  crud: any
  delete: any
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
export const fetchRaporSantriPage = createAsyncThunk('rapot_santri/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/rapot-santri', { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchRaporSantriById = createAsyncThunk('rapot_santri/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/rapot-santri/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postRaporSantri = createAsyncThunk('rapot_santri/post', async (params: any, thunkAPI) => {
  try {
    const formData = new FormData()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        if (key == 'file_rapot' || key == 'file_rapot_mda') {
          if (params[key] instanceof File) {
            formData.append(key, params[key])
          }
        } else {
          formData.append(key, params[key])
        }
      }
    }
    const response = await api.post('/app/rapot-santri', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postRaporSantriUpdate = createAsyncThunk('rapot_santri/update', async ({ id, params }: any, thunkAPI) => {
  try {
    const formData = new FormData()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        if (key == 'file_rapot' || key == 'file_rapot_mda') {
          if (params[key] instanceof File) {
            formData.append(key, params[key])
          }
        } else {
          formData.append(key, params[key])
        }
      }
    }
    const response = await api.put(`/app/rapot-santri/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const deleteRaporSantri = createAsyncThunk('rapot_santri/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/rapot-santri/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk('rapot_santri/export', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/rapot-santri/export', params)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice & Reducers
--------------------------- */
export const rapotSantriSlice = createSlice({
  name: 'rapot_santri',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchRaporSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })
    builder.addCase(fetchRaporSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postRaporSantri.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postRaporSantri.rejected, (state, action: any) => {
      state.crud = action.payload
    })
    builder.addCase(postRaporSantriUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postRaporSantriUpdate.rejected, (state, action: any) => {
      state.crud = action.payload
    })
    builder.addCase(deleteRaporSantri.fulfilled, (state, action) => {
      state.delete = action.payload.message || 'success'
    })
  }
})

export const { resetRedux } = rapotSantriSlice.actions
export default rapotSantriSlice.reducer
