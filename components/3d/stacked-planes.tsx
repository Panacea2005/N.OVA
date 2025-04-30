"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type StackedPlanesProps = {
  position?: [number, number, number];
  scale?: number;
}

export default function EnhancedStackedPlanes({ position = [0, 0, 0], scale = 1 }: StackedPlanesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const planesRef = useRef<THREE.LineSegments[]>([])
  
  // Improved planes data with more planes
  const planeCount = 11
  const planes = useMemo(() => {
    return Array.from({ length: planeCount }).map((_, i) => {
      const normalizedIndex = i / (planeCount - 1) // 0 to 1
      const positionCurve = Math.sin(normalizedIndex * Math.PI) // Sine distribution
      
      // Size follows a parabolic curve - smaller at top and bottom, larger in middle
      const size = 0.8 + 2.5 * positionCurve
      
      // z-position follows a distribution from -3 to 3
      const z = -3 + (i * 6 / (planeCount - 1))
      
      return {
        size,
        z,
        phaseOffset: i * 0.2, // Staggered animation
        vertexOpacity: 0.8 + normalizedIndex * 0.2, // Vertices brighter toward top
        lineOpacity: 0.2 + positionCurve * 0.5, // Lines more visible in middle
      }
    })
  }, [])

  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Animate each plane individually
    planes.forEach((plane, index) => {
      const planeRef = planesRef.current[index]
      if (planeRef) {
        // Rotate each plane slightly
        planeRef.rotation.z = Math.sin(time * 0.2 + plane.phaseOffset) * 0.1
        
        // Slight scale pulsation
        const scale = 1 + Math.sin(time * 0.3 + plane.phaseOffset) * 0.05
        planeRef.scale.set(scale, scale, scale)
      }
    })
    
    // Group rotation
    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y = time * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Render stacked planes */}
      {planes.map((plane, index) => (
        <lineSegments
          key={`plane-${index}`}
          ref={(ref) => {
            if (ref) planesRef.current[index] = ref
          }}
          position={[0, 0, plane.z]}
        >
          <edgesGeometry args={[new THREE.PlaneGeometry(plane.size, plane.size)]} />
          <lineBasicMaterial 
            color="#FFFFFF"
            transparent 
            opacity={plane.lineOpacity} 
          />
          
          {/* Add vertices at corners with more glow */}
          {[
            [-plane.size/2, -plane.size/2, 0],
            [plane.size/2, -plane.size/2, 0],
            [plane.size/2, plane.size/2, 0],
            [-plane.size/2, plane.size/2, 0]
          ].map((point, pointIndex) => (
            <mesh
              key={`point-${index}-${pointIndex}`}
              position={[point[0], point[1], point[2]]}
            >
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={plane.vertexOpacity} />
            </mesh>
          ))}
          
          {/* Add a center point to each plane */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ADEFFF" transparent opacity={plane.vertexOpacity} />
          </mesh>
        </lineSegments>
      ))}
    </group>
  )
}