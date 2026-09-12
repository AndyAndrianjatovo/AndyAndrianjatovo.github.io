import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import type { User } from '../api/types'

const LAST_USER_KEY = 'lumiere.lastUser'

interface AuthContextValue {
  user: User | null
  isBootstrapping: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginError: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cached = await SecureStore.getItemAsync(LAST_USER_KEY)
        if (cached && !cancelled) setUser(JSON.parse(cached))
      } catch {
        // ignore cache read errors
      }
      try {
        const me = await authApi.me()
        if (!cancelled) {
          setUser(me)
          await SecureStore.setItemAsync(LAST_USER_KEY, JSON.stringify(me))
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          await SecureStore.deleteItemAsync(LAST_USER_KEY)
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setLoginError(null)
    try {
      const loggedInUser = await authApi.login(username, password)
      setUser(loggedInUser)
      await SecureStore.setItemAsync(LAST_USER_KEY, JSON.stringify(loggedInUser))
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Connexion impossible')
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      await SecureStore.deleteItemAsync(LAST_USER_KEY)
    }
  }, [])

  const value = useMemo(
    () => ({ user, isBootstrapping, login, logout, loginError }),
    [user, isBootstrapping, login, logout, loginError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
