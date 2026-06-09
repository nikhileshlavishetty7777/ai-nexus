// src/components/chat/Sidebar.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, MessageSquare, Pin, Trash2, Edit3, MoreHorizontal,
  LogOut, Settings, User, Sparkles, ChevronDown, Sun, Moon, X, Check,
  Bot, Archive
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { formatDistanceToNow } from 'date-fns'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { chats, loadChats, createChat, deleteChat, updateChat, searchQuery, setSearchQuery } = useChatStore()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => { loadChats() }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadChats(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleNewChat = async () => {
    const chat = await createChat()
    navigate(`/chat/${chat.id}`)
    onClose()
  }

  const handleSelectChat = (id: string) => {
    navigate(`/chat/${id}`)
    onClose()
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteChat(id)
    if (chatId === id) navigate('/chat')
    toast.success('Chat deleted')
    setMenuOpen(null)
  }

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return
    await updateChat(id, { title: editTitle.trim() })
    setEditingId(null)
    toast.success('Renamed')
  }

  const handlePin = async (id: string, pinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    await updateChat(id, { is_pinned: !pinned })
    setMenuOpen(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out')
  }

  const pinnedChats = chats.filter(c => c.is_pinned)
  const recentChats = chats.filter(c => !c.is_pinned)

  const ChatItem = ({ chat }: { chat: typeof chats[0] }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={() => handleSelectChat(chat.id)}
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${chatId === chat.id ? 'active' : ''} sidebar-item`}
    >
      {/* Icon */}
      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: chatId === chat.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)' }}>
        <MessageSquare className="w-3.5 h-3.5" style={{ color: chatId === chat.id ? 'var(--accent)' : 'var(--text-muted)' }} />
      </div>

      {/* Title */}
      {editingId === chat.id ? (
        <input
          autoFocus
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleRename(chat.id); if (e.key === 'Escape') setEditingId(null) }}
          onClick={e => e.stopPropagation()}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
      ) : (
        <span className="flex-1 text-sm truncate">{chat.title}</span>
      )}

      {/* Pin indicator */}
      {chat.is_pinned && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />}

      {/* Actions */}
      {editingId === chat.id ? (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => handleRename(chat.id)} className="p-1 rounded text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditingId(null)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setMenuOpen(menuOpen === chat.id ? null : chat.id) }}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      )}

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen === chat.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-xl py-1 min-w-[160px]"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setEditTitle(chat.title); setEditingId(chat.id); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Edit3 className="w-3.5 h-3.5" /> Rename
            </button>
            <button onClick={(e) => handlePin(chat.id, chat.is_pinned, e)} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Pin className="w-3.5 h-3.5" /> {chat.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            <div className="h-px my-1" style={{ background: 'var(--border)' }} />
            <button onClick={(e) => handleDelete(chat.id, e)} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-400">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col lg:relative lg:translate-x-0 lg:z-auto"
        style={{ width: 280, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text text-lg">AI Nexus</span>
          <button onClick={onClose} className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 py-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleNewChat}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder="Search chats..."
              className="input-field pl-9 py-2 text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
          {/* Pinned */}
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Pin className="w-3 h-3" /> Pinned
              </div>
              <AnimatePresence>
                {pinnedChats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
              </AnimatePresence>
            </div>
          )}

          {/* Recent */}
          {recentChats.length > 0 && (
            <div>
              {pinnedChats.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Recent</div>
              )}
              <AnimatePresence>
                {recentChats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
              </AnimatePresence>
            </div>
          )}

          {chats.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No chats yet. Start a new one!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="sidebar-item w-full text-left"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="sidebar-item w-full"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.username}</div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden shadow-xl py-1"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); onClose() }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <User className="w-4 h-4" /> Profile
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { navigate('/admin'); setUserMenuOpen(false); onClose() }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Settings className="w-4 h-4" /> Admin Panel
                    </button>
                  )}
                  <div className="h-px my-1" style={{ background: 'var(--border)' }} />
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-red-500/10 transition-colors text-red-400">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
