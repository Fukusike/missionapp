
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId || !password) {
      toast({
        title: "エラー",
        description: "ユーザーIDとパスワードを入力してください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
        }),
      })

      if (response.ok) {
        toast({
          title: "ログイン成功",
          description: "マイプロフィールページに移動します",
        })
        
        // セッション情報をlocalStorageに保存
        localStorage.setItem('currentUserId', userId.trim())
        
        // プロフィールページに遷移
        router.push("/profile")
      } else {
        const error = await response.json()
        toast({
          title: "ログイン失敗",
          description: error.error || "ログインに失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "エラー",
        description: "ネットワークエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-800">ログイン</CardTitle>
          <CardDescription className="text-green-600">
            ユーザーIDとパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-green-700">
                ユーザーID
              </Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ユーザーIDを入力"
                required
                className="border-green-200 focus-visible:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700">
                パスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                  className="border-green-200 focus-visible:ring-green-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={!userId || !password || isLoading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isLoading ? (
              "ログイン中..."
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                ログイン
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-green-600">
            アカウントをお持ちでない方は{" "}
            <Link href="/register" className="text-green-700 hover:underline font-medium">
              こちら
            </Link>
            {" "}から登録
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
