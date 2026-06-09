// src/store/chatStore.ts
import { create } from 'zustand'
import { chatsAPI } from '../utils/api'

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  provider?: string
  tokens_used: number
  is_error: boolean
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  model: string
  provider: string
  is_pinned: boolean
  is_archived: boolean
  message_count: number
  total_tokens: number
  system_prompt?: string
  created_at: string
  updated_at: string
}

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  streamingContent: string
  searchQuery: string

  loadChats: (search?: string) => Promise<void>
  createChat: (data?: Partial<Chat>) => Promise<Chat>
  selectChat: (chatId: string) => Promise<void>
  updateChat: (chatId: string, data: Partial<Chat>) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  addMessage: (message: Message) => void
  setStreamingContent: (content: string) => void
  setIsStreaming: (value: boolean) => void
  setSearchQuery: (query: string) => void
  clearCurrentChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  searchQuery: '',

  loadChats: async (search) => {
    set({ isLoading: true })
    try {
      const params: any = {}
      if (search) params.search = search
      const { data } = await chatsAPI.list(params)
      set({ chats: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createChat: async (data = {}) => {
    const { data: chat } = await chatsAPI.create({
      title: 'New Chat',
      model: 'gpt-4o-mini',
      provider: 'openai',
      ...data,
    })
    set((state) => ({ chats: [chat, ...state.chats] }))
    return chat
  },

 selectChat: async (chatId) => {
  try {
    set({ isLoading: true })

    const [chatRes, messagesRes] = await Promise.all([
      chatsAPI.get(chatId),
      chatsAPI.getMessages(chatId),
    ])

    set({
      currentChat: chatRes.data,
      messages: messagesRes.data,
      streamingContent: '',
      isLoading: false,
    })
  } catch (error) {
    console.error(error)
    set({ isLoading: false })
  }
},

  updateChat: async (chatId, data) => {
    const { data: updated } = await chatsAPI.update(chatId, data)
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chatId ? updated : c)),
      currentChat: state.currentChat?.id === chatId ? updated : state.currentChat,
    }))
  },

  deleteChat: async (chatId) => {
    await chatsAPI.delete(chatId)
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
      messages: state.currentChat?.id === chatId ? [] : state.messages,
    }))
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  setStreamingContent: (content) => {
    set({ streamingContent: content })
  },

  setIsStreaming: (value) => {
    set({ isStreaming: value })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  clearCurrentChat: () => {
    set({ currentChat: null, messages: [], streamingContent: '' })
  },
}))
