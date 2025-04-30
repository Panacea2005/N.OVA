"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

export default function HolographicSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.Material>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }

    if (materialRef.current) {
      // @ts-ignore - MeshDistortMaterial has distort property
      materialRef.current.distort = 0.3 + Math.sin(state.clock.getElapsedTime()) * 0.1
    }
  })

  return (
    <group>
      {/* Inner sphere */}
      <Sphere args={[1.5, 64, 64]} ref={sphereRef}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#8B5CF6"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          opacity={0.8}
          transparent
        />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[1.8, 32, 32]}>
        <meshBasicMaterial color="#8B5CF6" opacity={0.1} transparent side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}
