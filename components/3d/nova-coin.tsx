"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Text } from "@react-three/drei"
import type * as THREE from "three"

export default function NovaCoin() {
  const coinRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (coinRef.current) {
      // Gentle rotation
      coinRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
      coinRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2
    }

    if (glowRef.current) {
      // Pulse the glow
      glowRef.current.scale.set(
        1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05,
        1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05,
        1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05,
      )
    }
  })

  return (
    <group ref={coinRef}>
      {/* Main coin body */}
      <Cylinder args={[2, 2, 0.3, 64]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#8B5CF6" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Coin edge detail */}
      <Cylinder args={[2.05, 2.05, 0.1, 64]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#4F46E5" metalness={0.8} roughness={0.3} />
      </Cylinder>

      {/* NOVA text */}
      <Text position={[0, 0, 0.25]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
        NOVA
      </Text>

      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}
