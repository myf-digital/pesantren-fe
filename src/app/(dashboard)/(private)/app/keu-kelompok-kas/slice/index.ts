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

export const fetchKeuKelompokKasAll = createAsyncThunk<any, FetchParams>(
  'keu-kelompok-kas/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-kelompok-kas/all-data', { params, signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuKelompokKasPage = createAsyncThunk<any, FetchParams>(
  'keu-kelompok-kas/fetchPage',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-kelompok-kas', { params, signal })

      if (!response.data?.status && response.data?.data !== null) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuKelompokKasById = createAsyncThunk<any, string>(
  'keu-kelompok-kas/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/app/keu-kelompok-kas/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuKelompokKas = createAsyncThunk<any, Record<string, any>>(
  'keu-kelompok-kas/create',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-kelompok-kas', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuKelompokKasUpdate = createAsyncThunk<any, { id: string; params: Record<string, any> }>(
  'keu-kelompok-kas/update',
  async ({ id, params }, { rejectWithValue, signal }) => {
    try {
      const response = await api.put(`/app/keu-kelompok-kas/${id}`, params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const deleteKeuKelompokKas = createAsyncThunk<any, string>(
  'keu-kelompok-kas/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.delete(`/app/keu-kelompok-kas/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postBatchKeuKelompokKas = createAsyncThunk<any, { data: Record<string, any>[] }>(
  'keu-kelompok-kas/insert',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-kelompok-kas/insert', params, { signal })

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
  'keu-kelompok-kas/import',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-kelompok-kas/import', params, { signal })

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
  'keu-kelompok-kas/export',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-kelompok-kas/export', params, { signal })

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
  name: 'keu_kelompok_kas',
  initialState,
  reducers: { resetRedux: () => initialState },
  extraReducers: builder => {
    builder.addCase(fetchKeuKelompokKasAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchKeuKelompokKasPage.fulfilled, (state, action) => {
      state.dataPage = { values: action.payload.data?.values || [], total: action.payload.data?.total || 0 }
    })
    builder.addCase(fetchKeuKelompokKasById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postKeuKelompokKas.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postKeuKelompokKasUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(deleteKeuKelompokKas.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
    builder.addCase(postBatchKeuKelompokKas.fulfilled, (state, action) => {
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
