
import { NextRequest, NextResponse } from 'next/server'
import { getFriends, addFriend, removeFriend } from '@/utils/db'

// GET: 友達リストを取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'ユーザーIDが必要です' },
      { status: 400 }
    )
  }

  try {
    const friends = await getFriends(userId)
    return NextResponse.json(friends)
  } catch (error) {
    console.error('友達リスト取得エラー:', error)
    return NextResponse.json(
      { error: '友達リストの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 友達を追加
export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json()

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'ユーザーIDと友達IDが必要です' },
        { status: 400 }
      )
    }

    const success = await addFriend(userId, friendId)

    if (!success) {
      return NextResponse.json(
        { error: '友達の追加に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: '友達が追加されました' })
  } catch (error) {
    console.error('友達追加エラー:', error)
    return NextResponse.json(
      { error: '友達の追加に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 友達を削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const friendId = searchParams.get('friendId')

  if (!userId || !friendId) {
    return NextResponse.json(
      { error: 'ユーザーIDと友達IDが必要です' },
      { status: 400 }
    )
  }

  try {
    await removeFriend(userId, friendId)
    return NextResponse.json({ message: '友達関係が削除されました' })
  } catch (error) {
    console.error('友達削除エラー:', error)
    return NextResponse.json(
      { error: '友達の削除に失敗しました' },
      { status: 500 }
    )
  }
}
