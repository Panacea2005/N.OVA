"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NIdentityBanner = () => {
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
        
        {/* 3D Canvas for the identity card visualization */}
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <IdentityCardVisualization />
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

// 3D Identity Card Visualization with dot architecture
const IdentityCardVisualization = () => {
  const groupRef = useRef<THREE.Group>(null!)
  const dotsRef = useRef<THREE.InstancedMesh>(null!)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotConnections, setDotConnections] = useState<Array<[number, number]>>([])
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  
  // Settings
  const dotSize = 0.04
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.7
  const totalDots = 800
  
  const { camera } = useThree()
  
  // Create dot positions for the identity card
  useEffect(() => {
    // Position camera for better view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 9
      camera.position.y = 0
      camera.lookAt(0, 0, 0)
    }
    
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const connections: [number, number][] = []
    
    // Card dimensions
    const cardWidth = 5.5
    const cardHeight = 3.5
    const cardThickness = 0.1
    
    let index = 0
    
    // 1. Create the card shape - rectangular form
    const cardOutlineDots = Math.floor(totalDots * 0.2)
    for (let i = 0; i < cardOutlineDots; i++) {
      // Calculate position along the perimeter
      const perimeterLength = 2 * (cardWidth + cardHeight)
      const pos = (i / cardOutlineDots) * perimeterLength
      
      let x, y, z
      
      // Top edge
      if (pos < cardWidth) {
        x = pos - cardWidth/2
        y = cardHeight/2
      }
      // Right edge
      else if (pos < cardWidth + cardHeight) {
        x = cardWidth/2
        y = cardHeight/2 - (pos - cardWidth)
      }
      // Bottom edge
      else if (pos < 2 * cardWidth + cardHeight) {
        x = cardWidth/2 - (pos - cardWidth - cardHeight)
        y = -cardHeight/2
      }
      // Left edge
      else {
        x = -cardWidth/2
        y = -cardHeight/2 + (pos - 2 * cardWidth - cardHeight)
      }
      
      // Add slight z-variance
      z = (Math.random() - 0.5) * 0.1
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Card outline dots are brighter
      intensities[index] = 0.9 + Math.random() * 0.1
      
      // Connect outline dots to create the card border
      if (i > 0) {
        connections.push([index, index - 1])
      }
      if (i === cardOutlineDots - 1) {
        connections.push([index, index - cardOutlineDots + 1])
      }
      
      index++
    }
    
    // 2. Create dots for card features - photo area, text fields, etc.
    const photoAreaDots = Math.floor(totalDots * 0.15)
    const photoX = -cardWidth/2 + 1
    const photoY = cardHeight/2 - 1
    const photoWidth = 1.5
    const photoHeight = 1.5
    
    // Photo area - top left of card
    for (let i = 0; i < photoAreaDots; i++) {
      const x = photoX + Math.random() * photoWidth
      const y = photoY - Math.random() * photoHeight
      const z = 0.05 + Math.random() * 0.1 // Slightly raised from card surface
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Photo area dots have medium intensity
      intensities[index] = 0.6 + Math.random() * 0.3
      
      // Create a network effect within the photo area
      if (Math.random() < 0.4 && i > 0) {
        const randomPrevIdx = index - Math.floor(Math.random() * Math.min(10, i)) - 1
        connections.push([index, randomPrevIdx])
      }
      
      index++
    }
    
    // 3. Create horizontal data lines
    const numDataLines = 4
    const dotsPerLine = Math.floor(totalDots * 0.1 / numDataLines)
    const dataLineStartX = -cardWidth/2 + 2.8
    const dataLineWidth = cardWidth - 3.2
    
    for (let line = 0; line < numDataLines; line++) {
      const lineY = photoY - 0.3 - line * 0.7
      const lineStartIdx = index
      
      for (let i = 0; i < dotsPerLine; i++) {
        // Spread dots along the data line, more concentrated at start and end
        let xPos
        if (i < dotsPerLine * 0.2 || i > dotsPerLine * 0.8) {
          // More dots at the edges
          xPos = dataLineStartX + Math.pow(Math.random(), 2) * dataLineWidth
          if (i > dotsPerLine * 0.8) {
            xPos = dataLineStartX + dataLineWidth - Math.pow(Math.random(), 2) * dataLineWidth
          }
        } else {
          // Fewer dots in the middle
          xPos = dataLineStartX + Math.random() * dataLineWidth
        }
        
        const x = xPos
        const y = lineY + (Math.random() - 0.5) * 0.1
        const z = 0.05 // Slightly raised from card surface
        
        originalPositions[index * 3] = x
        originalPositions[index * 3 + 1] = y
        originalPositions[index * 3 + 2] = z
        
        positions[index * 3] = x
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = z
        
        // Data line dots intensity varies
        intensities[index] = 0.5 + Math.random() * 0.5
        
        // Connect data line dots sequentially
        if (i > 0) {
          connections.push([index, index - 1])
        }
        
        index++
      }
      
      // Connect start and end of data line if it's a longer line
      if (line === 0 || line === 2) {
        connections.push([lineStartIdx, index - 1])
      }
    }
    
    // 4. Create card chip / QR code area in bottom right
    const chipDots = Math.floor(totalDots * 0.1)
    const chipX = cardWidth/2 - 1.2
    const chipY = -cardHeight/2 + 1.2
    const chipSize = 1.0
    
    for (let i = 0; i < chipDots; i++) {
      // Create a grid pattern for the chip
      const gridSize = Math.sqrt(chipDots)
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      
      const x = chipX - chipSize/2 + col / gridSize * chipSize
      const y = chipY - chipSize/2 + row / gridSize * chipSize
      const z = 0.08 // Slightly raised from card surface
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Chip dots have high intensity
      intensities[index] = 0.8 + Math.random() * 0.2
      
      // Create grid connections
      if (col > 0) {
        connections.push([index, index - 1]) // Horizontal connections
      }
      if (row > 0) {
        connections.push([index, index - Math.floor(gridSize)]) // Vertical connections
      }
      
      index++
    }
    
    // 5. Fill the rest of the card with scattered dots
    const remainingDots = totalDots - index
    for (let i = 0; i < remainingDots; i++) {
      // Random position within card dimensions
      const x = (Math.random() * 2 - 1) * cardWidth/2
      const y = (Math.random() * 2 - 1) * cardHeight/2
      const z = (Math.random() - 0.5) * 0.1
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Background dots have lower intensity
      intensities[index] = 0.3 + Math.random() * 0.3
      
      // Occasional connections to create a network effect
      if (Math.random() < 0.2) {
        const randomIdx = Math.floor(Math.random() * index)
        connections.push([index, randomIdx])
      }
      
      index++
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
    setDotConnections(connections)
  }, [totalDots, camera])
  
  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || !dotOriginalPositions || !dotPositions) 
      return
      
    const time = state.clock.getElapsedTime()
    
    // Subtle rotation and hovering of the card
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
    
    // Apply dynamic animations to the dots
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Subtle movement for "data flow" effect
      // More pronounced for dots on the data lines
      let flowFactor = 0
      if (i >= Math.floor(totalDots * 0.2) && i < Math.floor(totalDots * 0.6)) {
        flowFactor = 0.05 * Math.sin(time * 2 + i * 0.1)
      }
      
      // Add slight random movement for background dots
      const jitterFactor = 0.01
      const jitterX = (Math.random() - 0.5) * jitterFactor
      const jitterY = (Math.random() - 0.5) * jitterFactor
      const jitterZ = (Math.random() - 0.5) * jitterFactor
      
      // Set position with animations
      tempObj.position.set(
        x + jitterX + flowFactor, 
        y + jitterY, 
        z + jitterZ
      )
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities for pulsing/flowing effect
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Base intensity
      const baseIntensity = dotIntensities[i]
      
      // Data flow pulse effect - more pronounced for data line dots
      let pulseFactor = 0
      if (i >= Math.floor(totalDots * 0.2) && i < Math.floor(totalDots * 0.6)) {
        pulseFactor = 0.2 * Math.sin(time * 3 + i * 0.05)
      } else {
        // Subtle pulse for other dots
        pulseFactor = 0.1 * Math.sin(time * 1 + i * 0.02)
      }
      
      // Calculate final intensity
      const finalIntensity = Math.max(0.2, Math.min(1.2, baseIntensity * (1 + pulseFactor)))
      
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
      
      {/* Connection lines visualizing the network structure */}
      {dotConnections.map((connection, idx) => {
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
              opacity={0.15 + Math.random() * 0.1}
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

export default NIdentityBanner