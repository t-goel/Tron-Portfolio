import { contact } from '../data/contact'

export default function WebGLFallback() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Roboto Mono', monospace",
      color: '#F0F0F0',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{
        fontFamily: "'TR2N', sans-serif",
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        color: '#FF0000',
        letterSpacing: '0.15em',
        marginBottom: '1.5rem',
        textShadow: '0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.3)',
      }}>
        THIS EXPERIENCE REQUIRES WEBGL
      </h1>

      <p style={{
        fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
        color: '#F0F0F0',
        maxWidth: '500px',
        lineHeight: 1.6,
        marginBottom: '2.5rem',
        opacity: 0.8,
      }}>
        Your browser does not support WebGL, which is needed to render
        this 3D portfolio experience. Please try a modern browser, or
        reach out directly:
      </p>

      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <a href={contact.github} target="_blank" rel="noopener noreferrer" style={{
          color: '#00FFFF',
          textDecoration: 'none',
          fontSize: '1rem',
          padding: '0.5rem 1rem',
          border: '1px solid #00FFFF',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }}>
          GitHub
        </a>
        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" style={{
          color: '#00FFFF',
          textDecoration: 'none',
          fontSize: '1rem',
          padding: '0.5rem 1rem',
          border: '1px solid #00FFFF',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }}>
          LinkedIn
        </a>
        <a href={'mailto:' + contact.email} style={{
          color: '#00FFFF',
          textDecoration: 'none',
          fontSize: '1rem',
          padding: '0.5rem 1rem',
          border: '1px solid #00FFFF',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }}>
          Email
        </a>
      </div>
    </div>
  )
}
