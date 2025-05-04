"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NTransferBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black rounded-xl border border-white/10 overflow-hidden">
      {/* 3D Canvas for the dot visualization */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 16], fov: 40 }}>
        <TransferVisualization />
      </Canvas>
      
      {/* Overlay Content - Positioned in bottom left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-8 left-8 text-3xl font-bold text-white"
      >
        N.TRANSFER
      </motion.div>
    </div>
  )
}

// Transfer Visualization
const TransferVisualization = () => {
  const groupRef = useRef<THREE.Group>(null)
  const [mounted, setMounted] = useState(false)
  
  const { camera } = useThree()
  
  // Set up camera and scene
  useEffect(() => {
    setMounted(true)
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 20
      camera.position.y = 0
      camera.lookAt(0, 0, 0)
    }
  }, [camera])
  
  // Apply subtle rotation to the entire scene
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.03
      groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.02
    }
  })
  
  if (!mounted) return null
  
  return (
    <group ref={groupRef}>
      {/* Sender Node */}
      <WalletNode 
        position={[-9, 0, 0]}
        type="sender"
      />
      
      {/* Transfer Flow System */}
      <TransferFlow />
      
      {/* Receiver Node */}
      <WalletNode 
        position={[9, 0, 0]}
        type="receiver"
      />
      
      {/* Ambient particles for depth and atmosphere */}
      <AmbientParticles />
    </group>
  )
}

