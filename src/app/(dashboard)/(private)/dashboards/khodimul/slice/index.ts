'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */
export interface InitialState {
  dataKepesantrenan: any
  dataLembagaFormal: any
  loading: boolean
}

/* --------------------------
   2. Initial State
--------------------------- */
const initialState: InitialState = {
  dataKepesantrenan: {},
  dataLembagaFormal: {},
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

export const fetchSummaryLembagaFormal = createAsyncThunk<any, any>(
  'summary-lembaga-formal/fetchAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/summary-lembaga-formal`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const summaryKhodimulSlice = createSlice({
  name: 'khodimul',
  initialState,
  reducers: {
    resetRedux: state => {}
  },
  extraReducers: builder => {
    builder.addCase(fetchSummaryKepesantrenan.fulfilled, (state, action) => {
      state.dataKepesantrenan = action.payload.data
    })

    builder.addCase(fetchSummaryLembagaFormal.fulfilled, (state, action) => {
      state.dataLembagaFormal = action.payload.data
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

export const { resetRedux } = summaryKhodimulSlice.actions
export default summaryKhodimulSlice.reducer
