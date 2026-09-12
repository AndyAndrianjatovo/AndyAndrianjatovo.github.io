export type RootStackParamList = {
  Login: undefined
  Tabs: undefined
  AlbumDetail: { albumId: string; title: string }
  PhotoDetail: { photoId: string; albumId: string }
}

export type TabParamList = {
  Albums: undefined
  FamilyTree: undefined
  Notifications: undefined
  Profile: undefined
}
