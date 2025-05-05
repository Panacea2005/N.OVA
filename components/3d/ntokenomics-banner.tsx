"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NTokenomicsBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black rounded-xl border border-white/10 overflow-hidden">
      {/* 3D Canvas for the dot visualization */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 16], fov: 40 }}>
        <TripleCoins />
      </Canvas>
      
      {/* Overlay Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 right-8 text-3xl font-bold text-white"
      >
        N.TOKENOMICS
      </motion.div>
    </div>
  )
}

// 3D Triple Coin Configuration
const TripleCoins = () => {
  const groupRef = useRef<THREE.Group>(null)
  const [mounted, setMounted] = useState(false)
  
  const { camera } = useThree()
  
  // Set up camera and scene
  useEffect(() => {
    setMounted(true)
    
    // Position camera for better view - further back for better separation
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 18
      camera.position.y = 1.5
      camera.lookAt(0, 0, 0)
    }
  }, [camera])
  
  // Apply very subtle rotation to the entire group
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.03
      groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.01
    }
  })
  
  if (!mounted) return null
  
  return (
    <group ref={groupRef}>
      {/* Top Coin - facing forward with slight tilt */}
      <Coin 
        position={[0, 3.8, 0]} 
        rotation={[0.25, 0, 0]} 
        colorIntensity={1.3} 
        coinSize={2.2}
        label="TOP"
        animationOffset={0}
      />
      
      {/* Bottom Left Coin - angled facing left */}
      <Coin 
        position={[-4.5, -2.8, 0.5]} 
        rotation={[0.2, -0.4, 0.1]} 
        colorIntensity={0.9} 
        coinSize={2.2}
        label="LEFT"
        animationOffset={0.33}
      />
      
      {/* Bottom Right Coin - angled facing right */}
      <Coin 
        position={[4.5, -2.8, 0.5]} 
        rotation={[0.2, 0.4, -0.1]} 
        colorIntensity={1.1} 
        coinSize={2.2}
        label="RIGHT"
        animationOffset={0.66}
      />
    </group>
  )
}

// Individual Coin Component
interface CoinProps {
  position: [number, number, number]
  rotation: [number, number, number]
  colorIntensity: number
  coinSize: number
  label: string
  animationOffset: number
}

