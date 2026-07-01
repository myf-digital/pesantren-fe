'use strict'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/libs/axios'

/* --------------------------
   1. Types
   --------------------------- */
export interface FetchParams {
  page?: number
  perPage: number
  q?: string // Keyword search
  id_santri?: string
  id_pegawai?: string
  progres_status?: string
  kategori_sakit?: string
  tanggal_awal?: string
  tanggal_akhir?: string
  subject_type?: string
}

export interface InitialState {
  dataPage: {
    values: any[]
    total: number
    summary?: {
      ringan: number
      sedang: number
      berat: number
      dirawat: number
      dirujuk: number
    }
  }
  data: any
  crud: {
    status: boolean
    message: string | null
    data?: any
  } | null
  delete: {
    status: boolean
    message: string | null
  } | null
  export: {
    status: boolean
    message: string | null
    data?: any
  } | null
  loading: boolean
}

/* --------------------------
   2. Initial State
   --------------------------- */
const initialState: InitialState = {
  dataPage: {
    values: [],
    total: 0,
    summary: {
      ringan: 0,
      sedang: 0,
      berat: 0,
      dirawat: 0,
      dirujuk: 0
    }
  },
  data: {},
  crud: null,
  delete: null,
  export: null,
  loading: false
}

/* --------------------------
   3. Async Thunks
   --------------------------- */

// [GET] Fetch List Kesehatan (dengan Multi-Filter & Search Keyword)
export const fetchKesehatanSantriPage = createAsyncThunk(
  'kesehatanSantri/fetchPage',
  async (params: FetchParams, thunkAPI) => {
    try {
      const response = await api.get('/app/kesehatan-santri', {
        params: {
          page: params.page,
          perPage: params.perPage,
          keyword: params.q,
          id_santri: params.id_santri,
          id_pegawai: params.id_pegawai,
          progres_status: params.progres_status,
          kategori_sakit: params.kategori_sakit,
          tanggal_awal: params.tanggal_awal,
          tanggal_akhir: params.tanggal_akhir,
          subject_type: params.subject_type
        }
      })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [GET] Fetch Detail Kesehatan berdasarkan ID
export const fetchKesehatanSantriById = createAsyncThunk(
  'kesehatanSantri/fetchById',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`/app/kesehatan-santri/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Membuat Log Kesehatan Baru
export const postKesehatanSantri = createAsyncThunk(
  'kesehatanSantri/post',
  async (payload: any, thunkAPI) => {
    try {
      const response = await api.post('/app/kesehatan-santri', payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [PUT] Memperbarui Log Kesehatan
export const putKesehatanSantriUpdate = createAsyncThunk(
  'kesehatanSantri/update',
  async ({ id, params }: { id: string; params: any }, thunkAPI) => {
    try {
      const response = await api.put(`/app/kesehatan-santri/${id}`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [DELETE] Soft Delete Log Kesehatan
export const deleteKesehatanSantri = createAsyncThunk(
  'kesehatanSantri/delete',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.delete(`/app/kesehatan-santri/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

// [POST] Export Excel Log Kesehatan
export const postExportKesehatan = createAsyncThunk(
  'kesehatanSantri/export',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.post('/app/kesehatan-santri/export', params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice Definition
   --------------------------- */
export const slice = createSlice({
  name: 'kesehatanSantri',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    // List Page
    builder.addCase(fetchKesehatanSantriPage.pending, state => {
      state.loading = true
    })
    builder.addCase(fetchKesehatanSantriPage.fulfilled, (state, action) => {
      state.loading = false
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0,
        summary: action.payload.data?.summary || {
          ringan: 0,
          sedang: 0,
          berat: 0,
          dirawat: 0,
          dirujuk: 0
        }
      }
    })
    builder.addCase(fetchKesehatanSantriPage.rejected, state => {
      state.loading = false
    })

    // Detail
    builder.addCase(fetchKesehatanSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data || {}
    })

    // Create & Update
    builder.addCase(postKesehatanSantri.fulfilled, (state, action) => {
      state.crud = {
        status: action.payload.status,
        message: action.payload.message || 'Data berhasil disimpan',
        data: action.payload.data
      }
    })
    builder.addCase(postKesehatanSantri.rejected, (state, action: any) => {
      state.crud = {
        status: false,
        message: action.payload?.message || 'Gagal menyimpan data'
      }
    })

    builder.addCase(putKesehatanSantriUpdate.fulfilled, (state, action) => {
      state.crud = {
        status: action.payload.status,
        message: action.payload.message || 'Data berhasil diperbarui',
        data: action.payload.data
      }
    })
    builder.addCase(putKesehatanSantriUpdate.rejected, (state, action: any) => {
      state.crud = {
        status: false,
        message: action.payload?.message || 'Gagal memperbarui data'
      }
    })

    // Delete
    builder.addCase(deleteKesehatanSantri.fulfilled, (state, action) => {
      state.delete = {
        status: action.payload.status,
        message: action.payload.message || 'Data berhasil dihapus'
      }
    })
    builder.addCase(deleteKesehatanSantri.rejected, (state, action: any) => {
      state.delete = {
        status: false,
        message: action.payload?.message || 'Gagal menghapus data'
      }
    })

    // Export Excel
    builder.addCase(postExportKesehatan.fulfilled, (state, action) => {
      state.export = {
        status: action.payload.status,
        message: action.payload.message || 'Export berhasil',
        data: action.payload.data
      }
    })
    builder.addCase(postExportKesehatan.rejected, (state, action: any) => {
      state.export = {
        status: false,
        message: action.payload?.message || 'Gagal export data'
      }
    })
  }
})

export const { resetRedux } = slice.actions
export default slice.reducer
