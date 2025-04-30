"use client"

import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface DotArchVisualizationProps {
  greeting?: string
  dotSize?: number
  dotOpacity?: number
  dotColor?: string
  arcWidth?: number
  arcHeight?: number
  arcDepth?: number
  rows?: number
  dotsPerRow?: number
  animated?: boolean
}

// This component is meant to be used INSIDE a Canvas component
export default function DotArchVisualization({
  greeting = "// HI, I'm NOVA.",
  dotSize = 0.02,
  dotOpacity = 0.6,
  dotColor = "#FFFFFF",
  arcWidth = 10,
  arcHeight = 5,
  arcDepth = 2,
  rows = 30,
  dotsPerRow = 60,
  animated = true
}: DotArchVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null)
  const textRef = useRef<THREE.Mesh>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  
  // Create dot positions in arch formation
  useEffect(() => {
    const totalDots = rows * dotsPerRow
    const positions = new Float32Array(totalDots * 3) // x, y, z for each dot
    const intensities = new Float32Array(totalDots) // individual opacity for each dot
    
    let index = 0
    
    for (let row = 0; row < rows; row++) {
      const rowProgress = row / (rows - 1)
      // Calculate radius for this row (outer rows have larger radius)
      const rowRadius = arcHeight + (arcWidth - arcHeight) * rowProgress
      
      for (let dot = 0; dot < dotsPerRow; dot++) {
        const dotProgress = dot / (dotsPerRow - 1)
        // Calculate angle from 0 to Math.PI (half circle)
        const angle = Math.PI * dotProgress
        
        // Create arc formation
        const x = Math.cos(angle) * rowRadius
        const y = Math.sin(angle) * rowRadius
        // Add some depth variation
        const z = -rowProgress * arcDepth
        
        // Set position
        positions[index * 3] = x
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = z
        
        // Set dot intensity - more intense at the edges
        const edgeFactor = Math.pow(Math.abs(dotProgress - 0.5) * 2, 2)
        const randomFactor = Math.random() * 0.7 + 0.3
        intensities[index] = randomFactor * (0.3 + edgeFactor * 0.7)
        
        index++
      }
    }
    
    setDotPositions(positions)
    setDotIntensities(intensities)
  }, [rows, dotsPerRow, arcWidth, arcHeight, arcDepth])
  
  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || !animated) return
    
    const time = state.clock.getElapsedTime()
    const totalDots = rows * dotsPerRow
    
    // Rotate the entire visualization slightly
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.05
    
    // Animate dot opacities
    const tempColor = new THREE.Color(dotColor)
    
    // Update each dot's opacity/intensity
    for (let i = 0; i < totalDots; i++) {
      const noise = Math.sin(time + i * 0.1) * 0.2 + 0.8
      const intensity = dotIntensities[i] * noise
      
      // Create a new color with adjusted opacity
      const color = tempColor.clone()
      
      // Set the color and opacity for this instance
      dotsRef.current.setColorAt(i, color.multiplyScalar(intensity))
    }
    
    // Need to flag this as requiring an update
    if (dotsRef.current.instanceColor) {
      dotsRef.current.instanceColor.needsUpdate = true
    }
    
    // Pulsate the text slightly
    if (textRef.current) {
      const textScale = 1 + Math.sin(time * 0.5) * 0.05
      textRef.current.scale.set(textScale, textScale, textScale)
    }
  })
  
  // Display loading state if positions aren't ready
  if (!dotPositions || !dotIntensities) {
    return null
  }
  
  return (
    <group ref={groupRef} position={[0, -1, -2]}>
      {/* Create all dots as instanced mesh for better performance */}
      <instancedMesh 
        ref={dotsRef} 
        args={[undefined, undefined, rows * dotsPerRow]}
        frustumCulled={false}
      >
        <sphereGeometry args={[dotSize, 8, 8]} />
        <meshBasicMaterial 
          color={dotColor} 
          transparent={true} 
          opacity={dotOpacity} 
          toneMapped={false}
        />
      </instancedMesh>
      {/* Greeting text in the center */}
      <Text
        ref={textRef}
        position={[0, arcHeight/2, 1]}
        fontSize={0.3}
        color={dotColor}
        maxWidth={200}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {greeting}
      </Text>
      
      {/* Initialize dot positions */}
      <primitive object={new THREE.Object3D()} ref={(obj: { position: { set: (arg0: number, arg1: number, arg2: number) => void }; updateMatrix: () => void; matrix: THREE.Matrix4 }) => {
        if (obj && dotPositions && dotsRef.current) {
          // Set each dot's position
          for (let i = 0; i < rows * dotsPerRow; i++) {
            obj.position.set(
              dotPositions[i * 3],
              dotPositions[i * 3 + 1],
              dotPositions[i * 3 + 2]
            )
            obj.updateMatrix()
            dotsRef.current.setMatrixAt(i, obj.matrix)
          }
          dotsRef.current.instanceMatrix.needsUpdate = true
          
          // Initialize colors
          const tempColor = new THREE.Color(dotColor)
          for (let i = 0; i < rows * dotsPerRow; i++) {
            const intensity = dotIntensities[i]
            const color = tempColor.clone().multiplyScalar(intensity)
            dotsRef.current.setColorAt(i, color)
          }
          if (dotsRef.current.instanceColor) {
            dotsRef.current.instanceColor.needsUpdate = true
          }
        }
      }} />
    </group>
  )
}