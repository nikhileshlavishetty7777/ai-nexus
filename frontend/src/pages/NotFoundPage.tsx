// src/pages/NotFoundPage.tsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Sparkles } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-8xl mb-6"
        >
          🤖
        </motion.div>
        <h1 className="text-6xl font-extrabold mb-4 gradient-text">404</h1>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page not found</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-secondary flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/chat" className="btn-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Open Chat
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
