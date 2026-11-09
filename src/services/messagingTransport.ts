import type { Conversation, Message } from '../types/messaging'

export type SendMessageInput = { conversationId: string; text: string }
export type MessageEventHandler = (message: Message) => void

/**
 * Frontend transport boundary for the future Go service.
 * Expected REST routes: GET /api/v1/conversations,
 * GET /api/v1/conversations/{id}/messages, POST /api/v1/conversations/{id}/messages.
 * Live events use /ws?conversation_id={id}. The current UI intentionally uses mock state.
 */
export interface MessagingTransport {
  listConversations(signal?: AbortSignal): Promise<Conversation[]>
  listMessages(conversationId: string, signal?: AbortSignal): Promise<Message[]>
  sendMessage(input: SendMessageInput, signal?: AbortSignal): Promise<Message>
  subscribe(conversationId: string, onMessage: MessageEventHandler): () => void
}

export class HttpMessagingTransport implements MessagingTransport {
  constructor(private readonly baseUrl = '/api/v1', private readonly socketUrl = '/ws') {}

  async listConversations(signal?: AbortSignal): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations', { signal })
  }

  async listMessages(conversationId: string, signal?: AbortSignal): Promise<Message[]> {
    return this.request<Message[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`, { signal })
  }

  async sendMessage({ conversationId, text }: SendMessageInput, signal?: AbortSignal): Promise<Message> {
    return this.request<Message>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal,
    })
  }

  subscribe(conversationId: string, onMessage: MessageEventHandler): () => void {
    const url = new URL(this.socketUrl, window.location.href)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.searchParams.set('conversation_id', conversationId)
    const socket = new WebSocket(url)
    socket.addEventListener('message', (event) => {
      try { onMessage(JSON.parse(String(event.data)) as Message) } catch { /* Ignore malformed demo events. */ }
    })
    return () => socket.close()
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init)
    if (!response.ok) throw new Error(`Messaging request failed (${response.status}).`)
    return response.json() as Promise<T>
  }
}
