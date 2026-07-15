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
  status?: string
  id_cabang?: string
  id_lembaga_formal?: string
  id_lembaga_mda?: string
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
  export: null
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export const fetchSantriAll = createAsyncThunk<any, FetchParams>('santri/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/santri/all-data`, { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const fetchSantriPage = createAsyncThunk<any, FetchParams>('santri/fetchPage', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/santri`, { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const fetchSantriById = createAsyncThunk<any, string>('santri/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/app/santri/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postSantriUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'santri/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/santri/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postExport = createAsyncThunk<any, any>('santri/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/santri/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'santri',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchSantriAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(postSantriUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postExport.fulfilled, (state, action) => {
      state.export = action.payload
    })
  }
})

export const { resetRedux } = slice.actions
export default slice.reducer
