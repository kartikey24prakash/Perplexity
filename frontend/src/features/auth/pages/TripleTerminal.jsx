import React, { useEffect, useRef } from 'react'
import './TripleTerminal.css'

/* ── data ─────────────────────────────────────────── */
const T1 = [
  { cls:'cm',  t:'// search pipeline — LangChain + Gemini' },
  { cls:'kw',  t:'import { ChatGoogleGenerativeAI } from'   },
  { cls:'str', t:'  "@langchain/google-genai"'              },
  { cls:'kw',  t:'import { TavilySearchResults } from'      },
  { cls:'str', t:'  "@langchain/community/tools/tavily"'    },
  { cls:'dim', t:''                                          },
  { cls:'fn',  t:'export async function search(q: string) {'},
  { cls:'yw',  t:'  const model = new ChatGoogleGenerativeAI({' },
  { cls:'str', t:'    model: "gemini-1.5-flash",'           },
  { cls:'yw',  t:'    temperature: 0.2,'                    },
  { cls:'sy',  t:'  })'                                     },
  { cls:'dim', t:''                                          },
  { cls:'fn',  t:'  const tool = new TavilySearchResults({' },
  { cls:'yw',  t:'    maxResults: 8,'                       },
  { cls:'sy',  t:'  })'                                     },
  { cls:'fn',  t:'  const agent = createToolCallingAgent({'  },
  { cls:'yw',  t:'    llm: model, tools: [tool]'            },
  { cls:'sy',  t:'  })'                                     },
  { cls:'fn',  t:'  return await agent.invoke(q)'           },
  { cls:'sy',  t:'}'                                         },
]

const T2 = [
  { cls:'warn', t:'⚠  tsc --watch started...'              },
  { cls:'dim',  t:''                                         },
  { cls:'err',  t:'ERROR  src/search.service.ts:2:10'       },
  { cls:'sy',   t:'  Cannot find module "@langchain/'       },
  { cls:'sy',   t:'  google-genai". Check moduleResolution' },
  { cls:'dim',  t:''                                         },
  { cls:'err',  t:'ERROR  src/search.service.ts:8:18'       },
  { cls:'sy',   t:'  Type \'string\' is not assignable'     },
  { cls:'sy',   t:'  to type \'ModelParams\''               },
  { cls:'dim',  t:''                                         },
  { cls:'err',  t:'ERROR  src/search.service.ts:17:14'      },
  { cls:'sy',   t:'  Property \'bindTools\' does not'       },
  { cls:'sy',   t:'  exist on ChatGoogleGenerativeAI'       },
  { cls:'dim',  t:''                                         },
  { cls:'warn', t:'⚠  Found 3 errors. Watching...'         },
]

const T3 = [
  { cls:'ai',  t:'◈ Perplexity AI — analyzing...'          },
  { cls:'dim', t:''                                          },
  { cls:'ai',  t:'[SCAN] 3 errors in search.service.ts'    },
  { cls:'dim', t:''                                          },
  { cls:'fn',  t:'[FIX 1] tsconfig.json:'                  },
  { cls:'fix', t:'  "moduleResolution": "bundler"'          },
  { cls:'fix', t:'  "allowImportingTsExtensions": true'     },
  { cls:'dim', t:''                                          },
  { cls:'fn',  t:'[FIX 2] Model type assertion:'            },
  { cls:'fix', t:'  model: "gemini-1.5-flash" as const,'   },
  { cls:'dim', t:''                                          },
  { cls:'fn',  t:'[FIX 3] Use createToolCallingAgent:'      },
  { cls:'fix', t:'  const agent = createToolCallingAgent({'  },
  { cls:'fix', t:'    llm: model, tools: [tool]'            },
  { cls:'fix', t:'  })'                                     },
  { cls:'dim', t:''                                          },
  { cls:'ai',  t:'[DONE] All 3 errors resolved ✓'          },
  { cls:'fix', t:'  tsc: 0 errors — build clean'           },
]

