import { apiClient } from './client'
import type { NotificationsResponse } from './types'

export const notificationsApi = {
  list: () => apiClient.get<NotificationsResponse>('/api/notifications'),
  markAllRead: () => apiClient.post<{ ok: true }>('/api/notifications/read')
}
