"use client"

import { Environment } from "@react-three/drei"

// A custom environment component that uses built-in presets
// instead of external HDR files which might fail to load
export default function CustomEnvironment() {
  return (
    <Environment
      preset="night" // Using built-in preset
      background={false}
      blur={0.6}
    />
  )
}