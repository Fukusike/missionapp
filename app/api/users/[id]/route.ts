
import { NextRequest, NextResponse } from 'next/server'
import { getUser, deleteUser, updateLastLogin } from '@/utils/db'

// GET: 特定ユーザーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser(params.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 最後のログイン時間を更新
    await updateLastLogin(params.id)

    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: ユーザーを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteUser(params.id)
    return NextResponse.json({ message: 'ユーザーが削除されました' })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    )
  }
}
