
import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, upsertUser } from '@/utils/db'
import bcrypt from 'bcryptjs'

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

    // パスワードがある場合はハッシュ化
    let passwordHash = undefined
    if (userData.password) {
      if (userData.password.length < 8) {
        return NextResponse.json(
          { error: 'パスワードは8文字以上である必要があります' },
          { status: 400 }
        )
      }
      passwordHash = await bcrypt.hash(userData.password, 12)
    }

    const user = await upsertUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      profileImage: userData.profileImage,
      points: userData.points,
      submissions: userData.submissions,
      badges: userData.badges,
      passwordHash: passwordHash
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
