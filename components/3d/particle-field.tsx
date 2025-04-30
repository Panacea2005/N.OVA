"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

export default function ParticleField({ count = 3000 }) {
  const ref = useRef<THREE.Points>(null)

  // Generate random points in a sphere
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    // Use a simple random distribution
    for (let i = 0; i < temp.length; i += 3) {
      temp[i] = (Math.random() - 0.5) * 20
      temp[i + 1] = (Math.random() - 0.5) * 20
      temp[i + 2] = (Math.random() - 0.5) * 20
    }
    return temp
  }, [count])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.02
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.03
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}
