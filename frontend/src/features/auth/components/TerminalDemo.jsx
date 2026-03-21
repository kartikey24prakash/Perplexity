import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './terminal.css'

const SESSIONS = [
  {
    filename: 'api.js',
    lang: 'javascript',
    lines: [
      { code: `import express from 'express'`, color: 'c-import' },
      { code: `import { generateResponse } from './ai.service.js'`, color: 'c-import' },
      { code: ``, color: '' },
      { code: `const router = express.Router()`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `router.post('/message', async (req, res) => {`, color: 'c-fn' },
      { code: `  const { message, chatId } = req.body`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `  const response = await generateResponse({`, color: 'c-fn' },
      { code: `    message,`, color: 'c-prop' },
      { code: `    chatId,`, color: 'c-prop' },
      { code: `    userId: req.user.id`, color: 'c-prop' },
      { code: `  })`, color: 'c-fn' },
      { code: ``, color: '' },
      { code: `  res.status(200).json({ response })`, color: 'c-default' },
      { code: `})`, color: 'c-fn' },
      { code: ``, color: '' },
      { code: `export default router`, color: 'c-import' },
    ],
  },
  {
    filename: 'useChat.js',
    lang: 'javascript',
    lines: [
      { code: `import { useDispatch } from 'react-redux'`, color: 'c-import' },
      { code: `import { sendMessage } from '../api/chat'`, color: 'c-import' },
      { code: ``, color: '' },
      { code: `export const useChat = () => {`, color: 'c-fn' },
      { code: `  const dispatch = useDispatch()`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `  const handleSend = async ({ message, chatId }) => {`, color: 'c-fn' },
      { code: `    const data = await sendMessage({ message, chatId })`, color: 'c-default' },
      { code: `    const { chat, aiMessage } = data`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `    dispatch(addMessage({`, color: 'c-fn' },
      { code: `      chatId: chat._id,`, color: 'c-prop' },
      { code: `      content: aiMessage.content,`, color: 'c-prop' },
      { code: `      role: aiMessage.role`, color: 'c-prop' },
      { code: `    }))`, color: 'c-fn' },
      { code: `  }`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `  return { handleSend }`, color: 'c-default' },
      { code: `}`, color: 'c-fn' },
    ],
  },
  {
    filename: 'ai.service.js',
    lang: 'javascript',
    lines: [
      { code: `import { ChatGoogleGenerativeAI } from '@langchain/google-genai'`, color: 'c-import' },
      { code: `import { HumanMessage, AIMessage } from 'langchain'`, color: 'c-import' },
      { code: ``, color: '' },
      { code: `const model = new ChatGoogleGenerativeAI({`, color: 'c-fn' },
      { code: `  model: 'gemini-1.5-flash',`, color: 'c-prop' },
      { code: `  apiKey: process.env.GEMINI_API_KEY`, color: 'c-prop' },
      { code: `})`, color: 'c-fn' },
      { code: ``, color: '' },
      { code: `export async function generateResponse(messages) {`, color: 'c-fn' },
      { code: `  const formatted = messages.map(m =>`, color: 'c-default' },
      { code: `    m.role === 'user'`, color: 'c-default' },
      { code: `      ? new HumanMessage(m.content)`, color: 'c-string' },
      { code: `      : new AIMessage(m.content)`, color: 'c-string' },
      { code: `  )`, color: 'c-default' },
      { code: ``, color: '' },
      { code: `  const res = await model.invoke(formatted)`, color: 'c-default' },
      { code: `  return res.text`, color: 'c-default' },
      { code: `}`, color: 'c-fn' },
    ],
  },
]

export default function TerminalDemo() {
  const [sessionIdx, setSessionIdx] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [charCounts, setCharCounts] = useState([])
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  const session = SESSIONS[sessionIdx]

  const reset = (idx) => {
    setVisibleLines(0)
    setCharCounts([])
    setDone(false)
    setSessionIdx(idx)
  }

  useEffect(() => {
    const lines = session.lines
    let lineIdx = 0
    let charIdx = 0

    const type = () => {
      if (lineIdx >= lines.length) {
        setDone(true)
        timerRef.current = setTimeout(() => {
          const next = (sessionIdx + 1) % SESSIONS.length
          reset(next)
        }, 3500)
        return
      }

      const line = lines[lineIdx]
      const len = line.code.length

      if (charIdx <= len) {
        setVisibleLines(lineIdx + 1)
        setCharCounts(prev => {
          const arr = [...prev]
          arr[lineIdx] = charIdx
          return arr
        })
        charIdx++
        const delay = line.code === '' ? 60 : Math.random() * 18 + 14
        timerRef.current = setTimeout(type, delay)
      } else {
        lineIdx++
        charIdx = 0
        timerRef.current = setTimeout(type, line.code === '' ? 40 : 30)
      }
    }

    timerRef.current = setTimeout(type, 400)
    return () => clearTimeout(timerRef.current)
  }, [sessionIdx])

  return (
    <div className="term-wrap">
      {/* Terminal header */}
      <div className="term-header">
        <div className="term-dots">
          <span className="term-dot td-red" />
          <span className="term-dot td-yellow" />
          <span className="term-dot td-green" />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={session.filename}
            className="term-filename"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            {session.filename}
          </motion.span>
        </AnimatePresence>
        <div className="term-tabs">
          {SESSIONS.map((s, i) => (
            <button
              key={i}
              className={`term-tab ${i === sessionIdx ? 'term-tab-on' : ''}`}
              onClick={() => reset(i)}
            >
              {s.filename}
            </button>
          ))}
        </div>
      </div>

      {/* Code body */}
      <div className="term-body">
        <div className="term-lines">
          {session.lines.slice(0, visibleLines).map((line, i) => {
            const chars = charCounts[i] ?? 0
            const isTyping = i === visibleLines - 1 && !done
            const text = line.code.slice(0, chars)

            return (
              <motion.div
                key={`${sessionIdx}-${i}`}
                className="term-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                <span className="term-ln">{String(i + 1).padStart(2, '0')}</span>
                <span className={`term-code ${line.color}`}>
                  {text}
                  {isTyping && <span className="term-cursor">▌</span>}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className="term-status">
        <span className="term-status-lang">JS</span>
        <span className="term-status-file">{session.filename}</span>
        <span className="term-status-lines">{visibleLines} / {session.lines.length} lines</span>
        {done && (
          <motion.span
            className="term-status-done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✓ compiled
          </motion.span>
        )}
      </div>
    </div>
  )
}
