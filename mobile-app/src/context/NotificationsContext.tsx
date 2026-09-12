import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { notificationsApi } from '../api/notifications'
import type { AppNotification } from '../api/types'
import { NOTIFICATIONS_POLL_INTERVAL_MS } from '../config/env'
import { useAuth } from './AuthContext'

interface NotificationsContextValue {
  unreadCount: number
  items: AppNotification[]
  isLoading: boolean
  refresh: () => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

/**
 * Le backend n'expose pas encore de push/WebSocket : on rafraîchit par
 * polling pendant que l'app est au premier plan. C'est suffisant pour la
 * pastille et l'écran Notifications, mais pour livrer une notification en
 * "quelques secondes" même app fermée (cf. CDC), il faudra ajouter côté
 * backend un canal push (Expo Push / WebSocket) — voir README.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await notificationsApi.list()
      setUnreadCount(data.unread)
      setItems(data.items)
    } catch {
      // silencieux : le polling réessaiera au prochain tick
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setUnreadCount(0)
    setItems((prev) => prev.map((n) => ({ ...n, read: 1 })))
  }, [])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setItems([])
      return
    }
    refresh()
    intervalRef.current = setInterval(refresh, NOTIFICATIONS_POLL_INTERVAL_MS)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh()
    })
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      subscription.remove()
    }
  }, [user, refresh])

  const value = useMemo(
    () => ({ unreadCount, items, isLoading, refresh, markAllRead }),
    [unreadCount, items, isLoading, refresh, markAllRead]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications doit être utilisé dans un <NotificationsProvider>')
  return ctx
}
