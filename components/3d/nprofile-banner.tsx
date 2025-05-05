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
          <SlimRobotDots />
          
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

// Slim Robot Dots Visualization Component
const SlimRobotDots = () => {
  const groupRef = useRef<THREE.Group>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null)
  const [dotOriginalPositions, setDotOriginalPositions] = useState<Float32Array | null>(null)
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(null)
  const [dotSizes, setDotSizes] = useState<Float32Array | null>(null)
  const [dotAnimationPhases, setDotAnimationPhases] = useState<Float32Array | null>(null)
  const [animationTime, setAnimationTime] = useState(0)
  
  // Settings
  const dotSize = 0.025
  const dotColor = "#FFFFFF"
  const dotOpacity = 0.95
  const totalDots = 4000
  
  const { camera } = useThree()
  
  // Set up camera and scene
  useEffect(() => {
    // Position camera for better view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 16
      camera.position.y = 0
      camera.position.x = 2
      camera.lookAt(0, 0, 0)
    }
  }, [camera])
  
  // Define robot dimensions outside useEffect so they can be used in animation
  const headRadius = 1.5
  const neckLength = 0.4
  const shoulderWidth = 3.2
  const bodyWidth = 2.0
  const bodyWidthBottom = 1.6
  const bodyLength = 3.5
  const armLength = 2.8
  
  // Create dot positions for the robot agent
  useEffect(() => {
    const positions = new Float32Array(totalDots * 3)
    const originalPositions = new Float32Array(totalDots * 3)
    const intensities = new Float32Array(totalDots)
    const sizes = new Float32Array(totalDots)
    const animationPhases = new Float32Array(totalDots)
    
    let index = 0
    
    // Robot dimensions - match reference image proportions
    // Slim body, rounded helmet head, one arm positioned outward
    
    // 1. Create the glossy helmet head (oval shape)
    const headDots = Math.floor(totalDots * 0.2)
    for (let i = 0; i < headDots; i++) {
      // Create points distributed in an oval sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      
      // Create slightly oval helmet shape - wider than tall
      const radiusX = headRadius * 1.1
      const radiusY = headRadius * 0.95
      const radiusZ = headRadius * 1.1
      
      const x = radiusX * Math.sin(phi) * Math.cos(theta)
      const y = bodyLength/2 + neckLength + radiusY * Math.sin(phi) * Math.sin(theta)
      const z = radiusZ * Math.cos(phi)
      
      // Calculate position
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Glossy helmet lighting effect - brightest at front-top
      const frontFactor = Math.max(0, -Math.cos(phi)) // Brightest at front
      const topFactor = Math.max(0, Math.sin(phi) * Math.sin(theta)) // Highlight on top
      
      // Enhanced glossiness with bright spot
      let brightness = 0.5
      
      // Bright reflection area
      const distFromHighlight = Math.sqrt(
        Math.pow(Math.sin(phi) * Math.cos(theta) - 0.3, 2) + 
        Math.pow(Math.sin(phi) * Math.sin(theta) - 0.3, 2) + 
        Math.pow(Math.cos(phi) - 0.7, 2)
      )
      
      if (distFromHighlight < 0.6) {
        brightness = 1.0 - distFromHighlight
      }
      
      intensities[index] = Math.max(0.5, Math.min(1.2, brightness + frontFactor * 0.2 + topFactor * 0.2))
      
      // Helmet dots are slightly smaller for smoother appearance
      sizes[index] = dotSize * (0.8 + Math.random() * 0.2)
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 2. Add the faceplate dots (grid pattern)
    const faceDots = Math.floor(totalDots * 0.04)
    const faceGridWidth = 12
    const faceGridHeight = 8
    
    for (let i = 0; i < faceDots; i++) {
      // Create grid of dots for the faceplate
      const gridX = i % faceGridWidth - (faceGridWidth - 1) / 2
      const gridY = Math.floor(i / faceGridWidth) % faceGridHeight - (faceGridHeight - 1) / 2
      
      // Positioned on front of helmet
      const x = gridX * (headRadius * 0.12)
      const y = bodyLength/2 + neckLength + gridY * (headRadius * 0.12)
      const z = -headRadius * 0.97 // Just in front of the helmet surface
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Face grid dots vary in brightness for display effect
      intensities[index] = 0.9
      
      // Face grid dots are smaller
      sizes[index] = dotSize * 0.5
      
      // Animation phases for coordinated patterns
      animationPhases[index] = (gridX + gridY * 3) / (faceGridWidth + faceGridHeight * 3)
      
      index++
    }
    
    // 3. Create neck (thin cylindrical)
    const neckDots = Math.floor(totalDots * 0.02)
    for (let i = 0; i < neckDots; i++) {
      const angle = Math.random() * Math.PI * 2
      const height = Math.random() * neckLength
      
      // Cylindrical shape
      const radius = headRadius * 0.45
      const x = radius * Math.cos(angle)
      const y = bodyLength/2 + height
      const z = radius * Math.sin(angle)
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Neck is medium brightness
      intensities[index] = 0.6
      
      // Similar size to body
      sizes[index] = dotSize * 0.8
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 4. Create shoulders (wider than body)
    const shoulderDots = Math.floor(totalDots * 0.05)
    for (let i = 0; i < shoulderDots; i++) {
      // Shoulder position - top of body
      const shoulderY = bodyLength/2
      
      // Create arc-shaped shoulders
      const shoulderWidth = 3.2
      const shoulderThickness = 0.8
      
      // Distribute across shoulder width
      const xPos = (Math.random() * 2 - 1) * shoulderWidth/2
      
      // Create arc shape - higher in center, lower at edges
      const edgeFactor = Math.abs(xPos) / (shoulderWidth/2)
      const yPos = shoulderY - edgeFactor * 0.4
      
      // Add depth to shoulders
      const angle = Math.random() * Math.PI
      const zPos = Math.cos(angle) * shoulderThickness/2
      
      originalPositions[index * 3] = xPos
      originalPositions[index * 3 + 1] = yPos
      originalPositions[index * 3 + 2] = zPos
      
      positions[index * 3] = xPos
      positions[index * 3 + 1] = yPos
      positions[index * 3 + 2] = zPos
      
      // Shoulders have medium brightness
      intensities[index] = 0.7
      
      // Shoulder dots are normal sized
      sizes[index] = dotSize * 0.9
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 5. Create body (slim torso, tapered)
    const bodyDots = Math.floor(totalDots * 0.35)
    for (let i = 0; i < bodyDots; i++) {
      // Position in body, with y going from top to bottom
      const heightPercent = Math.random()
      const bodyY = bodyLength/2 - bodyLength * heightPercent
      
      // Width varies with height - tapers toward bottom
      const widthAtHeight = bodyWidth - (bodyWidth - bodyWidthBottom) * heightPercent
      
      // Create distributing using polar coordinates for more even density
      const angle = Math.random() * Math.PI * 2
      const radiusFraction = Math.sqrt(Math.random()) // Square root for uniform area distribution
      
      // Calculate position with tapered shape
      const bodyRadius = (widthAtHeight/2) * radiusFraction
      const bodyX = bodyRadius * Math.cos(angle)
      
      // Elliptical body shape - flatter front/back than sides
      const flattenFactor = Math.abs(Math.sin(angle)) * 0.5 + 0.5 // 0.5-1.0 range
      const bodyZ = bodyRadius * Math.sin(angle) * flattenFactor
      
      originalPositions[index * 3] = bodyX
      originalPositions[index * 3 + 1] = bodyY
      originalPositions[index * 3 + 2] = bodyZ
      
      positions[index * 3] = bodyX
      positions[index * 3 + 1] = bodyY
      positions[index * 3 + 2] = bodyZ
      
      // Body brightness varies based on position
      // Front is brighter than back
      const angleFactor = (Math.cos(angle) + 1) / 2 // 0-1 based on angle (1 at front, 0 at back)
      const baseBrightness = 0.4 + angleFactor * 0.4
      
      // Top of body is slightly brighter
      const heightFactor = Math.max(0, 1 - heightPercent * 2) // Brightest at top
      intensities[index] = baseBrightness + heightFactor * 0.1
      
      // Size varies slightly - larger near center, smaller near edges
      const edgeFactor = radiusFraction
      sizes[index] = dotSize * (1.0 - edgeFactor * 0.2) * (0.8 + Math.random() * 0.2)
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 6. Create left arm (at rest)
    const leftArmDots = Math.floor(totalDots * 0.08)
    
    for (let i = 0; i < leftArmDots; i++) {
      // Left arm (at rest)
      const shoulderY = bodyLength/2 - 0.3
      const armLength = 2.8
      
      // Position along arm length
      const segmentFraction = Math.random()
      
      // Slightly angled downward
      const armAngle = -Math.PI/12
      
      // Segment from shoulder down
      const x = -shoulderWidth/2 - segmentFraction * armLength * Math.sin(-armAngle)
      const y = shoulderY - segmentFraction * armLength * Math.cos(armAngle)
      
      // Create cylindrical shape with random distribution around central axis
      const radialAngle = Math.random() * Math.PI * 2
      const radialDist = Math.pow(Math.random(), 0.7) * bodyWidth * 0.2
      
      const armDirection = new THREE.Vector3(
        Math.sin(-armAngle),
        -Math.cos(armAngle),
        0
      ).normalize()
      
      // Create perpendicular vectors
      const up = new THREE.Vector3(0, 0, 1)
      const perpendicular1 = new THREE.Vector3().crossVectors(armDirection, up).normalize()
      const perpendicular2 = new THREE.Vector3().crossVectors(armDirection, perpendicular1).normalize()
      
      const finalX = x + radialDist * (Math.cos(radialAngle) * perpendicular1.x + Math.sin(radialAngle) * perpendicular2.x)
      const finalY = y + radialDist * (Math.cos(radialAngle) * perpendicular1.y + Math.sin(radialAngle) * perpendicular2.y)
      const finalZ = radialDist * (Math.cos(radialAngle) * perpendicular1.z + Math.sin(radialAngle) * perpendicular2.z)
      
      originalPositions[index * 3] = finalX
      originalPositions[index * 3 + 1] = finalY
      originalPositions[index * 3 + 2] = finalZ
      
      positions[index * 3] = finalX
      positions[index * 3 + 1] = finalY
      positions[index * 3 + 2] = finalZ
      
      // Arm brightness is medium
      intensities[index] = 0.6
      
      // Arm dots are slightly smaller
      sizes[index] = dotSize * 0.85 * (0.8 + Math.random() * 0.2)
      
      // Random animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 7. Create right arm (bent outward like in reference image)
    const rightArmDots = Math.floor(totalDots * 0.15)
    
    // First part - right shoulder to elbow
    const upperArmDots = Math.floor(rightArmDots * 0.5)
    for (let i = 0; i < upperArmDots; i++) {
      // Right shoulder position
      const shoulderY = bodyLength/2 - 0.3
      
      // Position along upper arm length
      const segmentFraction = Math.random()
      
      // Upper arm angle - slightly outward
      const upperArmAngle = Math.PI/12
      const upperArmLength = armLength * 0.45
      
      // Calculate position
      const x = shoulderWidth/2 + segmentFraction * upperArmLength * Math.sin(upperArmAngle)
      const y = shoulderY - segmentFraction * upperArmLength * Math.cos(upperArmAngle)
      
      // Create cylindrical shape
      const radialAngle = Math.random() * Math.PI * 2
      const radialDist = Math.pow(Math.random(), 0.7) * bodyWidth * 0.18
      
      const armDirection = new THREE.Vector3(
        Math.sin(upperArmAngle),
        -Math.cos(upperArmAngle),
        0
      ).normalize()
      
      // Create perpendicular vectors
      const up = new THREE.Vector3(0, 0, 1)
      const perpendicular1 = new THREE.Vector3().crossVectors(armDirection, up).normalize()
      const perpendicular2 = new THREE.Vector3().crossVectors(armDirection, perpendicular1).normalize()
      
      const finalX = x + radialDist * (Math.cos(radialAngle) * perpendicular1.x + Math.sin(radialAngle) * perpendicular2.x)
      const finalY = y + radialDist * (Math.cos(radialAngle) * perpendicular1.y + Math.sin(radialAngle) * perpendicular2.y)
      const finalZ = radialDist * (Math.cos(radialAngle) * perpendicular1.z + Math.sin(radialAngle) * perpendicular2.z)
      
      originalPositions[index * 3] = finalX
      originalPositions[index * 3 + 1] = finalY
      originalPositions[index * 3 + 2] = finalZ
      
      positions[index * 3] = finalX
      positions[index * 3 + 1] = finalY
      positions[index * 3 + 2] = finalZ
      
      // Arm brightness is medium
      intensities[index] = 0.65
      
      // Arm dots are slightly smaller
      sizes[index] = dotSize * 0.85 * (0.8 + Math.random() * 0.2)
      
      // Animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // Second part - elbow to hand (forearm)
    const forearmDots = rightArmDots - upperArmDots
    
    // Calculate elbow position
    const shoulderY = bodyLength/2 - 0.3
    const upperArmAngle = Math.PI/12
    const upperArmLength = armLength * 0.45
    const elbowX = shoulderWidth/2 + upperArmLength * Math.sin(upperArmAngle)
    const elbowY = shoulderY - upperArmLength * Math.cos(upperArmAngle)
    
    // Forearm is angled outward and slightly forward
    const forearmAngleH = Math.PI/3.5  // Horizontal angle (from vertical)
    const forearmAngleV = -Math.PI/12  // Vertical angle (from front)
    const forearmLength = armLength * 0.55
    
    for (let i = 0; i < forearmDots; i++) {
      // Position along forearm
      const segmentFraction = Math.random()
      
      // Calculate base position
      const xOffset = segmentFraction * forearmLength * Math.sin(forearmAngleH)
      const yOffset = -segmentFraction * forearmLength * Math.cos(forearmAngleH) * Math.cos(forearmAngleV)
      const zOffset = -segmentFraction * forearmLength * Math.cos(forearmAngleH) * Math.sin(forearmAngleV)
      
      const x = elbowX + xOffset
      const y = elbowY + yOffset
      const z = zOffset
      
      // Create cylindrical shape
      const radialAngle = Math.random() * Math.PI * 2
      const radialDist = Math.pow(Math.random(), 0.7) * bodyWidth * 0.15
      
      // Direction vector of forearm
      const armDirection = new THREE.Vector3(
        Math.sin(forearmAngleH),
        -Math.cos(forearmAngleH) * Math.cos(forearmAngleV),
        -Math.cos(forearmAngleH) * Math.sin(forearmAngleV)
      ).normalize()
      
      // Create perpendicular vectors
      const up = new THREE.Vector3(0, 0, 1)
      const perpendicular1 = new THREE.Vector3().crossVectors(armDirection, up).normalize()
      const perpendicular2 = new THREE.Vector3().crossVectors(armDirection, perpendicular1).normalize()
      
      const finalX = x + radialDist * (Math.cos(radialAngle) * perpendicular1.x + Math.sin(radialAngle) * perpendicular2.x)
      const finalY = y + radialDist * (Math.cos(radialAngle) * perpendicular1.y + Math.sin(radialAngle) * perpendicular2.y)
      const finalZ = z + radialDist * (Math.cos(radialAngle) * perpendicular1.z + Math.sin(radialAngle) * perpendicular2.z)
      
      originalPositions[index * 3] = finalX
      originalPositions[index * 3 + 1] = finalY
      originalPositions[index * 3 + 2] = finalZ
      
      positions[index * 3] = finalX
      positions[index * 3 + 1] = finalY
      positions[index * 3 + 2] = finalZ
      
      // Forearm brightness is medium
      intensities[index] = 0.65
      
      // Forearm dots are slightly smaller
      sizes[index] = dotSize * 0.8 * (0.8 + Math.random() * 0.2)
      
      // Animation phase - sequential for wave effect
      animationPhases[index] = segmentFraction
      
      index++
    }
    
    // 8. Create hand at end of right forearm
    const handDots = Math.floor(totalDots * 0.05)
    
    // Calculate hand position based on end of forearm
    const handX = elbowX + forearmLength * Math.sin(forearmAngleH)
    const handY = elbowY - forearmLength * Math.cos(forearmAngleH) * Math.cos(forearmAngleV)
    const handZ = -forearmLength * Math.cos(forearmAngleH) * Math.sin(forearmAngleV)
    
    for (let i = 0; i < handDots; i++) {
      // Create hand shape - slightly flattened sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      
      const handRadius = bodyWidth * 0.22
      
      // Flattened in z direction for hand shape
      const x = handX + handRadius * Math.sin(phi) * Math.cos(theta) * 0.8
      const y = handY + handRadius * Math.sin(phi) * Math.sin(theta)
      const z = handZ + handRadius * Math.cos(phi) * 0.6
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Hand dots vary in brightness - brighter on top
      const topFactor = Math.max(0, Math.sin(phi) * Math.sin(theta))
      intensities[index] = 0.6 + topFactor * 0.2
      
      // Hand dots are smaller
      sizes[index] = dotSize * 0.75 * (0.8 + Math.random() * 0.2)
      
      // Animation phases
      animationPhases[index] = Math.random()
      
      index++
    }
    
    // 9. Create lower body section
    const lowerBodyDots = totalDots - index
    for (let i = 0; i < lowerBodyDots; i++) {
      // Lower body position
      const lowerHeight = bodyLength * 0.6
      const heightPercent = Math.random()
      const y = -bodyLength/2 - heightPercent * lowerHeight
      
      // Width tapers further toward bottom
      const widthAtHeight = bodyWidthBottom * (1 - heightPercent * 0.3)
      
      // Create cylindrical distribution
      const angle = Math.random() * Math.PI * 2
      const radius = widthAtHeight/2 * Math.sqrt(Math.random())
      
      const x = radius * Math.cos(angle)
      
      // Elliptical shape - flatter front/back than sides
      const flattenFactor = Math.abs(Math.sin(angle)) * 0.4 + 0.6 // 0.6-1.0 range
      const z = radius * Math.sin(angle) * flattenFactor
      
      originalPositions[index * 3] = x
      originalPositions[index * 3 + 1] = y
      originalPositions[index * 3 + 2] = z
      
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      
      // Lower body is dimmer
      intensities[index] = 0.4 + Math.random() * 0.2
      
      // Lower body dots are smaller
      sizes[index] = dotSize * 0.7 * (0.8 + Math.random() * 0.2)
      
      // Animation phase
      animationPhases[index] = Math.random()
      
      index++
    }
    
    setDotPositions(positions)
    setDotOriginalPositions(originalPositions)
    setDotIntensities(intensities)
    setDotSizes(sizes)
    setDotAnimationPhases(animationPhases)
  }, [totalDots, dotSize])
  
  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !dotsRef.current || !dotIntensities || !dotOriginalPositions || 
        !dotPositions || !dotSizes || !dotAnimationPhases) 
      return
      
    const time = state.clock.getElapsedTime()
    setAnimationTime(time)
    // Use the shoulderWidth and bodyLength defined outside the animation loop
    const shoulderWidth = 3.2
    
    // More pronounced movement animation
    // Slight rotation + more breathing motion
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.12
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.08
    
    // Right arm movement animation
    const tempObj = new THREE.Object3D()
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotOriginalPositions.length / 3) continue
      
      // Get original position
      const x = dotOriginalPositions[i * 3]
      const y = dotOriginalPositions[i * 3 + 1]
      const z = dotOriginalPositions[i * 3 + 2]
      
      // Get animation phase
      const dotPhase = dotAnimationPhases[i]
      
      // Calculate dot-specific time
      const dotTime = time + dotPhase * 5
      
      // Different movement patterns for different body parts
      let nx = 0, ny = 0, nz = 0
      
      // Head dots - subtle pulsing
      if (i < totalDots * 0.2) {
        // Calculate distance from center of head
        const distFromCenter = Math.sqrt(x*x + Math.pow(y - 3.5, 2) + z*z)
        
        if (distFromCenter < 2) {
          // Subtle "breathing" pulse for head
          const breathFactor = 0.01 * Math.sin(time * 0.8)
          nx = x * breathFactor
          ny = (y - 3.5) * breathFactor
          nz = z * breathFactor
        }
      }
      // Face dots - digital display pattern
      else if (i < totalDots * 0.24) {
        // No movement, just intensity changes
      }
      // Body dots - breathing motion
      else if (i < totalDots * 0.64) {
        // Enhanced breathing animation
        const breathAmplitude = 0.015
        const breathPhase = Math.sin(time * 0.6)
        
        // Direction from center of body
        const centerX = 0
        const dirX = x === centerX ? 0 : (x - centerX) / Math.abs(x - centerX)
        const dirZ = z === 0 ? 0 : z / Math.abs(z)
        
        // Apply breathing animation - expands outward from center
        nx = dirX * Math.abs(x/3) * breathAmplitude * breathPhase
        nz = dirZ * Math.abs(z/3) * breathAmplitude * breathPhase
        
        // Subtle vertical motion
        ny = Math.sin(dotTime * 0.3) * 0.005
      }
      // Right arm - more pronounced movement
      else if (i < totalDots * 0.87) {
        // Check if point is in right arm (x > 0)
        if (x > 0) {
          // Wave-like animation for right arm - moves up/down slightly
          const armWaveAmplitude = 0.06
          const armWavePhase = Math.sin(time * 0.8)
          
          // Apply slight rotation to arm
          const rotationAxis = new THREE.Vector3(0, 0, 1)
          const rotationAngle = armWavePhase * 0.1
          
          // Pivot point for rotation (shoulder)
          const pivotX = shoulderWidth/2
          const pivotY = bodyLength/2 - 0.3
          
          // Translate to pivot, rotate, translate back
          const relativeX = x - pivotX
          const relativeY = y - pivotY
          
          // Rotation math
          const cosAngle = Math.cos(rotationAngle)
          const sinAngle = Math.sin(rotationAngle)
          
          // Only apply rotation to points further from shoulder
          const distFromShoulder = Math.sqrt(relativeX*relativeX + relativeY*relativeY)
          const rotationFactor = Math.min(1, distFromShoulder / 2)
          
          // Apply rotation with distance-based factor
          const rotatedX = relativeX * cosAngle - relativeY * sinAngle
          const rotatedY = relativeX * sinAngle + relativeY * cosAngle
          
          // Interpolate between original and rotated positions
          nx = (rotatedX - relativeX) * rotationFactor
          ny = (rotatedY - relativeY) * rotationFactor
          
          // Add vertical wave motion
          ny += armWaveAmplitude * armWavePhase * (1 - distFromShoulder/5) 
          
          // Add subtle twist
          nz += Math.sin(time + distFromShoulder) * 0.02
        }
      }
      // Hand dots - more pronounced movement
      else if (i < totalDots * 0.92) {
        // Finger movement animation
        const fingerWaveAmplitude = 0.08
        const fingerWavePhase = Math.sin(time * 1.2)
        
        // Apply finger movement - more at fingertips
        const handCenterX = 4.5
        const handCenterY = 1.3
        const distFromHandCenter = Math.sqrt(Math.pow(x - handCenterX, 2) + Math.pow(y - handCenterY, 2))
        
        // More movement at fingertips (furthest from hand center)
        const fingerFactor = Math.min(1, distFromHandCenter / 0.5)
        
        // Apply finger animation
        nx = Math.sin(time * 0.8 + x * 2) * fingerWaveAmplitude * fingerFactor
        ny = Math.cos(time * 0.8 + x * 2) * fingerWaveAmplitude * fingerFactor
        nz = Math.sin(time * 1.0 + x * 3) * fingerWaveAmplitude * fingerFactor * 0.5
      }
      // Lower body - subtle swaying
      else {
        // Subtle swaying animation
        const swayAmplitude = 0.01
        const swayPhase = Math.sin(time * 0.4)
        
        nx = swayPhase * swayAmplitude * x
        nz = Math.cos(time * 0.5) * swayAmplitude
      }
      
      // Add small random jitter for liveliness
      const jitter = 0.002
      nx += (Math.random() - 0.5) * jitter
      ny += (Math.random() - 0.5) * jitter
      nz += (Math.random() - 0.5) * jitter
      
      // Set position with animation applied
      tempObj.position.set(
        x + nx,
        y + ny,
        z + nz
      )
      
      // Apply dot size
      const size = dotSizes[i]
      tempObj.scale.set(size, size, size)
      
      tempObj.updateMatrix()
      dotsRef.current.setMatrixAt(i, tempObj.matrix)
    }
    
    dotsRef.current.instanceMatrix.needsUpdate = true
    
    // Animate dot intensities
    const tempColor = new THREE.Color(dotColor)
    
    for (let i = 0; i < totalDots; i++) {
      if (i >= dotIntensities.length) continue
      
      // Get base intensity
      const baseIntensity = dotIntensities[i]
      
      // Get animation phase
      const dotPhase = dotAnimationPhases[i]
      
      // Calculate dot-specific time
      const dotTime = time + dotPhase * 10
      
      let intensityFactor = 0
      
      // Face grid dots - digital display animations
      if (i >= totalDots * 0.2 && i < totalDots * 0.24) {
        // Enhanced digital face pattern
        const displayPatterns = [
          // Pattern 1: Random flickering
          () => {
            return Math.random() > 0.7 ? 0.5 : -0.3
          },
          // Pattern 2: Horizontal scan
          () => {
            const scanY = (time * 2) % 8 // 8 rows in face grid
            const dotY = Math.floor(dotPhase * 8) // Approximate row from phase
            return Math.abs(scanY - dotY) < 1 ? 0.5 : -0.3
          },
          // Pattern 3: Vertical scan
          () => {
            const scanX = (time * 3) % 12 // 12 columns in face grid
            const dotX = (dotPhase * 100) % 12 // Approximate column
            return Math.abs(scanX - dotX) < 1 ? 0.5 : -0.3
          },
          // Pattern 4: Pulsing all together
          () => {
            return Math.sin(time * 3) > 0 ? 0.5 : -0.3
          }
        ]
        
        // Choose pattern based on time
        const patternIndex = Math.floor(time / 4) % displayPatterns.length
        intensityFactor = displayPatterns[patternIndex]()
      } 
      // Helmet reflection animation
      else if (i < totalDots * 0.2) {
        // Enhanced reflection on helmet
        const reflectionSpeed = 0.5
        const reflectionPhase = Math.sin(time * reflectionSpeed + dotPhase * 3)
        intensityFactor = reflectionPhase * 0.15
      }
      // Body dots subtle pulsing
      else if (i < totalDots * 0.64) {
        // Breathing effect on intensity
        intensityFactor = Math.sin(time * 0.6 + dotPhase * 2) * 0.08
      }
      // Right arm "power flow" animation
      else if (i < totalDots * 0.87 && dotOriginalPositions[i * 3] > 0) {
        // Calculate distance along arm
        const shoulderX = shoulderWidth/2
        const shoulderY = bodyLength/2 - 0.3
        const distAlongArm = Math.sqrt(
          Math.pow(dotOriginalPositions[i * 3] - shoulderX, 2) + 
          Math.pow(dotOriginalPositions[i * 3 + 1] - shoulderY, 2)
        )
        
        // Create flowing pulse of intensity along arm
        const flowSpeed = 2
        const flowPos = (time * flowSpeed) % 8 - 4 // -4 to 4 range
        const distFromFlow = Math.abs(distAlongArm - flowPos)
        
        // Create pulse with falloff
        intensityFactor = Math.max(0, 0.2 - distFromFlow * 0.1)
      }
      // Hand dots - brighter on gesture
      else if (i < totalDots * 0.92) {
        // Hand gesture animation - brighten on movement
        const handGestureBrightness = Math.abs(Math.sin(time * 1.2)) * 0.2
        intensityFactor = handGestureBrightness
      }
      // Lower body subtle variation
      else {
        intensityFactor = Math.sin(dotTime * 0.3) * 0.05
      }
      
      // Calculate final intensity
      const finalIntensity = Math.max(0.1, Math.min(1.2, baseIntensity * (1 + intensityFactor)))
      
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
      {/* Key light from right side */}
      <directionalLight 
        position={[8, 4, 5]} 
        intensity={0.7} 
        color="#ffffff" 
      />
      
      {/* Fill light from left side */}
      <directionalLight 
        position={[-5, 2, 3]} 
        intensity={0.3} 
        color="#ffffff" 
      />
      
      {/* Rim light from right side - matches reference image */}
      <spotLight 
        position={[12, 0, 0]} 
        angle={0.6} 
        penumbra={0.8} 
        intensity={0.6} 
        color="#ffffff"
        castShadow
      />
      
      {/* Create all dots as instanced mesh */}
      <instancedMesh
        ref={dotsRef}
        args={[undefined, undefined, totalDots]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 8]} /> {/* Use base size of 1, scale with matrix */}
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