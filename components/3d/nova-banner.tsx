"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NovaBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black rounded-xl border border-white/10 overflow-hidden">
      {/* 3D Canvas for the dot visualization */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
        <NovaDotCoin />
      </Canvas>
      
      {/* Overlay Content */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* N.OVA text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-6 left-8 text-3xl font-bold text-white"
        >
          N.OVA
        </motion.div>
        
        {/* Market Cap data */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute bottom-8 right-8 text-right"
        >
          <div className="text-sm text-white/60 mb-1">MARKET CAP</div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            $9,497,824
          </div>
          <div className="text-sm text-green-400">
            +4648%
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// 3D Dot Coin Visualization
const NovaDotCoin = () => {
  const groupRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  
  // Settings
  const dotSize = 0.02
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.7
  const rows = 80
  const dotsPerRow = 160
  
  const { camera } = useThree()
  
  // Create dot positions for the coin
  useEffect(() => {
    // Position camera for better view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 8
      camera.position.y = 0.5
      camera.lookAt(0, 0, 0)
    }
    
    const totalDots = rows * dotsPerRow
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    
    // Coin dimensions
    const coinRadius = 3.5
    const coinThickness = 0.4
    
    let index = 0
    
    // Create coin structure with multiple approaches
    
    // 1. Create a solid disk structure for front and back
    // Front face
    const createFace = (zOffset: number, count: number) => {
      for (let i = 0; i < count; i++) {
        // Use various distribution approaches
        let r, theta
        
        // Different patterns for more organic spread
        const patternType = Math.floor(Math.random() * 3)
        
        if (patternType === 0) {
          // Spiral distribution
          const turns = 20
          r = Math.sqrt(Math.random()) * coinRadius
          theta = turns * 2 * Math.PI * (r / coinRadius)
        } else if (patternType === 1) {
          // Concentric rings with jitter
          const ringCount = 15
          const ringIndex = Math.floor(Math.random() * ringCount)
          r = (ringIndex / ringCount) * coinRadius
          r += (Math.random() * 0.08) * coinRadius // add jitter
          theta = Math.random() * Math.PI * 2
        } else {
          // Random points with bias toward center
          r = Math.pow(Math.random(), 0.5) * coinRadius // Sqrt for even distribution
          theta = Math.random() * Math.PI * 2
        }
        
        // Convert to cartesian coordinates
        const x = r * Math.cos(theta)
        const y = r * Math.sin(theta)
        const z = zOffset + (Math.random() * 0.03 - 0.015) // slight z jitter
        
        // Store positions
        originalPositions[index * 3] = x
        originalPositions[index * 3 + 1] = y
        originalPositions[index * 3 + 2] = z
        
        positions[index * 3] = x
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = z
        
        // Set dot intensity - vary to create depth
        const distFromCenter = Math.sqrt(x*x + y*y) / coinRadius
        // More brightness in center, fading to edges
        const baseBrightness = 1 - Math.pow(distFromCenter, 1.5) * 0.7
        // Add slight randomness for organic feel
        const randomFactor = Math.random() * 0.15 + 0.85
        intensities[index] = baseBrightness * randomFactor
        
        index++
      }
    }
    
    // Create front and back faces
    createFace(coinThickness/2, Math.floor(totalDots * 0.4)) // Front face
    createFace(-coinThickness/2, Math.floor(totalDots * 0.4)) // Back face
    
    // 2. Create edge particles
    const edgeParticleCount = Math.floor(totalDots * 0.2)
    for (let i = 0; i < edgeParticleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() * 2 - 1) * Math.PI / 2 // Edge angle
      
      const x = coinRadius * Math.cos(theta)
      const y = coinRadius * Math.sin(theta) 
      // Apply curve to edge
      const z = coinThickness/2 * Math.sin(phi)
      
      // Store positions
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Edge particles slightly dimmer
      intensities[index] = 0.7 + Math.random() * 0.3
      
      index++
    }
    
    // 3. Add volumetric particles for a more three-dimensional feel
    const volumeParticleCount = totalDots - index
    for (let i = 0; i < volumeParticleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = (0.85 + Math.random() * 0.15) * coinRadius // Near the edge
      const z = (Math.random() * 2 - 1) * coinThickness/2
      
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      
      // Store positions
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Volume particles have varying intensities
      intensities[index] = 0.5 + Math.random() * 0.5
      
      index++
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
  }, [rows, dotsPerRow, camera])
  
  // Animation loop - organic, lively movement without spinning
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || !dotOriginalPositions || !dotPositions) 
      return
      
    const time = state.clock.getElapsedTime()
    const totalDots = rows * dotsPerRow
    
    // Very subtle rotation - just enough to give sense of depth without spinning
    groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.1
    groupRef.current.rotation.x = Math.sin(time * 0.07) * 0.05 - 0.1 // Slight tilt to see the front face better
    
    // Apply dynamic wave-like animations to the dots
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Calculate point's polar coordinates for radius-based effects
      const distFromCenter = Math.sqrt(x*x + y*y)
      const angle = Math.atan2(y, x)
      
      // Wave effects - multiple layers of waves
      // 1. Radial pulses that emanate from center
      const radialWave = Math.sin(time * 1.5 - distFromCenter * 2) * 0.03
      
      // 2. Circular waves that rotate around the coin
      const rotationSpeed = 0.5
      const circularWave = Math.sin(angle + time * rotationSpeed) * 0.02
      
      // 3. Z-axis breathing
      const breathingAmp = 0.02
      const breathingSpeed = 0.8
      const zWave = Math.sin(time * breathingSpeed) * breathingAmp
      
      // 4. Vortex-like swirl - very subtle
      const vortexStrength = 0.001
      const vortexSpeed = 0.2
      const angleOffset = Math.sin(time * vortexSpeed) * vortexStrength * distFromCenter
      
      // Apply all effects - scale by distance for edge emphasis
      const xEffect = x * (1 + radialWave) + Math.sin(angle + angleOffset) * circularWave * distFromCenter
      const yEffect = y * (1 + radialWave) + Math.cos(angle + angleOffset) * circularWave * distFromCenter
      const zEffect = z + zWave * (Math.abs(z) > 0.1 ? 1.5 : 1) // Stronger on edges
      
      // Set position with combined effects
      tempObj.position.set(xEffect, yEffect, zEffect)
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities for subtle shimmer
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Multi-layered shimmer effect
      // 1. Fast subtle shimmer
      const fastShimmer = Math.sin(time * 5 + i * 0.1) * 0.05
      
      // 2. Slow pulsing
      const slowPulse = Math.sin(time * 0.2 + i * 0.01) * 0.1
      
      // 3. Wave patterns based on position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const distFromCenter = Math.sqrt(x*x + y*y)
      const angle = Math.atan2(y, x)
      
      // Waves emanating from center
      const radialShimmer = Math.sin(time * 2 - distFromCenter * 3) * 0.1
      
      // Circular waves
      const circularShimmer = Math.sin(angle * 5 + time) * 0.05
      
      // Combine all effects - note that we're keeping everything subtle
      const shimmerEffect = 1 + fastShimmer + slowPulse + (radialShimmer + circularShimmer) * (distFromCenter / 3.5)
      
      // Set intensity with combined shimmer effects
      const baseIntensity = dotIntensities[i]
      const finalIntensity = Math.max(0.3, Math.min(1.2, baseIntensity * shimmerEffect))
      
      // Set the color
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
        args={[undefined, undefined, rows * dotsPerRow]}
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
      
      {/* Initialize dot positions */}
      <primitive
        object={new THREE.Object3D()}
        ref={(obj: any) => {
          if (obj && dotPositions && dotsRef.current && dotIntensities) {
            // Set each dot's position
            for (let i = 0; i < rows * dotsPerRow; i++) {
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
            for (let i = 0; i < rows * dotsPerRow; i++) {
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

export default NovaBanner