import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Login.css'
import TripleTerminal from './TripleTerminal'

gsap.registerPlugin(ScrollTrigger)

function MatrixCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&アイウエオカキクケコ'
    const FS = 13
    let cols, drops, animId
    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cols  = Math.floor(canvas.width / FS)
      drops = Array.from({ length: cols }, () => Math.random() * -80)
    }
    resize()
    window.addEventListener('resize', resize)
    function tick() {
      ctx.fillStyle = 'rgba(6,6,6,0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${FS}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        const y  = drops[i] * FS
        const a  = Math.random() > 0.92 ? 0.85 : Math.max(0.08, 0.45 - (y / canvas.height) * 0.25)
        ctx.fillStyle = `rgba(200,200,200,${a})`
        ctx.fillText(ch, i * FS, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.38
      }
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="lp-canvas" />
}

function useTypewriter(phrases) {
  const [display, setDisplay] = useState('')
  const idx = useRef(0), chr = useRef(0), del = useRef(false), timer = useRef(null)
  useEffect(() => {
    function tick() {
      const full = phrases[idx.current]
      if (!del.current) {
        chr.current++
        setDisplay(full.slice(0, chr.current))
        if (chr.current === full.length) {
          timer.current = setTimeout(() => { del.current = true; tick() }, 2400)
          return
        }
      } else {
        chr.current--
        setDisplay(full.slice(0, chr.current))
        if (chr.current === 0) { del.current = false; idx.current = (idx.current + 1) % phrases.length }
      }
      timer.current = setTimeout(tick, del.current ? 42 : 78)
    }
    timer.current = setTimeout(tick, 500)
    return () => clearTimeout(timer.current)
  }, [])
  return display
}

function useScrollAnimations() {
  useEffect(() => {
    const ease = 'power3.out'
    const ctx = gsap.context(() => {
      gsap.from(['.lp-eyebrow','.lp-h1','.lp-desc','.lp-form-wrap','.lp-marquee'], { opacity:0, y:28, duration:.7, stagger:.12, ease, delay:.1 })
      gsap.from('.lp-word-inner', { y:'110%', opacity:0, duration:.65, stagger:.09, ease:'power4.out', delay:.2 })
      gsap.from('.lp-stat',    { opacity:0, y:40, duration:.7,  stagger:.09, ease, scrollTrigger:{ trigger:'.lp-stats',    start:'top 85%' } })
      gsap.from('.lp-sect-ey', { opacity:0, y:20, duration:.6,  ease, scrollTrigger:{ trigger:'.lp-sect-ey', start:'top 88%' } })
      gsap.from('.lp-h2',      { opacity:0, y:32, duration:.7,  ease, scrollTrigger:{ trigger:'.lp-h2',      start:'top 88%' } })
      gsap.from('.lp-feat',    { opacity:0, y:48, duration:.7,  stagger:.1,  ease, scrollTrigger:{ trigger:'.lp-feat-grid',start:'top 85%' } })
      gsap.from('.lp-con',     { opacity:0, y:36, duration:.75, ease, scrollTrigger:{ trigger:'.lp-con-wrap', start:'top 85%' } })
      gsap.from('.lp-tc',      { opacity:0, y:50, duration:.75, stagger:.12, ease, scrollTrigger:{ trigger:'.lp-tgrid',    start:'top 85%' } })
      gsap.from('.lp-cta-h',   { opacity:0, y:36, duration:.75, ease, scrollTrigger:{ trigger:'.lp-cta',     start:'top 88%' } })
      gsap.from('.lp-cta-sub', { opacity:0, y:20, duration:.6,  delay:.1, ease, scrollTrigger:{ trigger:'.lp-cta', start:'top 88%' } })
      gsap.from('.lp-cta-btn', { opacity:0, y:20, scale:.97, duration:.6, delay:.2, ease, scrollTrigger:{ trigger:'.lp-cta', start:'top 88%' } })
      gsap.to('.lp-h1', { yPercent:-6, ease:'none', scrollTrigger:{ trigger:'.lp-hero', start:'top top', end:'bottom top', scrub:true } })
      document.querySelectorAll('.lp-nav-btn, .lp-btn, .lp-cta-btn').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect()
          gsap.to(el, { x:(e.clientX-r.left-r.width/2)*.3, y:(e.clientY-r.top-r.height/2)*.3, duration:.25, ease:'power2.out' })
        })
        el.addEventListener('mouseleave', () => gsap.to(el, { x:0, y:0, duration:.5, ease:'elastic.out(1,0.4)' }))
      })
    })
    return () => ctx.revert()
  }, [])
}

