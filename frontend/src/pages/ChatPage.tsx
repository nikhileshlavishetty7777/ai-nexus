// src/pages/ChatPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Download, MoreVertical, Trash2, Pin, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { streamMessage, chatsAPI } from '../utils/api'
import Sidebar from '../components/chat/Sidebar'
import MessageBubble from '../components/chat/MessageBubble'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import WelcomeScreen from '../components/chat/WelcomeScreen'

export default function ChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatMenuOpen, setChatMenuOpen] = useState(false)

  const {
    currentChat, messages, isStreaming, streamingContent,
    selectChat, createChat, deleteChat, updateChat,
    addMessage, setStreamingContent, setIsStreaming, clearCurrentChat,
  } = useChatStore()
  const { user } = useAuthStore()

  // Load chat on mount / route change
  useEffect(() => {
    if (chatId) {
      selectChat(chatId)
    } else {
      clearCurrentChat()
    }
  }, [chatId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async (content: string, documentId?: string) => {
    if (!content.trim() || isStreaming) return

    let activeChatId = chatId
    // If no chat selected, create one
    if (!activeChatId) {
      const chat = await createChat({ model: 'gpt-4o-mini', provider: 'openai' })
      activeChatId = chat.id
      navigate(`/chat/${chat.id}`, { replace: true })
      await new Promise(r => setTimeout(r, 100))
    }

    // Optimistically add user message
    const tempMsg = {
      id: `temp-${Date.now()}`,
      chat_id: activeChatId!,
      role: 'user' as const,
      content,
      tokens_used: 0,
      is_error: false,
      created_at: new Date().toISOString(),
    }
    addMessage(tempMsg)
    setIsStreaming(true)
    setStreamingContent('')

    let accumulatedContent = ''

    await streamMessage(
      activeChatId!,
      content,
      {
        model: currentChat?.model,
        provider: currentChat?.provider,
        document_id: documentId,
      },
      (chunk) => {
  accumulatedContent += chunk

  console.log("CHUNK:", chunk)

  setStreamingContent(accumulatedContent)
},
      (data) => {
  console.log("DONE:", accumulatedContent)

  setIsStreaming(false)

  // Assistant message immediately UI me add karo
  addMessage({
    id: data.message_id || `assistant-${Date.now()}`,
    chat_id: activeChatId!,
    role: 'assistant',
    content: accumulatedContent,
    tokens_used: 0,
    is_error: false,
    created_at: new Date().toISOString(),
  })

  setStreamingContent('')

  // Chat title update
  if (data.title) {
    updateChat(activeChatId!, {
      title: data.title,
    })
  }

  // Database se sync
  setTimeout(async () => {
    try {
      await selectChat(activeChatId!)
    } catch (err) {
      console.error(err)
    }
  }, 500)
},
      (error) => {
        setIsStreaming(false)
        setStreamingContent('')
        toast.error(`Error: ${error}`)
        addMessage({
          id: `err-${Date.now()}`,
          chat_id: activeChatId!,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error}`,
          tokens_used: 0,
          is_error: true,
          created_at: new Date().toISOString(),
        })
      }
    )
  }

  const handleRegenerate = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      handleSend(lastUserMessage.content)
    }
  }

  const handleModelChange = async (model: string, provider: string) => {
    if (currentChat) {
      await updateChat(currentChat.id, { model, provider })
      toast.success(`Switched to ${model}`)
    }
  }

  const handleExport = async (format: 'json' | 'markdown' | 'txt') => {
    if (!currentChat) return
    try {
      const response = await chatsAPI.export(currentChat.id, format)
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentChat.title}.json`
        a.click()
      } else {
        const url = URL.createObjectURL(response.data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentChat.title}.${format === 'markdown' ? 'md' : 'txt'}`
        a.click()
      }
      toast.success('Chat exported!')
      setChatMenuOpen(false)
    } catch {
      toast.error('Export failed')
    }
  }

  const handleDeleteChat = async () => {
    if (!currentChat) return
    await deleteChat(currentChat.id)
    navigate('/chat')
    toast.success('Chat deleted')
    setChatMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop sidebar spacer */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: 280 }} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg lg:hidden hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Chat title */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {currentChat?.title || 'New Chat'}
            </h1>
            {currentChat && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {currentChat.model} · {currentChat.message_count} messages
              </p>
            )}
          </div>

          {/* Chat actions */}
          {currentChat && (
            <div className="relative">
              <button
                onClick={() => setChatMenuOpen(o => !o)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {chatMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl py-1 z-50 min-w-[180px]"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Export as</div>
                    {(['json', 'markdown', 'txt'] as const).map(fmt => (
                      <button key={fmt} onClick={() => handleExport(fmt)} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <Download className="w-3.5 h-3.5" />
                        {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                      </button>
                    ))}
                    <div className="h-px my-1" style={{ background: 'var(--border)' }} />
                    <button onClick={() => { updateChat(currentChat.id, { is_pinned: !currentChat.is_pinned }); setChatMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <Pin className="w-3.5 h-3.5" /> {currentChat.is_pinned ? 'Unpin' : 'Pin Chat'}
                    </button>
                    <button onClick={handleDeleteChat} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-400">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {(!currentChat || messages.length === 0) && !isStreaming ? (
            <WelcomeScreen onSuggestion={(text) => handleSend(text)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLast={i === messages.length - 1}
                    onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : undefined}
                  />
                ))}
              </AnimatePresence>

              {/* Streaming indicator */}
              <AnimatePresence>
                {isStreaming && (
                  <TypingIndicator streamContent={streamingContent} />
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <ChatInput
            onSend={handleSend}
            isStreaming={isStreaming}
            chatId={chatId || ''}
            currentModel={currentChat?.model || 'gpt-4o-mini'}
            currentProvider={currentChat?.provider || 'openai'}
            onModelChange={handleModelChange}
          />
        </div>
      </div>
    </div>
  )
}
