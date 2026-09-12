import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, typography, useTheme } from '../theme'

export function EmptyState({
  icon,
  title,
  subtitle
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
}) {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={theme.textSecondary} />
      <Text style={[typography.headline, { color: theme.text, marginTop: spacing.md }]}>{title}</Text>
      {subtitle && (
        <Text style={[typography.subhead, { color: theme.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }
})
