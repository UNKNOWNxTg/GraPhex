import type { User, UserPreferences } from '../types/messaging'

export const previewUser: User = {
  id: 'preview-user',
  displayName: 'Ujjwal',
  username: 'chipas.paglu',
}

export const defaultPreferences: UserPreferences = {
  theme: 'dark',
  compactSpacing: false,
  presenceVisible: true,
  readReceipts: true,
}
