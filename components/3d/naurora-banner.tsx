"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NAuroraBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black border border-white/30 p-0.5 overflow-hidden">
      <div className="absolute inset-0 border border-white/10 z-10">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} 
        />
        
        {/* 3D Canvas for the music visualization */}
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <MusicVisualization />
        </Canvas>
        
        {/* Overlay Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-8 right-8 text-3xl font-bold text-white"
        >
          N.AURORA
        </motion.div>

        {/* Animated scan lines */}
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={`scan-${i}`}
              className="absolute w-full h-[1px] bg-white/5"
              style={{ top: `${i * 25}%` }}
              animate={{
                opacity: [0.05, 0.1, 0.05],
                scaleY: [1, 1.5, 1],
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 15 + (i % 3),
                repeat: Infinity,
                delay: i * 1.5,
              }}
            />
          ))}
      </div>
    </div>
  )
}

// 3D Music Visualization with dot architecture
const MusicVisualization = () => {
  const groupRef = useRef<THREE.Group>(null!)
  const dotsRef = useRef<THREE.InstancedMesh>(null!)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  const [dotFrequencies, setDotFrequencies] = useState<Float32Array | null>(null)
  const [dotAmplitudes, setDotAmplitudes] = useState<Float32Array | null>(null)
  const [dotPhases, setDotPhases] = useState<Float32Array | null>(null)
  
  // Settings
  const dotSize = 0.035
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.8
  const totalDots = 2000
  
  const { camera } = useThree()
  
  // Create dot positions for the music visualization sphere
  useEffect(() => {
    // Position camera for better view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 10
      camera.position.y = 0
      camera.lookAt(0, 0, 0)
    }
    
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const frequencies = new Float32Array(totalDots)
    const amplitudes = new Float32Array(totalDots)
    const phases = new Float32Array(totalDots)
    
    // Base sphere radius
    const radius = 3.5
    
    // Create dots in a spherical formation
    for (let i = 0; i < totalDots; i++) {
      // Use fibonacci sphere algorithm for even distribution of points
      const phi = Math.acos(1 - 2 * (i / totalDots))
      const theta = Math.PI * 2 * i * (1 / 1.618033988749895) // Golden ratio based angle
      
      // Convert spherical to cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      // Store original positions
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z
      
      // Initial positions are same as original
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Create bands of intensity based on latitude (phi angle)
      // This creates horizontal bands of varying brightness
      const latitudeBands = 6
      const bandIndex = Math.floor((phi / Math.PI) * latitudeBands) % latitudeBands
      const bandIntensity = 0.4 + (bandIndex / latitudeBands) * 0.6
      
      // Add some random variation
      intensities[i] = bandIntensity * (0.8 + Math.random() * 0.4)
      
      // Create different animation frequencies - vary by position on sphere
      // Dots near poles have different frequencies than equator
      const latFreq = 0.2 + Math.abs(Math.cos(phi)) * 1.5
      const longFreq = 0.2 + (theta / (Math.PI * 2)) * 1.2
      frequencies[i] = latFreq * longFreq * (0.7 + Math.random() * 0.6)
      
      // Various amplitudes for different wave effects
      // Greater near equator, less at poles
      amplitudes[i] = 0.1 + Math.sin(phi) * 0.3 * (0.8 + Math.random() * 0.4)
      
      // Random phase offsets for more natural looking waves
      phases[i] = Math.random() * Math.PI * 2
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
    setDotFrequencies(frequencies)
    setDotAmplitudes(amplitudes)
    setDotPhases(phases)
  }, [totalDots, camera])
  
  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || 
        !dotOriginalPositions || !dotPositions || !dotFrequencies || 
        !dotAmplitudes || !dotPhases) 
      return
      
    const time = state.clock.getElapsedTime()
    
    // Rotation of the entire sphere
    groupRef.current.rotation.y = time * 0.1
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.1
    
    // Apply dynamic animations to the dots
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position on sphere
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Get animation parameters
      const freq = dotFrequencies[i]
      const amp = dotAmplitudes[i]
      const phase = dotPhases[i]
      
      // Calculate spherical coordinates from cartesian
      const radius = Math.sqrt(x*x + y*y + z*z)
      const theta = Math.atan2(y, x)
      const phi = Math.acos(z / radius)
      
      // Create different wave patterns based on position
      
      // Wave 1: Radial expansion/contraction based on longitude (theta)
      const wave1 = Math.sin(theta * 8 + time * freq + phase) * amp * 0.4
      
      // Wave 2: Latitude-based waves moving from poles to equator
      const wave2 = Math.sin(phi * 6 + time * (freq * 0.7) + phase) * amp * 0.5
      
      // Wave 3: Spiral pattern
      const wave3 = Math.sin(theta * 4 + phi * 4 + time * (freq * 0.5)) * amp * 0.3
      
      // Wave 4: Pulsating effect - all dots move in and out slightly
      const wave4 = Math.sin(time * 0.8) * 0.06
      
      // Combine waves for final displacement
      const displacement = wave1 + wave2 + wave3 + wave4
      
      // Calculate new position - move dot along its radial direction
      const newRadius = radius + displacement
      const newX = (x / radius) * newRadius
      const newY = (y / radius) * newRadius
      const newZ = (z / radius) * newRadius
      
      // Set new position
      tempObj.position.set(newX, newY, newZ)
      
      // Update matrix
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities for audio-reactive effect
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Base intensity
      const baseIntensity = dotIntensities[i]
      const freq = dotFrequencies[i]
      const phase = dotPhases[i]
      
      // Complex pulsing pattern that varies across the sphere
      // Create multiple overlapping waves for rich visual effect
      const pulse1 = 0.3 * Math.sin(time * 1.2 + phase)
      const pulse2 = 0.2 * Math.sin(time * freq * 0.7 + phase * 2)
      const pulse3 = 0.1 * Math.sin(time * freq * 1.3 + i * 0.01)
      
      // Combine pulses
      const pulseFactor = pulse1 + pulse2 + pulse3
      
      // Calculate final intensity with audio-reactive effect
      const finalIntensity = Math.max(0.1, Math.min(1.2, baseIntensity * (1 + pulseFactor)))
      
      // Apply color intensity
      const color = tempColor.clone().multiplyScalar(finalIntensity)
      dotsRef.current.setColorAt(i, color)
    }
    
    if (dotsRef.current.instanceColor) {
      dotsRef.current.instanceColor.needsUpdate = true
    }
  })
  
  // Display loading state if positions aren't ready
  if (!dotPositions || !dotIntensities) {
    return null
  }
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Create all dots as instanced mesh for better performance */}
      <instancedMesh
        ref={dotsRef}
        args={[undefined, undefined, totalDots]}
        frustumCulled={false}
      >
        <sphereGeometry args={[dotSize, 6, 6]} />
        <meshBasicMaterial
          color={dotColor}
          transparent={true}
          opacity={dotOpacity}
          toneMapped={false}
        />
      </instancedMesh>
      
      {/* Connection lines visualizing the sound waves and audio networks */}
      {/* Placeholder for dot connections */}
      {[] /* Replace with actual connections if needed */.map((connection: [any, any], idx: any) => {
        const [from, to] = connection
        
        // Skip invalid connections
        if (from >= totalDots || to >= totalDots) return null
        
        const startX = dotPositions[from * 3]
        const startY = dotPositions[from * 3 + 1]
        const startZ = dotPositions[from * 3 + 2]
        
        const endX = dotPositions[to * 3]
        const endY = dotPositions[to * 3 + 1]
        const endZ = dotPositions[to * 3 + 2]
        
        // Calculate the midpoint for the line
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const midZ = (startZ + endZ) / 2
        
        // Calculate distance between points
        const distance = Math.sqrt(
          Math.pow(endX - startX, 2) +
          Math.pow(endY - startY, 2) +
          Math.pow(endZ - startZ, 2)
        )
        
        // Only show lines if they aren't too long
        if (distance > 0.8) return null
        
        // Calculate line orientation
        const lineVector = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ)
        lineVector.normalize()
        
        // Create quaternion for orientation
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), // Default orientation (along y-axis)
          lineVector
        )
        
        // Determine line opacity based on dot types
        let lineOpacity = 0.15
        
        // Waveform connections are more visible
        if (from < totalDots * 0.25 && to < totalDots * 0.25) {
          lineOpacity = 0.25
        }
        // Ring connections also more visible
        else if (from >= totalDots * 0.5 && from < totalDots * 0.7 && 
                to >= totalDots * 0.5 && to < totalDots * 0.7) {
          lineOpacity = 0.2
        }
        // Note connections very bright
        else if (from >= totalDots * 0.7 && from < totalDots * 0.85 && 
                to >= totalDots * 0.7 && to < totalDots * 0.85) {
          lineOpacity = 0.3
        }
        
        return (
          <mesh
            key={`connection-${idx}`}
            position={[midX, midY, midZ]}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.006, 0.006, distance, 3, 1]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent={true}
              opacity={lineOpacity + Math.random() * 0.1}
            />
          </mesh>
        )
      })}
      
      {/* Initialize dot positions */}
      <primitive
        object={new THREE.Object3D()}
        ref={(obj: { position: { set: (arg0: number, arg1: number, arg2: number) => void }; updateMatrix: () => void; matrix: THREE.Matrix4 }) => {
          if (obj && dotPositions && dotsRef.current && dotIntensities) {
            // Set each dot's position
            for (let i = 0; i < totalDots; i++) {
              if (i < dotPositions.length / 3) {
                obj.position.set(
                  dotPositions[i * 3],
                  dotPositions[i * 3 + 1],
                  dotPositions[i * 3 + 2]
                )
                obj.updateMatrix()
                dotsRef.current.setMatrixAt(i, obj.matrix)
              }
            }
            dotsRef.current.instanceMatrix.needsUpdate = true
            
            // Initialize colors
            const tempColor = new THREE.Color(dotColor)
            for (let i = 0; i < totalDots; i++) {
              if (i < dotIntensities.length) {
                const intensity = dotIntensities[i]
                const color = tempColor.clone().multiplyScalar(intensity)
                dotsRef.current.setColorAt(i, color)
              }
            }
            if (dotsRef.current.instanceColor) {
              dotsRef.current.instanceColor.needsUpdate = true
            }
          }
        }}
      />
    </group>
  )
}

export default NAuroraBanner