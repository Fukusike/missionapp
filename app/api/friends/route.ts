import { NextRequest, NextResponse } from 'next/server'
import { 
  addFriend, 
  getFriends, 
  removeFriend, 
  checkFriendshipExists, 
  approveFriendRequest, 
  getFriendRequest,
  createNotificationFromTemplate,
  getUser
} from '../../../utils/db'
import { emailService } from '@/utils/email-service'

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
    // タイムアウト処理を追加
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 8000)
    )

    const friends = await Promise.race([
      getFriends(userId),
      timeoutPromise
    ])

    return NextResponse.json(friends)
  } catch (error) {
    console.error('友達リスト取得エラー:', error)

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'リクエストがタイムアウトしました' },
        { status: 408 }
      )
    }

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

    if (type === 'request') {
      // 基本的なバリデーション
      if (userId === friendId) {
        return NextResponse.json(
          { error: '自分自身に友達申請はできません' },
          { status: 400 }
        )
      }

      console.log('Friend request attempt:', { userId, friendId })

      // 友達関係の存在チェック
      const friendshipCheck = await checkFriendshipExists(userId, friendId)

      if (friendshipCheck.exists) {
        if (friendshipCheck.type === 'approved') {
          return NextResponse.json(
            { message: '既に友達関係が成立しています' },
            { status: 200 }
          )
        } else if (friendshipCheck.type === 'pending') {
          return NextResponse.json(
            { message: '既に友達申請済みです' },
            { status: 200 }
          )
        }
      }

      const success = await addFriend(userId, friendId)

      if (!success) {
        console.error('Friend request failed:', { userId, friendId })
        return NextResponse.json(
          { error: '友達申請の送信に失敗しました' },
          { status: 400 }
        )
      }

      // 申請先ユーザーに通知を送信
      const fromUser = await getUser(userId)
      const toUser = await getUser(friendId)

      if (fromUser && toUser) {
        await createNotificationFromTemplate(
          friendId,
          'friend_request',
          { fromUserName: fromUser.name },
          userId,
          fromUser.name
        )
      }

      // 友達申請メールを送信（受信者にメールアドレスがある場合のみ）
      if (toUser?.email) {
        try {
          await emailService.sendFriendRequestEmail(
            friendId,
            toUser.email,
            userId,
            fromUser?.name || 'ユーザー'
          )
          console.log(`友達申請メール送信成功: ${toUser.email}`)
        } catch (error) {
          console.error('友達申請メール送信エラー:', error)
          // メール送信エラーは友達申請の成功に影響しない
        }
      }

      return NextResponse.json({ 
        message: '友達申請を送信しました'
      })
    }

    return NextResponse.json({ message: '不正なリクエストです' }, { status: 400 })
  } catch (error) {
    console.error('友達追加エラー:', error)
    return NextResponse.json(
      { error: '友達の追加に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: 友達申請を承認
export async function PUT(request: NextRequest) {
  try {
    const { userId, requesterId } = await request.json()

    if (!userId || !requesterId) {
      return NextResponse.json(
        { error: 'ユーザーIDと申請者IDが必要です' },
        { status: 400 }
      )
    }

    // 友達申請が存在するかチェック
    const friendRequest = await getFriendRequest(userId, requesterId)
    if (!friendRequest) {
      return NextResponse.json(
        { error: '友達申請が見つかりません' },
        { status: 404 }
      )
    }

    const success = await approveFriendRequest(userId, requesterId)

    if (!success) {
      return NextResponse.json(
        { error: '友達申請の承認に失敗しました' },
        { status: 400 }
      )
    }

    // 申請者に承認通知を送信
    const approverUser = await getUser(userId)
    const requesterUser = await getUser(requesterId)

    if (approverUser && requesterUser) {
      await createNotificationFromTemplate(
        requesterId,
        'friend_accepted',
        { fromUserName: approverUser.name },
        userId,
        approverUser.name
      )
    }

    // 友達申請承認メールを送信（申請者にメールアドレスがある場合のみ）
    if (requesterUser?.email) {
      try {
        await emailService.sendFriendAcceptedEmail(
          requesterId,
          requesterUser.email,
          userId,
          approverUser?.name || 'ユーザー'
        )
        console.log(`友達申請承認メール送信成功: ${requesterUser.email}`)
      } catch (error) {
        console.error('友達申請承認メール送信エラー:', error)
        // メール送信エラーは承認の成功に影響しない
      }
    }

    return NextResponse.json({ 
      message: '友達申請を承認しました'
    })
  } catch (error) {
    console.error('友達申請承認エラー:', error)
    return NextResponse.json(
      { error: '友達申請の承認に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 友達を削除または友達申請を拒否
export async function DELETE(request: NextRequest) {
  try {
    const { userId, friendId, type = 'remove' } = await request.json()

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'ユーザーIDと友達IDが必要です' },
        { status: 400 }
      )
    }

    if (type === 'reject') {
      // 友達申請を拒否（申請者→受信者の関係を削除）
      await removeFriend(friendId, userId)
      return NextResponse.json({ message: '友達申請を拒否しました' })
    } else {
      // 既存の友達関係を削除
      await removeFriend(userId, friendId)
      return NextResponse.json({ message: '友達関係が削除されました' })
    }
  } catch (error) {
    console.error('友達削除エラー:', error)
    return NextResponse.json(
      { error: '友達の削除に失敗しました' },
      { status: 500 }
    )
  }
}