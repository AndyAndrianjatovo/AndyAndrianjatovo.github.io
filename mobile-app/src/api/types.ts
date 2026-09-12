export type Role = 'admin' | 'user'

export interface User {
  id: string
  username: string
  email?: string
  role: Role
}

export interface Album {
  id: string
  title: string
  description: string | null
  cover_photo_id: string | null
  share_token: string
  share_password: string | null
  is_public: 0 | 1
  created_by: string
  created_at: string
  photo_count: number
  cover: { filename: string } | null
  can_upload: boolean
}

export interface Photo {
  id: string
  album_id: string
  filename: string
  original_name: string | null
  caption: string | null
  uploaded_by: string
  created_at: string
  taken_at: string | null
  gps_lat: number | null
  gps_lng: number | null
  camera_model: string | null
}

export interface Comment {
  id: string
  photo_id: string
  user_id: string
  content: string
  created_at: string
  username: string
}

export interface Reaction {
  emoji: string
  count: number
  reacted: 0 | 1
}

export interface PhotoTag {
  id: string
  photo_id: string
  person_id: string
  x: number
  y: number
  created_by: string
  created_at: string
  first_name: string
  last_name: string
}

export type NotificationType = 'comment' | 'reaction' | 'mention' | 'tag' | 'tagged'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  from_user_id: string | null
  from_username: string | null
  photo_id: string | null
  photo_filename: string | null
  album_id: string | null
  album_title: string | null
  comment_id: string | null
  comment_content: string | null
  read: 0 | 1
  created_at: string
}

export interface NotificationsResponse {
  unread: number
  items: AppNotification[]
}

export interface FamilyPerson {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  death_date: string | null
  photo_filename: string | null
  gender: string | null
  bio: string | null
  user_id: string | null
}

export interface FamilyCouple {
  id: string
  person1_id: string
  person2_id: string
  wedding_date: string | null
}

export interface FamilyParentChild {
  parent_id: string
  child_id: string
}

export interface FamilyTreeResponse {
  people: FamilyPerson[]
  couples: FamilyCouple[]
  parentChild: FamilyParentChild[]
}

export interface ApiErrorBody {
  error: string
}
