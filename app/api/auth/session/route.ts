
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    const session = JSON.parse(sessionCookie.value)
    const now = Date.now()
    const sessionAge = now - session.loginTime

    // 1時間 = 60 * 60 * 1000 = 3600000ms
    if (sessionAge > 3600000) {
      return NextResponse.json({ authenticated: false, expired: true }, { status: 200 })
    }

    return NextResponse.json({ 
      authenticated: true, 
      userId: session.userId 
    }, { status: 200 })
  } catch (error) {
    console.error('セッションチェックエラー:', error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
