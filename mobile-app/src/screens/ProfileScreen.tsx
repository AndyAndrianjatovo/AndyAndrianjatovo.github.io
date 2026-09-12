import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { radius, spacing, typography, useTheme } from '../theme'

export function ProfileScreen() {
  const theme = useTheme()
  const { user, logout } = useAuth()

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
          <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View>
          <Text style={[typography.headline, { color: theme.text }]}>{user?.username}</Text>
          <Text style={[typography.subhead, { color: theme.textSecondary }]}>
            {user?.role === 'admin' ? 'Administrateur' : 'Membre de la famille'}
          </Text>
        </View>
      </View>

      <Pressable onPress={logout} style={[styles.logoutButton, { backgroundColor: theme.surface }]}>
        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        <Text style={{ color: theme.danger, fontWeight: '600' }}>Se déconnecter</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg
  }
})
