'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

function GlobeGeometry() {
  const groupRef = useRef<THREE.Group>(null)
  
  // Create points and lines
  const { positions, lines } = useMemo(() => {
    const points = []
    const numPoints = 600
    const radius = 2.5 // Globe radius
    
    // Fibonacci sphere for uniform distribution
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r
      
      points.push(new THREE.Vector3(x * radius, y * radius, z * radius))
    }
    
    const positions = new Float32Array(numPoints * 3)
    points.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    })
    
    // Create connection lines
    const linePositions = []
    const connectionDistance = 0.55 // Max distance to connect nodes
    
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dist = points[i].distanceTo(points[j])
        if (dist < connectionDistance) {
          linePositions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          )
        }
      }
    }
    
    const linePosArray = new Float32Array(linePositions)
    return { positions, lines: linePosArray }
  }, [])
  
  // State for inertia
  const currentRotation = useRef({ x: 0, y: 0 })
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    // Default slow rotation
    const time = state.clock.getElapsedTime()
    const autoRotate = time * 0.05
    
    // Mouse tracking targets
    const targetX = state.pointer.y * 0.3
    const targetY = state.pointer.x * 0.3
    
    // Lerp for smooth inertia
    currentRotation.current.x += (targetX - currentRotation.current.x) * 0.05
    currentRotation.current.y += (targetY - currentRotation.current.y) * 0.05
    
    // Apply rotation (base rotation + mouse tilt)
    groupRef.current.rotation.x = currentRotation.current.x
    groupRef.current.rotation.y = autoRotate + currentRotation.current.y
  })
  
  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#ffffff"
          transparent
          opacity={0.15}
          sizeAttenuation
        />
      </points>
      
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lines.length / 3}
            args={[lines, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
        />
      </lineSegments>
    </group>
  )
}

export function IntelligenceGlobe() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#000000]">
      {/* Subtle center white glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_60%)]" />
      
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        className="w-full h-full absolute inset-0 z-10"
        dpr={[1, 2]} // Support retina displays
        gl={{ antialias: true, alpha: true }}
      >
        {/* Optional depth fog for premium feel */}
        <fog attach="fog" args={['#000000', 3, 8]} />
        <GlobeGeometry />
      </Canvas>
    </div>
  )
}

export default IntelligenceGlobe
