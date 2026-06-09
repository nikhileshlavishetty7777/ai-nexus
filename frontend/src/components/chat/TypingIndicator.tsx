// src/components/chat/TypingIndicator.tsx
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface TypingIndicatorProps {
  streamContent?: string
}

export default function TypingIndicator({ streamContent }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 mb-6"
    >
      {/* Avatar */}
      <motion.div
        animate={{ boxShadow: ['0 0 10px rgba(99,102,241,0.3)', '0 0 25px rgba(99,102,241,0.6)', '0 0 10px rgba(99,102,241,0.3)'] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5"
      >
        <Bot className="w-4 h-4 text-white" />
      </motion.div>

      <div className="message-assistant max-w-[85%]">
        {streamContent ? (
          /* Render streaming content as markdown */
          <div className="prose-nexus">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (!match) {
                    return <code className={className} {...props}>{children}</code>
                  }
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      customStyle={{ margin: '8px 0', borderRadius: '8px', background: '#0d0d1a', fontSize: '13px' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  )
                },
              }}
            >
              {streamContent}
            </ReactMarkdown>
            {/* Cursor blink */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle"
              style={{ background: 'var(--accent)' }}
            />
          </div>
        ) : (
          /* Dots animation while waiting */
          <div className="flex items-center gap-1.5 py-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="typing-dot"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