// Ambient Particles Component
const AmbientParticles = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const [particlePositions, setParticlePositions] = useState<Float32Array | null>(null)
  const [particleSizes, setParticleSizes] = useState<Float32Array | null>(null)
  const [particleSpeeds, setParticleSpeeds] = useState<Float32Array | null>(null)
  
  const particleCount = 800
  const particleSize = 0.02
  
  // Initialize particle positions
  useEffect(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const speeds = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in a large volume
      positions[i * 3] = (Math.random() - 0.5) * 40      // X: spread wide
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20  // Y: less spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15  // Z: depth
      
      // Vary sizes slightly
      sizes[i] = particleSize * (0.5 + Math.random() * 0.5)
      
      // Random speeds
      speeds[i] = 0.002 + Math.random() * 0.003
    }
    
    setParticlePositions(positions)
    setParticleSizes(sizes)
    setParticleSpeeds(speeds)
  }, [])
  
  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current || !particlePositions || !particleSizes || !particleSpeeds) return
    
    const tempObject = new THREE.Object3D()
    const time = state.clock.getElapsedTime()
    
    for (let i = 0; i < particleCount; i++) {
      // Subtle drift motion
      const x = particlePositions[i * 3]
      const y = particlePositions[i * 3 + 1] + Math.sin(time * 0.1 + i * 0.01) * 0.01
      const z = particlePositions[i * 3 + 2]
      
      // Apply gentle pulsing
      const scale = particleSizes[i] * (0.9 + Math.sin(time * 0.2 + i * 0.05) * 0.1)
      
      tempObject.position.set(x, y, z)
      tempObject.scale.set(scale, scale, scale)
      tempObject.updateMatrix()
      
      particlesRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    particlesRef.current.instanceMatrix.needsUpdate = true
    
    // Update colors - subtle pulsation
    const tempColor = new THREE.Color("#FFFFFF")
    
    for (let i = 0; i < particleCount; i++) {
      // Distance from center affects brightness
      const x = particlePositions[i * 3]
      const y = particlePositions[i * 3 + 1]
      const z = particlePositions[i * 3 + 2]
      
      const distance = Math.sqrt(x*x + y*y + z*z)
      const normalizedDist = Math.min(1, distance / 15)
      
      // Combine distance factor with time-based pulsation
      const brightness = 0.4 - normalizedDist * 0.3 + Math.sin(time * 0.5 + i * 0.01) * 0.05
      
      const color = tempColor.clone().multiplyScalar(brightness)
      particlesRef.current.setColorAt(i, color)
    }
    
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true
    }
  })
  
  if (!particlePositions || !particleSizes) return null
  
  return (
    <instancedMesh
      ref={particlesRef}
      args={[undefined, undefined, particleCount]}
    >
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial
        color="#FFFFFF"
        transparent={true}
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

// Wallet Node Component
interface WalletNodeProps {
  position: [number, number, number]
  type: "sender" | "receiver"
}

const WalletNode: React.FC<WalletNodeProps> = ({ position, type }) => {
  const nodeRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  
  const [particleData, setParticleData] = useState<{
    positions: Float32Array,
    sizes: Float32Array,
    phases: Float32Array,
    radii: Float32Array
  } | null>(null)
  
  const particleCount = 1200
  const nodeRadius = 3
  const isSender = type === "sender"
  
  // Create particles and rings
  useEffect(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const phases = new Float32Array(particleCount)
    const radii = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in spherical shell
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      // Distribute in layers - inner cloud and outer shell
      const isShellParticle = i < particleCount * 0.6
      
      // Shell particles on the surface, cloud particles inside
      const radius = isShellParticle 
        ? nodeRadius * (0.95 + Math.random() * 0.05)  // Shell particles
        : nodeRadius * (0.2 + Math.random() * 0.75)   // Cloud particles
      
      // Convert to cartesian coordinates
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Vary size by position and layer
      const sizeFactor = isShellParticle ? 0.04 : 0.03
      sizes[i] = sizeFactor * (0.8 + Math.random() * 0.4)
      
      // Random phases for animation
      phases[i] = Math.random() * Math.PI * 2
      
      // Store radius for animation
      radii[i] = radius
    }
    
    setParticleData({
      positions,
      sizes,
      phases,
      radii
    })
  }, [])
  
  // Animate particles and rings
  useFrame((state) => {
    if (!nodeRef.current || !particlesRef.current || !particleData) return
    
    const time = state.clock.getElapsedTime()
    // Offset time for sender vs receiver to create alternating pulses
    const nodeTime = time + (isSender ? 0 : Math.PI)
    
    // Animate core pulsation
    if (coreRef.current) {
      const pulseFactor = 0.9 + Math.sin(nodeTime * 1.5) * 0.1
      coreRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor)
    }
    
    // Animate ring
    if (ringRef.current) {
      // Breathe effect for ring
      const ringPulse = 1 + Math.sin(nodeTime * 0.8) * 0.05
      ringRef.current.scale.set(ringPulse, ringPulse, ringPulse)
      
      // Rotate ring
      ringRef.current.rotation.z = time * 0.1
    }
    
    // Animate particles
    const tempObject = new THREE.Object3D()
    
    for (let i = 0; i < particleCount; i++) {
      const baseX = particleData.positions[i * 3]
      const baseY = particleData.positions[i * 3 + 1]
      const baseZ = particleData.positions[i * 3 + 2]
      
      // Get particle's phase and radius
      const phase = particleData.phases[i]
      const baseRadius = particleData.radii[i]
      
      // Calculate distance from center for scaling effects
      const distance = Math.sqrt(baseX*baseX + baseY*baseY + baseZ*baseZ)
      
      // Breathing effect - scale particles in/out
      const breathFreq = 0.8
      const breathAmp = 0.02
      const breathOffset = phase
      const breathFactor = 1 + Math.sin(nodeTime * breathFreq + breathOffset) * breathAmp
      
      // Apply breathing to position
      const x = baseX * breathFactor
      const y = baseY * breathFactor
      const z = baseZ * breathFactor
      
      // Apply some rotation to the entire field
      const rotSpeed = 0.1
      const rotAngle = time * rotSpeed
      const rotatedX = x * Math.cos(rotAngle) - y * Math.sin(rotAngle)
      const rotatedY = x * Math.sin(rotAngle) + y * Math.cos(rotAngle)
      
      // Set position
      tempObject.position.set(rotatedX, rotatedY, z)
      
      // Apply size with slight pulsation
      const sizePulse = 1 + Math.sin(nodeTime * 2 + phase * 3) * 0.1
      const size = particleData.sizes[i] * sizePulse
      
      tempObject.scale.set(size, size, size)
      tempObject.updateMatrix()
      
      particlesRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    particlesRef.current.instanceMatrix.needsUpdate = true
    
    // Update particle colors
    const senderColor = new THREE.Color("#FFFFFF")
    const receiverColor = new THREE.Color("#FFFFFF")
    
    for (let i = 0; i < particleCount; i++) {
      const baseX = particleData.positions[i * 3]
      const baseY = particleData.positions[i * 3 + 1]
      const baseZ = particleData.positions[i * 3 + 2]
      
      const distance = Math.sqrt(baseX*baseX + baseY*baseY + baseZ*baseZ)
      const normalizedDist = distance / nodeRadius
      
      // Phase for this particle
      const phase = particleData.phases[i]
      
      // Pulsation effect
      const pulseFactor = Math.sin(nodeTime * 1.5 + phase) * 0.15 + 0.85
      
      // Distance-based brightness
      let baseBrightness
      
      // For sender, outer particles are brighter
      if (isSender) {
        baseBrightness = 0.4 + normalizedDist * 0.5
      } 
      // For receiver, inner particles are brighter
      else {
        baseBrightness = 0.9 - normalizedDist * 0.3
      }
      
      // Combine effects
      const brightness = baseBrightness * pulseFactor
      
      // Set color based on node type
      const color = isSender ? 
        senderColor.clone().multiplyScalar(brightness) : 
        receiverColor.clone().multiplyScalar(brightness)
      
      particlesRef.current.setColorAt(i, color)
    }
    
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true
    }
  })
  
  if (!particleData) return null
  
  return (
    <group ref={nodeRef} position={position}>
      {/* Particles cloud */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, particleCount]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent={true}
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

// Transfer Flow Component - Creates a stream of particles flowing between nodes
const TransferFlow = () => {
  const flowRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  
  const [particleData, setParticleData] = useState<{
    positions: Float32Array,
    originalPositions: Float32Array,
    speeds: Float32Array,
    lanes: Float32Array,
    sizes: Float32Array,
    offsets: Float32Array
  } | null>(null)
  
  const particleCount = 3000
  const flowLength = 18    // Distance between nodes
  const flowHeight = 6     // Maximum height of arcs
  const flowWidth = 2      // Width of flow
  
  // Initialize particles
  useEffect(() => {
    const positions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    const lanes = new Float32Array(particleCount)
    const sizes = new Float32Array(particleCount)
    const offsets = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Random progress along the path (0 = start, 1 = end)
      const progress = Math.random()
      
      // Assign to a "lane" - conceptual track within the flow (0-9)
      const lane = Math.floor(Math.random() * 10)
      lanes[i] = lane
      
      // Calculate lane-specific parameters
      // Wider horizontal spread for outer lanes
      const laneOffset = (lane - 4.5) / 4.5
      const laneWidth = flowWidth * (0.2 + Math.abs(laneOffset) * 0.8)
      
      // Different heights for different lanes
      const laneHeight = flowHeight * (1 - Math.abs(laneOffset) * 0.5)
      
      // X position based on progress (from sender to receiver)
      const x = -flowLength/2 + progress * flowLength
      
      // Y position follows a parabolic arc
      // Normalized x position for arc calculation (-1 to 1)
      const normalizedX = (x / (flowLength/2))
      
      // Arc equation: y = height * (1 - x²)
      const baseY = laneHeight * (1 - normalizedX * normalizedX)
      
      // Add lane-specific height offset and variation
      const y = baseY + laneOffset * 0.5
      
      // Z with lane-specific spread
      const z = (Math.random() * 2 - 1) * laneWidth * 0.1
      
      // Store positions
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Particle speed (distance units per second)
      // Outer lanes move slightly slower
      const laneSpeedFactor = 1 - Math.abs(laneOffset) * 0.3
      speeds[i] = (0.5 + Math.random() * 1.0) * laneSpeedFactor
      
      // Particle size - inner lanes have larger particles
      const laneSizeFactor = 1 - Math.abs(laneOffset) * 0.4
      sizes[i] = (0.02 + Math.random() * 0.03) * laneSizeFactor
      
      // Random offset for animation variation
      offsets[i] = Math.random() * Math.PI * 2
    }
    
    setParticleData({
      positions,
      originalPositions,
      speeds,
      lanes,
      sizes,
      offsets
    })
  }, [])
  
  // Animate particle flow
  useFrame((state) => {
    if (!flowRef.current || !particlesRef.current || !particleData) return
    
    const tempObject = new THREE.Object3D()
    const time = state.clock.getElapsedTime()
    
    for (let i = 0; i < particleCount; i++) {
      // Get lane and original position
      const lane = particleData.lanes[i]
      const baseX = particleData.originalPositions[i * 3]
      const baseY = particleData.originalPositions[i * 3 + 1]
      const baseZ = particleData.originalPositions[i * 3 + 2]
      
      // Calculate movement along the path
      const speed = particleData.speeds[i]
      const offset = particleData.offsets[i]
      
      // Progress along the path
      let progress = (baseX + flowLength/2) / flowLength
      
      // Move particle along path
      progress += time * speed * 0.05
      
      // Loop back when reaching the end
      progress = progress % 1
      
      // Calculate new X position
      const x = -flowLength/2 + progress * flowLength
      
      // Recalculate Y to follow the parabolic arc
      const normalizedX = (x / (flowLength/2))
      
      // Get lane parameters
      const laneOffset = (lane - 4.5) / 4.5
      const laneHeight = flowHeight * (1 - Math.abs(laneOffset) * 0.5)
      
      // Arc equation
      const baseArcY = laneHeight * (1 - normalizedX * normalizedX)
      
      // Add lane-specific offset
      let y = baseArcY + laneOffset * 0.5
      
      // Add subtle wave motion perpendicular to path
      const waveFreq = 3 + lane * 0.2
      const waveAmp = 0.05
      const waveOffset = offset
      
      // Calculate tangent to path at this point for perpendicular oscillation
      const tangentX = 1.0
      const tangentY = -2 * normalizedX * laneHeight / (flowLength/2)
      
      // Normalize tangent
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
      const normalizedTangentX = tangentX / tangentLength
      const normalizedTangentY = tangentY / tangentLength
      
      // Perpendicular direction
      const perpX = -normalizedTangentY
      const perpY = normalizedTangentX
      
      // Apply oscillation in perpendicular direction
      const wave = Math.sin(time * waveFreq + waveOffset) * waveAmp
      const finalX = x + perpX * wave
      const finalY = y + perpY * wave
      
      // Set position
      tempObject.position.set(finalX, finalY, baseZ)
      
      // Calculate size with pulsation
      const baseSize = particleData.sizes[i]
      const sizePulse = 0.8 + Math.sin(time * 2 + offset * 5) * 0.2
      const size = baseSize * sizePulse
      
      tempObject.scale.set(size, size, size)
      tempObject.updateMatrix()
      
      particlesRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    particlesRef.current.instanceMatrix.needsUpdate = true
    
    // Update particle colors
    const tempColor = new THREE.Color("#FFFFFF")
    
    for (let i = 0; i < particleCount; i++) {
      // Get progress along the path
      const x = particleData.positions[i * 3]
      const normalizedProgress = (x + flowLength/2) / flowLength
      
      // Brightness increases from sender to receiver
      const baseBrightness = 0.4 + normalizedProgress * 0.6
      
      // Add pulsation effect
      const offset = particleData.offsets[i]
      const pulseFactor = 0.8 + Math.sin(time * 2 + offset * 5) * 0.2
      
      // Combine effects
      const brightness = baseBrightness * pulseFactor
      
      // Set color
      const color = tempColor.clone().multiplyScalar(brightness)
      particlesRef.current.setColorAt(i, color)
    }
    
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true
    }
  })
  
  if (!particleData) return null
  
  return (
    <group ref={flowRef}>
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, particleCount]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent={true}
          opacity={0.8}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

export default NTransferBanner