export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!(ctx && ctx instanceof WebGLRenderingContext)
  } catch (e) {
    return false
  }
}
