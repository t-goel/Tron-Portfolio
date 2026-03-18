import { useEffect, useRef, useState } from 'react'
import useAppState from '../../store/appState'
import { playWithFade, initAudio } from '../../utils/audioManager'

const BOOT_KEY = 'tron-boot-played'

// Easing functions
function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// Phase timing constants (ms)
const TRACE_START = 0
const TRACE_END = 2000
const FLASH_START = 2000
const FLASH_END = 2400
const FADE_BLACK_START = 2400
const FADE_BLACK_END = 3200
const AUDIO_TRIGGER = 2400

export default function BootSequence({ onComplete }) {
  const setPhase = useAppState((s) => s.setPhase)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const completedRef = useRef(false)
  const audioTriggeredRef = useRef(false)
  const startTimeRef = useRef(null)
  const [fadingOut, setFadingOut] = useState(false)

  const triggerFadeOut = () => {
    if (completedRef.current) return
    completedRef.current = true
    sessionStorage.setItem(BOOT_KEY, '1')
    setPhase(2)       // disc starts rendering underneath
    setFadingOut(true) // CSS overlay fades to transparent
  }

  const complete = () => {
    if (onComplete) onComplete() // remove overlay after CSS transition
  }

  useEffect(() => {
    // Session skip — if already booted, jump straight to disc
    if (sessionStorage.getItem(BOOT_KEY)) {
      setPhase(2)
      if (onComplete) onComplete()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Size canvas to viewport
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const TEXT = 'LOADING'
    const fontSize = Math.min(canvas.width * 0.12, 120)
    const centerY = canvas.height / 2
    const centerX = canvas.width / 2

    // Pre-measure text dimensions
    ctx.font = `${fontSize}px TR2N, sans-serif`
    const textMetrics = ctx.measureText(TEXT)
    const textWidth = textMetrics.width
    const textLeft = centerX - textWidth / 2
    const textRight = centerX + textWidth / 2

    // Autoplay fallback state
    let audioFailed = false

    function setupAudioFallback() {
      const sound = initAudio()
      if (sound) {
        sound.on('playerror', () => {
          audioFailed = true
          document.addEventListener(
            'click',
            () => {
              audioFailed = false
              playWithFade(2000)
            },
            { once: true }
          )
        })
      }
    }
    setupAudioFallback()

    function drawFrame(elapsed) {
      const W = canvas.width
      const H = canvas.height

      // Trigger audio at the right moment
      if (elapsed >= AUDIO_TRIGGER && !audioTriggeredRef.current) {
        audioTriggeredRef.current = true
        playWithFade(2000)
      }

      // Clear canvas
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, W, H)

      // ---- PHASE 1: Letter Tracing (0 - 2000ms) ----
      if (elapsed >= TRACE_START && elapsed < FLASH_START) {
        const t = Math.min((elapsed - TRACE_START) / (TRACE_END - TRACE_START), 1)
        const sweepX = textLeft + textWidth * t

        ctx.font = `${fontSize}px TR2N, sans-serif`

        // Draw top half (cyan)
        ctx.save()
        ctx.beginPath()
        ctx.rect(textLeft, 0, sweepX - textLeft, centerY)
        ctx.clip()
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00FFFF'
        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 2
        ctx.strokeText(TEXT, textLeft, centerY + fontSize * 0.25)
        ctx.restore()

        // Draw bottom half (orange)
        ctx.save()
        ctx.beginPath()
        ctx.rect(textLeft, centerY, sweepX - textLeft, H - centerY)
        ctx.clip()
        ctx.shadowBlur = 15
        ctx.shadowColor = '#FF5E00'
        ctx.strokeStyle = '#FF5E00'
        ctx.lineWidth = 2
        ctx.strokeText(TEXT, textLeft, centerY + fontSize * 0.25)
        ctx.restore()

        // Cyan sprite (top half) — leading glow dot
        const cyanGrad = ctx.createRadialGradient(sweepX, centerY - 20, 0, sweepX, centerY - 20, 18)
        cyanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        cyanGrad.addColorStop(0.3, 'rgba(0, 255, 255, 0.7)')
        cyanGrad.addColorStop(1, 'rgba(0, 255, 255, 0)')
        ctx.fillStyle = cyanGrad
        ctx.beginPath()
        ctx.arc(sweepX, centerY - 20, 18, 0, Math.PI * 2)
        ctx.fill()

        // Orange sprite (bottom half) — leading glow dot
        const orangeGrad = ctx.createRadialGradient(sweepX, centerY + 20, 0, sweepX, centerY + 20, 18)
        orangeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        orangeGrad.addColorStop(0.3, 'rgba(255, 94, 0, 0.7)')
        orangeGrad.addColorStop(1, 'rgba(255, 94, 0, 0)')
        ctx.fillStyle = orangeGrad
        ctx.beginPath()
        ctx.arc(sweepX, centerY + 20, 18, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- PHASE 2: Collision Flash (2000ms - 2200ms) ----
      if (elapsed >= FLASH_START && elapsed < FLASH_END) {
        const t = (elapsed - FLASH_START) / (FLASH_END - FLASH_START)
        const easedT = easeOutQuad(t)

        // Draw the completed text briefly at peak flash
        ctx.font = `${fontSize}px TR2N, sans-serif`

        // Full text in cyan top half
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, W, centerY)
        ctx.clip()
        ctx.shadowBlur = 20
        ctx.shadowColor = '#00FFFF'
        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 2
        ctx.strokeText(TEXT, textLeft, centerY + fontSize * 0.25)
        ctx.restore()

        // Full text in orange bottom half
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, centerY, W, H - centerY)
        ctx.clip()
        ctx.shadowBlur = 20
        ctx.shadowColor = '#FF5E00'
        ctx.strokeStyle = '#FF5E00'
        ctx.lineWidth = 2
        ctx.strokeText(TEXT, textLeft, centerY + fontSize * 0.25)
        ctx.restore()

        // Expanding white radial flash from center
        const maxRadius = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2) * 1.5
        const currentRadius = maxRadius * easedT
        const flashGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius)
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * (1 - t * 0.3)})`)
        flashGrad.addColorStop(0.3, `rgba(200, 240, 255, ${0.6 * (1 - t * 0.3)})`)
        flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = flashGrad
        ctx.beginPath()
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- PHASE 3: Fade to Black (2200ms - 2700ms) ----
      if (elapsed >= FADE_BLACK_START && elapsed < FADE_BLACK_END) {
        const t = (elapsed - FADE_BLACK_START) / (FADE_BLACK_END - FADE_BLACK_START)
        // Already drew black background at top — just keep canvas black, optionally fade out flash residual
        ctx.fillStyle = `rgba(0, 0, 0, ${t})`
        ctx.fillRect(0, 0, W, H)
      }

      // Autoplay fallback text
      if (audioFailed) {
        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.font = `14px 'Roboto Mono', monospace`
        ctx.fillStyle = '#00FFFF'
        ctx.textAlign = 'center'
        ctx.fillText('CLICK TO ENABLE AUDIO', centerX, H - 40)
        ctx.restore()
      }

      // At end of canvas animation, trigger CSS fade-out to reveal disc
      if (elapsed >= FADE_BLACK_END) {
        triggerFadeOut()
      }
    }

    function animate(timestamp) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      drawFrame(elapsed)

      if (elapsed < FADE_BLACK_END && !completedRef.current) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div
      onTransitionEnd={complete}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 20,
        overflow: 'hidden',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? 'opacity 1.4s ease-in' : 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
