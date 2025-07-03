
import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, upsertUser } from '@/utils/db'

// GET: 全ユーザーを取得
export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: ユーザーを作成/更新
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    if (!userData.id || !userData.name) {
      return NextResponse.json(
        { error: 'ユーザーIDと名前は必須です' },
        { status: 400 }
      )
    }

    const user = await upsertUser({
      id: userData.id,
      name: userData.name,
      profileImage: userData.profileImage,
      points: userData.points,
      submissions: userData.submissions,
      badges: userData.badges
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    )
  }
}
