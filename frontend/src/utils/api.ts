// src/utils/api.ts
import axios from 'axios'

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
}

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: any) => api.post('/users/change-password', data),
  getStats: () => api.get('/users/stats'),
}

// ─── Chats ─────────────────────────────────────────────────────────────────
export const chatsAPI = {
  list: (params?: any) => api.get('/chats', { params }),
  create: (data: any) => api.post('/chats', data),
  get: (id: string) => api.get(`/chats/${id}`),
  update: (id: string, data: any) => api.put(`/chats/${id}`, data),
  delete: (id: string) => api.delete(`/chats/${id}`),
  getMessages: (id: string) => api.get(`/chats/${id}/messages`),
  export: (id: string, format: string) =>
    api.get(`/chats/${id}/export`, { params: { format }, responseType: format === 'json' ? 'json' : 'blob' }),
}

// ─── AI ────────────────────────────────────────────────────────────────────
export const aiAPI = {
  getModels: () => api.get('/ai/models'),
  quickAction: (data: any) => api.post('/ai/quick', data),
  getCapabilities: () => api.get('/ai/capabilities'),
}

// ─── Documents ─────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload: (file: File, chatId?: string) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/documents/upload', form, {
      params: chatId ? { chat_id: chatId } : {},
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: (params?: any) => api.get('/documents', { params }),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getChats: (params?: any) => api.get('/admin/chats', { params }),
  deleteChat: (id: string) => api.delete(`/admin/chats/${id}`),
  getUsageLogs: (params?: any) => api.get('/admin/usage-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, value: string) => api.put(`/admin/settings/${key}`, { value }),
  getAnalytics: (days?: number) => api.get('/admin/analytics', { params: { days } }),
}

// ─── Streaming ─────────────────────────────────────────────────────────────
export async function streamMessage(
  chatId: string,
  content: string,
  options: { model?: string; provider?: string; document_id?: string },
  onChunk: (chunk: string) => void,
  onDone: (data: any) => void,
  onError: (error: string) => void,
) {
  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, ...options }),
  })

  if (!response.ok) {
    const error = await response.json()
    onError(error.detail || 'Request failed')
    return
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    onError('No response stream')
    return
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    const lines = text.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'chunk') {
            onChunk(data.content)
          } else if (data.type === 'done') {
            onDone(data)
          } else if (data.type === 'error') {
            onError(data.content)
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
