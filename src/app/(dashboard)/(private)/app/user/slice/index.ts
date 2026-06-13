'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

export interface InitialState {
  dataPage: {
    values: any[]
    total: number
  }
  data: any
  datas: any[]
  crud: any
  delete: any
  loading: boolean
}

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

export const fetchUserPage = createAsyncThunk('user/fetchPage', async (params: any, thunkAPI) => {
  try {
    const response = await api.get('/app/resource', { params })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchUserById = createAsyncThunk('user/fetchById', async (id: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/resource/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const fetchUserByUsername = createAsyncThunk('user/fetchByUsername', async (username: string, thunkAPI) => {
  try {
    const response = await api.get(`/app/resource/check/${username}?type=data`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

function dataURLtoFile(dataurl: string, filename: string): File | null {
  const arr = dataurl.split(',')
  if (arr.length < 2) return null
  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) return null
  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export const postUser = createAsyncThunk('user/post', async (params: any, thunkAPI) => {
  try {
    const formData = new FormData()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        if (key === 'image_foto' && typeof params[key] === 'string' && params[key].startsWith('data:')) {
          const file = dataURLtoFile(params[key], 'image_foto.png')
          if (file) formData.append('image_foto', file)
        } else if (key === 'role_id' || key === 'province_id' || key === 'regency_id') {
          formData.append(key, JSON.stringify(params[key]))
        } else {
          formData.append(key, params[key])
        }
      }
    }
    const response = await api.post('/app/resource', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postUserUpdate = createAsyncThunk('user/update', async ({ id, params }: any, thunkAPI) => {
  try {
    const formData = new FormData()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        if (key === 'image_foto' && typeof params[key] === 'string' && params[key].startsWith('data:')) {
          const file = dataURLtoFile(params[key], 'image_foto.png')
          if (file) formData.append('image_foto', file)
        } else if (key === 'role_id' || key === 'province_id' || key === 'regency_id') {
          formData.append(key, JSON.stringify(params[key]))
        } else if (key === 'password' && !params[key]) {
          continue
        } else {
          formData.append(key, params[key])
        }
      }
    }
    const response = await api.put(`/app/resource/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postUserUpdatePassword = createAsyncThunk('user/updatePassword', async ({ id, params }: any, thunkAPI) => {
  try {
    const response = await api.put(`/app/resource/update-password/${id}`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const deleteUser = createAsyncThunk('user/delete', async (id: string, thunkAPI) => {
  try {
    const response = await api.delete(`/app/resource/${id}`)

    return response.data
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e.response?.data)
  }
})

export const postExport = createAsyncThunk<any, any>('user/export', async (params, thunkAPI) => {
  try {
    const response = await api.post(`/app/resource/export`, params)

    return response.data
  } catch (e: any) {
    return thunkAPI.fulfillWithValue(e.response?.data)
  }
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetRedux: state => {
      state.crud = null
      state.delete = null
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchUserPage.fulfilled, (state, action) => {
      state.dataPage = {
        values: action.payload.data?.values || [],
        total: action.payload.data?.total || 0
      }
    })
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(fetchUserByUsername.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
    builder.addCase(postUser.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postUser.rejected, (state, action: any) => {
      state.crud = action.payload
    })
    builder.addCase(postUserUpdate.fulfilled, (state, action) => {
      state.crud = action.payload
    })
    builder.addCase(postUserUpdate.rejected, (state, action: any) => {
      state.crud = action.payload
    })
    builder.addCase(postUserUpdatePassword.fulfilled, (state, action: any) => {
      state.crud = action.payload
    })
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.delete = action.payload.message || 'success'
    })
  }
})

export const { resetRedux } = userSlice.actions
export default userSlice.reducer
