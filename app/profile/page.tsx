"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Home, Medal, Star, Copy, Check, UserPlus, Users } from "lucide-react"
import { getUser, getFriends, addFriend, getUserById, type User } from "@/utils/user-store"
import { useToast } from "@/hooks/use-toast"
import NotificationSettings from "@/components/notification-settings"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [friendId, setFriendId] = useState("")
  const [copied, setCopied] = useState(false)
  const [friendCount, setFriendCount] = useState(0)
  const [isAddingFriend, setIsAddingFriend] = useState(false)

  useEffect(() => {
    // ユーザーデータを取得
    const userData = getUser()
    if (!userData) {
      // ユーザーデータがない場合は登録ページにリダイレクト
      router.push("/register")
      return
    }

    setUser(userData)

    // 友達の数を取得
    const friends = getFriends()
    setFriendCount(friends.length)
  }, [router])

  const copyUserId = () => {
    if (!user) return

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

  const handleAddFriend = () => {
    if (!friendId || friendId.trim() === "") {
      toast({
        title: "エラー",
        description: "友達のユーザーIDを入力してください",
        variant: "destructive",
      })
      return
    }

    setIsAddingFriend(true)

    // 友達のデータを確認（実際のユーザーとモックユーザーの両方をチェック）
    const friendData = getUserById(friendId.trim())

    if (!friendData) {
      toast({
        title: "エラー",
        description: "指定されたユーザーIDは存在しません",
        variant: "destructive",
      })
      setIsAddingFriend(false)
      return
    }

    // 友達を追加
    const added = addFriend(friendId.trim())

    if (added) {
      toast({
        title: "友達を追加しました",
        description: `${friendData.name}さんを友達に追加しました`,
      })
      setFriendCount((prev) => prev + 1)
      setFriendId("")
    } else {
      toast({
        title: "追加できませんでした",
        description: "既に追加済みか、自分自身のIDです",
        variant: "destructive",
      })
    }

    setIsAddingFriend(false)
  }

  if (!user) {
    return null // ローディング中
  }

  // 提出履歴のモックデータ
  const submissions = [
    { id: 1, date: "2023-04-20", title: "数学の宿題", points: 10 },
    { id: 2, date: "2023-04-18", title: "英語のエッセイ", points: 15 },
    { id: 3, date: "2023-04-15", title: "理科のレポート", points: 20 },
    { id: 4, date: "2023-04-10", title: "社会の調査課題", points: 10 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="container max-w-2xl mx-auto py-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="friends">友達</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-green-800">マイプロフィール</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => router.push("/ranking")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    友達のランキング
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-green-200">
                    <AvatarImage src={user.profileImage || ""} />
                    <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Medal className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 text-sm">ランキング: {user.submissions > 0 ? "5位" : "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 text-sm">{user.points} ポイント</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-green-700">あなたのユーザーID</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={user.id} readOnly className="border-green-200 bg-green-50 font-mono" />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-50"
                        onClick={copyUserId}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-green-600">
                      このIDを友達と交換して、お互いのランキングを見ることができます
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-green-700 mb-2">獲得した称号</h3>
                    {user.badges && user.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.badges.map((badge, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-600">まだ称号を獲得していません</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-green-800">提出履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">{submission.title}</p>
                            <p className="text-xs text-green-600">{submission.date}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-200 text-green-800 hover:bg-green-300">+{submission.points}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-green-600">まだ課題を提出していません</p>
                    <Button className="mt-4 bg-green-500 hover:bg-green-600" onClick={() => router.push("/submit")}>
                      課題を提出する
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-green-800">友達を追加</CardTitle>
                <CardDescription className="text-green-600">友達のユーザーIDを入力して追加しましょう</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="友達のユーザーID"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    className="border-green-200 focus-visible:ring-green-500"
                  />
                  <Button
                    type="button"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleAddFriend}
                    disabled={isAddingFriend}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    追加
                  </Button>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">{friendCount}人</span>の友達がいます
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
