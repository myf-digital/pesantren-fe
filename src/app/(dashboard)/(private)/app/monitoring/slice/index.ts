'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/libs/axios'
import {
  DUMMY_KAMAR, DUMMY_KELAS, DUMMY_PEGAWAI, DUMMY_GURU, DUMMY_INSPEKSI
} from '../dummy.data'
/* --------------------------
  Types
--------------------------- */
export interface InitialState {
  dataKamar: any
  dataKelas: any
  dataPegawai: any[]
  dataGuru: any[]
  dataInspeksi: any[]
  loading: boolean
  error: any
}

/* --------------------------
  Initial State
--------------------------- */
const initialState: InitialState = {
  dataKamar: null,
  dataKelas: null,
  dataPegawai: [],
  dataGuru: [],
  dataInspeksi: [],
  loading: false,
  error: null
}

const IS_DUMMY = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/* --------------------------
  Async Thunks
--------------------------- */
export const fetchMonitoringKamar = createAsyncThunk('monitoring/fetchKamar', async (params: any, thunkAPI) => {
  if (IS_DUMMY) {
    await delay(500); // Simulasi loading 0.5 detik
    return DUMMY_KAMAR;
  }

  try {
    const response = await api.get('/app/kamar-belum-absen', { params })
    return response.data?.data || response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchMonitoringKelas = createAsyncThunk('monitoring/fetchKelas', async (params: any, thunkAPI) => {
  if (IS_DUMMY) {
    await delay(500);
    return DUMMY_KELAS;
  }

  try {
    const response = await api.get('/app/kelas-belum-absen', { params })
    return response.data?.data || response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchMonitoringPegawai = createAsyncThunk('monitoring/fetchPegawai', async (params: any, thunkAPI) => {
  if (IS_DUMMY) {
    await delay(500);
    return DUMMY_PEGAWAI;
  }

  try {
    const response = await api.get('/app/pegawai-belum-absen', { params })
    return response.data?.data || response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchMonitoringGuru = createAsyncThunk('monitoring/fetchGuru', async (params: any, thunkAPI) => {
  if (IS_DUMMY) {
    await delay(500);
    return DUMMY_GURU;
  }

  try {
    const response = await api.get('/app/guru-belum-absen', { params })
    return response.data?.data || response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchMonitoringInspeksi = createAsyncThunk('monitoring/fetchInspeksi', async (params: any, thunkAPI) => {
  if (IS_DUMMY) {
    await delay(500);
    return DUMMY_INSPEKSI;
  }

  try {
    const response = await api.get('/app/inspeksi-belum-dikerjakan', { params })
    return response.data?.data || response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})
/* --------------------------
   Slice Definition
--------------------------- */
export const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    resetRedux: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    // Kamar
    builder.addCase(fetchMonitoringKamar.fulfilled, (state, action) => {
      state.dataKamar = action.payload
    })
    // Kelas
    builder.addCase(fetchMonitoringKelas.fulfilled, (state, action) => {
      state.dataKelas = action.payload
    })
    // Pegawai
    builder.addCase(fetchMonitoringPegawai.fulfilled, (state, action) => {
      state.dataPegawai = action.payload
    })
    // Guru
    builder.addCase(fetchMonitoringGuru.fulfilled, (state, action) => {
      state.dataGuru = action.payload
    })
    // Inspeksi
    builder.addCase(fetchMonitoringInspeksi.fulfilled, (state, action) => {
      state.dataInspeksi = action.payload
    })

    // Handle Loading & Errors globally for this slice
    builder.addMatcher(
      a => a.type.startsWith('monitoring/') && a.type.endsWith('/pending'),
      state => {
        state.loading = true
        state.error = null
      }
    )
    builder.addMatcher(
      a => a.type.startsWith('monitoring/') && a.type.endsWith('/fulfilled'),
      state => {
        state.loading = false
      }
    )
    builder.addMatcher(
      a => a.type.startsWith('monitoring/') && a.type.endsWith('/rejected'),
      (state, action: any) => {
        state.loading = false
        state.error = action.payload
      }
    )
  }
})

export const { resetRedux } = monitoringSlice.actions
export default monitoringSlice.reducer
