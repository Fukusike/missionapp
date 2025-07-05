
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Users, Check, Trash2, UserCheck } from 'lucide-react'
import { useNotificationStore } from '@/utils/notification-store'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUserId } from '@/utils/user-store'
import Link from 'next/link'

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotificationStore()
  const { toast } = useToast()
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
  }, [])

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'friend_request' && !notification.isRead) {
      setSelectedNotification(notification)
      setIsApprovalDialogOpen(true)
    }
    
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  const handleApproveFriendRequest = async () => {
    if (!selectedNotification || !currentUserId) return

    setIsApproving(true)
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          requesterId: selectedNotification.fromUserId,
        }),
      })

      if (response.ok) {
        toast({
          title: "友達申請を承認しました",
          description: `${selectedNotification.fromUserName}さんと友達になりました`,
        })
        setIsApprovalDialogOpen(false)
        setSelectedNotification(null)
      } else {
        throw new Error('承認に失敗しました')
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "友達申請の承認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'friend_accepted':
        return <Check className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'border-l-blue-500'
      case 'friend_accepted':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">通知履歴</h1>
            <p className="text-green-600">
              {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : 'すべての通知を確認済みです'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            前の画面に戻る
          </Button>
        </div>

        {/* アクションボタン */}
        {notifications.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  <span className="font-medium">通知管理</span>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" size="sm">
                      すべて既読にする
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 通知リスト */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  通知はありません
                </h3>
                <p className="text-gray-500">
                  友達申請や承認があると、ここに通知が表示されます
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/30'
                } ${notification.type === 'friend_request' && !notification.isRead ? 'cursor-pointer hover:bg-blue-100/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              未読
                            </Badge>
                          )}
                          {notification.type === 'friend_request' && !notification.isRead && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              クリックして承認
                            </Badge>
                          )}
                        </div>
                        <p className={`mb-2 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>差出人: {notification.fromUserName}</span>
                          <span>
                            {notification.createdAt.toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!notification.isRead && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => removeNotification(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 友達申請承認ダイアログ */}
        <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                友達申請の承認
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedNotification && (
                  <span>
                    <strong>{selectedNotification.fromUserName}</strong>さんからの友達申請を承認しますか？
                    <br />
                    承認すると、お互いのランキングで友達として表示されるようになります。
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isApproving}>
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleApproveFriendRequest}
                disabled={isApproving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isApproving ? '承認中...' : '承認する'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
