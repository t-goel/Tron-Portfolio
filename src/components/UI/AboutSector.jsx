import { useState, useEffect, useRef } from 'react'
import { contact } from '../../data/contact'
import useAppState from '../../store/appState'

const PROMPT = 'tanmay@grid:~$ '

const TERMINAL_SEQUENCE = [
  { cmd: `${PROMPT}whoami`, output: 'tanmay-goel' },
  { cmd: `${PROMPT}cat background.txt`, output: 'CS at UIUC (Class of 2027). Building full-stack and ML systems since freshman year.' },
  { cmd: `${PROMPT}cat interests.txt`, output: 'AI/ML research, distributed systems, immersive frontend engineering.' },
  { cmd: `${PROMPT}cat looking_for.txt`, output: 'SWE/ML internship opportunities — Summer 2027. Open to research and systems roles.' },
  { cmd: `${PROMPT}ls contact/`, output: 'github.txt  linkedin.txt  email.txt' },
  { cmd: `${PROMPT}cat contact/*`, output: '__CONTACT_LINKS__' },
]


export default function AboutSector() {
  const [visible, setVisible] = useState(false)
  const [lines, setLines] = useState([])
  const [currentTyping, setCurrentTyping] = useState('')
  const [done, setDone] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [userInput, setUserInput] = useState('')
  const timeoutsRef = useRef([])
  const terminalBodyRef = useRef(null)
  const setActiveSector = useAppState((s) => s.setActiveSector)

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll whenever lines or currentTyping changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [lines, currentTyping, userInput])

  // Typewriter engine
  useEffect(() => {
    let cancelled = false

    function scheduleTimeout(fn, delay) {
      const id = setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeoutsRef.current.push(id)
      return id
    }

    let totalDelay = 300 // initial boot delay

    TERMINAL_SEQUENCE.forEach((entry, seqIndex) => {
      const { cmd, output } = entry

      // Type each character of the command
      for (let i = 0; i < cmd.length; i++) {
        const charIndex = i
        scheduleTimeout(() => {
          setCurrentTyping(cmd.slice(0, charIndex + 1))
        }, totalDelay + charIndex * 35)
      }
      totalDelay += cmd.length * 35

      // 400ms pause after command is fully typed, then push to lines
      scheduleTimeout(() => {
        setCurrentTyping('')
        setLines((prev) => {
          const newLines = [
            ...prev,
            { type: 'cmd', text: cmd },
          ]
          if (output === '__CONTACT_LINKS__') {
            newLines.push({ type: 'contact' })
          } else {
            newLines.push({ type: 'output', text: output })
          }
          return newLines
        })
        if (seqIndex === TERMINAL_SEQUENCE.length - 1) {
          setDone(true)
        }
      }, totalDelay + 400)

      totalDelay += 400 + 300 // pause after output before next command
    })

    return () => {
      cancelled = true
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  // Keyboard handler for interactive mode
  useEffect(() => {
    if (!done) return

    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        const cmd = userInput.trim()
        setUserInput('')

        const cmdLine = { type: 'cmd', text: `${PROMPT}${cmd}` }

        if (cmd === 'exit') {
          setActiveSector(null)
          return
        }

        if (!cmd) {
          setLines((prev) => [...prev, cmdLine])
          return
        }

        setLines((prev) => [
          ...prev,
          cmdLine,
          { type: 'error', text: `bash: ${cmd}: command not found` },
        ])
      } else if (e.key === 'Backspace') {
        setUserInput((v) => v.slice(0, -1))
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setUserInput((v) => v + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [done, userInput, setActiveSector])

  function renderContactLink(href, label, isTBD) {
    if (isTBD) {
      return (
        <span
          key={label}
          style={{
            display: 'block',
            color: 'rgba(0,255,255,0.4)',
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {label}: [not set]
        </span>
      )
    }
    return (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          color: '#00FFFF',
          textShadow: '0 0 8px #00FFFF',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {label}
      </a>
    )
  }

  function renderContactLinks() {
    const githubTBD = !contact.github || contact.github === 'TBD'
    const linkedinTBD = !contact.linkedin || contact.linkedin === 'TBD'
    const emailTBD = !contact.email || contact.email === 'TBD'

    const githubHref = contact.github && contact.github.startsWith('http')
      ? contact.github
      : `https://github.com/${contact.github}`
    const linkedinHref = contact.linkedin && contact.linkedin.startsWith('http')
      ? contact.linkedin
      : `https://linkedin.com/in/${contact.linkedin}`
    const emailHref = `mailto:${contact.email}`

    return (
      <div style={{ paddingTop: 2 }}>
        {renderContactLink(githubHref, `github: ${githubTBD ? 'TBD' : contact.github}`, githubTBD)}
        {renderContactLink(linkedinHref, `linkedin: ${linkedinTBD ? 'TBD' : contact.linkedin}`, linkedinTBD)}
        {renderContactLink(emailHref, `email: ${emailTBD ? 'TBD' : contact.email}`, emailTBD)}
      </div>
    )
  }

  function renderCmdLine(text, idx) {
    const promptEnd = text.indexOf('$ ') + 2
    const prompt = text.slice(0, promptEnd)
    const command = text.slice(promptEnd)
    return (
      <div key={idx}>
        <span style={{ color: '#28C840', letterSpacing: '0.05em' }}>{prompt}</span>
        <span style={{ color: '#00FFFF', letterSpacing: '0.05em' }}>{command}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-in',
      }}
    >
      {/* Terminal window */}
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: 480,
          margin: '0 16px',
          border: '1px solid rgba(0,255,255,0.3)',
          background: '#000000',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 28,
            background: 'rgba(0,30,30,0.98)',
            borderBottom: '1px solid rgba(0,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 12,
            color: 'rgba(0,255,255,0.6)',
            letterSpacing: '0.1em',
          }}>
            bash — tanmay@grid: ~
          </span>
          <span style={{
            position: 'absolute',
            right: 12,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 11,
            color: 'rgba(0,255,255,0.3)',
            cursor: 'default',
          }}>
            ✕
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalBodyRef}
          style={{
            padding: 16,
            overflowY: 'auto',
            flex: 1,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 14,
            color: '#00FFFF',
            lineHeight: 1.6,
          }}
        >
          {lines.map((line, idx) => {
            if (line.type === 'cmd') return renderCmdLine(line.text, idx)
            if (line.type === 'output') {
              return (
                <div key={idx} style={{ color: '#F0F0F0', marginBottom: 8 }}>
                  {line.text}
                </div>
              )
            }
            if (line.type === 'error') {
              return (
                <div key={idx} style={{ color: '#FF5E00', marginBottom: 8 }}>
                  {line.text}
                </div>
              )
            }
            if (line.type === 'contact') {
              return (
                <div key={idx} style={{ marginBottom: 8 }}>
                  {renderContactLinks()}
                </div>
              )
            }
            return null
          })}

          {/* Currently typing line (typewriter) */}
          {!done && (
            <div>
              {(() => {
                const promptEnd = currentTyping.indexOf('$ ') + 2
                const prompt = promptEnd > 1 ? currentTyping.slice(0, promptEnd) : currentTyping
                const command = promptEnd > 1 ? currentTyping.slice(promptEnd) : ''
                return (
                  <>
                    <span style={{ color: '#28C840', letterSpacing: '0.05em' }}>{prompt}</span>
                    <span style={{ color: '#00FFFF', letterSpacing: '0.05em' }}>{command}</span>
                  </>
                )
              })()}
              <span style={{ color: '#00FFFF', opacity: cursorVisible ? 1 : 0, marginLeft: 1 }}>▌</span>
            </div>
          )}

          {/* Interactive prompt when done */}
          {done && (
            <>
              {/* Hint */}
              <div style={{ color: 'rgba(0,255,255,0.25)', fontSize: 12, marginBottom: 4, fontStyle: 'italic' }}>
                # type &apos;exit&apos; to return to grid
              </div>
              <div>
                <span style={{ color: '#28C840', letterSpacing: '0.05em' }}>{PROMPT}</span>
                <span style={{ color: '#00FFFF', letterSpacing: '0.05em' }}>{userInput}</span>
                <span style={{ color: '#00FFFF', opacity: cursorVisible ? 1 : 0, marginLeft: 1 }}>▌</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
