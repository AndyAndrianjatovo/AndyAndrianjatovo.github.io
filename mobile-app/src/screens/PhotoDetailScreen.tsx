import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { Image } from 'expo-image'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { photosApi } from '../api/photos'
import { familyTreeApi } from '../api/familyTree'
import { apiClient } from '../api/client'
import type { Comment, FamilyPerson, Photo, PhotoTag, Reaction } from '../api/types'
import { CommentItem } from '../components/CommentItem'
import { ReactionBar } from '../components/ReactionBar'
import { radius, spacing, typography, useTheme } from '../theme'
import type { RootStackParamList } from '../navigation/types'

export function PhotoDetailScreen() {
  const theme = useTheme()
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoDetail'>>()
  const { photoId, albumId } = route.params

  const [photo, setPhoto] = useState<Photo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [tags, setTags] = useState<PhotoTag[]>([])
  const [people, setPeople] = useState<Pick<FamilyPerson, 'id' | 'first_name' | 'last_name'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [commentDraft, setCommentDraft] = useState('')
  const [isTagging, setIsTagging] = useState(false)
  const [pendingTagPosition, setPendingTagPosition] = useState<{ x: number; y: number } | null>(null)
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 })

  const loadAll = useCallback(async () => {
    const [photos, commentsData, reactionsData, tagsData] = await Promise.all([
      photosApi.listByAlbum(albumId),
      photosApi.comments(photoId),
      photosApi.reactions(photoId),
      photosApi.tags(photoId)
    ])
    setPhoto(photos.find((p) => p.id === photoId) ?? null)
    setComments(commentsData)
    setReactions(reactionsData)
    setTags(tagsData)
  }, [albumId, photoId])

  useEffect(() => {
    setIsLoading(true)
    loadAll().finally(() => setIsLoading(false))
  }, [loadAll])

  const onReact = async (emoji: string) => {
    const updated = await photosApi.react(photoId, emoji)
    setReactions(updated)
  }

  const onSendComment = async () => {
    const content = commentDraft.trim()
    if (!content) return
    setCommentDraft('')
    const created = await photosApi.addComment(photoId, content)
    setComments((prev) => [...prev, created])
  }

  const onStartTagging = async () => {
    if (people.length === 0) {
      try {
        setPeople(await familyTreeApi.people())
      } catch {
        // l'arbre généalogique reste optionnel si l'appel échoue
      }
    }
    setIsTagging(true)
  }

  const onImagePress = (x: number, y: number) => {
    if (!isTagging) return
    setPendingTagPosition({ x, y })
  }

  const onPickPerson = async (personId: string) => {
    if (!pendingTagPosition) return
    const tag = await photosApi.addTag(photoId, personId, pendingTagPosition.x, pendingTagPosition.y)
    setTags((prev) => [...prev, tag])
    setPendingTagPosition(null)
    setIsTagging(false)
  }

  const imageUri = useMemo(() => (photo ? apiClient.photoUrl(photo.filename) : null), [photo])

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Pressable
          onPress={(e) => {
            const { locationX, locationY } = e.nativeEvent
            onImagePress(locationX / imageSize.width, locationY / imageSize.height)
          }}
        >
          <View
            style={styles.imageWrapper}
            onLayout={(e) => setImageSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          >
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={150} />
            )}
            {tags.map((tag) => (
              <View
                key={tag.id}
                style={[styles.tagMarker, { left: `${tag.x * 100}%`, top: `${tag.y * 100}%` }]}
                pointerEvents="none"
              >
                <View style={[styles.tagDot, { backgroundColor: theme.tint }]} />
                <View style={[styles.tagLabel, { backgroundColor: theme.overlay }]}>
                  <Text style={styles.tagLabelText}>
                    {tag.first_name} {tag.last_name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Pressable>

        {isTagging && !pendingTagPosition && (
          <Text style={[typography.caption, { color: theme.tint, padding: spacing.md }]}>
            Touchez la photo à l'endroit où se trouve la personne à identifier.
          </Text>
        )}

        {pendingTagPosition && (
          <View style={{ padding: spacing.md }}>
            <Text style={[typography.subhead, { color: theme.text, marginBottom: spacing.sm }]}>
              Qui est-ce ?
            </Text>
            <FlatList
              horizontal
              data={people}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onPickPerson(item.id)}
                  style={[styles.personChip, { backgroundColor: theme.surfaceSecondary }]}
                >
                  <Text style={{ color: theme.text }}>
                    {item.first_name} {item.last_name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={{ padding: spacing.md, gap: spacing.md }}>
          <View style={styles.row}>
            <ReactionBar reactions={reactions} onReact={onReact} />
            <Pressable onPress={onStartTagging} style={styles.tagButton}>
              <Ionicons name="pricetag-outline" size={18} color={theme.tint} />
              <Text style={{ color: theme.tint, fontWeight: '600' }}>Identifier</Text>
            </Pressable>
          </View>

          <View>
            <Text style={[typography.headline, { color: theme.text, marginBottom: spacing.sm }]}>
              Commentaires
            </Text>
            {comments.length === 0 ? (
              <Text style={{ color: theme.textSecondary }}>Aucun commentaire pour l'instant.</Text>
            ) : (
              comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.commentBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TextInput
          value={commentDraft}
          onChangeText={setCommentDraft}
          placeholder="Ajouter un commentaire… @nom pour mentionner"
          placeholderTextColor={theme.textSecondary}
          style={[styles.commentInput, { color: theme.text }]}
          multiline
        />
        <Pressable onPress={onSendComment} disabled={!commentDraft.trim()}>
          <Ionicons name="send" size={22} color={commentDraft.trim() ? theme.tint : theme.textSecondary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageWrapper: { width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  tagMarker: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -6 }, { translateY: -6 }] },
  tagDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF' },
  tagLabel: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  tagLabelText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  tagButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  personChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, marginRight: spacing.xs },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  commentInput: { flex: 1, maxHeight: 100, fontSize: 15, paddingVertical: 8 }
})
