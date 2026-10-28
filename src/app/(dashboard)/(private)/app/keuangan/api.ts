import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '@/libs/axios'

export function createFinanceModule(resource: string) {
  const request = createAsyncThunk<
    any,
    { method?: 'get' | 'post' | 'put' | 'delete'; suffix?: string; params?: any; data?: any; allowEmpty?: boolean }
  >(
    `${resource}/request`,
    async ({ method = 'get', suffix = '', params, data, allowEmpty }, { rejectWithValue, signal }) => {
      try {
        const response = await api.request({ method, url: `/app/${resource}${suffix}`, params, data, signal })

        if (!response.data?.status && !(allowEmpty && response.data?.data === null)) {
          return rejectWithValue(response.data?.message || 'Permintaan gagal')
        }

        return response.data
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Tidak dapat menghubungi server')
      }
    }
  )

  const slice = createSlice({
    name: resource,
    initialState: { result: null as any },
    reducers: {},
    extraReducers: builder => {
      builder.addCase(request.fulfilled, (state, action) => {
        state.result = action.payload
      })
    }
  })

  return { request, reducer: slice.reducer }
}

export function errorMessage(error: unknown) {
  return typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : 'Terjadi kesalahan saat memproses data'
}

export async function downloadFinanceFile(resource: string, params: Record<string, any>) {
  const response = await api.post(`/app/${resource}/export`, params)

  if (!response.data?.status || !response.data?.data) throw new Error(response.data?.message || 'Gagal mengunduh file')
  const link = document.createElement('a')

  link.href = `${process.env.NEXT_PUBLIC_API_URL}${response.data.data}`
  link.download = ''
  document.body.appendChild(link)
  link.click()
  link.remove()
}
