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

export const fetchKeuAkunAll = createAsyncThunk<any, FetchParams>(
  'keu-akun/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-akun/all-data', { params, signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuAkunPage = createAsyncThunk<any, FetchParams>(
  'keu-akun/fetchPage',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/app/keu-akun', { params, signal })

      if (!response.data?.status && response.data?.data !== null) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const fetchKeuAkunById = createAsyncThunk<any, string>(
  'keu-akun/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/app/keu-akun/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuAkun = createAsyncThunk<any, Record<string, any>>(
  'keu-akun/create',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-akun', params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postKeuAkunUpdate = createAsyncThunk<any, { id: string; params: Record<string, any> }>(
  'keu-akun/update',
  async ({ id, params }, { rejectWithValue, signal }) => {
    try {
      const response = await api.put(`/app/keu-akun/${id}`, params, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const deleteKeuAkun = createAsyncThunk<any, string>(
  'keu-akun/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await api.delete(`/app/keu-akun/${id}`, { signal })

      if (!response.data?.status) {
        return rejectWithValue(response.data?.message || 'Permintaan gagal')
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
    }
  }
)

export const postBatchKeuAkun = createAsyncThunk<any, { data: Record<string, any>[] }>(
  'keu-akun/insert',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-akun/insert', params, { signal })

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
  'keu-akun/import',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-akun/import', params, { signal })

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
  'keu-akun/export',
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await api.post('/app/keu-akun/export', params, { signal })

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
  name: 'keu_akun',
  initialState,
  reducers: { resetRedux: () => initialState },
  extraReducers: builder => {
    builder.addCase(fetchKeuAkunAll.fulfilled, (state, action) => {
      state.datas = action.payload.data || []
    })
    builder.addCase(fetchKeuAkunPage.fulfilled, (state, action) => {
      state.dataPage = { values: action.payload.data?.values || [], total: action.payload.data?.total || 0 }
    })
    builder.addCase(fetchKeuAkunById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postKeuAkun.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postKeuAkunUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(deleteKeuAkun.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
    builder.addCase(postBatchKeuAkun.fulfilled, (state, action) => {
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
