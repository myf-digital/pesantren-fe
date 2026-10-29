import type { AsyncThunk } from '@reduxjs/toolkit'

export interface FetchParams {
  page?: number
  perPage?: number
  q?: string
  is_active?: string | boolean
  is_current?: string | boolean
  status_batch?: string
}

export interface InitialState {
  dataPage: { values: any[]; total: number }
  data: any
  datas: any[]
  crud: any
  delete: string | null
  import: any
  export: any
}

export interface FinanceActions {
  fetchPage: AsyncThunk<any, FetchParams, {}>
  fetchById: AsyncThunk<any, string, {}>
  create: AsyncThunk<any, Record<string, any>, {}>
  update: AsyncThunk<any, { id: string; params: Record<string, any> }, {}>
  remove: AsyncThunk<any, string, {}>
  postImport: AsyncThunk<any, FormData, {}>
  postExport: AsyncThunk<any, Record<string, any>, {}>
  resetRedux: () => { type: string }
}
