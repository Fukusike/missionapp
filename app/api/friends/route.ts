
import { NextRequest, NextResponse } from 'next/server'
import { getFriends, addFriend, removeFriend, getUser } from '@/utils/db'

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
    const { userId, friendId, type = 'request' } = await request.json()

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

    // 通知情報を取得
    const requesterUser = await getUser(userId)
    const targetUser = await getUser(friendId)

    if (type === 'request') {
      // 友達申請の通知
      return NextResponse.json({ 
        message: '友達申請を送信しました',
        notification: {
          type: 'friend_request',
          title: '友達申請が届きました',
          message: `${requesterUser?.name || 'ユーザー'}さんから友達申請が届きました`,
          fromUserId: userId,
          fromUserName: requesterUser?.name || 'ユーザー',
          targetUserId: friendId,
          isRead: false
        }
      })
    } else if (type === 'accept') {
      // 友達申請承認の通知
      return NextResponse.json({ 
        message: '友達申請を承認しました',
        notification: {
          type: 'friend_accepted',
          title: '友達申請が承認されました',
          message: `${targetUser?.name || 'ユーザー'}さんがあなたの友達申請を承認しました`,
          fromUserId: friendId,
          fromUserName: targetUser?.name || 'ユーザー',
          targetUserId: userId,
          isRead: false
        }
      })
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
