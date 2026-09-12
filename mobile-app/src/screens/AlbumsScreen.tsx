import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { albumsApi } from '../api/albums'
import { ApiError } from '../api/client'
import type { Album } from '../api/types'
import { AlbumCard } from '../components/AlbumCard'
import { EmptyState } from '../components/EmptyState'
import { spacing, useTheme } from '../theme'
import type { RootStackParamList } from '../navigation/types'

export function AlbumsScreen() {
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [albums, setAlbums] = useState<Album[] | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const data = await albumsApi.list()
      setAlbums(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les albums")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load(false)
  }, [load])

  useFocusEffect(
    useCallback(() => {
      load(false)
    }, [load])
  )

  if (albums === null && !error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    )
  }

  if (error && !albums) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <EmptyState icon="cloud-offline-outline" title="Connexion impossible" subtitle={error} />
      </View>
    )
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.sm, flexGrow: 1 }}
      data={albums ?? []}
      keyExtractor={(item) => item.id}
      numColumns={2}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={theme.tint} />}
      renderItem={({ item }) => (
        <AlbumCard album={item} onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id, title: item.title })} />
      )}
      ListEmptyComponent={
        <EmptyState
          icon="images-outline"
          title="Aucun album pour l'instant"
          subtitle="Les albums créés par l'administrateur apparaîtront ici."
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
