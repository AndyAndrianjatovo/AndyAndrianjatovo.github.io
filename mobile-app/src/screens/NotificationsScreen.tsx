import React, { useCallback, useEffect } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useNotifications } from '../context/NotificationsContext'
import { apiClient } from '../api/client'
import type { AppNotification, NotificationType } from '../api/types'
import { EmptyState } from '../components/EmptyState'
import { radius, spacing, typography, useTheme } from '../theme'
import type { RootStackParamList } from '../navigation/types'

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  comment: 'chatbubble-outline',
  reaction: 'heart-outline',
  mention: 'at-outline',
  tag: 'pricetag-outline',
  tagged: 'person-outline'
}

function label(notification: AppNotification): string {
  const who = notification.from_username ?? 'Quelqu\'un'
  switch (notification.type) {
    case 'comment':
      return `${who} a commenté votre photo`
    case 'reaction':
      return `${who} a réagi à votre photo`
    case 'mention':
      return `${who} vous a mentionné dans un commentaire`
    case 'tag':
      return `${who} a identifié une personne sur votre photo`
    case 'tagged':
      return `${who} vous a identifié sur une photo`
    default:
      return 'Nouvelle notification'
  }
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso.replace(' ', 'T') + 'Z').getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} j`
}

export function NotificationsScreen() {
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { items, isLoading, refresh, markAllRead } = useNotifications()

  useEffect(() => {
    refresh().then(markAllRead)
  }, [refresh, markAllRead])

  const onPressItem = useCallback(
    (notification: AppNotification) => {
      if (notification.photo_id && notification.album_id) {
        navigation.navigate('PhotoDetail', { photoId: notification.photo_id, albumId: notification.album_id })
      }
    },
    [navigation]
  )

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ flexGrow: 1, padding: spacing.md }}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={theme.tint} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressItem(item)}
          style={[styles.row, { backgroundColor: item.read ? theme.surface : theme.tint + '14' }]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons name={ICONS[item.type]} size={18} color={theme.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { color: theme.text }]}>{label(item)}</Text>
            {item.comment_content && (
              <Text numberOfLines={1} style={[typography.subhead, { color: theme.textSecondary, marginTop: 2 }]}>
                “{item.comment_content}”
              </Text>
            )}
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
              {timeAgo(item.created_at)}
              {item.album_title ? ` · ${item.album_title}` : ''}
            </Text>
          </View>
          {item.photo_filename && (
            <Image source={{ uri: apiClient.thumbUrl(item.photo_filename) }} style={styles.thumb} contentFit="cover" />
          )}
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState icon="notifications-outline" title="Aucune notification" subtitle="Les commentaires, réactions et mentions apparaîtront ici." />
      }
    />
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 44, height: 44, borderRadius: radius.sm }
})
