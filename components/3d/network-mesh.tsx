"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function NetworkMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  
  // Generate network data
  const { positions, indices, pointsArray } = useMemo(() => {
    const nodeCount = 40
    const positions = new Float32Array(nodeCount * 3)
    const sizes = new Float32Array(nodeCount)
    const pointsArray = []
    
    // Create points in a more complex network shape
    for (let i = 0; i < nodeCount; i++) {
      let x, y, z
      
      // Create a complex geometric network structure
      // This creates a different distribution than circular orbits
      if (i < nodeCount * 0.6) {
        // Main cluster of points - irregular diamond/polyhedron shape
        const phi = Math.acos(2 * Math.random() - 1) // For a uniform distribution on a sphere
        const theta = Math.random() * Math.PI * 2
        
        const radius = 0.8 + Math.random() * 1.2
        
        x = radius * Math.sin(phi) * Math.cos(theta)
        y = radius * Math.sin(phi) * Math.sin(theta)
        z = radius * Math.cos(phi)
        
        // Stretch in one direction for a more irregular shape
        if (Math.random() > 0.5) {
          x *= 1.5
        } else {
          y *= 1.5
        }
      } else {
        // Outlying points with connections to the main cluster
        const distance = 2 + Math.random() * 1.5
        const angle1 = Math.random() * Math.PI * 2
        const angle2 = Math.random() * Math.PI * 2
        
        x = Math.cos(angle1) * Math.sin(angle2) * distance
        y = Math.sin(angle1) * Math.sin(angle2) * distance
        z = Math.cos(angle2) * distance
      }
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Vary the point sizes for visual interest
      sizes[i] = i < nodeCount * 0.2 ? 0.08 + Math.random() * 0.04 : 0.04 + Math.random() * 0.03
      
      pointsArray.push(new THREE.Vector3(x, y, z))
    }
    
    // Create connections between points based on proximity and some longer connections
    const connections = []
    const shortThreshold = 1.4 // Connection distance threshold for close points
    const longThreshold = 3.5 // For some longer connections
    
    for (let i = 0; i < nodeCount; i++) {
      const p1 = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      )
      
      // Connect to closest points
      for (let j = i + 1; j < nodeCount; j++) {
        const p2 = new THREE.Vector3(
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2]
        )
        
        const distance = p1.distanceTo(p2)
        
        // Create short connections
        if (distance < shortThreshold) {
          connections.push(i, j)
        }
        // Create some longer connections (network bridges) with lower probability
        else if (distance < longThreshold && Math.random() < 0.05) {
          connections.push(i, j)
        }
      }
      
      // Ensure all points have at least one connection
      if (i > 0 && !connections.includes(i)) {
        // Find closest point to connect to
        let minDist = Infinity
        let closestIdx = 0
        
        for (let j = 0; j < nodeCount; j++) {
          if (i !== j) {
            const p2 = new THREE.Vector3(
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2]
            )
            
            const distance = p1.distanceTo(p2)
            if (distance < minDist) {
              minDist = distance
              closestIdx = j
            }
          }
        }
        
        connections.push(i, closestIdx)
      }
    }
    
    return { 
      positions, 
      indices: new Uint16Array(connections),
      pointsArray,
      sizes
    }
  }, [])

  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (groupRef.current) {
      // Slower rotation for more complex visualization
      groupRef.current.rotation.y = time * 0.1
      groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.2
    }
    
    // Animate points
    if (pointsRef.current && pointsRef.current.geometry.attributes.position) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        // More complex movement pattern - different from circular orbits
        const idx = i / 3
        const factor = Math.sin(idx) * 0.5 + 0.5 // Different amplitude for different points
        
        positions[i] += Math.sin(time * 0.5 + idx) * 0.001 * factor
        positions[i + 1] += Math.cos(time * 0.4 + idx * 1.1) * 0.001 * factor
        positions[i + 2] += Math.sin(time * 0.3 + idx * 0.7) * 0.001 * factor
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      
      // Update lines to follow points
      if (linesRef.current && linesRef.current.geometry.attributes.position) {
        const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array
        const indices = linesRef.current.geometry.index?.array as Uint16Array
        
        for (let i = 0; i < indices.length; i += 2) {
          const idx1 = indices[i] * 3
          const idx2 = indices[i + 1] * 3
          
          linePositions[i * 3] = positions[idx1]
          linePositions[i * 3 + 1] = positions[idx1 + 1]
          linePositions[i * 3 + 2] = positions[idx1 + 2]
          
          linePositions[i * 3 + 3] = positions[idx2]
          linePositions[i * 3 + 4] = positions[idx2 + 1]
          linePositions[i * 3 + 5] = positions[idx2 + 2]
        }
        
        linesRef.current.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Network nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffffff" 
          size={0.08}
          sizeAttenuation
        />
      </points>
      
      {/* Network connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={indices.length}
            array={(() => {
              const linePositions = new Float32Array(indices.length * 3)
              for (let i = 0; i < indices.length; i++) {
                const idx = indices[i] * 3
                linePositions[i * 3] = positions[idx]
                linePositions[i * 3 + 1] = positions[idx + 1]
                linePositions[i * 3 + 2] = positions[idx + 2]
              }
              return linePositions
            })()}
            itemSize={3}
          />
          <bufferAttribute 
            attach="index"
            count={indices.length}
            array={indices}
            itemSize={1}
            args={[indices, 1]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </lineSegments>
    </group>
  )
}