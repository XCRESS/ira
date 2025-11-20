import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Log to console (Vercel/production captures these)
    console.log('📊 WEB VITALS:', JSON.stringify({
      metric: data.metric,
      value: data.value,
      path: data.path,
      timestamp: new Date(data.timestamp).toISOString(),
    }))

    // Optional: Save to database for historical analysis
    // await prisma.analytics.create({ data })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ ok: false }, { status: 500 })
  }
}
