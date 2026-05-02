import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToChat, uploadChatFile } from '../../services/realtimeChat'
import { fetchSessionMessages, sendChatMessage } from '../../services/api'
import { formatRelativeTime } from '../../utils/formatTime'
import { Send, Image, FileText, X } from 'lucide-react'

export default function ChatPanel({ sessionId, isOpen, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    let ignore = false
    fetchSessionMessages(sessionId).then((data) => {
      if (!ignore) setMessages(data)
    })
    const unsubscribe = subscribeToChat(sessionId, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      ignore = true
      unsubscribe()
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await sendChatMessage(sessionId, {
        content: text.trim(),
        messageType: 'text',
      })
      setText('')
    } catch (e) { console.error('Send failed:', e) }
  }

  const handleFileUpload = async (file, messageType) => {
    if (!file) return
    setUploading(true)
    try {
      const { url, fileName } = await uploadChatFile(file, sessionId)
      await sendChatMessage(sessionId, {
        content: '',
        messageType,
        fileUrl: url,
        fileName,
      })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const renderMessageContent = (msg) => {
    if (msg.messageType === 'image' || msg.message_type === 'image') {
      const url = msg.fileUrl || msg.file_url
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt="shared"
            className="max-w-[240px] max-h-[180px] rounded-lg object-cover"
          />
        </a>
      )
    }
    if (msg.messageType === 'file' || msg.message_type === 'file') {
      const url = msg.fileUrl || msg.file_url
      const name = msg.fileName || msg.file_name || 'File'
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <FileText size={16} />
          <span className="text-sm font-medium truncate max-w-[180px]">{name}</span>
        </a>
      )
    }
    return <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{msg.content}</p>
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full glass-strong rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/40">
        <h3 className="text-sm font-semibold text-slate-700">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/50 text-slate-400 transition-colors lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.user?.id === user?.id || msg.userId === user?.id
          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-slate-400 mb-0.5">
                {msg.user?.name || msg.userName || 'Unknown'}
              </span>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  isOwn ? 'bg-slate-800 text-white' : 'glass'
                }`}
              >
                {renderMessageContent(msg)}
              </div>
              <span className="text-[10px] text-slate-300 mt-0.5">
                {formatRelativeTime(msg.createdAt || msg.created_at)}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {uploading && (
        <div className="px-4 py-2 text-xs text-slate-400">Uploading...</div>
      )}

      <form onSubmit={handleSend} className="p-3 border-t border-slate-200/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-lg glass text-slate-500 hover:text-slate-700 transition-colors"
            title="Send image"
          >
            <Image size={16} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) handleFileUpload(e.target.files[0], 'image')
              e.target.value = ''
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg glass text-slate-500 hover:text-slate-700 transition-colors"
            title="Send PDF/file"
          >
            <FileText size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) handleFileUpload(e.target.files[0], 'file')
              e.target.value = ''
            }}
          />

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-glass text-sm"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
