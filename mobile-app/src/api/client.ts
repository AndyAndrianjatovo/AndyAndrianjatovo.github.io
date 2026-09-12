import CookieManager from '@react-native-cookies/cookies'
import { API_BASE_URL } from '../config/env'
import type { ApiErrorBody } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Le backend Lumière Photos authentifie via un cookie de session
 * (express-session), pas un token bearer. `credentials: 'include'` fait
 * envoyer/recevoir ce cookie par le client fetch de React Native.
 * On force un flush disque après login/logout pour que la session
 * survive au redémarrage de l'app (nécessaire surtout sur Android où
 * la persistance des cookies n'est pas garantie sans flush explicite).
 */
async function persistCookies() {
  try {
    await CookieManager.flush()
  } catch {
    // no-op sur les plateformes où flush() n'est pas nécessaire (iOS)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...options.headers
    }
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const body = data as ApiErrorBody | null
    throw new ApiError(response.status, body?.error || `Erreur réseau (${response.status})`)
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: async <T>(path: string, body?: unknown) => {
    const result = await request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    })
    if (path.startsWith('/api/auth/')) await persistCookies()
    return result
  },
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  photoUrl: (filename: string) => `${API_BASE_URL}/uploads/${filename}`,
  thumbUrl: (filename: string) => {
    const jpgName = filename.replace(/\.[^.]+$/, '.jpg')
    return `${API_BASE_URL}/uploads/thumbs/${jpgName}`
  },
  familyPhotoUrl: (filename: string) => `${API_BASE_URL}/uploads/family/${filename}`
}

export { persistCookies }
