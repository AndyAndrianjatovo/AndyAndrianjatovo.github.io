import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { photosApi } from '../api/photos'
import { apiClient, ApiError } from '../api/client'
import type { Photo } from '../api/types'
import { EmptyState } from '../components/EmptyState'
import { radius, spacing, useTheme } from '../theme'
import type { RootStackParamList } from '../navigation/types'

const GAP = spacing.xs
const COLUMNS = 3

export function AlbumDetailScreen() {
  const theme = useTheme()
  const route = useRoute<RouteProp<RootStackParamList, 'AlbumDetail'>>()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { albumId } = route.params
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setIsRefreshing(true)
      try {
        const data = await photosApi.listByAlbum(albumId)
        setPhotos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Impossible de charger les photos')
      } finally {
        setIsRefreshing(false)
      }
    },
    [albumId]
  )

  useEffect(() => {
    load(false)
  }, [load])

  if (photos === null && !error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    )
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: GAP, flexGrow: 1 }}
      data={photos ?? []}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={theme.tint} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('PhotoDetail', { photoId: item.id, albumId })}
          style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Image
            source={{ uri: apiClient.thumbUrl(item.filename) }}
            style={[styles.thumb, { backgroundColor: theme.surfaceSecondary }]}
            contentFit="cover"
            transition={150}
          />
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="camera-outline"
          title={error ? 'Connexion impossible' : 'Album vide'}
          subtitle={error ?? "Aucune photo n'a encore été ajoutée à cet album."}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1 / COLUMNS, aspectRatio: 1, padding: GAP / 2 },
  thumb: { flex: 1, borderRadius: radius.sm }
})
