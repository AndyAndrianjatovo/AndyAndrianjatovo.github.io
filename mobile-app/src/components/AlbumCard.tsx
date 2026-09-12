import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { apiClient } from '../api/client'
import type { Album } from '../api/types'
import { radius, spacing, typography, useTheme } from '../theme'

export function AlbumCard({ album, onPress }: { album: Album; onPress: () => void }) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.thumbWrapper, { backgroundColor: theme.surfaceSecondary }]}>
        {album.cover ? (
          <Image
            source={{ uri: apiClient.thumbUrl(album.cover.filename) }}
            style={styles.thumb}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={styles.emptyThumb}>
            <Ionicons name="images-outline" size={28} color={theme.textSecondary} />
          </View>
        )}
        {!album.is_public && (
          <View style={[styles.lockBadge, { backgroundColor: theme.overlay }]}>
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={[typography.headline, { color: theme.text, marginTop: spacing.sm }]}>
        {album.title}
      </Text>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>
        {album.photo_count} photo{album.photo_count > 1 ? 's' : ''}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg, padding: spacing.sm, margin: spacing.xs },
  thumbWrapper: { aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  emptyThumb: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lockBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: radius.pill,
    padding: 6
  }
})
