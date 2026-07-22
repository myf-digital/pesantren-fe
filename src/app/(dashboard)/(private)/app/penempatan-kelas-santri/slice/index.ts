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
  id_tahun_ajaran?: string
  id_kelas_formal?: string
  id_kelas_mda?: string
  status?: string
  status_santri?: string
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

export const fetchPenempatanKelasSantriAll = createAsyncThunk<any, FetchParams>(
  'penempatan_kelas_santri/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/penempatan-kelas-santri/all-data`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchPenempatanKelasSantriPage = createAsyncThunk<any, FetchParams>(
  'penempatan_kelas_santri/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/penempatan-kelas-santri`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const fetchPenempatanKelasSantriById = createAsyncThunk<any, string>(
  'penempatan_kelas_santri/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/app/penempatan-kelas-santri/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postPenempatanKelasSantri = createAsyncThunk<any, any>(
  'penempatan_kelas_santri/create',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/penempatan-kelas-santri`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postPenempatanKelasSantriUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'penempatan_kelas_santri/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/penempatan-kelas-santri/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deletePenempatanKelasSantri = createAsyncThunk<any, string>(
  'penempatan_kelas_santri/delete',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/app/penempatan-kelas-santri/${id}`)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postBatch = createAsyncThunk<any, any>(
  'penempatan_kelas_santri/insert',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/penempatan-kelas-santri/insert`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postImport = createAsyncThunk<any, any>(
  'penempatan_kelas_santri/import',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/penempatan-kelas-santri/import`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postExport = createAsyncThunk<any, any>(
  'penempatan_kelas_santri/export',
  async (params, thunkAPI) => {
    try {
      const response = await api.post(`/app/penempatan-kelas-santri/export`, params)

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
  name: 'penempatan_kelas_santri',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchPenempatanKelasSantriAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })

    builder.addCase(fetchPenempatanKelasSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchPenempatanKelasSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(deletePenempatanKelasSantri.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })

    builder.addCase(postPenempatanKelasSantri.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postBatch.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(postPenempatanKelasSantriUpdate.fulfilled, (state, action) => {
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
