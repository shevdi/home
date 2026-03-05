import axios, { AxiosHeaders, AxiosInstance } from 'axios'
import type { DrimeClientDeps } from './drime.types.js'

export const createDrimeClient = ({
  axiosInstance = axios,
  baseURL = process.env.DRIME_URL,
  getAccessToken = () => undefined
}: DrimeClientDeps = {}): AxiosInstance => {
  const client = axiosInstance.create({
    baseURL,
    timeout: 30000
  })

  client.interceptors.request.use(
    config => {
      const accessToken = getAccessToken()
      const headers = AxiosHeaders.from(config.headers ?? {})
      if (!headers['Content-Type']) headers.set('Content-Type', 'application/json')
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
      config.headers = headers
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  return client
}
