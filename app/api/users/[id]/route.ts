
import { NextRequest, NextResponse } from 'next/server'
import { getUser, deleteUser, updateLastLogin, upsertUser } from '@/utils/db'

// GET: 特定ユーザーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUser(id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 最後のログイン時間を更新
    await updateLastLogin(id)

    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ユーザー情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userData = await request.json()
    
    // IDが一致しているかチェック
    if (userData.id && userData.id !== id) {
      return NextResponse.json(
        { error: 'URLのIDとデータのIDが一致しません' },
        { status: 400 }
      )
    }
    
    // 既存のユーザー情報を取得
    const existingUser = await getUser(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // ユーザー情報を更新（既存の値を保持）
    const updatedUser = await upsertUser({
      id,
      name: userData.name || existingUser.name,
      email: userData.email !== undefined ? userData.email : existingUser.email,
      profileImage: userData.profileImage !== undefined ? userData.profileImage : existingUser.profileImage,
      points: userData.points !== undefined ? userData.points : existingUser.points,
      submissions: userData.submissions !== undefined ? userData.submissions : existingUser.submissions,
      badges: userData.badges || existingUser.badges
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('ユーザー更新エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: ユーザーを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteUser(id)
    return NextResponse.json({ message: 'ユーザーが削除されました' })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    )
  }
}
