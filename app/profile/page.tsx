"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Home, Edit, Copy, Check, LogOut, UserPlus } from "lucide-react"
import { getUser, updateUser, addFriend, logout, type UserData } from "@/utils/user-store"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [friendId, setFriendId] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadUser = async () => {
      try {
        const userData = await getUser()
        if (!userData) {
          router.push("/register")
          return
        }
        setUser(userData)
        setEditedName(userData.name)
        setEditedEmail(userData.email || "")
        setProfileImage(userData.profileImage || null)
      } catch (error) {
        console.error('Error loading user:', error)
        toast({
          title: "エラー",
          description: "ユーザー情報の読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router, toast])

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl text-green-800">読み込み中...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id)
    setCopied(true)
    toast({
      title: "コピーしました",
      description: "ユーザーIDがクリップボードにコピーされました",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast({
        title: "エラー",
        description: "ニックネームを入力してください",
        variant: "destructive",
      })
      return
    }

    if (!editedEmail.trim()) {
      toast({
        title: "エラー",
        description: "メールアドレスを入力してください",
        variant: "destructive",
      })
      return
    }

    // 簡単なメールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editedEmail.trim())) {
      toast({
        title: "エラー",
        description: "正しいメールアドレス形式で入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedUser = await updateUser({
        name: editedName.trim(),
        email: editedEmail.trim(),
        profileImage: profileImage,
      })

      if (updatedUser) {
        setUser(updatedUser)
        setIsEditDialogOpen(false)
        toast({
          title: "保存完了",
          description: "プロフィールが更新されました",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleAddFriend = async () => {
    if (!friendId.trim()) {
      toast({
        title: "エラー",
        description: "友達のユーザーIDを入力してください",
        variant: "destructive",
      })
      return
    }

    if (friendId.trim() === user.id) {
      toast({
        title: "エラー",
        description: "自分自身を友達に追加することはできません",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await addFriend(friendId.trim())
      if (result.success) {
        setFriendId("")
        setIsAddFriendDialogOpen(false)
        toast({
          title: "友達申請完了",
          description: result.message || "友達申請を送信しました",
        })
      } else {
        toast({
          title: "エラー",
          description: result.message || "友達の追加に失敗しました。ユーザーIDを確認してください",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "友達の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()

        // ローカルストレージをクリア
        localStorage.removeItem('user')

        toast({
          title: "ログアウト",
          description: "ログアウトしました",
        })

        // ログイン画面にリダイレクト
        router.push(data.redirect || '/login')
      } else {
        throw new Error('ログアウトに失敗しました')
      }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push("/")} className="border-green-200 text-green-700">
            <Home className="h-4 w-4 mr-2" />
            ホーム
          </Button>
          <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-700">
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="border-green-200 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24 border-4 border-green-200">
                <AvatarImage src={user.profileImage || ""} />
                <AvatarFallback className="bg-green-100 text-green-800 text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl text-green-800">{user.name}</CardTitle>
            <CardDescription className="text-green-600">
              ID: {user.id}
              {user.email && <><br />Email: {user.email}</>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{user.points}</div>
                <div className="text-sm text-green-600">ポイント</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{user.submissions}</div>
                <div className="text-sm text-green-600">提出数</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{user.badges.length}</div>
                <div className="text-sm text-green-600">バッジ</div>
              </div>
            </div>

            {user.badges.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-800 mb-2">獲得バッジ</h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {user.createdAt && (
              <p className="text-sm text-green-600">
                登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </p>
            )}

            <div className="flex gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-green-500 hover:bg-green-600">
                    <Edit className="h-4 w-4 mr-2" />
                    プロフィール編集
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>プロフィール編集</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">ニックネーム</Label>
                      <Input
                        id="edit-name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="border-green-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">メールアドレス</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="border-green-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-image">プロフィール画像</Label>
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={profileImage || ""} />
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {editedName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          id="edit-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="border-green-200"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full bg-green-500 hover:bg-green-600">
                      保存
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={copyUserId} className="border-green-200 text-green-600">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Friend Card */}
        <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-800">友達を追加</CardTitle>
            <CardDescription className="text-green-600">
              友達のユーザーIDを入力して、お互いのランキングを見ることができます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddFriendDialogOpen} onOpenChange={setIsAddFriendDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  友達を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>友達を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="friend-id">友達のユーザーID</Label>
                    <Input
                      id="friend-id"
                      value={friendId}
                      onChange={(e) => setFriendId(e.target.value)}
                      placeholder="例: ABC12345"
                      className="border-green-200 font-mono"
                    />
                  </div>
                  <Button onClick={handleAddFriend} className="w-full bg-green-500 hover:bg-green-600">
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}