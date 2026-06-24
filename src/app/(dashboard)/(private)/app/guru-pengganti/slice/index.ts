import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page: number
  perPage: number
  q: string
  status?: string
  id_lokasi?: string
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
  export: null
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export interface FetchParamAlls {
  status: string
}

export const fetchGuruPenggantiAll = createAsyncThunk<any, FetchParamAlls>(
  'guru-pengganti/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-pengganti/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchGuruPenggantiPage = createAsyncThunk<any, FetchParams>(
  'guru-pengganti/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-pengganti`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchGuruPenggantiById = createAsyncThunk<any, string>(
  'guru-pengganti/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-pengganti/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postGuruPengganti = createAsyncThunk<any, any>('guru-pengganti/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-pengganti`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatchGuruPengganti = createAsyncThunk<any, any>('guru-pengganti/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-pengganti/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postGuruPenggantiUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'guru-pengganti/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/guru-pengganti/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteGuruPengganti = createAsyncThunk<any, string>('guru-pengganti/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/guru-pengganti/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('guru-pengganti/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-pengganti/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('guru-pengganti/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-pengganti/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'guru_pengganti',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchGuruPenggantiAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchGuruPenggantiPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchGuruPenggantiById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteGuruPengganti.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postGuruPengganti.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postGuruPenggantiUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatchGuruPengganti.fulfilled, (state, action) => {
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
export default slice.reducer
