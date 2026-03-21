import { useState, useEffect } from 'react'
import { contact } from '../../data/contact'

const EMAIL = contact.email === 'TBD' ? 'contact@example.com' : contact.email

const icons = [
  {
    label: 'GitHub profile',
    href: contact.github === 'TBD' ? 'https://github.com' : contact.github,
    path: 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z',
  },
  {
    label: 'LinkedIn profile',
    href: contact.linkedin === 'TBD' ? 'https://linkedin.com' : contact.linkedin,
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Copy email',
    isEmail: true,
    path: 'M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z',
  },
]

const CHECK_PATH = 'M4.5 12.75l6 6 9-13.5'

export default function SocialIcons() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  function handleEmailClick(e) {
    e.preventDefault()
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const sharedStyle = (i, isActive) => ({
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid #00FFFF',
    boxShadow: hovered === i ? '0 0 14px #00FFFF' : '0 0 8px #00FFFF',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.4s ease',
    transitionDelay: visible ? `${i * 80}ms` : '0ms',
    transform: hovered === i ? 'scale(1.1)' : 'scale(1)',
    opacity: visible ? 1 : 0,
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {icons.map((icon, i) => {
        if (icon.isEmail) {
          return (
            <button
              key={icon.label}
              aria-label={copied ? 'Email copied!' : icon.label}
              onClick={handleEmailClick}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ ...sharedStyle(i), border: copied ? '1px solid #00FF88' : '1px solid #00FFFF', boxShadow: copied ? '0 0 14px #00FF88' : hovered === i ? '0 0 14px #00FFFF' : '0 0 8px #00FFFF' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={copied ? '#00FF88' : '#00FFFF'}
                stroke={copied ? '#00FF88' : 'none'}
                strokeWidth={copied ? '2.5' : '0'}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ transition: 'fill 0.2s ease' }}
              >
                <path
                  d={copied ? CHECK_PATH : icon.path}
                  fill={copied ? 'none' : '#00FFFF'}
                  stroke={copied ? '#00FF88' : 'none'}
                  strokeWidth={copied ? '2.5' : '0'}
                />
              </svg>
            </button>
          )
        }
        return (
          <a
            key={icon.label}
            href={icon.href}
            aria-label={icon.label}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={sharedStyle(i)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#00FFFF"
              aria-hidden="true"
            >
              <path d={icon.path} />
            </svg>
          </a>
        )
      })}
    </div>
  )
}