const Coin: React.FC<CoinProps> = ({ position, rotation, colorIntensity, coinSize, label, animationOffset }) => {
  const coinRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  const [dotSizes, setDotSizes] = useState<Float32Array | null>(null)
  const [dotAnimationPhases, setDotAnimationPhases] = useState<Float32Array | null>(null)
  
  // Settings
  const baseDotSize = 0.035
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.9
  const totalDots = 1800
  
  // Create dot positions for the coin
  useEffect(() => {
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const sizes = new Float32Array(totalDots)
    const animationPhases = new Float32Array(totalDots)
    
    // Coin dimensions
    const coinRadius = coinSize
    const coinThickness = 0.5
    
    let index = 0
    
    // 1. Create the coin front face with more dots
    const frontFaceDots = Math.floor(totalDots * 0.45)
    for (let i = 0; i < frontFaceDots; i++) {
      // Use different distribution patterns for more realistic look
      const r = Math.sqrt(Math.random()) * coinRadius
      const theta = Math.random() * Math.PI * 2
      
      // Convert to cartesian coordinates
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      
      // Slight bulge in the center for more 3D effect
      const bulge = 0.1 * (1 - Math.min(1, (r / coinRadius) * 1.5))
      const z = coinThickness/2 + bulge + (Math.random() * 0.03 - 0.015)
      
      // Store positions
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Front face has varying intensity based on distance from edge for 3D effect
      // Brighter in center, fading toward edges
      const distFromCenter = Math.sqrt(x*x + y*y) / coinRadius
      const edgeFactor = Math.min(1, distFromCenter * 1.7)
      
      // Enhanced shading - bright center fading to edges
      let baseBrightness = 1.2 - edgeFactor * 0.8
      
      // Add a subtle lighting effect from top-left
      const angle = Math.atan2(y, x)
      const lightAngle = Math.PI / 4 // Light coming from top-left
      const angleDiff = Math.abs(((angle - lightAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
      const lightingEffect = 0.2 * (1 - angleDiff / Math.PI)
      
      baseBrightness += lightingEffect
      
      // Apply coin's overall intensity factor
      intensities[index] = baseBrightness * colorIntensity
      
      // Slightly larger dots in the center for emphasis
      const sizeFactor = 1 - edgeFactor * 0.3
      sizes[index] = baseDotSize * sizeFactor
      
      // Assign a random animation phase to each dot (0-1)
      // This determines when in the cycle this dot will move
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 2. Create the coin back face with fewer dots
    const backFaceDots = Math.floor(totalDots * 0.25)
    for (let i = 0; i < backFaceDots; i++) {
      const r = Math.sqrt(Math.random()) * coinRadius
      const theta = Math.random() * Math.PI * 2
      
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      
      // Slight concave shape for back face
      const concave = -0.05 * (1 - Math.min(1, (r / coinRadius) * 1.2))
      const z = -coinThickness/2 + concave + (Math.random() * 0.03 - 0.015)
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Back face is much dimmer overall
      const distFromCenter = Math.sqrt(x*x + y*y) / coinRadius
      const edgeFactor = Math.min(1, distFromCenter * 1.5)
      const baseBrightness = 0.4 - edgeFactor * 0.3
      
      // Apply coin's overall intensity factor
      intensities[index] = baseBrightness * colorIntensity
      
      // Smaller dots on back face
      sizes[index] = baseDotSize * 0.7
      
      // Assign a random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 3. Create the coin edge with more defined dots
    const edgeDots = Math.floor(totalDots * 0.3)
    for (let i = 0; i < edgeDots; i++) {
      const theta = Math.random() * Math.PI * 2
      
      // Position dots precisely around the edge
      const x = coinRadius * Math.cos(theta)
      const y = coinRadius * Math.sin(theta)
      
      // Distribute dots along the thickness of the coin
      const zPos = (Math.random() * 2 - 1) * coinThickness/2
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = zPos
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = zPos
      
      // Edge brightness varies based on angle - simulate light from top
      // This creates a highlight on the top edge and shadow on bottom
      const normalizedTheta = ((theta + Math.PI * 2) % (Math.PI * 2))
      
      // Brightest at top (π/2), darkest at bottom (3π/2)
      const topFactor = 1 - Math.abs(normalizedTheta - Math.PI/2) / Math.PI
      
      // Also vary brightness based on z-position (sides are less bright)
      const zFactor = 1 - Math.abs(zPos) / (coinThickness/2)
      const baseBrightness = 0.5 + topFactor * 0.5 + zFactor * 0.2
      
      // Apply coin's overall intensity factor
      intensities[index] = baseBrightness * colorIntensity
      
      // Slightly larger dots on the edge for definition
      sizes[index] = baseDotSize * 0.9
      
      // Assign a random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
    setDotSizes(sizes)
    setDotAnimationPhases(animationPhases)
  }, [totalDots, colorIntensity, coinSize, baseDotSize])
  
  // Animation loop - sequential dot movement
  useFrame((state) => {
    if (!coinRef.current || !dotsRef.current || !dotIntensities || !dotOriginalPositions || 
        !dotPositions || !dotSizes || !dotAnimationPhases) 
      return
      
    const time = state.clock.getElapsedTime()
    
    // Add coin-specific animation offset to create staggered effects between coins
    const coinTime = time + animationOffset * 10
    
    // Apply sequential animations to dots
    const tempObj = new THREE.Object3D()
    
    // Wave frequency for sequential animation
    const sequenceFrequency = 0.3
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Get this dot's animation phase (0-1)
      const dotPhase = dotAnimationPhases[i]
      
      // Calculate distance from center
      const distFromCenter = Math.sqrt(x*x + y*y)
      
      // Create a time offset based on the dot's phase
      // This staggers the animation across dots
      const phaseOffset = dotPhase * Math.PI * 2
      
      // Phase-shifted time for this specific dot
      const dotTime = coinTime + phaseOffset
      
      // Amplitude of movement varies by position
      const noiseAmp = 0.008
      
      // When this dot should move (phase-based timing)
      // Each dot moves once per animation cycle, at its specific phase
      // Sharper peak in the sin curve creates more distinct movement
      const movementFactor = Math.pow(Math.sin(dotTime * sequenceFrequency) * 0.5 + 0.5, 2)
      
      // Different movement patterns based on position
      const nx = Math.sin(x * 2 + dotPhase * 10) * noiseAmp * movementFactor
      const ny = Math.cos(y * 2 + dotPhase * 10) * noiseAmp * movementFactor
      const nz = Math.sin(z * 3 + dotPhase * 10) * noiseAmp * movementFactor
      
      // Apply movement with distance-based scaling
      // Dots near the edge move slightly more
      const edgeFactor = Math.min(1, distFromCenter / coinSize)
      const scaleFactor = 1 + edgeFactor * 0.3
      
      tempObj.position.set(
        x + nx * scaleFactor,
        y + ny * scaleFactor,
        z + nz * scaleFactor
      )
      
      // Apply dot size
      tempObj.scale.set(
        dotSizes[i], 
        dotSizes[i], 
        dotSizes[i]
      )
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities - also sequentially
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Get this dot's animation phase
      const dotPhase = dotAnimationPhases[i]
      
      // Create phase-shifted time
      const phaseOffset = dotPhase * Math.PI * 2
      const dotTime = coinTime + phaseOffset
      
      // Sequential shimmer effect - dots brighten one after another
      const shimmerFactor = Math.pow(Math.sin(dotTime * sequenceFrequency) * 0.5 + 0.5, 3) * 0.15
      
      // Get original position for position-based effects
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      
      // Different shimmer based on position
      const distFromCenter = Math.sqrt(x*x + y*y)
      
      // Combine effects
      const shimmerEffect = 1 + shimmerFactor * (distFromCenter / coinSize)
      
      // Calculate final intensity with original base value
      const baseIntensity = dotIntensities[i]
      const finalIntensity = Math.max(0.2, Math.min(1.2, baseIntensity * shimmerEffect))
      
      // Set the color with intensity
      const color = tempColor.clone().multiplyScalar(finalIntensity)
      dotsRef.current.setColorAt(i, color)
    }
    
    if (dotsRef.current.instanceColor) {
      dotsRef.current.instanceColor.needsUpdate = true
    }
  })
  
  // Display loading state if positions aren't ready
  if (!dotPositions || !dotIntensities || !dotSizes || !dotAnimationPhases) {
    return null
  }
  
  return (
    <group 
      ref={coinRef} 
      position={position}
      rotation={[rotation[0], rotation[1], rotation[2]]}
    >
      {/* Create all dots as instanced mesh for better performance */}
      <instancedMesh
        ref={dotsRef}
        args={[undefined, undefined, totalDots]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} /> {/* Use base size of 1, scale with matrix */}
        <meshBasicMaterial
          color={dotColor}
          transparent={true}
          opacity={dotOpacity}
          toneMapped={false}
        />
      </instancedMesh>
      
      {/* Initialize dot positions and sizes */}
      <primitive
        object={new THREE.Object3D()}
        ref={(obj: any) => {
          if (obj && dotPositions && dotsRef.current && dotIntensities && dotSizes) {
            // Set each dot's position and size
            for (let i = 0; i < totalDots; i++) {
              if (i < dotPositions.length / 3) {
                obj.position.set(
                  dotPositions[i * 3],
                  dotPositions[i * 3 + 1],
                  dotPositions[i * 3 + 2]
                )
                
                // Apply dot size
                const size = dotSizes[i]
                obj.scale.set(size, size, size)
                
                obj.updateMatrix()
                dotsRef.current.setMatrixAt(i, obj.matrix)
              }
            }
            dotsRef.current.instanceMatrix.needsUpdate = true
            
            // Initialize colors with 3D shading
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

export default NTokenomicsBanner