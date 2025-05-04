"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NIdentityBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black rounded-xl border border-white/10 overflow-hidden">
      {/* 3D Canvas for the dot visualization */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 30 }}>
        <IdentityCard />
      </Canvas>
      
      {/* Overlay Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 right-8 text-3xl font-bold text-white"
      >
        N.IDENTITY
      </motion.div>
    </div>
  )
}

// 3D Identity Card
const IdentityCard = () => {
  const cardRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  const [dotSizes, setDotSizes] = useState<Float32Array | null>(null)
  const [dotColors, setDotColors] = useState<Float32Array | null>(null)
  const [dotAnimationPhases, setDotAnimationPhases] = useState<Float32Array | null>(null)
  
  // Settings
  const dotSize = 0.02
  const totalDots = 6000
  
  const { camera } = useThree()
  
  // Create dot positions for the card
  useEffect(() => {
    // Position camera for better view - angled to see card as 3D
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 5.5
      camera.position.y = 1.2
      camera.position.x = -2
      camera.lookAt(0, 0, 0)
    }
    
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const sizes = new Float32Array(totalDots)
    const colors = new Float32Array(totalDots * 3)
    const animationPhases = new Float32Array(totalDots)
    
    // Card dimensions - aspect ratio of a typical ID card
    const cardWidth = 3.5
    const cardHeight = 2.2
    const cardThickness = 0.06
    
    let index = 0
    
    // 1. Create the card front face
    const frontFaceDots = Math.floor(totalDots * 0.4)
    for (let i = 0; i < frontFaceDots; i++) {
      // Random position within the card dimensions, but ensure good edge coverage
      let x, y
      
      // Ensure better edge coverage by increasing probability near edges
      if (Math.random() < 0.3) {
        // Place dots near the edges
        const edge = Math.floor(Math.random() * 4)
        if (edge === 0) {
          // Top edge
          x = (Math.random() * 2 - 1) * cardWidth / 2
          y = cardHeight / 2 - Math.random() * 0.1
        } else if (edge === 1) {
          // Right edge
          x = cardWidth / 2 - Math.random() * 0.1
          y = (Math.random() * 2 - 1) * cardHeight / 2
        } else if (edge === 2) {
          // Bottom edge
          x = (Math.random() * 2 - 1) * cardWidth / 2
          y = -cardHeight / 2 + Math.random() * 0.1
        } else {
          // Left edge
          x = -cardWidth / 2 + Math.random() * 0.1
          y = (Math.random() * 2 - 1) * cardHeight / 2
        }
      } else {
        // Random position within the card
        x = (Math.random() * 2 - 1) * cardWidth / 2
        y = (Math.random() * 2 - 1) * cardHeight / 2
      }
      
      const z = cardThickness / 2 + (Math.random() * 0.01 - 0.005) // slight z variation
      
      // Store positions
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Calculate distance from card center for shading
      const distFromCenterX = Math.abs(x) / (cardWidth / 2)
      const distFromCenterY = Math.abs(y) / (cardHeight / 2)
      const edgeFactor = Math.max(distFromCenterX, distFromCenterY)
      
      // Front face has varying intensity for 3D effect
      // Brighter in center, fading toward edges
      const baseBrightness = 1 - edgeFactor * 0.3
      
      // Add lighting effect (top-left light source)
      const lightX = -cardWidth / 2
      const lightY = cardHeight / 2
      const distFromLight = Math.sqrt(
        Math.pow(x - lightX, 2) + Math.pow(y - lightY, 2)
      ) / Math.sqrt(Math.pow(cardWidth, 2) + Math.pow(cardHeight, 2))
      
      const lightingEffect = 0.2 * (1 - distFromLight)
      intensities[index] = Math.min(1, baseBrightness + lightingEffect)
      
      // Card front dots are larger
      sizes[index] = dotSize * (1 - edgeFactor * 0.2)
      
      // Set color based on position (simulate a gradient identity card)
      // Create a gradient from blue to purple
      const gradientFactor = (x + cardWidth / 2) / cardWidth
      
      // Blue to purple gradient
      colors[index * 3] = 0.3 + 0.4 * gradientFactor // R
      colors[index * 3 + 1] = 0.4 * (1 - gradientFactor) // G
      colors[index * 3 + 2] = 0.8 // B
      
      // Add visual elements to the card - horizontal stripes for data fields
      const dataFieldRow = Math.floor((y + cardHeight / 2) / (cardHeight / 6))
      
      if (dataFieldRow === 1 || dataFieldRow === 3 || dataFieldRow === 5) {
        // Data field rows are brighter and whiter
        colors[index * 3] = 0.8 // R
        colors[index * 3 + 1] = 0.8 // G
        colors[index * 3 + 2] = 0.9 // B
        intensities[index] *= 1.3
      }
      
      // Add a photo area on the left side
      if (x < -cardWidth / 4 && y > 0) {
        // Photo area dots are more neutral
        colors[index * 3] = 0.7 // R
        colors[index * 3 + 1] = 0.7 // G
        colors[index * 3 + 2] = 0.7 // B
      }
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 2. Create the card back face
    const backFaceDots = Math.floor(totalDots * 0.4)
    for (let i = 0; i < backFaceDots; i++) {
      // Random position within card dimensions
      const x = (Math.random() * 2 - 1) * cardWidth / 2
      const y = (Math.random() * 2 - 1) * cardHeight / 2
      const z = -cardThickness / 2 + (Math.random() * 0.01 - 0.005)
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Back face is dimmer
      const distFromCenterX = Math.abs(x) / (cardWidth / 2)
      const distFromCenterY = Math.abs(y) / (cardHeight / 2)
      const edgeFactor = Math.max(distFromCenterX, distFromCenterY)
      
      // Dimmer overall with edge gradient
      const baseBrightness = 0.6 - edgeFactor * 0.2
      intensities[index] = baseBrightness
      
      // Back face dots are smaller
      sizes[index] = dotSize * 0.8
      
      // Back face has a more uniform dark color
      colors[index * 3] = 0.2 // R
      colors[index * 3 + 1] = 0.2 // G
      colors[index * 3 + 2] = 0.4 // B
      
      // Add a magnetic stripe
      if (y > cardHeight / 4 && y < cardHeight / 2.5) {
        colors[index * 3] = 0.1 // R
        colors[index * 3 + 1] = 0.1 // G
        colors[index * 3 + 2] = 0.1 // B
      }
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 3. Create the card edges
    const edgeDots = totalDots - index
    for (let i = 0; i < edgeDots; i++) {
      let x, y, z
      
      // Choose a random edge
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) {
        // Top edge
        x = (Math.random() * 2 - 1) * cardWidth / 2
        y = cardHeight / 2
        z = (Math.random() * 2 - 1) * cardThickness / 2
      } else if (edge === 1) {
        // Right edge
        x = cardWidth / 2
        y = (Math.random() * 2 - 1) * cardHeight / 2
        z = (Math.random() * 2 - 1) * cardThickness / 2
      } else if (edge === 2) {
        // Bottom edge
        x = (Math.random() * 2 - 1) * cardWidth / 2
        y = -cardHeight / 2
        z = (Math.random() * 2 - 1) * cardThickness / 2
      } else {
        // Left edge
        x = -cardWidth / 2
        y = (Math.random() * 2 - 1) * cardHeight / 2
        z = (Math.random() * 2 - 1) * cardThickness / 2
      }
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Edges are slightly brighter to highlight the card boundaries
      intensities[index] = 0.85
      
      // Edge dots are same size
      sizes[index] = dotSize * 0.9
      
      // Edges have a silver/metallic color
      colors[index * 3] = 0.75 // R
      colors[index * 3 + 1] = 0.75 // G
      colors[index * 3 + 2] = 0.8 // B
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
    setDotSizes(sizes)
    setDotColors(colors)
    setDotAnimationPhases(animationPhases)
  }, [totalDots, dotSize, camera])
  
  // Animation loop with sequential dot movement
  useFrame((state) => {
    if (!cardRef.current || !dotsRef.current || !dotIntensities || !dotOriginalPositions || 
        !dotPositions || !dotSizes || !dotAnimationPhases || !dotColors) 
      return
      
    const time = state.clock.getElapsedTime()
    
    // Card hover animation - gentle floating and rotation
    cardRef.current.position.y = Math.sin(time * 0.5) * 0.05
    cardRef.current.rotation.y = Math.sin(time * 0.3) * 0.03 - 0.3 // Angled to show 3D
    cardRef.current.rotation.x = Math.sin(time * 0.4) * 0.02 + 0.15 // Slight tilt for better view
    
    // Apply sequential animations to dots
    const tempObj = new THREE.Object3D()
    
    // Wave frequency for sequential animation
    const sequenceFrequency = 0.2
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Get this dot's animation phase (0-1)
      const dotPhase = dotAnimationPhases[i]
      
      // Phase-shifted time for this specific dot
      const phaseOffset = dotPhase * Math.PI * 2
      const dotTime = time + phaseOffset
      
      // Sequential movement based on phase
      const movementFactor = Math.pow(Math.sin(dotTime * sequenceFrequency) * 0.5 + 0.5, 3)
      
      // Subtle movement amplitude
      const noiseAmp = 0.004
      
      // Each dot has a unique movement pattern
      const nx = Math.sin(x * 5 + dotPhase * 20) * noiseAmp * movementFactor
      const ny = Math.cos(y * 5 + dotPhase * 20) * noiseAmp * movementFactor
      const nz = Math.sin(z * 5 + dotPhase * 20) * noiseAmp * movementFactor
      
      tempObj.position.set(
        x + nx,
        y + ny,
        z + nz
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
    
    // Animate dot intensities - sequential shimmer
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Get this dot's animation phase
      const dotPhase = dotAnimationPhases[i]
      
      // Phase-shifted time
      const phaseOffset = dotPhase * Math.PI * 2
      const dotTime = time + phaseOffset
      
      // Sequential shimmer effect
      const shimmerFactor = Math.pow(Math.sin(dotTime * sequenceFrequency) * 0.5 + 0.5, 4) * 0.1
      
      // Calculate final intensity
      const baseIntensity = dotIntensities[i]
      const finalIntensity = Math.max(0.2, Math.min(1.2, baseIntensity * (1 + shimmerFactor)))
      
      // Get original dot color
      const r = dotColors[i * 3]
      const g = dotColors[i * 3 + 1]
      const b = dotColors[i * 3 + 2]
      
      // Apply intensity to color
      const color = new THREE.Color(r, g, b).multiplyScalar(finalIntensity)
      dotsRef.current.setColorAt(i, color)
    }
    
    if (dotsRef.current.instanceColor) {
      dotsRef.current.instanceColor.needsUpdate = true
    }
  })
  
  // Display loading state if positions aren't ready
  if (!dotPositions || !dotIntensities || !dotSizes || !dotAnimationPhases || !dotColors) {
    return null
  }
  
  return (
    <group ref={cardRef}>
      {/* Create all dots as instanced mesh */}
      <instancedMesh
        ref={dotsRef}
        args={[undefined, undefined, totalDots]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} /> {/* Use base size of 1, scale in matrix */}
        <meshBasicMaterial
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>
      
      {/* Initialize dot positions, sizes and colors */}
      <primitive
        object={new THREE.Object3D()}
        ref={(obj: any) => {
          if (obj && dotPositions && dotsRef.current && dotIntensities && dotSizes && dotColors) {
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
            for (let i = 0; i < totalDots; i++) {
              if (i < dotColors.length / 3) {
                const r = dotColors[i * 3]
                const g = dotColors[i * 3 + 1]
                const b = dotColors[i * 3 + 2]
                const intensity = dotIntensities[i]
                
                const color = new THREE.Color(r, g, b).multiplyScalar(intensity)
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

export default NIdentityBanner