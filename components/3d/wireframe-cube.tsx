"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function WireframeCube() {
  const cubeRef = useRef<THREE.Group | null>(null)
  const edgesRef = useRef<THREE.LineSegments | null>(null)
  const verticesRef = useRef<(THREE.Mesh | null)[]>([])
  
  // Create vertex colors
  const vertexColors = useMemo(() => {
    return Array.from({ length: 8 }).map(() => new THREE.Color())
  }, [])
  
  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Cube rotation with slight wobble
    if (cubeRef.current) {
      cubeRef.current.rotation.x = time * 0.2 + Math.sin(time * 0.5) * 0.1
      cubeRef.current.rotation.y = time * 0.3 + Math.sin(time * 0.4) * 0.1
      cubeRef.current.rotation.z = Math.sin(time * 0.2) * 0.05
    }
    
    // Edge pulse effect
    if (edgesRef.current) {
      if (edgesRef.current.material instanceof THREE.Material) {
        edgesRef.current.material.opacity = 0.6 + Math.sin(time * 2) * 0.4
      }
    }
    
    // Animate vertices
    verticesRef.current.forEach((vertex, i) => {
      if (vertex) {
        // Pulse size for each vertex
        const pulse = 0.08 + Math.sin(time * 1.5 + i * 0.4) * 0.04
        vertex.scale.set(pulse, pulse, pulse)
        
        // Color shifting effect
        const hue = (time * 0.1 + i * 0.12) % 1
        vertexColors[i].setHSL(hue, 0.8, 0.6)
        if (vertex.material instanceof THREE.MeshBasicMaterial) {
          vertex.material.color = vertexColors[i]
        }
        
        // Opacity pulse
        if (vertex.material instanceof THREE.MeshBasicMaterial) {
          vertex.material.opacity = 0.7 + Math.sin(time * 2 + i * 0.3) * 0.3
        }
      }
    })
  })
  
  return (
    <group ref={cubeRef} scale={1.5}>
      {/* Edges with glow effect */}
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.8}
          linewidth={1.5}
        />
      </lineSegments>
      
      {/* Thin inner cube */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.8, 1.8, 1.8)]} />
        <lineBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>
      
      {/* Enhanced vertices */}
      {[
        [-1, -1, -1], // 0: bottom-back-left
        [1, -1, -1],  // 1: bottom-back-right
        [1, 1, -1],   // 2: top-back-right
        [-1, 1, -1],  // 3: top-back-left
        [-1, -1, 1],  // 4: bottom-front-left
        [1, -1, 1],   // 5: bottom-front-right
        [1, 1, 1],    // 6: top-front-right
        [-1, 1, 1],   // 7: top-front-left
      ].map((position, index) => (
        <mesh 
          key={index} 
          position={position as [number, number, number]}
          ref={el => { verticesRef.current[index] = el }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Add interior glow */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
        />
      </mesh>
      
      {/* Add subtle light traces along edges */}
      {[
        // Draw a few diagonal light traces
        [[-1, -1, -1], [1, 1, 1]],  // Diagonal 1
        [[-1, 1, -1], [1, -1, 1]],  // Diagonal 2
        [[-1, -1, 1], [1, 1, -1]],  // Diagonal 3
        [[1, -1, -1], [-1, 1, 1]],  // Diagonal 4
      ].map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          points.map(p => new THREE.Vector3(...p))
        )
        return (
          <lineSegments key={`trace-${i}`} geometry={geometry}>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3 + Math.sin(i * 0.5) * 0.1}
            />
          </lineSegments>
        )
      })}
    </group>
  )
}