import { apiClient } from './client'
import type { Comment, Photo, PhotoTag, Reaction } from './types'

export const photosApi = {
  listByAlbum: (albumId: string) => apiClient.get<Photo[]>(`/api/photos/album/${albumId}`),

  upload: (albumId: string, files: { uri: string; name: string; type: string }[]) => {
    const form = new FormData()
    for (const file of files) {
      // @ts-expect-error React Native FormData accepts { uri, name, type }
      form.append('photos', { uri: file.uri, name: file.name, type: file.type })
    }
    return apiClient.post<{ id: string; filename: string; original_name: string }[]>(
      `/api/photos/upload/${albumId}`,
      form
    )
  },

  comments: (photoId: string) => apiClient.get<Comment[]>(`/api/photos/${photoId}/comments`),
  addComment: (photoId: string, content: string) =>
    apiClient.post<Comment>(`/api/photos/${photoId}/comments`, { content }),
  deleteComment: (photoId: string, commentId: string) =>
    apiClient.delete<{ ok: true }>(`/api/photos/${photoId}/comments/${commentId}`),

  reactions: (photoId: string) => apiClient.get<Reaction[]>(`/api/photos/${photoId}/reactions`),
  react: (photoId: string, emoji: string) =>
    apiClient.post<Reaction[]>(`/api/photos/${photoId}/reactions`, { emoji }),

  tags: (photoId: string) => apiClient.get<PhotoTag[]>(`/api/photos/${photoId}/tags`),
  addTag: (photoId: string, personId: string, x: number, y: number) =>
    apiClient.post<PhotoTag>(`/api/photos/${photoId}/tags`, { person_id: personId, x, y }),
  deleteTag: (photoId: string, tagId: string) =>
    apiClient.delete<{ ok: true }>(`/api/photos/${photoId}/tags/${tagId}`)
}
