import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { NotificationsProvider } from '../context/NotificationsContext'
import { useTheme } from '../theme'
import { NotificationBell } from '../components/NotificationBell'
import type { RootStackParamList, TabParamList } from './types'

import { LoginScreen } from '../screens/LoginScreen'
import { AlbumsScreen } from '../screens/AlbumsScreen'
import { AlbumDetailScreen } from '../screens/AlbumDetailScreen'
import { PhotoDetailScreen } from '../screens/PhotoDetailScreen'
import { NotificationsScreen } from '../screens/NotificationsScreen'
import { FamilyTreeScreen } from '../screens/FamilyTreeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Albums: 'images-outline',
  FamilyTree: 'git-network-outline',
  Notifications: 'notifications-outline',
  Profile: 'person-circle-outline'
}

function MainTabs() {
  const theme = useTheme()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => (route.name === 'Notifications' ? undefined : <NotificationBell />),
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof TabParamList]} color={color} size={size} />
        )
      })}
    >
      <Tab.Screen name="Albums" component={AlbumsScreen} options={{ title: 'Albums' }} />
      <Tab.Screen name="FamilyTree" component={FamilyTreeScreen} options={{ title: 'Arbre généalogique' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  )
}

export function RootNavigator() {
  const { user, isBootstrapping } = useAuth()
  const theme = useTheme()

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    )
  }

  return (
    <NotificationsProvider>
      <NavigationContainer theme={theme.scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTitleStyle: { color: theme.text } }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen
                name="AlbumDetail"
                component={AlbumDetailScreen}
                options={({ route }) => ({ title: route.params.title })}
              />
              <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} options={{ title: 'Photo' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationsProvider>
  )
}