const MQ_ITEMS = [
  'No Credit Card','Instant Start','Persistent History','Zero Hallucinations',
  'Sub-second TTFB','Gemini 1.5 Flash','Tavily Grounded','Free Forever',
  'Cross-device Sync','JWT Auth','MongoDB Atlas','LangChain Pipeline',
]
function Marquee() {
  return (
    <div className="lp-marquee">
      <div className="lp-mq-track">
        {[...MQ_ITEMS,...MQ_ITEMS].map((t,i) => (
          <div key={i} className="lp-mq-item">{t}<span className="lp-mq-dot" /></div>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  { icon:'◎', tag:'FREE',   title:'No credit card',     desc:'Start immediately, no payment details required.'      },
  { icon:'▣', tag:'MEMORY', title:'Persistent history',  desc:'Every conversation saved and synced across devices.'  },
  { icon:'◉', tag:'TRUTH',  title:'Zero hallucinations', desc:'Every answer grounded in real Tavily search results.' },
  { icon:'⌕', tag:'SPEED',  title:'Sub-second TTFB',     desc:'Powered by Gemini 1.5 Flash via LangChain pipeline.'  },
]

const TESTIMONIALS = [
  { initials:'AM', name:'Arjun M.',  role:'Product Designer',  quote:'Replaced my entire research workflow. Better answers in 10 seconds than 20 minutes of Googling.'              },
  { initials:'PS', name:'Priya S.',  role:'Software Engineer', quote:'The persistent history is a game-changer. I revisit conversations and pick up exactly where I stopped.'        },
  { initials:'RK', name:'Rohit K.',  role:'Researcher',        quote:"Finally an AI search that doesn't hallucinate. Source grounding makes all the difference."                     },
]

export default function Register() {
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [focused,  setFocused]  = useState(null)

  const user    = useSelector(s => s.auth.user)
  const loading = useSelector(s => s.auth.loading)
  const { handleRegister } = useAuth()
  const navigate = useNavigate()
  const typed = useTypewriter(['Join the Revolution.\nSearch Smarter.', 'Create Account.\nGet Started.'])
  useScrollAnimations()

  const submit = async e => {
    e.preventDefault()
    await handleRegister({ username, email, password })
    navigate('/')
  }

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <div className="lp-root">
      <MatrixCanvas />
      <div className="lp-grid" />

      <div className="lp-nav-wrap">
        <nav className="lp-nav">
          <div className="lp-brand">
            {/* <span className="lp-mark">◈</span> */}
            <span className="lp-name">PERPLEXITY</span>
          </div>
          <div className="lp-sep" />
          <div className="lp-nav-links">
            <span className="lp-nl">Search</span>
            <span className="lp-nl">Docs</span>
            <span className="lp-nl">Pricing</span>
          </div>
          <div className="lp-sep" />
          <span className="lp-live"><span className="lp-ldot" />live</span>
          <Link to="/login" className="lp-nav-btn">Sign In</Link>
        </nav>
      </div>

      <section className="lp-hero">
        <p className="lp-eyebrow">// CREATE YOUR ACCOUNT</p>
        <h1 className="lp-h1">
          {typed.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line.split(' ').map((word, j, words) => (
                <span key={j} className="lp-word">
                  <span className={`lp-word-inner${word==='Revolution.'?' lp-glitch':''}`} data-text={word}>{word}</span>
                  {j < words.length - 1 && ' '}
                </span>
              ))}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
          <span className="lp-h1-cur" />
        </h1>
        <p className="lp-desc">
          Enterprise-grade AI search, free to start.<br />
          Source-grounded answers. Zero hallucinations.
        </p>
        <div className="lp-form-wrap">
          <div className="lp-tabs">
            <button className="lp-tab" onClick={() => navigate('/login')}>LOGIN</button>
            <button className="lp-tab active">REGISTER</button>
          </div>
          <div className="lp-card-outer">
            <div className="lp-beam" />
            <div className={`lp-card${focused?' glow':''}`}>
              <form onSubmit={submit} className="lp-form">
                <div className={`lp-field${focused==='un'?' on':''}`}>
                  <label className="lp-label">USERNAME</label>
                  <input className="lp-input" type="text" value={username} required placeholder="Choose a username"
                    onFocus={() => setFocused('un')} onBlur={() => setFocused(null)} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className={`lp-field${focused==='em'?' on':''}`}>
                  <label className="lp-label">EMAIL</label>
                  <input className="lp-input" type="email" value={email} required placeholder="you@example.com"
                    onFocus={() => setFocused('em')} onBlur={() => setFocused(null)} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className={`lp-field${focused==='pw'?' on':''}`}>
                  <label className="lp-label">PASSWORD</label>
                  <input className="lp-input" type="password" value={password} required placeholder="Create a strong password"
                    onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="lp-btn">CREATE ACCOUNT <span className="lp-btn-arr">→</span></button>
              </form>
              <div className="lp-stack">
                <span className="lp-sdot" />
                Gemini · LangChain · Tavily · MongoDB
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-marquee-outer">
        <Marquee />
      </div>

      <div className="lp-stats-outer">
        <section className="lp-stats">
          <div className="lp-stat"><div className="lp-stat-val">~1s</div><div className="lp-stat-label">Response time</div></div>
          <div className="lp-stat"><div className="lp-stat-val">100%</div><div className="lp-stat-label">Source-grounded</div></div>
          <div className="lp-stat"><div className="lp-stat-val">∞</div><div className="lp-stat-label">Conversations</div></div>
          <div className="lp-stat"><div className="lp-stat-val">Free</div><div className="lp-stat-label">Always free</div></div>
        </section>
      </div>

      <div className="lp-feats-outer">
        <section className="lp-feats">
          <p className="lp-sect-ey">// WHY PERPLEXITY</p>
          <h2 className="lp-h2">Everything you need.<br />Nothing you don't.</h2>
          <div className="lp-feat-grid">
            {FEATURES.map((f,i) => (
              <div key={i} className="lp-feat">
                <div className="lp-feat-head">
                  <span className="lp-feat-icon">{f.icon}</span>
                  <span className="lp-feat-tag">{f.tag}</span>
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="lp-con-outer">
        <div className="lp-con-wrap">
          <TripleTerminal />
        </div>
      </div>

      <div className="lp-testi-outer">
        <section className="lp-testi">
          <p className="lp-sect-ey">// USERS</p>
          <h2 className="lp-h2">People actually<br />use this.</h2>
          <div className="lp-tlist">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="lp-trow">
                <div className="lp-trow-num">0{i+1}</div>
                <div className="lp-trow-quote">"{t.quote}"</div>
                <div className="lp-trow-who">
                  <div className="lp-tav">{t.initials}</div>
                  <div>
                    <div className="lp-tname">{t.name}</div>
                    <div className="lp-trole">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="lp-cta-outer">
        <section className="lp-cta">
          <p className="lp-sect-ey">// ALREADY HAVE AN ACCOUNT?</p>
          <h2 className="lp-cta-h">Been here before?<br /><em>Sign back in.</em></h2>
          <p className="lp-cta-sub">Your history is waiting for you.</p>
          <Link to="/login" className="lp-cta-btn">SIGN IN →</Link>
        </section>
      </div>

      <footer className="lp-footer">
        <span className="lp-mark">◈</span>
        <span>PERPLEXITY</span>
        <span className="lp-footer-dim">· AI Search · Gemini · LangChain · Tavily</span>
      </footer>
    </div>
  )
}