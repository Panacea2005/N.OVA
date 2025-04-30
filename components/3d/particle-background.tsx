"use client"

import { Canvas } from "@react-three/fiber"
import ParticleField from "./particle-field"

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ParticleField />
      </Canvas>
    </div>
  )
}
