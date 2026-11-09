export type Message = {
  id: number
  text: string
  time: string
  mine?: boolean
  read?: boolean
  attachment?: boolean
  status?: MessageStatus
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type User = {
  id: string
  displayName: string
  username: string
  email?: string
  avatarUrl?: string
}

export type Attachment = {
  id: string
  name: string
  mimeType: string
  size: number
  url?: string
}

export type Conversation = {
  id: number
  name: string
  initials: string
  color: string
  online: boolean
  preview: string
  time: string
  unread?: number
  messages: Message[]
}

export type Theme = 'dark' | 'light' | 'system'

export type UserPreferences = {
  theme: Theme
  compactSpacing: boolean
  presenceVisible: boolean
  readReceipts: boolean
}
