import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'IRA - IPO Readiness Assessment Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            IPO Readiness Assessment
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#94a3b8',
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            Free 90-second eligibility check
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#3b82f6',
            }}
          >
            IRA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
