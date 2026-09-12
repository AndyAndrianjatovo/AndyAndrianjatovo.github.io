import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { familyTreeApi } from '../api/familyTree'
import { apiClient } from '../api/client'
import type { FamilyPerson } from '../api/types'
import { EmptyState } from '../components/EmptyState'
import { radius, spacing, typography, useTheme } from '../theme'

/**
 * L'arbre généalogique complet (couples, liens parent-enfant, rendu
 * graphique interactif) mérite son propre écran dédié avec un moteur de
 * layout (cf. public/family-tree.html côté web, qui fait ~57 Ko de JS).
 * Pour ce scaffold on affiche la liste des personnes connectées à l'API
 * réelle ; le rendu "arbre" visuel est la prochaine étape (voir README).
 */
export function FamilyTreeScreen() {
  const theme = useTheme()
  const [people, setPeople] = useState<FamilyPerson[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    familyTreeApi
      .get()
      .then((data) => setPeople(data.people))
      .catch(() => setError("Impossible de charger l'arbre généalogique"))
  }, [])

  if (!people && !error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    )
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
      data={people ?? []}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      renderItem={({ item }) => (
        <View style={[styles.row, { backgroundColor: theme.surface }]}>
          {item.photo_filename ? (
            <Image source={{ uri: apiClient.familyPhotoUrl(item.photo_filename) }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
          )}
          <View>
            <Text style={[typography.body, { color: theme.text }]}>
              {item.first_name} {item.last_name}
            </Text>
            {item.birth_date && (
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{item.birth_date}</Text>
            )}
          </View>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="git-network-outline"
          title={error ? 'Connexion impossible' : 'Arbre vide'}
          subtitle={error ?? "L'administrateur n'a pas encore ajouté de membres."}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.md },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {}
})
