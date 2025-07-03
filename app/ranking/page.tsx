
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Trophy, Users, Star } from "lucide-react"
import { getUser, getFriends, getRankingData, type UserData, type Friend } from "@/utils/user-store"
import { useToast } from "@/hooks/use-toast"

export default function RankingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [allUsers, setAllUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const loadData = async () => {
      try {
        const userData = await getUser()
        if (!userData) {
          router.push("/register")
          return
        }
        
        setCurrentUser(userData)
        
        // 友達リストと全体ランキングを並行して取得
        const [friendsData, rankingData] = await Promise.all([
          getFriends(),
          getRankingData()
        ])
        
        setFriends(friendsData)
        setAllUsers(rankingData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "エラー",
          description: "データの読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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

  if (!currentUser) {
    return null
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />
    return <Star className="h-5 w-5 text-green-500" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-200"
    if (rank === 2) return "bg-gray-50 border-gray-200"
    if (rank === 3) return "bg-amber-50 border-amber-200"
    return "bg-white border-green-200"
  }

  const currentUserRank = allUsers.findIndex(user => user.id === currentUser.id) + 1

  const RankingList = ({ users, title, showCurrentUser = false }: { 
    users: (UserData | Friend)[], 
    title: string,
    showCurrentUser?: boolean 
  }) => (
    <div className="space-y-3">
      {showCurrentUser && currentUser && (
        <Card className={`${getRankColor(currentUserRank)} border-2`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(currentUserRank)}
                  <span className="font-bold text-lg">#{currentUserRank}</span>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentUser.profileImage || ""} />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{currentUser.name}</div>
                  <Badge variant="outline" className="text-xs">あなた</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-green-800">{currentUser.points}pt</div>
                <div className="text-sm text-gray-600">{currentUser.submissions}回提出</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {users.map((user, index) => {
        const rank = index + 1
        const isCurrentUser = user.id === currentUser.id
        
        if (showCurrentUser && isCurrentUser) return null
        
        return (
          <Card key={user.id} className={`${getRankColor(rank)} ${isCurrentUser ? 'border-2' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(rank)}
                    <span className="font-bold text-lg">#{rank}</span>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.profileImage || ""} />
                    <AvatarFallback className="bg-green-100 text-green-800">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">あなた</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-800">{user.points}pt</div>
                  {('submissions' in user) && (
                    <div className="text-sm text-gray-600">{user.submissions}回提出</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push("/")} className="border-green-200 text-green-700">
            <Home className="h-4 w-4 mr-2" />
            ホーム
          </Button>
          <h1 className="text-2xl font-bold text-green-800">ランキング</h1>
          <div className="w-20" />
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-green-100">
            <TabsTrigger value="friends" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 mr-2" />
              友達ランキング
            </TabsTrigger>
            <TabsTrigger value="global" className="data-[state=active]:bg-white">
              <Trophy className="h-4 w-4 mr-2" />
              全体ランキング
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">友達ランキング</CardTitle>
                <CardDescription className="text-green-600">
                  友達との競争でモチベーションアップ！
                </CardDescription>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>まだ友達が追加されていません</p>
                    <p className="text-sm">プロフィールページから友達を追加してみましょう</p>
                  </div>
                ) : (
                  <RankingList 
                    users={[currentUser, ...friends].sort((a, b) => b.points - a.points)} 
                    title="友達ランキング"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global" className="mt-6">
            <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-800">全体ランキング</CardTitle>
                <CardDescription className="text-green-600">
                  全ユーザーの中での順位を確認しよう！
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RankingList 
                  users={allUsers} 
                  title="全体ランキング"
                  showCurrentUser={currentUserRank > 10}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
