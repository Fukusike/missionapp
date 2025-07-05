"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, BellOff, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettings {
  enabled: boolean
  reminderTime: string
  frequency: string
  subjects: string[]
}

export default function NotificationSettings() {
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    reminderTime: "19:00",
    frequency: "daily",
    subjects: ["math", "english"]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")

  // マウント状態の管理
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 設定の読み込み
  useEffect(() => {
    if (!isMounted) return

    const savedSettings = localStorage.getItem("notification-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // 通知許可状態をチェック
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [isMounted])

  if (!isMounted) {
    return null
  }
}