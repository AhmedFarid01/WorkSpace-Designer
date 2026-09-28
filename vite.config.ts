import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The 3D engine loads in its own chunks so the panel can paint before the villa is ready.
// Vite normalises module ids to forward slashes on every platform.
const R3F = /node_modules\/(@react-three|postprocessing|camera-controls|maath|three-stdlib|three-mesh-bvh|troika-[^/]+|@monogrid|meshline|stats-gl|its-fine|react-reconciler|suspend-react)\//

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          if (R3F.test(id)) return 'r3f'
          // React, zustand and Vite's own helpers stay in the eager vendor chunk.
          if (id.includes('node_modules') || id.startsWith('\0')) return 'vendor'
        },
      },
    },
  },
})
