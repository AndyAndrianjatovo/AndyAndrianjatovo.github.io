import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme, radius, spacing, typography } from '../theme'

export function LoginScreen() {
  const theme = useTheme()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!username || !password) {
      setError('Renseignez votre identifiant et votre mot de passe.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch {
      setError('Identifiants incorrects.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[typography.largeTitle, { color: theme.text }]}>Lumière Photos</Text>
        <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs }]}>
          Les souvenirs de famille, partagés en toute simplicité.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Identifiant ou e-mail"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        />

        {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint, opacity: pressed || isSubmitting ? 0.8 : 1 }
          ]}
        >
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  header: { marginBottom: spacing.xl },
  form: { gap: spacing.md },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    fontSize: 16
  },
  button: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  error: { fontSize: 14 }
})
