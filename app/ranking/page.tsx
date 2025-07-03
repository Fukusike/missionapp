"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Medal, Trophy, Users } from "lucide-react"
import { getUser, getAllRegisteredUsers, getAllMockUsers, getFriendsData, getFriends, type User } from "@/utils/user-store"

export default function RankingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [friendUsers, setFriendUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // ユーザーデータを取得
    const userData = getUser()
    if (!userData) {
      // ユーザーデータがない場合は登録ページにリダイレクト
      router.push("/register")
      return
    }

    setUser(userData)

    // 全ユーザーのランキングデータを取得
    const mockUsers = getAllMockUsers()
    const registeredUsers = Object.values(getAllRegisteredUsers())

    // モックユーザーと登録ユーザーを結合（重複を除く）
    const uniqueUsers = new Map<string, User>()

    // モックユーザーを追加
    mockUsers.forEach((user) => {
      uniqueUsers.set(user.id, user)
    })

    // 登録ユーザーを追加（同じIDがあれば上書き）
    registeredUsers.forEach((user) => {
      uniqueUsers.set(user.id, user)
    })

    // 自分のデータも追加
    if (userData.submissions > 0 || userData.points > 0) {
      uniqueUsers.set(userData.id, userData)
    }

    // Mapから配列に変換してポイント順にソート
    const allUsersData = Array.from(uniqueUsers.values())
    allUsersData.sort((a, b) => b.points - a.points)
    setAllUsers(allUsersData)

    // 友達のデータを取得
    const friendsData = getFriendsData()

    // 自分のデータも追加
    friendsData.push(userData)

    // ポイント順にソート
    friendsData.sort((a, b) => b.points - a.points)
    setFriendUsers(friendsData)
  }, [router])

  // メダルの色を取得する関数
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-600"
      default:
        return "text-green-600"
    }
  }

  if (!isClient || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
        <div className="container max-w-md mx-auto py-4 text-center">
          <h1 className="text-2xl text-green-800">読み込み中...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="container max-w-md mx-auto py-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>

        <Card className="border-green-200 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">ランキング</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                >
                  全体ランキング
                </TabsTrigger>
                <TabsTrigger
                  value="friends"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                >
                  <Users className="mr-2 h-4 w-4" />
                  友達ランキング
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="space-y-3">
                  {allUsers.length > 0 ? (
                    allUsers.map((rankUser, index) => (
                      <div
                        key={rankUser.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index < 3 ? "bg-green-100" : "bg-green-50"
                        } ${rankUser.id === user.id ? "border-2 border-green-500" : ""} hover:bg-green-100 transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full ${
                              index < 3 ? "bg-white" : "bg-green-100"
                            }`}
                          >
                            <Medal className={`h-4 w-4 ${getMedalColor(index + 1)}`} />
                          </div>
                          <Avatar className="w-8 h-8 border border-green-200">
                            <AvatarImage src={rankUser.profileImage || ""} />
                            <AvatarFallback className="bg-green-50 text-green-800">
                              {rankUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-green-800">
                              {rankUser.name}
                              {rankUser.id === user.id && <span className="text-green-600 ml-1">(あなた)</span>}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-green-600">{rankUser.submissions}回提出</span>
                              <span className="text-xs text-green-600">•</span>
                              <span className="text-xs text-green-600">{rankUser.points}ポイント</span>
                            </div>
                          </div>
                        </div>

                        {rankUser.badges && rankUser.badges.length > 0 && (
                          <Badge className="bg-green-200 text-green-800 hover:bg-green-300">{rankUser.badges[0]}</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-green-600">まだランキングデータがありません</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="friends" className="mt-0">
                <div className="space-y-3">
                  {friendUsers.length > 0 ? (
                    friendUsers.map((rankUser, index) => (
                      <div
                        key={rankUser.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index < 3 ? "bg-green-100" : "bg-green-50"
                        } ${rankUser.id === user.id ? "border-2 border-green-500" : ""} hover:bg-green-100 transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full ${
                              index < 3 ? "bg-white" : "bg-green-100"
                            }`}
                          >
                            <Medal className={`h-4 w-4 ${getMedalColor(index + 1)}`} />
                          </div>
                          <Avatar className="w-8 h-8 border border-green-200">
                            <AvatarImage src={rankUser.profileImage || ""} />
                            <AvatarFallback className="bg-green-50 text-green-800">
                              {rankUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-green-800">
                              {rankUser.name}
                              {rankUser.id === user.id && <span className="text-green-600 ml-1">(あなた)</span>}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-green-600">{rankUser.submissions}回提出</span>
                              <span className="text-xs text-green-600">•</span>
                              <span className="text-xs text-green-600">{rankUser.points}ポイント</span>
                            </div>
                          </div>
                        </div>

                        {rankUser.badges && rankUser.badges.length > 0 && (
                          <Badge className="bg-green-200 text-green-800 hover:bg-green-300">{rankUser.badges[0]}</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-green-600">まだ友達を追加していません</p>
                      <Button className="mt-4 bg-green-500 hover:bg-green-600" onClick={() => router.push("/profile")}>
                        友達を追加する
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
