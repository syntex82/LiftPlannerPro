import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Lift Planner Pro'
    const description = searchParams.get('description') || 'Professional CAD Software for Lift Planning'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            padding: '60px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            }}
          />

          {/* Top Section - Logo & Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                }}
              >
                🏗️
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {title}
                </span>
                <span style={{ fontSize: '24px', color: '#94a3b8' }}>
                  Professional CAD Software
                </span>
              </div>
            </div>

            {/* Main Tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px' }}>
              <span
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                Plan. Design. Execute.
              </span>
              <span style={{ fontSize: '28px', color: '#cbd5e1', maxWidth: '700px' }}>
                {description}
              </span>
            </div>
          </div>

          {/* Bottom Section - Features & URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Feature Pills */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {['🎨 2D/3D CAD', '⚖️ Load Calculator', '📋 RAMS Generator', '🗺️ Route Planner', '🤖 AI Safety'].map((feature) => (
                <div
                  key={feature}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    fontSize: '18px',
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', color: '#64748b' }}>
                liftplannerpro.org
              </span>
              <div
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                Start Free Trial →
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new NextResponse('Error generating image', { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
