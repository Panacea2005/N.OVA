"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { motion } from "framer-motion"
import { 
  EffectComposer, 
  Bloom
} from "@react-three/postprocessing"

// Main Banner Component
const NProfileBanner = () => {
  return (
    <div className="relative w-full h-80 md:h-96 bg-black border border-white/30 p-0.5 overflow-hidden">
      <div className="absolute inset-0 border border-white/10">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} 
        />
        
        {/* 3D Canvas for the profile agent visualization */}
        <Canvas 
          dpr={[1, 2]} 
          camera={{ position: [0, 0, 18], fov: 40 }}
        >
          <color attach="background" args={["#000000"]} />
          <fog attach="fog" args={['#000000', 15, 25]} />
          <BrainModel />
          
          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom 
              intensity={0.4} 
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
        
        {/* Overlay Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-8 right-8 text-3xl font-bold text-white"
        >
          N.PROFILE
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
          
        {/* Corner decorative elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/10" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-white/10" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-white/10" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-white/10" />
      </div>
    </div>
  )
}

// Brain Visualization Component
const BrainModel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  const [dotSizes, setDotSizes] = useState<Float32Array | null>(null)
  const [dotAnimationPhases, setDotAnimationPhases] = useState<Float32Array | null>(null)
  const [connectionLines, setConnectionLines] = useState<THREE.Vector3[][]>([])
  
  // Settings
  const dotSize = 0.035
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.9
  const totalDots = 1200 // Reduced number of dots for simplicity
  
  const { camera } = useThree()
  
  // Set up camera
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 16
      camera.position.y = 0
      camera.lookAt(0, 0, 0)
    }
  }, [camera])
  
  // Brain dimensions
  const brainWidth = 6
  const brainHeight = 6
  const brainDepth = 5
  
  // Create brain dots
  useEffect(() => {
    const positions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const sizes = new Float32Array(totalDots)
    const animationPhases = new Float32Array(totalDots)
    const newConnectionLines: THREE.Vector3[][] = []
    
    // Create brain-like structure
    for (let i = 0; i < totalDots; i++) {
      // Use parametric equations to create a brain-shaped structure
      
      // Start with a sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      
      // Create ellipsoid base shape
      const radiusX = brainWidth/2 * (0.7 + Math.random() * 0.3)
      const radiusY = brainHeight/2 * (0.7 + Math.random() * 0.3)
      const radiusZ = brainDepth/2 * (0.7 + Math.random() * 0.3)
      
      // Apply some distortion for brain-like shape
      const x = radiusX * Math.sin(phi) * Math.cos(theta)
      const y = radiusY * Math.sin(phi) * Math.sin(theta) 
      const z = radiusZ * Math.cos(phi)
      
      // Apply sulci and gyri (brain folding) distortion
      const foldingFreq = 3
      const foldingAmplitude = 0.3
      
      // Distort the shape to look more like a brain
      // Add some noise based on spherical coordinates
      const noiseX = foldingAmplitude * Math.sin(phi * foldingFreq) * Math.cos(theta * foldingFreq)
      const noiseY = foldingAmplitude * Math.sin(phi * foldingFreq) * Math.sin(theta * foldingFreq)
      const noiseZ = foldingAmplitude * Math.cos(phi * foldingFreq)
      
      // Split brain into two hemispheres with a gap in between
      const hemisphereOffset = Math.sign(x) * 0.4
      const finalX = x + hemisphereOffset + noiseX
      
      // Save the final position
      positions[i * 3] = finalX 
      positions[i * 3 + 1] = y + noiseY
      positions[i * 3 + 2] = z + noiseZ
      
      // Vary brightness based on position
      // Brighter towards the front of the brain (prefrontal cortex)
      const frontFactor = Math.max(0, -z) / radiusZ
      // Brighter at certain neuron clusters
      const clusterBrightness = Math.random() > 0.7 ? 0.3 : 0 
      
      intensities[i] = 0.4 + frontFactor * 0.3 + clusterBrightness
      
      // Vary size based on position and function
      // Larger in important areas
      sizes[i] = dotSize * (0.7 + Math.random() * 0.5)
      
      // Random animation phase for wave patterns
      animationPhases[i] = Math.random()
      
      // Create neural connections (lines between points)
      // Connect some dots to simulate neural networks
      if (i > 0 && Math.random() > 0.95) {
        // Find a nearby point to connect to
        const nearestIndex = findNearestPoint(positions, i)
        if (nearestIndex >= 0) {
          const startPoint = new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
          )
          
          const endPoint = new THREE.Vector3(
            positions[nearestIndex * 3],
            positions[nearestIndex * 3 + 1],
            positions[nearestIndex * 3 + 2]
          )
          
          newConnectionLines.push([startPoint, endPoint])
        }
      }
    }
    
    // Function to find a nearby point
    function findNearestPoint(positions: Float32Array, currentIndex: number): number {
      const currentX = positions[currentIndex * 3]
      const currentY = positions[currentIndex * 3 + 1]
      const currentZ = positions[currentIndex * 3 + 2]
      
      // Max connection distance
      const maxDistance = 1.5
      
      let nearestIndex = -1
      let nearestDistance = maxDistance
      
      // Check a random set of 40 points for efficiency
      for (let j = 0; j < 40; j++) {
        const randomIndex = Math.floor(Math.random() * currentIndex)
        
        const otherX = positions[randomIndex * 3]
        const otherY = positions[randomIndex * 3 + 1]
        const otherZ = positions[randomIndex * 3 + 2]
        
        const distance = Math.sqrt(
          Math.pow(currentX - otherX, 2) +
          Math.pow(currentY - otherY, 2) +
          Math.pow(currentZ - otherZ, 2)
        )
        
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = randomIndex
        }
      }
      
      return nearestIndex
    }
    
    setDotPositions(positions)
    setDotIntensities(intensities)
    setDotSizes(sizes)
    setDotAnimationPhases(animationPhases)
    setConnectionLines(newConnectionLines)
  }, [totalDots, dotSize, brainWidth, brainHeight, brainDepth])
  
  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || 
        !dotPositions || !dotSizes || !dotAnimationPhases) 
      return
      
    const time = state.clock.getElapsedTime()
    
    // Rotate brain slightly for breathing effect
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
    
    // Position with subtle floating animation
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.2
    
    // Animate dot positions
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotPositions.length / 3) continue
      
      const x = dotPositions[i * 3]
      const y = dotPositions[i * 3 + 1]
      const z = dotPositions[i * 3 + 2]
      
      const dotPhase = dotAnimationPhases[i]
      const dotTime = time + dotPhase * 5
      
      // Create neural pulse waves that propagate through the brain
      const distanceFromCenter = Math.sqrt(x*x + y*y + z*z)
      
      // Create wave patterns
      const waveSpeed = 0.8
      const waveFrequency = 2
      const waveAmplitude = 0.05
      
      // Wave direction from random center points that change over time
      const waveCenterX = Math.sin(time * 0.2) * 2
      const waveCenterY = Math.cos(time * 0.3) * 2
      const waveCenterZ = Math.sin(time * 0.4) * 2
      
      // Distance from wave center
      const distFromWave = Math.sqrt(
        Math.pow(x - waveCenterX, 2) + 
        Math.pow(y - waveCenterY, 2) + 
        Math.pow(z - waveCenterZ, 2)
      )
      
      // Calculate wave effect
      const waveValue = Math.sin(distFromWave * waveFrequency - time * waveSpeed)
      
      // Apply wave effect radially
      const dirX = x === 0 ? 0 : x / Math.abs(x)
      const dirY = y === 0 ? 0 : y / Math.abs(y)
      const dirZ = z === 0 ? 0 : z / Math.abs(z)
      
      // Get normalized direction vector
      const length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ)
      const normX = dirX / length
      const normY = dirY / length
      const normZ = dirZ / length
      
      // Apply wave movement
      const moveFactor = waveAmplitude * waveValue * (1 - Math.min(1, distanceFromCenter / 3))
      
      // Set position with animation applied
      tempObj.position.set(
        x + normX * moveFactor,
        y + normY * moveFactor,
        z + normZ * moveFactor
      )
      
      // Apply dot size
      const size = dotSizes[i]
      tempObj.scale.set(size, size, size)
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities (neural activity)
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      const baseIntensity = dotIntensities[i]
      const dotPhase = dotAnimationPhases[i]
      const dotTime = time + dotPhase * 3
      
      // Neural activation patterns
      let intensityFactor = 0
      
      // Create neural firing patterns
      // Some neurons pulse randomly
      if (Math.sin(dotTime * 2) > 0.7) {
        intensityFactor = 0.3 * Math.pow(Math.sin(dotTime * 2), 2)
      }
      
      // Some neurons follow wave patterns
      const wavePhase = Math.sin(time * 0.8 + dotPhase * 6.28)
      intensityFactor += wavePhase * 0.15
      
      // Occasional bright "thought" patterns
      if (Math.random() > 0.99) {
        intensityFactor += 0.4
      }
      
      // Calculate final intensity
      const finalIntensity = Math.max(0.2, Math.min(1.1, baseIntensity * (1 + intensityFactor)))
      
      // Set color with intensity
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
    <group ref={groupRef}>
      {/* Ambient light */}
      <ambientLight intensity={0.2} />
      
      {/* Main light from front */}
      <directionalLight 
        position={[0, 0, 5]} 
        intensity={0.5} 
        color="#ffffff" 
      />
      
      {/* Secondary lights */}
      <pointLight 
        position={[3, 2, 2]} 
        intensity={0.3} 
        color="#66a0ff" 
      />
      
      <pointLight 
        position={[-3, -2, -2]} 
        intensity={0.2} 
        color="#ff66a0" 
      />
      
      {/* Create all brain dots as instanced mesh */}
      <instancedMesh
        ref={dotsRef}
        args={[undefined, undefined, totalDots]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color={dotColor}
          emissive={dotColor}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.5}
          transparent={true}
          opacity={dotOpacity}
          toneMapped={false}
        />
      </instancedMesh>
      
      {/* Neural connection lines */}
      {connectionLines.map((line, index) => (
        <line key={`line-${index}`}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  line[0].x, line[0].y, line[0].z,
                  line[1].x, line[1].y, line[1].z
                ]),
                3
              ]}
              count={2}
              itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial
            attach="material"
            color="#ffffff"
            transparent
            opacity={0.2}
            toneMapped={false}
          />
        </line>
      ))}
      
      {/* Initialize dot positions and colors */}
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
            
            // Initialize colors with intensity
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

export default NProfileBanner