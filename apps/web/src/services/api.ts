import axios from 'axios'
import { toast } from 'sonner'
import { authService } from './auth'

const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000
})

// Adiciona token em todas as requisições
api.interceptors.request.use((config) => {
  const token = authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros globais
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail || ""

    if (err.response?.status === 403 && detail.toLowerCase().includes('inativa')) {
      authService.logout()
      toast.error("Sua escola foi desativada", {
        description: "Entre em contato com o administrador do MINEDU.",
        duration: 6000,
      })
      // força redirect sem usar hook
      window.location.href = '/login'
    }

    if (err.response?.status === 401) {
      authService.logout()
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)
