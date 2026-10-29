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

export const fetchKeuRekapHarianAll = createAsyncThunk<any, FetchParams>(
  'keu-rekap-harian/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-rekap-harian/all-data', { params, signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuRekapHarianPage = createAsyncThunk<any, FetchParams>(
  'keu-rekap-harian/fetchPage',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-rekap-harian', { params, signal })

      if (!response.data?.status && response.data?.data !== null) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuRekapHarianById = createAsyncThunk<any, string>(
  'keu-rekap-harian/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/app/keu-rekap-harian/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuRekapHarian = createAsyncThunk<any, Record<string, any>>(
  'keu-rekap-harian/create',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-rekap-harian', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuRekapHarianUpdate = createAsyncThunk<any, { id: string; params: Record<string, any> }>(
  'keu-rekap-harian/update',
  async ({ id, params }, { rejectWithValue, signal }) => {
    try {
      const response = await api.put(`/app/keu-rekap-harian/${id}`, params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const deleteKeuRekapHarian = createAsyncThunk<any, string>(
  'keu-rekap-harian/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.delete(`/app/keu-rekap-harian/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postBatchKeuRekapHarian = createAsyncThunk<any, { data: Record<string, any>[] }>(
  'keu-rekap-harian/insert',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-rekap-harian/insert', params, { signal })

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
  'keu-rekap-harian/import',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-rekap-harian/import', params, { signal })

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
  'keu-rekap-harian/export',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-rekap-harian/export', params, { signal })

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
  name: 'keu_rekap_harian',
  initialState,
  reducers: { resetRedux: () => initialState },
  extraReducers: builder => {
    builder.addCase(fetchKeuRekapHarianAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchKeuRekapHarianPage.fulfilled, (state, action) => {
      state.dataPage = { values: action.payload.data?.values || [], total: action.payload.data?.total || 0 }
    })
    builder.addCase(fetchKeuRekapHarianById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postKeuRekapHarian.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postKeuRekapHarianUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(deleteKeuRekapHarian.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
    builder.addCase(postBatchKeuRekapHarian.fulfilled, (state, action) => {
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
