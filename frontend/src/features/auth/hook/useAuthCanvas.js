import { useEffect } from 'react'

export function useAuthCanvas() {
    useEffect(() => {
        const canvas = document.getElementById('auth-canvas')
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let animId
        let particles = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        class Particle {
            constructor() {
                this.reset()
            }
            reset() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                this.size = Math.random() * 1.5 + 0.3
                this.speedX = (Math.random() - 0.5) * 0.4
                this.speedY = (Math.random() - 0.5) * 0.4
                this.opacity = Math.random() * 0.5 + 0.1
                this.pulse = Math.random() * Math.PI * 2
            }
            update() {
                this.x += this.speedX
                this.y += this.speedY
                this.pulse += 0.02
                this.opacity = 0.1 + Math.abs(Math.sin(this.pulse)) * 0.4
                if (this.x < 0 || this.x > canvas.width ||
                    this.y < 0 || this.y > canvas.height) {
                    this.reset()
                }
            }
            draw() {
                ctx.save()
                ctx.globalAlpha = this.opacity
                ctx.fillStyle = '#f97316'
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()
            }
        }

        for (let i = 0; i < 80; i++) {
            particles.push(new Particle())
        }

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 120) {
                        ctx.save()
                        ctx.globalAlpha = (1 - dist / 120) * 0.08
                        ctx.strokeStyle = '#f97316'
                        ctx.lineWidth = 0.5
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                        ctx.restore()
                    }
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => { p.update(); p.draw() })
            drawConnections()
            animId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])
}