import { create } from 'zustand'

const useAppState = create((set) => ({
  // Phase management
  phase: 2, // Start at Phase 2 (Identity Disc) — Phase 1 boot sequence added later
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
