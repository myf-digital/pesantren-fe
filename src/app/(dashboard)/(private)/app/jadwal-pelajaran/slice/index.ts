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
  id_kelas?: string
  id_kelas_mda?: string
  hari?: string
  id_pegawai?: string
  id_lokasi_parent?: string
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

export const fetchJadwalPelajaranAll = createAsyncThunk<any, FetchParamAlls>(
  'jadwal-pelajaran/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/jadwal-pelajaran/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchJadwalPelajaranPage = createAsyncThunk<any, FetchParams>(
  'jadwal-pelajaran/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/jadwal-pelajaran`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchJadwalPelajaranById = createAsyncThunk<any, string>(
  'jadwal-pelajaran/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/jadwal-pelajaran/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postJadwalPelajaran = createAsyncThunk<any, any>('jadwal-pelajaran/create', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jadwal-pelajaran`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postBatchJadwalPelajaran = createAsyncThunk<any, any>(
  'jadwal-pelajaran/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/jadwal-pelajaran/insert`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postJadwalPelajaranUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'jadwal-pelajaran/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/jadwal-pelajaran/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteJadwalPelajaran = createAsyncThunk<any, string>('jadwal-pelajaran/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/jadwal-pelajaran/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postImport = createAsyncThunk<any, any>('jadwal-pelajaran/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jadwal-pelajaran/import`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('jadwal-pelajaran/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/jadwal-pelajaran/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'jadwal_pelajaran',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchJadwalPelajaranAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchJadwalPelajaranPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchJadwalPelajaranById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deleteJadwalPelajaran.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postJadwalPelajaran.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postJadwalPelajaranUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatchJadwalPelajaran.fulfilled, (state, action) => {
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
