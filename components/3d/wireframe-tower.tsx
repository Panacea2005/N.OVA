"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function WireframeTower({ 
  position = [0, 0, 0] as [number, number, number], 
  scale = 1 
}) {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Group[]>([])

  // Create data for all the circular rings
  const ringCount = 12
  const rings = useMemo(() => {
    return Array.from({ length: ringCount }).map((_, i) => {
      // Normalize index from 0 to 1
      const normalizedIndex = i / (ringCount - 1)
      
      // Size follows a parabolic distribution - smallest at top and bottom
      const sizeCurve = Math.sin(normalizedIndex * Math.PI)
      const size = 0.5 + 2.5 * sizeCurve
      
      // Y position follows a linear distribution 
      const y = -3 + normalizedIndex * 6
      
      return {
        size,
        y,
        rotation: Math.PI / 2, // Flat circles
        phaseOffset: i * 0.2,
        segmentCount: 32, // Smoother circles
        pointSize: 0.04 + 0.03 * sizeCurve,
        opacity: 0.7 + 0.3 * sizeCurve // More visible in the middle
      }
    })
  }, [])

  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Animate each ring
    rings.forEach((ring, index) => {
      const ringRef = ringsRef.current[index]
      if (ringRef) {
        // Rotate each ring
        ringRef.rotation.y = time * 0.2 + ring.phaseOffset
        
        // Slight pulsation
        const scaleFactor = 1 + Math.sin(time * 0.5 + ring.phaseOffset) * 0.02
        ringRef.scale.set(scaleFactor, 1, scaleFactor)
      }
    })
    
    // Group rotation
    if (groupRef.current) {
      // Slow continuous rotation around vertical axis
      groupRef.current.rotation.y = time * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Render each ring */}
      {rings.map((ring, index) => {
        const { size, y, rotation, segmentCount, pointSize, opacity } = ring
        
        // Create a circle of points for this ring
        const points = []
        for (let i = 0; i < segmentCount; i++) {
          const angle = (i / segmentCount) * Math.PI * 2
          const x = Math.cos(angle) * size
          const z = Math.sin(angle) * size
          points.push(new THREE.Vector3(x, 0, z))
        }
        
        // Close the loop
        points.push(points[0].clone())
        
        // Create a path from the points
        const path = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.BufferGeometry().setFromPoints(
          path.getPoints(segmentCount)
        )
        
        return (
          <group 
            key={`ring-${index}`} 
            ref={(ref) => { if (ref) ringsRef.current[index] = ref }}
            position={[0, y, 0]} 
            rotation={[rotation, 0, 0]}
          >
            {/* Line segments for the ring */}
            <line>
              <bufferGeometry attach="geometry" {...geometry} />
              <lineBasicMaterial
                attach="material"
                color="#FFFFFF"
                transparent
                opacity={opacity}
                linewidth={1}
              />
            </line>
            
            {/* Points at each vertex */}
            {points.slice(0, -1).map((point, pointIndex) => (
              <mesh
                key={`point-${index}-${pointIndex}`}
                position={[point.x, point.y, point.z]}
              >
                <sphereGeometry args={[pointSize, 8, 8]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={opacity} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}