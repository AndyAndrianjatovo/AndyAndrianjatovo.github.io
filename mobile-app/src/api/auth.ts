import { apiClient } from './client'
import type { User } from './types'

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<User>('/api/auth/login', { username, password }),

  logout: () => apiClient.post<{ ok: true }>('/api/auth/logout'),

  me: () => apiClient.get<User>('/api/auth/me'),

  acceptInvite: (token: string, payload: { username: string; email: string; password: string }) =>
    apiClient.post<User>(`/api/auth/invite/${token}`, payload),

  checkInvite: (token: string) => apiClient.get<{ email: string }>(`/api/auth/invite/${token}`),

  users: () => apiClient.get<Pick<User, 'id' | 'username'>[]>('/api/auth/users')
}
