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
  lembaga_type?: string
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
  lembaga: any[]
  lembaga_kepesantrenan: any[]
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
  lembaga: [],
  lembaga_kepesantrenan: []
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export const fetchJamPelajaranAll = createAsyncThunk<any, FetchParams>(
  'jam_pelajaran/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/jam-pelajaran/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchJamPelajaranPage = createAsyncThunk<any, FetchParams>(
  'jam_pelajaran/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/jam-pelajaran`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchJamPelajaranById = createAsyncThunk<any, string>('jam_pelajaran/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/app/jam-pelajaran/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postJamPelajaran = createAsyncThunk<any, any>('jam_pelajaran/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jam-pelajaran`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postJamPelajaranUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'jam_pelajaran/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/jam-pelajaran/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteJamPelajaran = createAsyncThunk<any, string>('jam_pelajaran/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/jam-pelajaran/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatch = createAsyncThunk<any, any>('jam_pelajaran/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jam-pelajaran/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('jam_pelajaran/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jam-pelajaran/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('jam_pelajaran/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jam-pelajaran/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})
export const fetchLembagaAll = createAsyncThunk<any, FetchParams>('lembaga/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/lembaga-formal/all-data`, { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})
export const fetchLembagaKepesantrenanAll = createAsyncThunk<any, FetchParams>(
  'lembaga_kepesantrenan/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/lembaga-kepesantrenan/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'jam_pelajaran',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchJamPelajaranAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchJamPelajaranPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchJamPelajaranById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteJamPelajaran.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postJamPelajaran.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatch.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postJamPelajaranUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postImport.fulfilled, (state, action) => {
      state.import = action.payload
    })

    builder.addCase(postExport.fulfilled, (state, action) => {
      state.export = action.payload
    })

    builder.addCase(fetchLembagaAll.fulfilled, (state, action) => {
      state.lembaga = action.payload.data || []
    })

    builder.addCase(fetchLembagaKepesantrenanAll.fulfilled, (state, action) => {
      state.lembaga_kepesantrenan = action.payload.data || []
    })
  }
})

export const { resetRedux } = slice.actions
export default slice.reducer
