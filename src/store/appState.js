import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppState = create(
  persist(
    (set) => ({
      // Phase management
      phase: 1, // Start at Phase 1 (Boot Sequence) — skipped via sessionStorage on repeat visits
      setPhase: (phase) => set({ phase }),

      // Audio
      audioEnabled: true,
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

      // UI visibility
      hudVisible: false,
      setHudVisible: (visible) => set({ hudVisible: visible }),

      // Active sector (null, 'about', 'skills', 'projects')
      activeSector: null,
      setActiveSector: (sector) => set({ activeSector: sector }),

      // Camera transition flag — prevents double-fire during GSAP lerp
      transitioning: false,
      setTransitioning: (v) => set({ transitioning: v }),

      // Player group ref — shared between LightCycles and CameraController
      playerRef: null,
      setPlayerRef: (ref) => set({ playerRef: ref }),
    }),
    {
      name: 'tron-app-state',
      partialize: (state) => ({ audioEnabled: state.audioEnabled }),
    }
  )
)

export default useAppState
