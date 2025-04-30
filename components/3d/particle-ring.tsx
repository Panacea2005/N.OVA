"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

export default function ParticleRing({ count = 5000 }) {
  const ref = useRef<THREE.Points>(null)

  // Generate random points on a ring shape
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    const radius = 2.5
    const thickness = 0.8

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const angle = Math.random() * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * thickness

      temp[i3] = Math.cos(angle) * r
      temp[i3 + 1] = (Math.random() - 0.5) * thickness
      temp[i3 + 2] = Math.sin(angle) * r
    }

    return temp
  }, [count])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.05
      ref.current.rotation.y += delta * 0.075
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}
