'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */
export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  data: any
  datas: any[] // Untuk fetch all (kebutuhan dropdown)
  crud: any
  delete: any // Menggunakan any agar bisa menampung error object atau string
  loading: boolean
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
  loading: false
}

/* --------------------------
   3. Async Thunks
--------------------------- */

export const fetchSummaryKepesantrenan = createAsyncThunk<any, any>(
  'summary-kepesantrenan/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/summary-kepesantrenan`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const summaryKepesantrenanSlice = createSlice({
  name: 'summary_kepesantrenan',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchSummaryKepesantrenan.fulfilled, (state, action) => {
      state.data = action.payload.data
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

export const { resetRedux } = summaryKepesantrenanSlice.actions
export default summaryKepesantrenanSlice.reducer
