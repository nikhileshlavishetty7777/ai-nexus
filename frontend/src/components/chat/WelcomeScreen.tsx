// src/components/chat/WelcomeScreen.tsx
import { motion } from 'framer-motion'
import { Sparkles, Code2, FileText, Globe, Mail, PenTool, Calculator, Lightbulb } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const SUGGESTIONS = [
  { icon: Code2, text: 'Write a Python function to sort a list of dictionaries', color: '#06b6d4' },
  { icon: Globe, text: 'Translate "Hello, how are you?" to Japanese, Spanish, and French', color: '#10b981' },
  { icon: FileText, text: 'Summarize the key points of the attached document', color: '#f59e0b' },
  { icon: Mail, text: 'Write a professional email requesting a meeting with a client', color: '#8b5cf6' },
  { icon: PenTool, text: 'Write a 500-word essay on the impact of AI on education', color: '#ec4899' },
  { icon: Calculator, text: 'Explain the concept of quantum entanglement simply', color: '#6366f1' },
]

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void
}

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  const { user } = useAuthStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        {/* Animated logo */}
        <motion.div
          animate={{
            boxShadow: ['0 0 20px rgba(99,102,241,0.3)', '0 0 50px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.3)'],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {user?.full_name ? `Hello, ${user.full_name.split(' ')[0]}!` : `Hello, ${user?.username}!`} 👋
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          I'm AI Nexus. How can I help you today?
        </p>

        {/* Suggestion grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s.text}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSuggestion(s.text)}
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 text-sm"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${s.color}15` }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="leading-snug">{s.text}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Powered by OpenAI GPT-4o & Google Gemini 1.5 Pro
        </p>
      </motion.div>
    </div>
  )
}
