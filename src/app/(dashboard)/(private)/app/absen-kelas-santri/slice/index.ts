'use client'

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */
export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  jurnalPage: {
    values: any[]
    total: number
  }
  data: any
  jamPel: any
  santriList: any[]
  crud: any
  delete: any
  loading: boolean
  activeJurnal: any | null
}

/* --------------------------
   2. Initial State
--------------------------- */
const initialState: InitialState = {
  dataPage: {
    values: [],
    total: 0
  },
  jurnalPage: {
    values: [],
    total: 0
  },
  data: {},
  jamPel: null,
  santriList: [],
  crud: null,
  delete: null,
  loading: false,
  activeJurnal: null
}

/* --------------------------
   3. Async Thunks
--------------------------- */

export const fetchAbsenKelasSantriPage = createAsyncThunk(
  'absenKelasSantri/fetchPage',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.get('/app/absen-kelas-santri', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchKelasSantri = createAsyncThunk(
  'absenSantri/fetchKelasSantri',
  async (params: { id_kelas?: string }, thunkAPI) => {
    try {
      const response = await api.get('/app/absen-kelas-santri/kelas-santri', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchKelasList = createAsyncThunk('absenKelasSantri/fetchKelasList', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/absen-kelas-santri/kelas-list', { params })
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchMatchingJamPelajaran = createAsyncThunk(
  'absenKelasSantri/fetchJamPelajaran',
  async (params: { waktu_absen: string }, thunkAPI) => {
    try {
      const response = await api.get('/app/absen-kelas-santri/jam-pelajaran', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchAbsenKelasSantriById = createAsyncThunk(
  'absenKelasSantri/fetchById',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`/app/absen-kelas-santri/${id}`)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postAbsenKelasScanQR = createAsyncThunk(
  'absenKelasSantri/postScanQR',
  async (
    payload: {
      nis: string
      tanggal_custom: string
      waktu_custom: string
      id_lokasi: string
      id_jam_pelajaran: string
    },
    thunkAPI
  ) => {
    try {
      const response = await api.post(`/app/absen-kelas-santri/scan-qr`, payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postAbsenKelasSantri = createAsyncThunk('absenKelasSantri/post', async (params: any, thunkAPI) => {
  try {
    const response = await api.post('/app/absen-kelas-santri', params)
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postAbsenKelasSantriUpdate = createAsyncThunk(
  'absenKelasSantri/update',
  async ({ id, params }: any, thunkAPI) => {
    try {
      const response = await api.put(`/app/absen-kelas-santri/${id}`, params)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const deleteAbsenKelasSantri = createAsyncThunk('absenKelasSantri/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/absen-kelas-santri/${id}`)
    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postAbsenKelasBatch = createAsyncThunk<any, any>('absenKelasSantri/insert', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/absen-kelas-santri/insert`, params)
    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postAbsenKelasImport = createAsyncThunk<any, any>('absenKelasSantri/import', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/absen-kelas-santri/import`, params)
    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const postAbsenKelasExport = createAsyncThunk<any, any>('absenKelasSantri/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/absen-kelas-santri/export`, params)
    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const fetchActiveJurnalKelas = createAsyncThunk(
  'absenKelasSantri/fetchActiveJurnal',
  async (params: { tanggal: string; id_lokasi: string; id_jam_pelajaran: string }, thunkAPI) => {
    try {
      const response = await api.get('/app/jurnal-kelas/active', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const endJurnalKelas = createAsyncThunk(
  'absenKelasSantri/endJurnal',
  async (payload: { id_jurnal: string; materi: string | null; catatan: string | null }, thunkAPI) => {
    try {
      const response = await api.post('/app/jurnal-kelas/end', payload)
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const fetchJurnalKelasPage = createAsyncThunk(
  'absenKelasSantri/fetchJurnalKelasPage',
  async (params: any, thunkAPI) => {
    try {
      const response = await api.get('/app/jurnal-kelas', { params })
      return response.data
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response?.data)
    }
  }
)

export const postJurnalKelasExport = createAsyncThunk<any, any>(
  'absenKelasSantri/exportJurnal',
  async (params, thunkAPI) => {
    try {
      const response = await api.post('/app/jurnal-kelas/export', params)
      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

/* --------------------------
   4. Slice Definition
--------------------------- */
export const absenKelasSantriSlice = createSlice({
  name: 'absenKelasSantri',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
      state.jamPel = null
      state.activeJurnal = null
    },
    clearSantriList: state => {
      state.santriList = []
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchAbsenKelasSantriPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchJurnalKelasPage.fulfilled, (state, action) => {
      state.jurnalPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })

    builder.addCase(fetchKelasSantri.fulfilled, (state, action) => {
      state.santriList = action.payload.data || []
    })

    builder.addCase(fetchMatchingJamPelajaran.fulfilled, (state, action) => {
      state.jamPel = action.payload.data || null
    })

    builder.addCase(fetchAbsenKelasSantriById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })

    builder.addCase(postAbsenKelasSantri.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message, data: action.payload.data }
      state.activeJurnal = action.payload.data?.jurnal || null
    })
    builder.addCase(postAbsenKelasSantri.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    builder.addCase(postAbsenKelasScanQR.pending, state => {
      state.crud = null
    })
    builder.addCase(postAbsenKelasScanQR.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message, data: action.payload.data }
      state.activeJurnal = action.payload.data?.jurnal || null
    })
    builder.addCase(postAbsenKelasScanQR.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message || 'Gagal memproses scan QR kartu' }
    })

    builder.addCase(fetchActiveJurnalKelas.fulfilled, (state, action) => {
      state.activeJurnal = action.payload.data || null
    })
    builder.addCase(fetchActiveJurnalKelas.rejected, (state) => {
      state.activeJurnal = null
    })

    builder.addCase(endJurnalKelas.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
      state.activeJurnal = null
    })
    builder.addCase(endJurnalKelas.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    builder.addCase(postAbsenKelasSantriUpdate.fulfilled, (state, action) => {
      state.crud = { status: true, message: action.payload.message }
    })
    builder.addCase(postAbsenKelasSantriUpdate.rejected, (state, action: any) => {
      state.crud = { status: false, message: action.payload?.message }
    })

    builder.addCase(deleteAbsenKelasSantri.fulfilled, (state, action) => {
      state.delete = { status: true, message: action.payload.message }
    })

    builder.addMatcher(
      a => a.type.endsWith('/pending'),
      state => {
        state.loading = true
      }
    )
    builder.addMatcher(
      a => a.type.endsWith('/fulfilled') || a.type.endsWith('/rejected'),
      state => {
        state.loading = false
      }
    )
  }
})

export const { resetRedux } = absenKelasSantriSlice.actions
export default absenKelasSantriSlice.reducer
