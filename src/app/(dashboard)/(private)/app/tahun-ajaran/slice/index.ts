import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page?: number
  perPage?: number
  q?: string
  status?: string
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
  status?: string
}

export const fetchTahunAjaranAll = createAsyncThunk<any, FetchParamAlls>(
  'tahun-ajaran/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/tahun-ajaran/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchTahunAjaranPage = createAsyncThunk<any, FetchParams>(
  'tahun-ajaran/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/tahun-ajaran`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchTahunAjaranById = createAsyncThunk<any, string>('tahun-ajaran/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/app/tahun-ajaran/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postTahunAjaran = createAsyncThunk<any, any>('tahun-ajaran/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/tahun-ajaran`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postTahunAjaranUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'tahun-ajaran/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/tahun-ajaran/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postBatchTahunAjaran = createAsyncThunk<any, any>('tahun-ajaran/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/tahun-ajaran/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const deleteTahunAjaran = createAsyncThunk<any, string>('tahun-ajaran/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/tahun-ajaran/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('tahun-ajaran/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/tahun-ajaran/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('tahun-ajaran/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/tahun-ajaran/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'tahun_ajaran',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchTahunAjaranAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchTahunAjaranPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchTahunAjaranById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteTahunAjaran.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postTahunAjaran.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postTahunAjaranUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatchTahunAjaran.fulfilled, (state, action) => {
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
