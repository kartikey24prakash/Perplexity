import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hook/useChat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './dashboard.css'
import UserProfile from './UserProfile'

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="dash-typing">
      <span /><span /><span />
    </div>
  )
}

/* ── Loading skeleton for sidebar chats ── */
function ChatSkeleton() {
  return (
    <div className="dash-skeleton">
      {[1,2,3,4].map(i => (
        <div key={i} className="dash-skeleton__item">
          <div className="dash-skeleton__dot" />
          <div className="dash-skeleton__line" style={{ width: `${60 + i * 8}%` }} />
        </div>
      ))}
    </div>
  )
}

/* ── Copy button ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback for older browsers */
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button className={`dash-copy${copied ? ' dash-copy--done' : ''}`} onClick={handleCopy} title="Copy response">
      {copied ? (
        /* checkmark */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        /* copy icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

/* ── Format timestamp ── */
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ── Code block renderer ── */
function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '')
  const code  = String(children).replace(/\n$/, '')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return <code className="dash-code-inline" {...props}>{children}</code>
  }

  return (
    <div className="dash-code-block">
      <div className="dash-code-block__header">
        <span className="dash-code-block__lang">{match ? match[1] : 'code'}</span>
        <button className={`dash-code-block__copy${copied ? ' done' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={match ? match[1] : 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '0.78rem',
          background: '#0d0d0d',
          border: 'none',
          padding: '1rem',
        }}
        codeTagProps={{
          style: { background: 'transparent' }
        }}
        wrapLongLines={false}
        useInlineStyles={true}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

/* ── Single message ── */
function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`dash-message dash-message--${isUser ? 'user' : 'ai'}`}>
      {!isUser && <div className="dash-message__label">PERPLEXITY</div>}
      <div className="dash-message__body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: CodeBlock }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      <div className="dash-message__meta">
        {message.timestamp && (
          <span className="dash-message__time">{formatTime(message.timestamp)}</span>
        )}
        {!isUser && <CopyButton text={message.content} />}
      </div>
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ onChipClick }) {
  const CHIPS = [
    'How does LangChain work?',
    'What is RAG architecture?',
    'Compare GPT-4 vs Gemini',
    'Latest AI research 2025',
  ]
  return (
    <div className="dash-empty">
      <h2 className="dash-empty__title">What do you want to know?</h2>
      <div className="dash-empty__chips">
        {CHIPS.map((chip, i) => (
          <button key={i} className="dash-empty__chip" onClick={() => onChipClick(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
const Dashboard = () => {
  const chat              = useChat()
  const [chatInput,     setChatInput]     = useState('')
  const [isTyping,      setIsTyping]      = useState(false)
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [chatsLoading,  setChatsLoading]  = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const chats         = useSelector(state => state.chat.chats)
  const currentChatId = useSelector(state => state.chat.currentChatId)

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    async function init() {
      chat.initializeSocketConnection()
      setChatsLoading(true)
      await chat.handleGetChats()
      setChatsLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId])

  const currentMessages = chats[currentChatId]?.messages || []
  const hasMessages     = !!currentChatId && currentMessages.length > 0

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return
    setChatInput('')
    setIsTyping(true)
    setError(null)
    try {
      await chat.handleSendMessage({ message: trimmed, chatId: currentChatId })
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleChipClick = async (msg) => {
    setIsTyping(true)
    setError(null)
    try {
      await chat.handleSendMessage({ message: msg, chatId: currentChatId })
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && chatInput.trim()) handleSubmit()
  }

  const openChat = (chatId) => {
    chat.handleOpenChats(chatId, chats)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  return (
    <div className={`dash-root${sidebarOpen ? ' sidebar-open' : ''}`}>

      {/* ── TOGGLE ── */}
      <button
        className="dash-toggle"
        onClick={() => setSidebarOpen(prev => !prev)}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 5 5 12 12 19" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__head">
          <div className="dash-sidebar__logo">
            {/* <span className="dash-sidebar__mark">◈</span> */}
            <span className="dash-sidebar__name">PERPLEXITY</span>
          </div>
          <button className="dash-sidebar__new" onClick={() => chat.handleNewChat()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        </div>

        <div className="dash-sidebar__section">Recent</div>

        {chatsLoading ? (
          <ChatSkeleton />
        ) : Object.values(chats).length === 0 ? (
          <div className="dash-sidebar__empty">No chats yet</div>
        ) : (
          <div className="dash-sidebar__chat-list">
            {Object.values(chats).map(item => (
              <div
                key={item.id}
                className={`dash-sidebar__chat-item${item.id === currentChatId ? ' dash-sidebar__chat-item--active' : ''}`}
              >
                <button className="dash-sidebar__chat-btn" onClick={() => openChat(item.id)}>
                  <span className="dash-sidebar__chat-dot" />
                  <span className="dash-sidebar__chat-title">{item.title || 'New chat'}</span>
                </button>
                <button
                  className="dash-sidebar__chat-delete"
                  onClick={(e) => { e.stopPropagation(); chat.handleDeleteChat(item.id, currentChatId, chats) }}
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="dash-sidebar__spacer" />
        <div className="dash-sidebar__footer">
          <UserProfile />
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">
        <div className="dash-content">
          {!hasMessages ? (
            <EmptyState onChipClick={handleChipClick} />
          ) : (
            <div className="dash-messages">
              {currentMessages.map((message, i) => (
                <Message key={i} message={message} />
              ))}
              {isTyping && (
                <div className="dash-message dash-message--ai">
                  <div className="dash-message__label">PERPLEXITY</div>
                  <TypingDots />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="dash-error">
            <span className="dash-error__icon">⚠</span>
            <span className="dash-error__text">{error}</span>
            <button className="dash-error__close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="dash-searchbar">
          <div className="dash-searchbar__box">
            <input
              className="dash-searchbar__input"
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Perplexity..."
            />
            <button
              className="dash-searchbar__button"
              disabled={!chatInput.trim()}
              onClick={handleSubmit}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke={chatInput.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard