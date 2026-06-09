// src/pages/AdminPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MessageSquare, BarChart3, Settings, LogOut, Sparkles,
  ArrowLeft, Trash2, UserCheck, UserX, TrendingUp, Zap,
  Database, Search, ChevronDown, RefreshCw, Shield, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'

type Section = 'overview' | 'users' | 'chats' | 'logs' | 'settings'

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'logs', label: 'Usage Logs', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function StatCard({ title, value, icon: Icon, color, sub }: any) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" style={{ background: `${color}20` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value?.toLocaleString() ?? '—'}</div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</div>
        {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total_users} icon={Users} color="#6366f1" sub={`${stats.new_users_today} new today`} />
        <StatCard title="Active Users" value={stats.active_users} icon={UserCheck} color="#10b981" />
        <StatCard title="Total Chats" value={stats.total_chats} icon={MessageSquare} color="#f59e0b" />
        <StatCard title="Total Messages" value={stats.total_messages} icon={TrendingUp} color="#ec4899" sub={`${stats.messages_today} today`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard title="Total Tokens" value={stats.total_tokens} icon={Zap} color="#a855f7" />
        <StatCard title="OpenAI Tokens" value={stats.openai_tokens} icon={Globe} color="#10a37f" />
        <StatCard title="Gemini Tokens" value={stats.gemini_tokens} icon={Sparkles} color="#4285f4" />
      </div>
    </div>
  )
}

// ─── Users Tab ───────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getUsers({ search: search || undefined })
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(load, 400)
    return () => clearTimeout(t)
  }, [search])

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await adminAPI.updateUser(id, { is_active: !active })
      setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !active } : x))
      toast.success(`User ${active ? 'disabled' : 'enabled'}`)
    } catch { toast.error('Failed') }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      await adminAPI.deleteUser(id)
      setUsers(u => u.filter(x => x.id !== id))
      toast.success('User deleted')
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search users..." className="input-field pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border transition-colors hover:bg-white/5" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--bg-tertiary)' }}>
            <tr>
              {['User', 'Role', 'Status', 'Messages', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="transition-colors hover:bg-white/3" style={{ borderTop: '1px solid var(--border)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.username}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium capitalize"
                    style={{ background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.12)', color: u.role === 'admin' ? '#818cf8' : '#10b981' }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ background: u.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.is_active ? '#10b981' : '#ef4444' }}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.total_messages.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(u.id, u.is_active)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: u.is_active ? '#f59e0b' : '#10b981' }} title={u.is_active ? 'Disable' : 'Enable'}>
                      {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400" title="Delete user">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</div>
        )}
      </div>
    </div>
  )
}

// ─── Chats Tab ───────────────────────────────────────────────────────────────
function ChatsTab() {
  const [chats, setChats] = useState<any[]>([])

  const load = async () => {
    const { data } = await adminAPI.getChats()
    setChats(data)
  }

  useEffect(() => { load() }, [])

  const deleteChat = async (id: string) => {
    if (!confirm('Delete this chat?')) return
    await adminAPI.deleteChat(id)
    setChats(c => c.filter(x => x.id !== id))
    toast.success('Chat deleted')
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead style={{ background: 'var(--bg-tertiary)' }}>
          <tr>
            {['Title', 'User', 'Model', 'Messages', 'Tokens', 'Created', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chats.map(c => (
            <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }} className="hover:bg-white/3 transition-colors">
              <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.user_username}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{c.model}</span>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.message_count}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.total_tokens.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</td>
              <td className="px-4 py-3">
                <button onClick={() => deleteChat(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Logs Tab ────────────────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    adminAPI.getUsageLogs().then(r => setLogs(r.data)).catch(() => {})
  }, [])

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead style={{ background: 'var(--bg-tertiary)' }}>
          <tr>
            {['Provider', 'Model', 'Action', 'Tokens', 'Cost', 'Status', 'Time'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }} className="hover:bg-white/3 transition-colors">
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                  style={{ background: log.provider === 'openai' ? 'rgba(16,163,127,0.15)' : 'rgba(66,133,244,0.15)', color: log.provider === 'openai' ? '#10a37f' : '#4285f4' }}>
                  {log.provider}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{log.model}</td>
              <td className="px-4 py-3 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{log.action}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{log.total_tokens.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>${log.cost_estimate.toFixed(6)}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: log.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: log.status === 'success' ? '#10b981' : '#ef4444' }}>
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<Record<string, string>>({})

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const handleSave = async (key: string) => {
    try {
      await adminAPI.updateSetting(key, editing[key])
      setSettings(s => ({ ...s, [key]: { ...s[key], value: editing[key] } }))
      setEditing(e => { const n = { ...e }; delete n[key]; return n })
      toast.success('Setting saved')
    } catch { toast.error('Failed to save') }
  }

  return (
    <div className="space-y-3">
      {Object.entries(settings).map(([key, setting]) => (
        <div key={key} className="card p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)' }}>{key}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{setting.type}</span>
            </div>
            {setting.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{setting.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="input-field w-40 text-sm py-2"
              value={editing[key] ?? setting.value}
              onChange={e => setEditing(ed => ({ ...ed, [key]: e.target.value }))}
            />
            {editing[key] !== undefined && (
              <button onClick={() => handleSave(key)} className="btn-primary py-2 px-4 text-xs">Save</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [section, setSection] = useState<Section>('overview')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    adminAPI.getDashboard().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Admin sidebar */}
      <aside className="flex-shrink-0 flex flex-col" style={{ width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Nexus</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id as Section)}
              className={`sidebar-item w-full ${section === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => navigate('/chat')} className="sidebar-item w-full">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div>
            <h1 className="font-bold text-lg capitalize" style={{ color: 'var(--text-primary)' }}>
              {navItems.find(n => n.id === section)?.label}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Logged in as <strong>{user?.username}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              Admin
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {section === 'overview' && <OverviewTab stats={stats} />}
              {section === 'users' && <UsersTab />}
              {section === 'chats' && <ChatsTab />}
              {section === 'logs' && <LogsTab />}
              {section === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
