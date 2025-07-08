
'use client'

import { create } from 'zustand'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  fromUserId: string
  fromUserName: string
  isRead: boolean
  createdAt: Date
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  
  // データベース連携機能
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  removeNotification: (id: string) => Promise<void>
  
  // ローカル状態管理
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  updateLocalNotification: (id: string, updates: Partial<Notification>) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  // データベースから通知を取得
  fetchNotifications: async (userId: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedNotifications = data.map((n: any) => ({
          id: n.id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          fromUserId: n.fromUserId,
          fromUserName: n.fromUserName,
          isRead: n.isRead,
          createdAt: new Date(n.createdAt)
        }))
        
        set({
          notifications: formattedNotifications,
          unreadCount: formattedNotifications.filter((n: Notification) => !n.isRead).length,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('通知取得エラー:', error)
      set({ isLoading: false })
    }
  },
  
  // 通知を既読にする
  markAsRead: async (id: string) => {
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

      if (response.ok) {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      }
    } catch (error) {
      console.error('通知更新エラー:', error)
    }
  },
  
  // すべての通知を既読にする
  markAllAsRead: async (userId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          action: 'markAllAsRead'
        }),
      })

      if (response.ok) {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }))
      }
    } catch (error) {
      console.error('通知更新エラー:', error)
    }
  },
  
  // 通知を削除する
  removeNotification: async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: parseInt(id)
        }),
      })

      if (response.ok) {
        set(state => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.isRead ? state.unreadCount - 1 : state.unreadCount
          }
        })
      }
    } catch (error) {
      console.error('通知削除エラー:', error)
    }
  },
  
  // 新しい通知をローカルに追加（リアルタイム用）
  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }
    
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },
  
  // ローカル通知を更新
  updateLocalNotification: (id: string, updates: Partial<Notification>) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, ...updates } : n
      )
    }))
  }
}))
