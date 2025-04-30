"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function CircularOrbits() {
  const groupRef = useRef<THREE.Group>(null)
  const orbitRefs = useRef<THREE.Line[]>([])
  const pointRefs = useRef<THREE.Mesh[]>([])
  
  // Initialize orbit data
  const orbitCount = 12
  const orbits = Array.from({ length: orbitCount }).map((_, i) => {
    const radius = 0.5 + i * 0.2
    const segments = 64
    const pointCount = Math.max(2, Math.floor(Math.random() * 4)) // 2-4 points per orbit
    
    return {
      radius,
      segments,
      points: Array.from({ length: pointCount }).map(() => {
        return {
          angle: Math.random() * Math.PI * 2,
          speed: (0.2 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
          size: 0.03 + Math.random() * 0.03
        }
      })
    }
  })

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2
    }
    
    // Animate points along orbits
    let pointIndex = 0
    orbits.forEach((orbit, i) => {
      orbit.points.forEach((point, j) => {
        if (pointRefs.current[pointIndex]) {
          // Update point position along orbit
          point.angle += point.speed * 0.01
          const x = Math.cos(point.angle) * orbit.radius
          const z = Math.sin(point.angle) * orbit.radius
          pointRefs.current[pointIndex].position.set(x, 0, z)
          
          // Pulse size
          const time = state.clock.getElapsedTime()
          const scale = point.size * (1 + Math.sin(time * 2 + i * 0.5) * 0.2)
          pointRefs.current[pointIndex].scale.set(scale, scale, scale)
        }
        pointIndex++
      })
    })
  })

  return (
    <group ref={groupRef}>
      {/* Render orbits and points */}
      {orbits.map((orbit, orbitIndex) => (
        <group key={`orbit-${orbitIndex}`}>
          {/* Orbit line */}
          <line ref={(ref) => {
            if (ref) orbitRefs.current[orbitIndex] = ref as unknown as THREE.Line
          }}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[(() => {
                  const positions = new Float32Array((orbit.segments + 1) * 3)
                  for (let i = 0; i <= orbit.segments; i++) {
                    const angle = (i / orbit.segments) * Math.PI * 2
                    const x = Math.cos(angle) * orbit.radius
                    const z = Math.sin(angle) * orbit.radius
                    positions[i * 3] = x
                    positions[i * 3 + 1] = 0
                    positions[i * 3 + 2] = z
                  }
                  return positions
                })(), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2 + (orbitIndex % 3 === 0 ? 0.2 : 0)} />
          </line>
          
          {/* Points on orbit */}
          {orbit.points.map((point, pointIdx) => {
            const globalPointIndex = orbits.slice(0, orbitIndex).reduce(
              (sum, o) => sum + o.points.length, 0
            ) + pointIdx
            
            return (
              <mesh 
                key={`point-${orbitIndex}-${pointIdx}`}
                ref={(ref) => pointRefs.current[globalPointIndex] = ref as THREE.Mesh}
                position={[orbit.radius, 0, 0]}
              >
                <sphereGeometry args={[point.size, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )
          })}
        </group>
      ))}
      
      {/* Central point */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}