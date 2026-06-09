// src/components/chat/ChatInput.tsx
import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import {
  Send, Paperclip, X, FileText, Sparkles,
  ChevronDown, Zap, Globe, Brain, Code2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { documentsAPI } from '../../utils/api'

interface ChatInputProps {
  onSend: (content: string, documentId?: string) => void
  isStreaming: boolean
  chatId: string
  currentModel?: string
  currentProvider?: string
  onModelChange?: (model: string, provider: string) => void
}

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: Brain, color: '#10a37f', desc: 'Most capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', icon: Zap, color: '#10a37f', desc: 'Fast & cheap' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'openai', icon: Code2, color: '#10a37f', desc: 'Cost-effective' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', icon: Sparkles, color: '#4285f4', desc: 'Google AI' },
  { id: 'gemini-1.5-flash', name: 'Gemini Flash', provider: 'gemini', icon: Zap, color: '#4285f4', desc: 'Ultra-fast' },
]

export default function ChatInput({ onSend, isStreaming, chatId, currentModel, currentProvider, onModelChange }: ChatInputProps) {
  const [content, setContent] = useState('')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string; name: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedModel = MODELS.find(m => m.id === currentModel) || MODELS[0]

  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed, uploadedDoc?.id)
    setContent('')
    setUploadedDoc(null)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|docx)$/i)) {
      toast.error('Only PDF, TXT and DOCX files are supported')
      return
    }

    setIsUploading(true)
    try {
      const { data } = await documentsAPI.upload(file, chatId)
      setUploadedDoc({ id: data.id, name: data.original_filename })
      toast.success('Document uploaded!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Uploaded doc preview */}
        <AnimatePresence>
          {uploadedDoc && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FileText className="w-4 h-4 text-indigo-400" />
                <span style={{ color: 'var(--text-secondary)' }}>{uploadedDoc.name}</span>
                <button onClick={() => setUploadedDoc(null)} style={{ color: 'var(--text-muted)' }} className="hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input box */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: isStreaming ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none', transition: 'box-shadow 0.2s' }}>
          <TextareaAutosize
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'AI is thinking...' : 'Message AI Nexus... (Shift+Enter for new line)'}
            disabled={isStreaming}
            minRows={1}
            maxRows={8}
            className="w-full px-4 pt-4 pb-12 text-sm resize-none outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Left: file upload + model picker */}
            <div className="flex items-center gap-2">
              {/* File upload */}
              <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: 'var(--text-muted)' }}
                title="Upload document"
              >
                {isUploading
                  ? <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                  : <Paperclip className="w-4 h-4" />
                }
              </button>

              {/* Model picker */}
              <div className="relative">
                <button
                  onClick={() => setShowModelPicker(s => !s)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                  style={{ color: selectedModel.color, background: `${selectedModel.color}15`, border: `1px solid ${selectedModel.color}30` }}
                >
                  <selectedModel.icon className="w-3 h-3" />
                  {selectedModel.name}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {showModelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 left-0 rounded-xl overflow-hidden shadow-xl py-1 z-50 min-w-[200px]"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    >
                      {MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onModelChange?.(model.id, model.provider)
                            setShowModelPicker(false)
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${model.color}20` }}>
                            <model.icon className="w-3.5 h-3.5" style={{ color: model.color }} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)', ...(currentModel === model.id ? { color: model.color } : {}) }}>
                              {model.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.desc}</div>
                          </div>
                          {currentModel === model.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!content.trim() || isStreaming}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: content.trim() && !isStreaming
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'var(--bg-tertiary)',
              }}
            >
              {isStreaming
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </motion.button>
          </div>
        </div>

        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          AI Nexus can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
