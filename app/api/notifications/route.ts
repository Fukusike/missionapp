
import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getUnreadNotificationCount } from '@/utils/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    const notifications = await getUserNotifications(userId)
    
    // 通知データを適切な形式に変換
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      fromUserId: notification.from_user_id,
      fromUserName: notification.from_user_name,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at)
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error('通知取得エラー:', error)
    return NextResponse.json({ error: '通知の取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { notificationId, action, userId } = await request.json()

    if (action === 'markAsRead') {
      await markNotificationAsRead(notificationId)
      return NextResponse.json({ message: '通知を既読にしました' })
    } else if (action === 'markAllAsRead') {
      await markAllNotificationsAsRead(userId)
      return NextResponse.json({ message: 'すべての通知を既読にしました' })
    }

    return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
  } catch (error) {
    console.error('通知更新エラー:', error)
    return NextResponse.json({ error: '通知の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json()

    await deleteNotification(notificationId)
    return NextResponse.json({ message: '通知を削除しました' })
  } catch (error) {
    console.error('通知削除エラー:', error)
    return NextResponse.json({ error: '通知の削除に失敗しました' }, { status: 500 })
  }
}
