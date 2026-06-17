'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Animation state
    let animationFrameId: number
    let time = 0

    // Define neural network nodes
    const nodeCount = 12
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      baseX: number
      baseY: number
      id: number
    }> = []

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const distance = 150 + Math.random() * 200
      const x = canvas.width / 2 + Math.cos(angle) * distance
      const y = canvas.height / 2 + Math.sin(angle) * distance

      nodes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseX: x,
        baseY: y,
        id: i,
      })
    }

    // Data stream paths (flowing lines)
    const streamPaths: Array<{
      points: Array<{ x: number; y: number; age: number }>
      speed: number
      angle: number
      originX: number
      originY: number
    }> = []

    for (let i = 0; i < 3; i++) {
      streamPaths.push({
        points: [],
        speed: 0.5 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        originX: canvas.width * Math.random(),
        originY: canvas.height * Math.random(),
      })
    }

    // Animation loop
    const animate = () => {
      time += 1

      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, '#0A0A0A')
      bgGradient.addColorStop(0.5, '#111111')
      bgGradient.addColorStop(1, '#0A0A0A')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 80
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Update and draw nodes
      nodes.forEach((node) => {
        // Oscillating movement
        const wobbleX = Math.sin(time * 0.002 + node.id) * 40
        const wobbleY = Math.cos(time * 0.0015 + node.id) * 40

        node.x = node.baseX + wobbleX
        node.y = node.baseY + wobbleY

        // Draw node glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 8)
        glowGradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)')
        glowGradient.addColorStop(0.7, 'rgba(167, 139, 250, 0.1)')
        glowGradient.addColorStop(1, 'rgba(167, 139, 250, 0)')

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
        ctx.fill()

        // Draw node center
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 250) {
            const opacity = (1 - distance / 250) * 0.15
            ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()

            // Animated flow along connection
            const flowProgress = ((time * 0.5) % distance) / distance
            const flowX = nodes[i].x + dx * flowProgress
            const flowY = nodes[i].y + dy * flowProgress

            const flowGradient = ctx.createRadialGradient(
              flowX,
              flowY,
              0,
              flowX,
              flowY,
              6
            )
            flowGradient.addColorStop(
              0,
              `rgba(167, 139, 250, ${opacity * 2})`
            )
            flowGradient.addColorStop(1, `rgba(167, 139, 250, 0)`)

            ctx.fillStyle = flowGradient
            ctx.beginPath()
            ctx.arc(flowX, flowY, 6, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Update and draw data streams
      streamPaths.forEach((stream, streamIndex) => {
        const streamSpeed = 1.5

        // Add new point to stream
        if (time % 8 === 0) {
          const moveDistance = streamSpeed
          const newX = stream.originX + Math.cos(stream.angle) * moveDistance * (time / 8)
          const newY = stream.originY + Math.sin(stream.angle) * moveDistance * (time / 8)

          stream.points.push({
            x: newX,
            y: newY,
            age: 0,
          })

          // Keep array manageable
          if (stream.points.length > 100) {
            stream.points.shift()
          }
        }

        // Update point ages
        stream.points.forEach((p) => {
          p.age += 1
        })

        // Draw stream
        stream.points.forEach((point, idx) => {
          const fadeOut = 1 - point.age / 120
          const opacity = fadeOut * 0.08
          const primaryColor = streamIndex === 0 ? '167, 139, 250' : '167, 139, 250'

          ctx.fillStyle = `rgba(${primaryColor}, ${opacity})`
          ctx.beginPath()
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)
          ctx.fill()
        })
      })

      // Add radial gradient glow from center
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      )
      centerGradient.addColorStop(0, 'rgba(167, 139, 250, 0.05)')
      centerGradient.addColorStop(0.4, 'rgba(167, 139, 250, 0.02)')
      centerGradient.addColorStop(1, 'rgba(11, 16, 32, 0)')

      ctx.fillStyle = centerGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  )
}
