
'use client'

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { getCurrentUserId } from '@/utils/user-store'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  fromUserId: string
  fromUserName: string
  isRead: boolean
  createdAt: Date
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)
    if (userId) {
      fetchNotifications(userId)
    }
  }, [])

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('通知取得エラー:', error)
    }
  }

  const recentNotifications = notifications.slice(0, 5)

  const handleNotificationClick = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: parseInt(id),
          action: 'markAsRead'
        }),
      })

      if (response.ok && currentUserId) {
        // 通知を再取得
        await fetchNotifications(currentUserId)
      }
    } catch (error) {
      console.error('通知更新エラー:', error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell 
            className={`h-6 w-6 ${unreadCount > 0 ? 'text-red-500' : 'text-gray-600'}`} 
          />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">通知</h3>
            <Link 
              href="/notifications" 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              すべて見る
            </Link>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              新しい通知はありません
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.createdAt.toLocaleString('ja-JP')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
