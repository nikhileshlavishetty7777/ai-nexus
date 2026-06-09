// src/pages/LandingPage.tsx
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, Zap, Brain, Code2, Globe2, FileText,
  ArrowRight, Star, Shield, ChevronDown, Bot, MessageSquare
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon } from 'lucide-react'

const features = [
  { icon: Brain, title: 'Advanced AI Models', desc: 'GPT-4o, Gemini 1.5 Pro and more at your fingertips', color: 'from-purple-500 to-indigo-500' },
  { icon: Code2, title: 'Code Generation', desc: 'Write, debug and explain code in any language', color: 'from-cyan-500 to-blue-500' },
  { icon: Globe2, title: 'Multi-Language', desc: 'Translate and communicate in 100+ languages', color: 'from-green-500 to-emerald-500' },
  { icon: FileText, title: 'Document Analysis', desc: 'Upload PDFs, docs and get AI-powered insights', color: 'from-orange-500 to-rose-500' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Streaming responses for instant AI interaction', color: 'from-yellow-500 to-orange-500' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT auth, encrypted storage, your data stays safe', color: 'from-violet-500 to-purple-500' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer', text: 'AI Nexus transformed my workflow. The code generation is incredible.', stars: 5 },
  { name: 'Marcus Rivera', role: 'Product Manager', text: 'The document analysis feature saves me hours every week. Essential tool.', stars: 5 },
  { name: 'Priya Sharma', role: 'Content Creator', text: 'Best AI writing assistant I\'ve used. The multi-model switching is genius.', stars: 5 },
]

const modelBadges = ['GPT-4o', 'GPT-4o Mini', 'Gemini 1.5 Pro', 'Gemini Flash', 'GPT-3.5']

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: isDark ? '#0a0a0f' : '#fafafa' }}>
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">AI Nexus</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#models" className="hover:text-indigo-400 transition-colors">Models</a>
            <a href="#testimonials" className="hover:text-indigo-400 transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors hover:bg-white/10">
              {isDark ? <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
            </button>
            {isAuthenticated ? (
              <Link to="/chat" className="btn-primary text-sm py-2 px-5">Open App</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(99,102,241,0.1)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(168,85,247,0.1)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
          >
            <Sparkles className="w-3 h-3" />
            Powered by GPT-4o & Gemini 1.5 Pro
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            The AI Platform{' '}
            <span className="gradient-text">Built for</span>
            <br />
            <span className="gradient-text">Serious Work</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Chat, code, analyze documents, translate, and create — all in one
            beautifully designed AI workspace powered by multiple frontier models.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              <Sparkles className="w-4 h-4" />
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <MessageSquare className="w-4 h-4" />
              Sign In
            </Link>
          </motion.div>

          {/* Model badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-16"
          >
            {modelBadges.map((model, i) => (
              <motion.span
                key={model}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {model}
              </motion.span>
            ))}
          </motion.div>

          {/* Hero Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs" style={{ color: 'var(--text-muted)' }}>AI Nexus — New Chat</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="message-user w-fit ml-auto">Explain quantum computing in simple terms</div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="message-assistant">
                    <p style={{ color: 'var(--text-primary)' }}>
                      Quantum computing uses <strong>quantum bits (qubits)</strong> that can exist in multiple states simultaneously — unlike classical bits which are either 0 or 1. This allows quantum computers to solve certain problems exponentially faster...
                    </p>
                    <div className="flex gap-1 mt-3">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute inset-0 -z-10 rounded-2xl blur-xl" style={{ background: 'rgba(99,102,241,0.15)' }} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to{' '}
              <span className="gradient-text">work smarter</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Powerful AI features designed for professionals, creators, and developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="card cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models ── */}
      <section id="models" className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="gradient-text">Multiple Models,</span> One Platform
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Switch between OpenAI and Google Gemini models with one click
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'GPT-4o', provider: 'OpenAI', color: '#10a37f', desc: 'Most capable' },
              { name: 'GPT-4o Mini', provider: 'OpenAI', color: '#10a37f', desc: 'Fast & affordable' },
              { name: 'Gemini 1.5 Pro', provider: 'Google', color: '#4285f4', desc: 'Multimodal AI' },
              { name: 'Gemini Flash', provider: 'Google', color: '#4285f4', desc: 'Ultra-fast' },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl text-center"
                style={{ background: 'var(--bg-tertiary)', border: `1px solid ${model.color}30` }}
              >
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold" style={{ background: model.color }}>
                  {model.name[0]}
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{model.name}</div>
                <div className="text-xs mb-1" style={{ color: model.color }}>{model.provider}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--text-primary)' }}
          >
            Loved by <span className="gradient-text">professionals</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <div className="absolute inset-0 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
          <div className="relative">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to get started?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of professionals already using AI Nexus
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        © 2024 AI Nexus. Built with FastAPI, React & ❤️
      </footer>
    </div>
  )
}
