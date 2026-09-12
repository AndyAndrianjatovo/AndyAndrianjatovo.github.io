import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useNotifications } from '../context/NotificationsContext'
import { useTheme } from '../theme'

export function NotificationBell() {
  const theme = useTheme()
  const { unreadCount } = useNotifications()
  const navigation = useNavigation<any>()

  return (
    <Pressable
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={12}
      style={styles.wrapper}
      accessibilityLabel={unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Notifications'}
    >
      <Ionicons name="notifications-outline" size={24} color={theme.text} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginRight: 16, padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' }
})
