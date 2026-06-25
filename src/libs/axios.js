'use client'

import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

import { loading } from './loading'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

let isRefreshing = false
let failedQueue = []

api.defaults.showLoading = true

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use(async config => {
  const session = await getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  const showLoading = config?.showLoading ?? api.defaults.showLoading

  if (showLoading) {
    loading.start()
    loading.progress(10)
    config.loadingStarted = true
  }

  return config
})

api.interceptors.response.use(
  res => {
    const showLoading = res?.config.showLoading ?? api.defaults.showLoading

    if (showLoading && res.config.loadingStarted) {
      res.config.loadingStarted = false
      loading.progress(100)
      setTimeout(() => {
        loading.stop()
        loading.progress(0)
      }, 300)
    }

    return res
  },
  async err => {
    const originalRequest = err?.config
    const showLoading = originalRequest?.showLoading ?? api.defaults.showLoading

    if (showLoading && originalRequest?.loadingStarted) {
      originalRequest.loadingStarted = false
      loading.stop()
      loading.progress(0)
    }

    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`

            return api(originalRequest)
          })
          .catch(e => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = await fetch('/api/auth/refresh', { method: 'GET' })
        const data = await refresh.json()

        if (data?.error === 'RefreshAccessTokenError') {
          signOut()

          return Promise.reject(err)
        }

        const newToken = data?.access_token

        processQueue(null, newToken)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (error) {
        processQueue(error, null)
        isRefreshing = false
        signOut()

        return Promise.reject(error)
      }
    }

    return Promise.reject(err)
  }
)

export default api
