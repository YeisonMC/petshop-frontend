import axios from 'axios'

export const TOKEN_KEY = 'petshop_customer_token'

const api = axios.create({
  baseURL: '/api',
  timeout: 12_000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getApiError(error, fallback = 'No pudimos completar la solicitud.') {
  return (
    error.response?.data?.message ||
    (error.code === 'ECONNABORTED'
      ? 'La solicitud tardó demasiado. Inténtalo de nuevo.'
      : fallback)
  )
}

export default api
