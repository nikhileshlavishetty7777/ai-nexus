// src/components/chat/MessageBubble.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, RefreshCw, Bot, User, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Message } from '../../store/chatStore'

interface MessageBubbleProps {
  message: Message
  onRegenerate?: () => void
  isLast?: boolean
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: '#0d0d1a', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <span className="text-xs font-mono" style={{ color: '#818cf8' }}>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: copied ? '#10b981' : '#94a3b8' }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        customStyle={{ margin: 0, borderRadius: 0, background: '#0d0d1a', fontSize: '13px', lineHeight: '1.6' }}
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export default function MessageBubble({ message, onRegenerate, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {/* Bubble */}
        {isUser ? (
          <div className="message-user">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className={`message-assistant ${message.is_error ? 'border-red-500/30 bg-red-500/5' : ''}`}>
            {message.is_error && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Error response
              </div>
            )}
            <div className="prose-nexus">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    if (isInline) {
                      return <code className={className} {...props}>{children}</code>
                    }
                    return (
                      <CodeBlock language={match[1]}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {message.model && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {message.model}
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: copied ? '#10b981' : 'var(--text-muted)' }}
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isAssistant && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  )
}
