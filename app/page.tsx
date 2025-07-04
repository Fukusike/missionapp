"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, BookOpen, User, GraduationCap } from "lucide-react"
import { getUser } from "@/utils/user-store"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // ユーザーデータをチェック（リダイレクトはしない）
    const loadUser = async () => {
      const userData = await getUser()
      setUser(userData)
    }
    loadUser()
  }, [])

  // ユーザー登録状態をチェックしてナビゲートする関数
  const navigateWithUserCheck = async (path: string) => {
    if (!isClient) return
    
    const userData = await getUser()
    if (!userData) {
      // ユーザーデータがない場合は登録ページにリダイレクト
      router.push("/register")
    } else {
      // ユーザーデータがある場合は指定されたページに遷移
      router.push(path)
    }
  }

  // クライアントサイドレンダリングが完了するまで待機
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <main className="flex-1 container max-w-md mx-auto p-4">
          <div className="space-y-6 py-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-green-800">ミッションマスター</h1>
              <p className="text-green-600">読み込み中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="space-y-6 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-green-800">ミッションマスター</h1>
            <p className="text-green-600">課題をミッションに変えて、学びを楽しもう！</p>
          </div>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="p-6">
              <div className="grid gap-4">
                <div className="text-center space-y-2">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-green-800">今日のミッション</h2>
                  <p className="text-green-600">課題を提出して、ポイントをゲットしよう！</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => navigateWithUserCheck("/submit")}
                  >
                    課題を提出する
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                    onClick={() => navigateWithUserCheck("/ranking")}
                  >
                    ランキングを見る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card
              className="border-green-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateWithUserCheck("/profile")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                <User className="h-8 w-8 text-green-600" />
                <h3 className="font-medium text-green-800">マイプロフィール</h3>
              </CardContent>
            </Card>
            <Card
              className="border-green-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateWithUserCheck("/ranking")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                <Trophy className="h-8 w-8 text-green-600" />
                <h3 className="font-medium text-green-800">ランキング</h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card
              className="border-blue-200 bg-blue-50/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateWithUserCheck("/courses")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h3 className="font-medium text-blue-800">講義管理</h3>
                <p className="text-xs text-blue-600 text-center">履修講義を登録して課題判定精度を向上</p>
              </CardContent>
            </Card>
          </div>

          {isClient && !user && (
            <Card className="border-green-200 bg-green-50/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-green-700 mb-3">まずはユーザー登録をして始めましょう！</p>
                <Button className="bg-green-500 hover:bg-green-600" onClick={() => router.push("/register")}>
                  ユーザー登録
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-green-600 bg-green-50">
        ミッションマスター © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
