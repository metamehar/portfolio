import { NextRequest, NextResponse } from 'next/server'

// ----------------------------------------------------------------------------
// FAISAL — Real-time Visitor Counter (Honest Version)
//
// Tracks unique visitors in the last 15 MINUTES (not 1 hour) using an
// in-memory store. Shorter window = more honest "who's here right now"
// signal. No fake numbers, no inflation.
//
// Endpoints:
//   POST /api/visitors  — register a heartbeat (body: { visitorId?: string })
//   GET  /api/visitors  — get current visitor count
//
// The GET endpoint also accepts an optional ?exclude=visitorId query param
// so the client can ask "how many OTHER people are here?" (excludes self).
// ----------------------------------------------------------------------------

// In-memory store: Map<visitorId, lastSeenEpochMs>
const visitors = new Map<string, number>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes (honest "right now" window)

// Prune on EVERY request (not every 5 min) so stale entries never inflate the count
function prune() {
  const now = Date.now()
  for (const [id, ts] of visitors) {
    if (now - ts > WINDOW_MS) {
      visitors.delete(id)
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const visitorId =
      typeof body?.visitorId === 'string' && body.visitorId.length > 0
        ? body.visitorId.slice(0, 100)
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const now = Date.now()
    visitors.set(visitorId, now)
    prune() // prune on every write

    // Count active visitors (seen in the last 15 minutes)
    let count = 0
    for (const ts of visitors.values()) {
      if (now - ts < WINDOW_MS) count++
    }

    return NextResponse.json({
      success: true,
      count,
      windowMinutes: 15,
      registered: true,
      visitorId, // echo back so client knows its own ID
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not register visitor.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const now = Date.now()
  prune() // prune on every read

  // Optional: exclude a specific visitor (so the client can ask
  // "how many OTHER people are here?")
  const excludeId = req.nextUrl.searchParams.get('exclude')

  // Count active visitors
  let totalCount = 0
  let otherCount = 0
  for (const [id, ts] of visitors) {
    if (now - ts < WINDOW_MS) {
      totalCount++
      if (id !== excludeId) otherCount++
    }
  }

  return NextResponse.json({
    success: true,
    count: totalCount,
    otherCount, // visitors excluding the requester
    windowMinutes: 15,
    isOnlyVisitor: totalCount <= 1,
  })
}
