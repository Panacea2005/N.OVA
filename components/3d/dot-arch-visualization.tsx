"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface DotArchVisualizationProps {
  greeting?: string;
  dotSize?: number;
  dotOpacity?: number;
  dotColor?: string;
  arcWidth?: number;
  arcHeight?: number;
  arcDepth?: number;
  rows?: number;
  dotsPerRow?: number;
  animated?: boolean;
}

// This component is meant to be used INSIDE a Canvas component
export default function DotArchVisualization({
  greeting = "// NOVA.",
  dotSize = 0.02,
  dotOpacity = 0.8,
  dotColor = "#FFFFFF", // Pure white
  arcWidth = 10,
  arcHeight = 5,
  arcDepth = 2,
  rows = 30,
  dotsPerRow = 60,
  animated = true,
}: DotArchVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const [dotPositions, setDotPositions] = useState<Float32Array | null>(null);
  const [dotOriginalPositions, setDotOriginalPositions] =
    useState<Float32Array | null>(null);
  const [dotIntensities, setDotIntensities] = useState<Float32Array | null>(
    null
  );

  const { camera } = useThree();

  // Noise function for creating organic sphere deformations
  const noise = (x: number, y: number, z: number) => {
    // Simple 3D noise function
    const noiseFrequency = 1.2;
    const nx = Math.cos(x * noiseFrequency);
    const ny = Math.cos(y * noiseFrequency);
    const nz = Math.cos(z * noiseFrequency);
    return (nx + ny + nz) / 3;
  };

  // Create dot positions in a sphere formation
  useEffect(() => {
    // Position camera for better view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 10;
      camera.position.y = 0;
      camera.lookAt(0, 0, 0);
    }

    const sphereRadius = Math.min(arcWidth, arcHeight) / 2;
    const deformStrength = 0.6; // How much the sphere is deformed

    const totalDots = rows * dotsPerRow;
    const positions = new Float32Array(totalDots * 3); // x, y, z for each dot
    const originalPositions = new Float32Array(totalDots * 3); // Store original positions for animation
    const intensities = new Float32Array(totalDots); // individual opacity for each dot

    let index = 0;

    // Create sphere using Fibonacci sequence for even distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < totalDots; i++) {
      // Fibonacci sphere algorithm
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalDots);

      // Convert to Cartesian coordinates
      let x = Math.cos(theta) * Math.sin(phi);
      let y = Math.sin(theta) * Math.sin(phi);
      let z = Math.cos(phi);

      // Add some noise for organic deformation like in the image
      const deform = noise(x, y, z) * deformStrength;
      x += x * deform;
      y += y * deform;
      z += z * deform;

      // Scale to desired radius
      x *= sphereRadius;
      y *= sphereRadius;
      z *= sphereRadius;

      // Store original positions for animation
      originalPositions[index * 3] = x;
      originalPositions[index * 3 + 1] = y;
      originalPositions[index * 3 + 2] = z;

      // Set position
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      // Set dot intensity - vary a bit to create depth
      const randomFactor = Math.random() * 0.3 + 0.7;
      intensities[index] = randomFactor;

      index++;
    }

    setDotPositions(positions);
    setDotOriginalPositions(originalPositions);
    setDotIntensities(intensities);
  }, [rows, dotsPerRow, arcWidth, arcHeight, arcDepth, camera]);

  // Animation loop
  useFrame((state) => {
    if (
      !groupRef.current ||
      !dotsRef.current ||
      !dotIntensities ||
      !dotOriginalPositions ||
      !dotPositions ||
      !animated
    )
      return;

    const time = state.clock.getElapsedTime();
    const totalDots = rows * dotsPerRow;

    // Rotate the entire visualization slowly
    groupRef.current.rotation.y = time * 0.05;

    // Apply subtle wave-like animation to the dots
    const obj = new THREE.Object3D();

    for (let i = 0; i < totalDots; i++) {
      // Get original position
      const x = dotOriginalPositions[i * 3];
      const y = dotOriginalPositions[i * 3 + 1];
      const z = dotOriginalPositions[i * 3 + 2];

      // Apply subtle breathing animation
      const breathingAmp = 0.03; // Breathing amplitude
      const breathingSpeed = 0.2; // Breathing speed
      const pulseScale = 1 + Math.sin(time * breathingSpeed) * breathingAmp;

      // Apply wave deformation like in the example image
      const waveSpeed = 0.5;
      const waveAmplitude = 0.1;
      const waveFreq = 2;
      // Create a wave that travels across the sphere
      const wavePhase =
        Math.sin(time * waveSpeed + (x + y + z) * waveFreq) * waveAmplitude;

      // Apply both effects
      obj.position.set(
        x * (pulseScale + wavePhase),
        y * (pulseScale + wavePhase),
        z * (pulseScale + wavePhase)
      );

      obj.updateMatrix();
      dotsRef.current.setMatrixAt(i, obj.matrix);
    }

    dotsRef.current.instanceMatrix.needsUpdate = true;

    // Animate dot opacities slightly for subtle shimmer effect
    const tempColor = new THREE.Color(dotColor);

    // Update each dot's opacity/intensity
    for (let i = 0; i < totalDots; i++) {
      const noise = Math.sin(time * 0.5 + i * 0.1) * 0.1 + 0.9;
      const intensity = dotIntensities[i] * noise;

      // Create a new color with adjusted opacity
      const color = tempColor.clone().multiplyScalar(intensity);

      // Set the color and opacity for this instance
      dotsRef.current.setColorAt(i, color);
    }

    // Need to flag this as requiring an update
    if (dotsRef.current.instanceColor) {
      dotsRef.current.instanceColor.needsUpdate = true;
    }
  });

  // Display loading state if positions aren't ready
  if (!dotPositions || !dotIntensities) {
    return null;
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

      {/* The greeting text shows only when using HTML overlay */}
      <Html
        center
        position={[0, 0, 0]}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "32px",
            fontFamily: "monospace",
            color: "white",
            textAlign: "center",
            whiteSpace: "nowrap", // Force single line
            fontWeight: "bold",
            letterSpacing: "1px",
            textShadow: "0 0 3px rgba(255, 255, 255, 0.5)",
          }}
        >
          {greeting}
          {/* Underline */}
          <div
            style={{
              position: "absolute",
              bottom: "-15px",
              left: "0",
              width: "100%",
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)",
            }}
          ></div>
        </div>
      </Html>

      {/* Initialize dot positions */}
      <primitive
        object={new THREE.Object3D()}
        ref={(obj: {
          position: { set: (arg0: number, arg1: number, arg2: number) => void };
          updateMatrix: () => void;
          matrix: THREE.Matrix4;
        }) => {
          if (obj && dotPositions && dotsRef.current) {
            // Set each dot's position
            for (let i = 0; i < rows * dotsPerRow; i++) {
              obj.position.set(
                dotPositions[i * 3],
                dotPositions[i * 3 + 1],
                dotPositions[i * 3 + 2]
              );
              obj.updateMatrix();
              dotsRef.current.setMatrixAt(i, obj.matrix);
            }
            dotsRef.current.instanceMatrix.needsUpdate = true;

            // Initialize colors
            const tempColor = new THREE.Color(dotColor);
            for (let i = 0; i < rows * dotsPerRow; i++) {
              const intensity = dotIntensities[i];
              const color = tempColor.clone().multiplyScalar(intensity);
              dotsRef.current.setColorAt(i, color);
            }
            if (dotsRef.current.instanceColor) {
              dotsRef.current.instanceColor.needsUpdate = true;
            }
          }
        }}
      />
    </group>
  );
}
