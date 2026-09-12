import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Comment } from '../api/types'
import { spacing, typography, useTheme } from '../theme'

export function CommentItem({ comment }: { comment: Comment }) {
  const theme = useTheme()
  const parts = comment.content.split(/(@\w+)/g)

  return (
    <View style={styles.container}>
      <Text style={[typography.subhead, { color: theme.text, fontWeight: '600' }]}>{comment.username}</Text>
      <Text style={[typography.body, { color: theme.text, marginTop: 2 }]}>
        {parts.map((part, i) =>
          part.startsWith('@') ? (
            <Text key={i} style={{ color: theme.tint, fontWeight: '600' }}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md }
})
