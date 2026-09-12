import { apiClient } from './client'
import type { Album } from './types'

export const albumsApi = {
  list: () => apiClient.get<Album[]>('/api/albums'),
  get: (id: string) => apiClient.get<Album & { cover: { filename: string } | null }>(`/api/albums/${id}/single`)
}
