
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserForAuth, updateLastLogin } from '@/utils/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'ユーザーIDとパスワードが必要です' },
        { status: 400 }
      )
    }

    // ユーザーを取得
    const user = await getUserForAuth(userId)
    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // パスワードを検証
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // 最後のログイン時間を更新
    await updateLastLogin(userId)

    // セッション情報をレスポンスに設定
    const response = NextResponse.json(
      { message: 'ログインしました', userId: user.id },
      { status: 200 }
    )

    // セッションクッキーを設定（1時間の有効期限）
    response.cookies.set('session', JSON.stringify({
      userId: user.id,
      loginTime: Date.now()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1時間
    })

    return response
  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
