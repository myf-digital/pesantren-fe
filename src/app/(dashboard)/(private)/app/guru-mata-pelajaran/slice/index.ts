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
  pegawai: any[]
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
  pegawai: [],
  lembaga_kepesantrenan: []
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export const fetchGuruMataPelajaranAll = createAsyncThunk<any, FetchParams>(
  'guru_mata_pelajaran/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-mata-pelajaran/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchGuruMataPelajaranPage = createAsyncThunk<any, FetchParams>(
  'guru_mata_pelajaran/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-mata-pelajaran`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchGuruMataPelajaranById = createAsyncThunk<any, string>(
  'guru_mata_pelajaran/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/guru-mata-pelajaran/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postGuruMataPelajaran = createAsyncThunk<any, any>(
  'guru_mata_pelajaran/create',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/guru-mata-pelajaran`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postGuruMataPelajaranUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'guru_mata_pelajaran/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/guru-mata-pelajaran/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteGuruMataPelajaran = createAsyncThunk<any, string>(
  'guru_mata_pelajaran/delete',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/app/guru-mata-pelajaran/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postBatch = createAsyncThunk<any, any>('guru_mata_pelajaran/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-mata-pelajaran/insert`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('guru_mata_pelajaran/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-mata-pelajaran/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('guru_mata_pelajaran/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/guru-mata-pelajaran/export`, params)

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

export const fetchPegawaiAll = createAsyncThunk<any, FetchParams>('pegawai/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await api.get(`/app/pegawai/all-data`, { params })

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
  name: 'guru_mata_pelajaran',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchGuruMataPelajaranAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchGuruMataPelajaranPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchGuruMataPelajaranById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteGuruMataPelajaran.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postGuruMataPelajaran.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatch.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postGuruMataPelajaranUpdate.fulfilled, (state, action) => {
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

    builder.addCase(fetchPegawaiAll.fulfilled, (state, action) => {
      state.pegawai = action.payload.data || []
    })

    builder.addCase(fetchLembagaKepesantrenanAll.fulfilled, (state, action) => {
      state.lembaga_kepesantrenan = action.payload.data || []
    })
  }
})

export const { resetRedux } = slice.actions
export default slice.reducer
