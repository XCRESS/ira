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
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Title */}
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

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#94a3b8',
              marginBottom: 48,
              textAlign: 'center',
            }}
          >
            Expert analysis for BSE, NSE, NYSE & NASDAQ listings
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginBottom: 48,
            }}
          >
            {['Free Eligibility Check', 'Expert Analysis', 'Comprehensive Reports'].map((feature) => (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: '16px 24px',
                  borderRadius: 12,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <div style={{ color: '#60a5fa', fontSize: 24 }}>✓</div>
                <div style={{ color: '#e2e8f0', fontSize: 20, marginLeft: 12 }}>{feature}</div>
              </div>
            ))}
          </div>

          {/* Logo and domain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              IRA
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#64748b',
              }}
            >
              irascore.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
