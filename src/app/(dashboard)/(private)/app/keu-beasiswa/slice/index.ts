import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'
import type { FetchParams, InitialState } from '../../keuangan/types'

export type { FetchParams, InitialState } from '../../keuangan/types'

const initialState: InitialState = {
  dataPage: { values: [], total: 0 },
  data: {},
  datas: [],
  crud: null,
  delete: null,
  import: null,
  export: null
}

export const fetchKeuBeasiswaAll = createAsyncThunk<any, FetchParams>(
  'keu-beasiswa/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-beasiswa/all-data', { params, signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuBeasiswaPage = createAsyncThunk<any, FetchParams>(
  'keu-beasiswa/fetchPage',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-beasiswa', { params, signal })

      if (!response.data?.status && response.data?.data !== null) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuBeasiswaById = createAsyncThunk<any, string>(
  'keu-beasiswa/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/app/keu-beasiswa/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuBeasiswa = createAsyncThunk<any, Record<string, any>>(
  'keu-beasiswa/create',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-beasiswa', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuBeasiswaUpdate = createAsyncThunk<any, { id: string; params: Record<string, any> }>(
  'keu-beasiswa/update',
  async ({ id, params }, { rejectWithValue, signal }) => {
    try {
      const response = await api.put(`/app/keu-beasiswa/${id}`, params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const deleteKeuBeasiswa = createAsyncThunk<any, string>(
  'keu-beasiswa/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.delete(`/app/keu-beasiswa/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postBatchKeuBeasiswa = createAsyncThunk<any, { data: Record<string, any>[] }>(
  'keu-beasiswa/insert',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-beasiswa/insert', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postImport = createAsyncThunk<any, FormData>(
  'keu-beasiswa/import',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-beasiswa/import', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postExport = createAsyncThunk<any, Record<string, any>>(
  'keu-beasiswa/export',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-beasiswa/export', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const slice = createSlice({
  name: 'keu_beasiswa',
  initialState,
  reducers: { resetRedux: () => initialState },
  extraReducers: builder => {
    builder.addCase(fetchKeuBeasiswaAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchKeuBeasiswaPage.fulfilled, (state, action) => {
      state.dataPage = { values: action.payload.data?.values || [], total: action.payload.data?.total || 0 }
    })
    builder.addCase(fetchKeuBeasiswaById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postKeuBeasiswa.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postKeuBeasiswaUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(deleteKeuBeasiswa.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
    builder.addCase(postBatchKeuBeasiswa.fulfilled, (state, action) => {
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
