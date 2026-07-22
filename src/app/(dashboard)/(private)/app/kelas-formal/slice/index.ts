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
  id_tingkat?: string
}

export const fetchKelasFormalAll = createAsyncThunk<any, FetchParamAlls>(
  'kelas-formal/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kelas-formal/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKelasFormalPage = createAsyncThunk<any, FetchParams>(
  'kelas-formal/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kelas-formal`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKelasFormalById = createAsyncThunk<any, string>('kelas-formal/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/app/kelas-formal/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postKelasFormal = createAsyncThunk<any, any>('kelas-formal/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-formal`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatchKelasFormal = createAsyncThunk<any, any>('kelas-formal/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-formal/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postKelasFormalUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'kelas-formal/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/kelas-formal/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteKelasFormal = createAsyncThunk<any, string>('kelas-formal/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/kelas-formal/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('kelas-formal/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-formal/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('kelas-formal/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-formal/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'kelas_formal',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchKelasFormalAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchKelasFormalPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchKelasFormalById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteKelasFormal.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postKelasFormal.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postKelasFormalUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatchKelasFormal.fulfilled, (state, action) => {
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
