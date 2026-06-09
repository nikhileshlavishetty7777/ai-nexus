// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, User, Mail, Lock, Save, MessageSquare,
  Zap, Calendar, TrendingUp, Eye, EyeOff, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { usersAPI } from '../utils/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    avatar_url: user?.avatar_url || '',
  })

  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
  })

  useEffect(() => {
    usersAPI.getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await usersAPI.updateProfile(profileForm)
      updateUser(data)
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await usersAPI.changePassword(passForm)
      toast.success('Password changed!')
      setPassForm({ current_password: '', new_password: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const statCards = [
    { icon: MessageSquare, label: 'Total Chats', value: stats?.total_chats ?? '—', color: '#6366f1' },
    { icon: TrendingUp, label: 'Messages', value: stats?.total_messages ?? '—', color: '#10b981' },
    { icon: Zap, label: 'Tokens Used', value: stats?.total_tokens?.toLocaleString() ?? '—', color: '#f59e0b' },
    { icon: Calendar, label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '—', color: '#a855f7' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/chat')} className="p-2 rounded-xl hover:bg-white/10 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Avatar + name */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <Camera className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.full_name || user?.username}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
              style={{ background: user?.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)', color: user?.role === 'admin' ? '#818cf8' : '#10b981' }}>
              {user?.role}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="card text-center p-4">
              <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            {(['profile', 'security'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                style={{
                  background: activeTab === tab ? 'var(--bg-secondary)' : 'transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Your full name" className="input-field pl-10" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Avatar URL (optional)</label>
                <input type="url" placeholder="https://..." className="input-field" value={profileForm.avatar_url} onChange={e => setProfileForm(f => ({ ...f, avatar_url: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" className="input-field pl-10 opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </motion.button>
            </motion.div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} placeholder="Current password" className="input-field pl-10 pr-10" value={passForm.current_password} onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" className="input-field pl-10" value={passForm.new_password} onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))} />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleChangePassword} disabled={saving || !passForm.current_password || !passForm.new_password} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
