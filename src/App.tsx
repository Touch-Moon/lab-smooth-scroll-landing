import { useEffect, useRef } from 'react'
import './index.css'

const lerp = (a: number, b: number, n: number) => a + (b - a) * n

const SECTIONS = [
  { num: '01', title: ['Langill', 'Farm'], tag: 'Steinbach, Manitoba — 73 acres' },
  { num: '02', title: ['The', 'Land'], tag: 'Premium lots · master-planned' },
  { num: '03', title: ['Phase 1', '41% Sold'], tag: 'Limited availability' },
  { num: '04', title: ['Start', 'Here'], tag: 'Get in touch today' },
]

export default function App() {
  const wrapperRef = useRef<HTMLDivElement>(null)   // clip container
  const domRef = useRef<HTMLDivElement>(null)        // scrollable DOM
  const canvasRef = useRef<HTMLCanvasElement>(null)  // wave overlay
  const scrollState = useRef({ current: 0, target: 0, velocity: 0, last: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const dom = domRef.current
    const canvas = canvasRef.current
    if (!wrapper || !dom || !canvas) return

    const H = window.innerHeight
    let W = window.innerWidth
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // --- Scroll input ---
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const max = dom.scrollHeight - H
      scrollState.current.target = Math.max(0, Math.min(max, scrollState.current.target + e.deltaY))
    }
    window.addEventListener('wheel', onWheel, { passive: false })

    // --- RAF loop ---
    let rafId = 0
    const tick = () => {
      const s = scrollState.current
      s.last = s.current
      s.current = lerp(s.current, s.target, 0.075)
      s.velocity = s.current - s.last   // px/frame — this IS the "출렁임"

      // 1. Move DOM
      dom.style.transform = `translateY(${-s.current}px)`

      // 2. Draw wave on canvas overlay — visible warp lines driven by velocity
      ctx.clearRect(0, 0, W, H)

      const speed = Math.abs(s.velocity)
      if (speed > 0.05) {
        const lines = 18
        const amplitude = Math.min(speed * 1.8, 28) // max 28px wave
        const freq = 0.018

        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(201,151,62,${Math.min(speed * 0.04, 0.18)})`

        for (let l = 0; l < lines; l++) {
          const y0 = (l / lines) * H
          ctx.beginPath()
          for (let x = 0; x <= W; x += 3) {
            const wave = Math.sin(x * freq + s.current * 0.008 + l * 0.5) * amplitude
            const y = y0 + wave
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      }

      // Progress bar
      const max = dom.scrollHeight - H
      const bar = document.getElementById('progress-bar')
      if (bar) bar.style.transform = `scaleX(${s.current / max})`

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onResize = () => {
      W = window.innerWidth
      canvas.width = W
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', overflow: 'hidden' }}>

      {/* Progress bar */}
      <div id="progress-bar" style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: 2,
        background: '#c9973e',
        transformOrigin: 'left', transform: 'scaleX(0)',
        zIndex: 100,
      }} />

      {/* Clip wrapper */}
      <div ref={wrapperRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

        {/* Scrollable DOM — moved via lerp */}
        <div ref={domRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', willChange: 'transform' }}>
          {SECTIONS.map((s, i) => (
            <section key={i} style={{
              height: '100vh',
              display: 'flex', alignItems: 'center',
              padding: '0 8vw', position: 'relative',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              {/* Large bg number */}
              <span style={{
                position: 'absolute', right: '4vw', bottom: '-0.1em',
                fontSize: 'clamp(180px,28vw,380px)', fontWeight: 800,
                color: 'rgba(255,255,255,0.025)', lineHeight: 1,
                userSelect: 'none', letterSpacing: '-0.05em', pointerEvents: 'none',
              }}>{s.num}</span>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c9973e', fontWeight: 500 }}>
                    {s.num}
                  </span>
                  <div style={{ height: 1, width: 48, background: 'linear-gradient(to right,#c9973e,transparent)' }} />
                  <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.35)' }}>
                    {s.tag}
                  </span>
                </div>

                {s.title.map((line, li) => (
                  <div key={li} style={{
                    fontSize: 'clamp(64px,10vw,140px)', fontWeight: 100,
                    lineHeight: 0.95, letterSpacing: '-0.04em', color: '#f0ede8',
                  }}>{line}</div>
                ))}

                {i === SECTIONS.length - 1 && (
                  <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9973e' }}>
                      View listings
                    </span>
                    <div style={{ width: 32, height: 1, background: '#c9973e' }} />
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Canvas wave overlay — pointer-events:none so DOM is still interactive */}
        <canvas ref={canvasRef} style={{
          position: 'absolute', inset: 0,
          zIndex: 10, pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
