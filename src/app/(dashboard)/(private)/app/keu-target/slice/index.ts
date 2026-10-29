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

export const fetchKeuTargetAll = createAsyncThunk<any, FetchParams>(
  'keu-target/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-target/all-data', { params, signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuTargetPage = createAsyncThunk<any, FetchParams>(
  'keu-target/fetchPage',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-target', { params, signal })

      if (!response.data?.status && response.data?.data !== null) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuTargetById = createAsyncThunk<any, string>(
  'keu-target/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/app/keu-target/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuTarget = createAsyncThunk<any, Record<string, any>>(
  'keu-target/create',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-target', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuTargetUpdate = createAsyncThunk<any, { id: string; params: Record<string, any> }>(
  'keu-target/update',
  async ({ id, params }, { rejectWithValue, signal }) => {
    try {
      const response = await api.put(`/app/keu-target/${id}`, params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const deleteKeuTarget = createAsyncThunk<any, string>(
  'keu-target/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.delete(`/app/keu-target/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postBatchKeuTarget = createAsyncThunk<any, { data: Record<string, any>[] }>(
  'keu-target/insert',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-target/insert', params, { signal })

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
  'keu-target/import',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-target/import', params, { signal })

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
  'keu-target/export',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-target/export', params, { signal })

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
  name: 'keu_target',
  initialState,
  reducers: { resetRedux: () => initialState },
  extraReducers: builder => {
    builder.addCase(fetchKeuTargetAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchKeuTargetPage.fulfilled, (state, action) => {
      state.dataPage = { values: action.payload.data?.values || [], total: action.payload.data?.total || 0 }
    })
    builder.addCase(fetchKeuTargetById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postKeuTarget.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postKeuTargetUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(deleteKeuTarget.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
    builder.addCase(postBatchKeuTarget.fulfilled, (state, action) => {
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
