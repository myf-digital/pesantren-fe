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

export const fetchKelasMdaAll = createAsyncThunk<any, FetchParamAlls>(
  'kelas-mda/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/kelas-mda/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchKelasMdaPage = createAsyncThunk<any, FetchParams>('kelas-mda/fetchPage', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/kelas-mda`, { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const fetchKelasMdaById = createAsyncThunk<any, string>('kelas-mda/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/app/kelas-mda/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postKelasMda = createAsyncThunk<any, any>('kelas-mda/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-mda`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatchKelasMda = createAsyncThunk<any, any>('kelas-mda/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-mda/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postKelasMdaUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'kelas-mda/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/kelas-mda/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteKelasMda = createAsyncThunk<any, string>('kelas-mda/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/kelas-mda/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('kelas-mda/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-mda/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('kelas-mda/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/kelas-mda/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'kelas_mda',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchKelasMdaAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchKelasMdaPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchKelasMdaById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteKelasMda.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postKelasMda.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatchKelasMda.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postKelasMdaUpdate.fulfilled, (state, action) => {
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