/* ── single terminal ──────────────────────────────── */
function Terminal({ id, title, badge, badgeCls, lines, statusId, statusDot, statusTxt, statusVal, statusValColor, delay, interval }) {
  const bodyRef   = useRef(null)
  const statusRef = useRef(null)
  const idxRef    = useRef(0)
  const timerRef  = useRef(null)

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return

    function addLine() {
      const idx = idxRef.current
      if (idx >= lines.length) {
        /* loop — clear and restart */
        timerRef.current = setTimeout(() => {
          body.innerHTML = ''
          idxRef.current = 0
          if (statusRef.current) {
            statusRef.current.textContent = statusVal
            statusRef.current.style.color = statusValColor
          }
          schedule()
        }, 4500)
        return
      }

      const line = lines[idx]

      /* remove caret from last line */
      body.querySelectorAll('.tt-caret').forEach(el => el.classList.remove('tt-caret'))

      const el = document.createElement('div')
      el.className = `tt-ln tt-${line.cls} tt-caret`
      el.textContent = line.t || '\u00a0'
      body.appendChild(el)

      /* keep fixed scroll — remove oldest if overflow */
      while (body.scrollHeight > body.clientHeight + 2) {
        if (body.firstChild) body.removeChild(body.firstChild)
      }

      /* status updates for T2 */
      if (statusRef.current && line.cls === 'err') {
        const errCount = Array.from(body.querySelectorAll('.tt-err')).length
        statusRef.current.textContent = errCount + ' error' + (errCount !== 1 ? 's' : '')
        statusRef.current.style.color = '#ff4444'
      }
      if (statusRef.current && line.t && line.t.includes('0 errors')) {
        statusRef.current.textContent = '0 errors ✓'
        statusRef.current.style.color = '#00ff88'
      }
      if (statusRef.current && line.t && line.t.includes('DONE')) {
        statusRef.current.textContent = 'fixed ✓'
        statusRef.current.style.color = '#00ff88'
      }
      if (statusRef.current && line.cls === 'fix' && !line.t.includes('0 errors')) {
        if (statusRef.current.textContent === statusVal) {
          statusRef.current.textContent = 'applying...'
          statusRef.current.style.color = '#fde68a'
        }
      }

      idxRef.current++
      schedule()
    }

    function schedule() {
      timerRef.current = setTimeout(addLine, interval + Math.random() * 80)
    }

    timerRef.current = setTimeout(addLine, delay)

    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="tt-term">
      <div className="tt-bar">
        <span className="tt-dot tt-r" /><span className="tt-dot tt-y" /><span className="tt-dot tt-g" />
        <span className="tt-title">{title}</span>
        <span className={`tt-badge ${badgeCls}`}>{badge}</span>
      </div>
      <div className="tt-body" ref={bodyRef} />
      <div className="tt-status">
        <span className="tt-sdot" style={{ background: statusDot }} />
        <span className="tt-stxt">{statusTxt}</span>
        <span className="tt-sval" ref={statusRef} style={{ color: statusValColor }}>{statusVal}</span>
      </div>
    </div>
  )
}

/* ── main export ──────────────────────────────────── */
export default function TripleTerminal() {
  return (
    <div className="tt-wrap">
      <Terminal
        title="search.service.ts"
        badge="CODING"       badgeCls="tt-badge-code"
        lines={T1}
        statusDot="#00ff88"  statusTxt="TypeScript · ESM"
        statusVal="0 errors" statusValColor="rgba(255,255,255,.25)"
        delay={400}          interval={115}
      />
      <Terminal
        title="compiler output"
        badge="ERRORS"        badgeCls="tt-badge-err"
        lines={T2}
        statusDot="#ff4444"   statusTxt="tsc --watch"
        statusVal="3 errors"  statusValColor="#ff4444"
        delay={1400}          interval={175}
      />
      <Terminal
        title="ai assistant"
        badge="AI FIX"        badgeCls="tt-badge-ai"
        lines={T3}
        statusDot="#7c8fff"   statusTxt="Gemini · analyzing"
        statusVal="fixing..."  statusValColor="#7c8fff"
        delay={3200}          interval={200}
      />
    </div>
  )
}
