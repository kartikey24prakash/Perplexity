import { useEffect } from 'react'

export function useMatrixCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコサシスセソ'
    const fontSize = 14
    let cols = Math.floor(canvas.width / fontSize)
    let drops = Array.from({ length: cols }, () => Math.random() * -120)

    const tick = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.045)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const c = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * fontSize
        const alpha = Math.random() > 0.96 ? 0.9 : Math.max(0.06, 0.45 - (y / canvas.height) * 0.3)
        ctx.fillStyle = `rgba(220,220,220,${alpha})`
        ctx.fillText(c, i * fontSize, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.4
      }
      const newCols = Math.floor(canvas.width / fontSize)
      if (newCols !== cols) { cols = newCols; drops = Array.from({ length: cols }, () => Math.random() * -120) }
    }

    const loop = () => { tick(); animId = requestAnimationFrame(loop) }
    loop()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
}