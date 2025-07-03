"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Clock, MessageSquare, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettings {
  enabled: boolean
  customMessage: string
  reminderTime: string
  frequency: "daily" | "weekly" | "custom"
  daysInAdvance: number
}

export default function NotificationSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    customMessage: "課題の締切が近づいています！忘れずに提出しましょう 📚",
    reminderTime: "09:00",
    frequency: "daily",
    daysInAdvance: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check current notification permission status
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission)
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "通知がサポートされていません",
        description: "このブラウザは通知機能をサポートしていません",
        variant: "destructive",
      })
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    setPermissionStatus(permission)

    if (permission === "granted") {
      toast({
        title: "通知が有効になりました",
        description: "課題のリマインダー通知を受け取ることができます",
      })
      return true
    } else {
      toast({
        title: "通知が拒否されました",
        description: "ブラウザの設定から通知を許可してください",
        variant: "destructive",
      })
      return false
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsLoading(true)

    if (enabled) {
      const hasPermission = await requestNotificationPermission()
      if (!hasPermission) {
        setIsLoading(false)
        return
      }

      // Send test notification
      new Notification("通知設定完了", {
        body: "課題リマインダーが有効になりました！",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })

      toast({
        title: "通知が有効になりました",
        description: "設定した時間に課題のリマインダーが送信されます",
      })
    } else {
      toast({
        title: "通知が無効になりました",
        description: "課題のリマインダー通知は送信されません",
      })
    }

    saveSettings({ ...settings, enabled })
    setIsLoading(false)
  }

  const handleTestNotification = () => {
    if (permissionStatus !== "granted") {
      toast({
        title: "通知の許可が必要です",
        description: "まず通知を有効にしてください",
        variant: "destructive",
      })
      return
    }

    new Notification("テスト通知", {
      body: settings.customMessage,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    })

    toast({
      title: "テスト通知を送信しました",
      description: "設定したメッセージで通知が表示されます",
    })
  }

  const getStatusBadge = () => {
    if (!settings.enabled) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          <BellOff className="h-3 w-3 mr-1" />
          無効
        </Badge>
      )
    }

    if (permissionStatus === "granted") {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          有効
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        許可が必要
      </Badge>
    )
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return [`${hour}:00`, `${hour}:30`]
  }).flat()

  return (
    <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            <CardTitle className="text-xl text-green-800">通知設定</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-green-600">課題の締切リマインダー通知を設定できます</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <Label className="text-base font-medium text-green-800">プッシュ通知</Label>
              <p className="text-sm text-green-600">課題のリマインダー通知を受け取る</p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        {/* Settings Panel - Only show when enabled */}
        {settings.enabled && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            {/* Custom Message */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-green-700">
                <MessageSquare className="h-4 w-4" />
                カスタムメッセージ
              </Label>
              <Input
                value={settings.customMessage}
                onChange={(e) =>
                  saveSettings({
                    ...settings,
                    customMessage: e.target.value,
                  })
                }
                placeholder="リマインダーメッセージを入力..."
                className="border-green-200 focus-visible:ring-green-500"
              />
              <p className="text-xs text-gray-500">通知で表示されるメッセージをカスタマイズできます</p>
            </div>

            {/* Time Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-green-700">
                  <Clock className="h-4 w-4" />
                  通知時刻
                </Label>
                <Select
                  value={settings.reminderTime}
                  onValueChange={(value) =>
                    saveSettings({
                      ...settings,
                      reminderTime: value,
                    })
                  }
                >
                  <SelectTrigger className="border-green-200 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-green-700">通知頻度</Label>
                <Select
                  value={settings.frequency}
                  onValueChange={(value: "daily" | "weekly" | "custom") =>
                    saveSettings({
                      ...settings,
                      frequency: value,
                    })
                  }
                >
                  <SelectTrigger className="border-green-200 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">毎日</SelectItem>
                    <SelectItem value="weekly">毎週</SelectItem>
                    <SelectItem value="custom">カスタム</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days in Advance */}
            <div className="space-y-2">
              <Label className="text-green-700">締切の何日前に通知</Label>
              <Select
                value={settings.daysInAdvance.toString()}
                onValueChange={(value) =>
                  saveSettings({
                    ...settings,
                    daysInAdvance: Number.parseInt(value),
                  })
                }
              >
                <SelectTrigger className="border-green-200 focus:ring-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">当日</SelectItem>
                  <SelectItem value="1">1日前</SelectItem>
                  <SelectItem value="2">2日前</SelectItem>
                  <SelectItem value="3">3日前</SelectItem>
                  <SelectItem value="7">1週間前</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Notification Button */}
            <div className="pt-2">
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
                disabled={!settings.enabled || permissionStatus !== "granted"}
              >
                <Bell className="h-4 w-4 mr-2" />
                テスト通知を送信
              </Button>
            </div>
          </div>
        )}

        {/* Current Settings Summary */}
        {settings.enabled && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">現在の設定</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• 通知時刻: {settings.reminderTime}</p>
              <p>
                • 頻度:{" "}
                {settings.frequency === "daily" ? "毎日" : settings.frequency === "weekly" ? "毎週" : "カスタム"}
              </p>
              <p>• 締切の{settings.daysInAdvance}日前に通知</p>
              <p>• メッセージ: "{settings.customMessage}"</p>
            </div>
          </div>
        )}

        {/* Permission Status Info */}
        {permissionStatus === "denied" && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">通知が拒否されています</h4>
                <p className="text-sm text-red-700 mt-1">
                  ブラウザの設定から通知を許可してください。アドレスバーの左側にある鍵アイコンをクリックして、通知を「許可」に変更してください。
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
