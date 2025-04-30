"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

export default function ParticleText({ text = "NOVA" }) {
  const pointsRef = useRef<THREE.Points>(null)
  const textRef = useRef<THREE.Mesh>(null)

  // Create particles based on text
  const particles = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 10
      positions[i3 + 1] = (Math.random() - 0.5) * 5
      positions[i3 + 2] = (Math.random() - 0.5) * 5

      sizes[i] = Math.random() * 0.1 + 0.01
    }

    return { positions, sizes }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05

      // Update particle positions
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        const z = positions[i + 2]

        // Apply sine wave animation
        positions[i + 1] = y + Math.sin(state.clock.getElapsedTime() + x) * 0.01
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (textRef.current && textRef.current.material) {
      // Cast to MeshBasicMaterial which has opacity property
      const material = Array.isArray(textRef.current.material) 
        ? textRef.current.material[0] as THREE.Material & { opacity: number }
        : textRef.current.material as THREE.Material & { opacity: number }
      
      material.opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2
    }
  })

  return (
    <group>
      <Text
        ref={textRef}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
        letterSpacing={0.1}
      >
        {text}
      </Text>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particles.sizes.length}
            array={particles.sizes}
            itemSize={1}
            args={[particles.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ffffff"
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
