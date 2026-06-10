import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

/* --------------------------
   1. Types
--------------------------- */

export interface FetchParams {
  page?: number
  perPage?: number
  q?: string
  parent?: string
}

export interface InitialState {
  dataPage: {
    values: any[]
    total: number
    total_new: number
  }
  data: any
  datas: any[]
  crud: any
  delete: string | null
  import: any
  export: any
}

/* --------------------------
   2. Initial State
--------------------------- */

const initialState: InitialState = {
  dataPage: {
    values: [],
    total: 0,
    total_new: 0
  },
  data: {},
  datas: [],
  crud: null,
  delete: null,
  import: null,
  export: null
}

/* --------------------------
   3. Async Thunks (typed)
--------------------------- */

export const fetchNotificationPage = createAsyncThunk<any, FetchParams>(
  'notification/fetchPage',
  async (params, thunkAPI) => {
    try {
      const response = await api.get(`/app/notification`, { params })

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const postNotificationUpdate = createAsyncThunk<any, { id: string; params: any }>(
  'notification/update',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await api.put(`/app/notification/${id}`, params)

      return response.data
    } catch (e: any) {
      return thunkAPI.fulfillWithValue(e.response?.data)
    }
  }
)

export const deleteNotification = createAsyncThunk<any, string>('notification/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/app/notification/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

/* --------------------------
   4. Slice + Reducers
--------------------------- */

export const slice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetRedux: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(fetchNotificationPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0,
        total_new: action.payload.data?.total_new || 0
      }
    })

    builder.addCase(postNotificationUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })

    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      state.delete = action.payload.message
    })
  }
})

export const { resetRedux } = slice.actions
export default slice.reducer
