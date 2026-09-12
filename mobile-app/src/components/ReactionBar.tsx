import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Reaction } from '../api/types'
import { radius, spacing, useTheme } from '../theme'

// 6 réactions façon Facebook, cf. CDC.
export const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export function ReactionBar({
  reactions,
  onReact
}: {
  reactions: Reaction[]
  onReact: (emoji: string) => void
}) {
  const theme = useTheme()
  const countByEmoji = new Map(reactions.map((r) => [r.emoji, r]))

  return (
    <View style={styles.row}>
      {REACTIONS.map((emoji) => {
        const reaction = countByEmoji.get(emoji)
        const isActive = reaction?.reacted === 1
        return (
          <Pressable
            key={emoji}
            onPress={() => onReact(emoji)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.tint + '22' : theme.surfaceSecondary,
                borderColor: isActive ? theme.tint : 'transparent'
              }
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            {!!reaction?.count && (
              <Text style={[styles.count, { color: isActive ? theme.tint : theme.textSecondary }]}>
                {reaction.count}
              </Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    gap: 4
  },
  emoji: { fontSize: 16 },
  count: { fontSize: 13, fontWeight: '600' }
})
