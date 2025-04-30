"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type * as THREE from "three"

function Grid() {
  const gridRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2
      gridRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
      gridRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group ref={gridRef}>
      {/* Horizontal lines */}
      {Array.from({ length: 20 }).map((_, i) => {
        const y = (i - 10) * 0.5
        return (
          <line key={`h-${i}`}>
            <bufferGeometry attach="geometry">
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([-10, y, 0, 10, y, 0]), 3]}
                count={2} />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
          </line>
        )
      })}

      {/* Vertical lines */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (i - 10) * 0.5
        return (
          <line key={`v-${i}`}>
            <bufferGeometry attach="geometry">
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([x, -10, 0, x, 10, 0]), 3]}
                count={2} />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
          </line>
        )
      })}
    </group>
  )
}

export default function FloatingGrid() {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
      <Grid />
    </Canvas>
  )
}
