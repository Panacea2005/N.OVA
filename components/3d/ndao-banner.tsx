"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"

// Main Banner Component
const NdaoBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black rounded-xl border border-white/10 overflow-hidden">
      {/* 3D Canvas for the dot visualization */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
        <DaoVisualization />
      </Canvas>
      
      {/* Overlay Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-8 left-8 text-3xl font-bold text-white"
      >
        N.DAO
      </motion.div>
    </div>
  )
}

// 3D Dot Visualization for DAO concept
const DaoVisualization = () => {
  const groupRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotConnections, setDotConnections] = useState<[number, number][]>([])
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  
  // Settings
  const dotSize = 0.04
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.7
  const totalDots = 800
  
  const { camera } = useThree()
  
  // Create dot positions for the DAO visualization (decentralized network structure)
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
    
    // Structure parameters
    const sphereRadius = 3.5
    const hexSize = 1.0
    const centerDotsCount = 50
    const satelliteStructuresCount = 7
    
    let index = 0
    
    // 1. Create central hub - represents the central governance structure
    for (let i = 0; i < centerDotsCount; i++) {
      // Create a small spherical cluster at center
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      
      const radius = Math.random() * 1.0
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Central hub dots are brighter
      intensities[index] = 0.8 + Math.random() * 0.2
      
      index++
    }
    
    // Store central hub indices for connections
    const centralHubIndices = Array.from({ length: centerDotsCount }, (_, i) => i)
    
    // 2. Create satellite structures - representing different working groups or proposals
    for (let s = 0; s < satelliteStructuresCount; s++) {
      // Position satellites around the center
      const satelliteAngle = (s / satelliteStructuresCount) * Math.PI * 2
      const satelliteX = Math.cos(satelliteAngle) * 2.5
      const satelliteY = Math.sin(satelliteAngle) * 2.5
      const satelliteZ = (Math.random() - 0.5) * 0.8
      
      const satelliteDotsCount = 40 + Math.floor(Math.random() * 30)
      const satelliteType = Math.floor(Math.random() * 3)
      
      const satelliteStartIndex = index
      
      // Create dots for this satellite structure based on its type
      for (let i = 0; i < satelliteDotsCount; i++) {
        let x, y, z
        
        if (satelliteType === 0) {
          // Hexagonal structure - represents voting or proposal systems
          const hexRadius = hexSize * (0.6 + Math.random() * 0.4)
          const hexAngle = Math.random() * Math.PI * 2
          
          x = satelliteX + hexRadius * Math.cos(hexAngle)
          y = satelliteY + hexRadius * Math.sin(hexAngle)
          z = satelliteZ + (Math.random() - 0.5) * 0.4
        } 
        else if (satelliteType === 1) {
          // Spherical cluster - represents community groups
          const phi = Math.acos(2 * Math.random() - 1)
          const theta = Math.random() * Math.PI * 2
          
          const radius = 0.8 * (0.7 + Math.random() * 0.3)
          
          x = satelliteX + radius * Math.sin(phi) * Math.cos(theta)
          y = satelliteY + radius * Math.sin(phi) * Math.sin(theta)
          z = satelliteZ + radius * Math.cos(phi)
        } 
        else {
          // Linear structure - represents treasury or resource allocation
          const lineLength = 1.2
          const lineOffset = (i / satelliteDotsCount - 0.5) * lineLength
          
          x = satelliteX + lineOffset
          y = satelliteY + lineOffset * 0.6
          z = satelliteZ + (Math.random() - 0.5) * 0.3
        }
        
        // Add slight randomness
        x += (Math.random() - 0.5) * 0.2
        y += (Math.random() - 0.5) * 0.2
        z += (Math.random() - 0.5) * 0.2
        
        originalPositions[index * 3] = x
        originalPositions[index * 3 + 1] = y
        originalPositions[index * 3 + 2] = z
        
        positions[index * 3] = x
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = z
        
        // Satellite dots have varying intensities
        intensities[index] = 0.6 + Math.random() * 0.3
        
        index++
      }
      
      // Create connections within this satellite
      for (let i = 0; i < satelliteDotsCount; i++) {
        const dotIndex = satelliteStartIndex + i
        
        // Connect to 2-3 neighbors within the same satellite
        const numConnections = Math.floor(Math.random() * 2) + 2
        for (let c = 0; c < numConnections; c++) {
          const neighborIdx = satelliteStartIndex + Math.floor(Math.random() * satelliteDotsCount)
          if (neighborIdx !== dotIndex) {
            connections.push([dotIndex, neighborIdx])
          }
        }
        
        // Connect to central hub (governance connections)
        if (Math.random() < 0.2) {
          const randomCentralIdx = centralHubIndices[Math.floor(Math.random() * centralHubIndices.length)]
          connections.push([dotIndex, randomCentralIdx])
        }
      }
    }
    
    // 3. Create outer decentralized network - representing broader community
    const remainingDots = totalDots - index
    for (let i = 0; i < remainingDots; i++) {
      // Distribute randomly but maintain a spherical boundary
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      
      // Not completely filled sphere - more concentrated toward the surface
      const radiusFactor = 0.5 + Math.pow(Math.random(), 0.5) * 0.5
      const radius = sphereRadius * radiusFactor
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi) * 0.8 // Flatten slightly on z-axis
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Outer dots are dimmer
      intensities[index] = 0.3 + Math.random() * 0.5
      
      // Create sparse connections for community nodes
      if (Math.random() < 0.3) {
        // Find another random node to connect to
        const randomNodeIdx = Math.floor(Math.random() * totalDots)
        if (randomNodeIdx !== index) {
          connections.push([index, randomNodeIdx])
        }
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
    
    // Subtle rotation of the entire structure
    groupRef.current.rotation.y = time * 0.05
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
    
    // Apply dynamic animations to the dots
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Calculate distance from center
      const distFromCenter = Math.sqrt(x*x + y*y + z*z)
      
      // "Breathing" effect - dots move slightly toward and away from their original positions
      const breathingAmplitude = 0.05
      const breathingSpeed = 0.5
      // Different timing for different dots creates a wave-like effect
      const breathingOffset = i * 0.01
      const breathingFactor = Math.sin(time * breathingSpeed + breathingOffset) * breathingAmplitude
      
      // Apply effect scaled by distance
      const scaleFactor = 1 + breathingFactor * (distFromCenter / 5)
      
      // Set position with breathing effect
      tempObj.position.set(
        x * scaleFactor, 
        y * scaleFactor, 
        z * scaleFactor
      )
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities for pulsing/glowing effect
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Multi-layered intensity animation
      const baseIntensity = dotIntensities[i]
      
      // Fast subtle shimmer
      const shimmerSpeed = 3.0
      const shimmerAmplitude = 0.1
      const shimmer = Math.sin(time * shimmerSpeed + i * 0.1) * shimmerAmplitude
      
      // Slow pulsing - different for different dots
      const pulseSpeed = 0.3
      const pulseAmplitude = 0.15
      const pulseFactor = Math.sin(time * pulseSpeed + i * 0.03) * pulseAmplitude
      
      // Combine effects
      const finalIntensity = Math.max(0.2, Math.min(1.2, baseIntensity * (1 + shimmer + pulseFactor)))
      
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
      
      {/* Connection lines visualizing the DAO network */}
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
        
        // Calculate the midpoint and distance for the line
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const midZ = (startZ + endZ) / 2
        
        const distance = Math.sqrt(
          Math.pow(endX - startX, 2) +
          Math.pow(endY - startY, 2) +
          Math.pow(endZ - startZ, 2)
        )
        
        // Only render connections if they're not too long (to avoid cluttering)
        if (distance > 1.5) return null
        
        // Calculate line orientation
        const lineVector = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ)
        lineVector.normalize()
        
        // Create a quaternion for the line orientation
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
        ref={(obj: any) => {
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

export default NdaoBanner