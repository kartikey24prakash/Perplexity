import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hook/useChat'
import ReactMarkdown from 'react-markdown'
import './Dashboard.css'

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="dash-typing">
      <span /><span /><span />
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
        <ReactMarkdown>{message.content}</ReactMarkdown>
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
  const chat          = useChat()
  const [chatInput, setChatInput] = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const messagesEndRef = useRef(null)

  const chats         = useSelector(state => state.chat.chats)
  const currentChatId = useSelector(state => state.chat.currentChatId)
  const user          = useSelector(state => state.auth.user)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId])

  const currentMessages = chats[currentChatId]?.messages || []
  const hasMessages     = currentMessages.length > 0

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return
    setChatInput('')
    setIsTyping(true)
    await chat.handleSendMessage({ message: trimmed, chatId: currentChatId })
    setIsTyping(false)
  }

  const handleChipClick = async (msg) => {
    setIsTyping(true)
    await chat.handleSendMessage({ message: msg, chatId: currentChatId })
    setIsTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && chatInput.trim()) handleSubmit()
  }

  const openChat = (chatId) => {
    chat.handleOpenChats(chatId, chats)
  }

  return (
    <div className="dash-root">

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__head">
          <div className="dash-sidebar__logo">
            <span className="dash-sidebar__mark">◈</span>
            <span className="dash-sidebar__name">PERPLEXITY</span>
          </div>
          <button className="dash-sidebar__new" onClick={() => chat.handleNewChat?.()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        </div>

        {Object.values(chats).length > 0 && (
          <>
            <div className="dash-sidebar__section">Recent</div>
            <div className="dash-sidebar__chat-list">
              {Object.values(chats).map(item => (
                <button
                  key={item.id}
                  className={`dash-sidebar__chat-item${item.id === currentChatId ? ' dash-sidebar__chat-item--active' : ''}`}
                  onClick={() => openChat(item.id)}
                >
                  <span className="dash-sidebar__chat-dot" />
                  <span className="dash-sidebar__chat-title">{item.title || 'New chat'}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="dash-sidebar__spacer" />

        <div className="dash-sidebar__footer">
          <div className="dash-sidebar__user">
            <div className="dash-sidebar__avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="dash-sidebar__user-info">
              <div className="dash-sidebar__user-name">{user?.name || 'User'}</div>
              <div className="dash-sidebar__user-role">PREMIUM</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">
        <div className="dash-content">
          {!hasMessages ? (
            <EmptyState onChipClick={handleChipClick} />
          ) : (
            <div className="dash-messages">
              {currentMessages.map(message => (
                <Message key={message.id} message={message} />
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