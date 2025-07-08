"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Copy, Check, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { generateUserId, saveUser, getUser } from "@/utils/user-store"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  // ページロード時に既存のユーザーデータをチェック
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const existingUser = await getUser()
        if (existingUser) {
          // 既にユーザー登録済みの場合はプロフィールページにリダイレクト
          router.push("/profile")
          return
        }
        // 新規ユーザーの場合はユーザーIDを生成（クライアント側でのみ）
        setUserId(generateUserId())
      } catch (error) {
        console.error("ユーザーチェックエラー:", error)
        // エラーが発生してもユーザーIDは生成する
        setUserId(generateUserId())
      } finally {
        setIsCheckingUser(false)
      }
    }

    checkExistingUser()
  }, [router])

  // チェック中の表示
  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl text-green-800">読み込み中...</h1>
        </div>
      </div>
    )
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
    navigator.clipboard.writeText(userId)
    setCopied(true)
    toast({
      title: "コピーしました",
      description: "ユーザーIDがクリップボードにコピーされました",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.trim() === "") {
      toast({
        title: "エラー",
        description: "ニックネームを入力してください",
        variant: "destructive",
      })
      return
    }

    if (!email || email.trim() === "") {
      toast({
        title: "エラー",
        description: "メールアドレスを入力してください",
        variant: "destructive",
      })
      return
    }

    // 簡単なメールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "エラー",
        description: "正しいメールアドレス形式で入力してください",
        variant: "destructive",
      })
      return
    }

    if (!password || password.length < 8) {
      toast({
        title: "エラー",
        description: "パスワードは8文字以上で入力してください",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "エラー",
        description: "パスワードが一致しません",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // ユーザーデータを保存
    const userData = {
      id: userId,
      name: name.trim(),
      email: email.trim(),
      password: password,
      profileImage: profileImage,
      profileImageFile: profileImage, // Base64データとして送信
      points: 0,
      submissions: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    }

    await saveUser(userData)

    // 登録完了を表示
    toast({
      title: "登録完了",
      description: "プロフィールが作成されました",
    })

    // 少し待ってからリダイレクト
    setTimeout(() => {
      setIsLoading(false)
      router.push("/profile")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-800">ユーザー登録</CardTitle>
          <CardDescription className="text-green-600">プロフィール情報を入力して始めましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">
                ニックネーム
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ニックネームを入力"
                required
                className="border-green-200 focus-visible:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                required
                className="border-green-200 focus-visible:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-id" className="text-green-700">
                あなたのユーザーID
              </Label>
              <div className="flex items-center space-x-2">
                <Input id="user-id" value={userId} readOnly className="border-green-200 bg-green-50 font-mono" />
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
              <p className="text-xs text-green-600 mt-1">
                このIDを友達と交換すると、お互いのランキングを見ることができます
              </p>
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
                  placeholder="8文字以上のパスワードを入力"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-green-700">
                パスワード確認
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  className="border-green-200 focus-visible:ring-green-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image" className="text-green-700">
                プロフィール画像
              </Label>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-2 border-green-200">
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full">
                  <Label
                    htmlFor="profile-image-upload"
                    className="flex items-center justify-center gap-2 p-2 border border-dashed border-green-300 rounded-md cursor-pointer hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">画像をアップロード</span>
                  </Label>
                  <Input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={!name || !email || !password || !confirmPassword || isLoading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isLoading ? "登録中..." : "登録する"}
          </Button>

          <div className="text-center text-sm text-green-600">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-green-700 hover:underline font-medium">
              こちら
            </Link>
            {" "}からログイン
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}