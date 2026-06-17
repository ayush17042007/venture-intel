'use client'

import { useEffect, useRef } from 'react'
import { Lightbulb, BookOpen, Users, TrendingUp, FileText } from 'lucide-react'

export function AIIntelligencePipeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const centerY = height / 2

    // Define node positions
    const nodes = [
      { x: 0, label: 'Startup Idea' },
      { x: width * 0.25, label: 'Research' },
      { x: width * 0.5, label: 'Competitors' },
      { x: width * 0.75, label: 'Analysis' },
      { x: width, label: 'Report' },
    ]

    let animationFrame = 0
    let lastTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - lastTime
      lastTime = now
      animationFrame += elapsed * 0.0005

      // Clear canvas
      ctx.fillStyle = 'rgba(11, 16, 32, 0)'
      ctx.fillRect(0, 0, width, height)

      // Draw connection lines with animation
      for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i]
        const to = nodes[i + 1]

        // Animated gradient for connection line
        const gradient = ctx.createLinearGradient(from.x, centerY, to.x, centerY)
        const pulseValue = (Math.sin(animationFrame + i * 0.5) + 1) / 2
        gradient.addColorStop(0, `rgba(167, 139, 250, ${0.1 + pulseValue * 0.2})`)
        gradient.addColorStop(0.5, `rgba(167, 139, 250, ${0.3 + pulseValue * 0.3})`)
        gradient.addColorStop(1, `rgba(167, 139, 250, ${0.1 + pulseValue * 0.2})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(from.x + 24, centerY)
        ctx.lineTo(to.x - 24, centerY)
        ctx.stroke()

        // Animated flow particle
        const particleProgress = (animationFrame * 0.3 + i * 0.2) % 1
        const particleX = from.x + (to.x - from.x) * particleProgress
        ctx.fillStyle = `rgba(167, 139, 250, ${0.4 - particleProgress * 0.4})`
        ctx.beginPath()
        ctx.arc(particleX, centerY, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw glowing nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Outer glow
        const glowSize = 12 + Math.sin(animationFrame + i * 0.3) * 2
        ctx.fillStyle = `rgba(167, 139, 250, ${0.15 - (i / nodes.length) * 0.08})`
        ctx.beginPath()
        ctx.arc(node.x, centerY, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Inner circle
        ctx.fillStyle = 'rgba(167, 139, 250, 0.4)'
        ctx.beginPath()
        ctx.arc(node.x, centerY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Center dot
        ctx.fillStyle = 'rgb(167, 139, 250)'
        ctx.beginPath()
        ctx.arc(node.x, centerY, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])

  const steps = [
    { icon: Lightbulb, label: 'Startup Idea' },
    { icon: BookOpen, label: 'Research' },
    { icon: Users, label: 'Competitors' },
    { icon: TrendingUp, label: 'Analysis' },
    { icon: FileText, label: 'Report' },
  ]

  return (
    <div className="w-full py-12">
      <div className="relative">
        {/* Canvas for animated connections */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ height: '80px' }}
        />

        {/* Icons and labels */}
        <div className="relative flex items-center justify-between px-4" style={{ height: '80px' }}>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-card/80 hover:border-accent/40 transition-all duration-300">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center whitespace-nowrap">{step.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
