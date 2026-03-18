import { create } from 'zustand'

const useAppState = create((set) => ({
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
}))

export default useAppState
