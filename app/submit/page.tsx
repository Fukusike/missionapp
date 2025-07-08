"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Camera, ImageIcon, X, Scan, BookOpen } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getUser, submitAssignment, type UserData, getCurrentUser } from "@/utils/user-store"
import { judgeAssignment, type AssignmentJudgment } from "@/utils/course-store"
import AssignmentJudgmentDisplay from "@/components/assignment-judgment"
import { useToast } from "@/hooks/use-toast"

export default function SubmitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignmentImage, setAssignmentImage] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [judgment, setJudgment] = useState<AssignmentJudgment | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // ユーザーデータを取得
    const loadUserData = async () => {
      const userData = await getUser()
      if (!userData) {
        // ユーザーデータがない場合は登録ページにリダイレクト
        router.push("/register")
        return
      }

      setUser(userData)
    }

    loadUserData()
  }, [router, isMounted])

  // ユーザー情報と講義データを取得
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user?.id) {
      fetchCourses(user.id)
    }
  }, [])

  const fetchCourses = async (userId: string) => {
    try {
      const response = await fetch('/api/courses', {
        headers: {
          'x-user-id': userId,
        },
      })

      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('講義取得エラー:', error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAssignmentImage(e.target?.result as string)
        setJudgment(null) // 新しい画像がアップロードされたら判定結果をクリア
      }
      reader.readAsDataURL(file)
    }
  }

  // テキスト正規化（表記揺れ吸収）関数
  const normalizeText = (text: string): string => {
    if (!text) return '';

    const zenkakuToHankakuMap: { [key: string]: string } = {
      '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
      'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E', 'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
      'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O', 'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
      'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y', 'Ｚ': 'Z',
      'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j',
      'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't',
      'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
      'Ⅰ': '1', 'Ⅱ': '2', 'Ⅲ': '3', 'Ⅳ': '4', 'Ⅴ': '5',
      '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5', '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9', '⑩': '10',
      '　': ' '
    };

    return text
      .replace(/[０-９Ａ-Ｚａ-ｚⅠ-Ⅴ①-⑩　]/g, (s) => zenkakuToHankakuMap[s] || s)
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  };

  const analyzeImage = async () => {
    if (!assignmentImage) return

    setIsAnalyzing(true)
    setJudgment(null)

    try {
      const result = await (await import("tesseract.js")).recognize(assignmentImage, "jpn+eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            const progress = Math.round(m.progress * 100)
            console.log(`OCR進行状況: ${progress}%`)
          }
        },
      })

      const detectedText = result.data.text
      console.log("検出されたテキスト:", detectedText)

      // テキストを正規化して表記揺れを吸収
      const normalizedText = normalizeText(detectedText)
      console.log("正規化後のテキスト:", normalizedText)

      // 課題判定を実行（正規化されたテキストと元のテキスト両方を使用）
      const assignmentJudgment = judgeAssignment(detectedText, normalizedText)
      setJudgment(assignmentJudgment)

      toast({
        title: "画像解析完了",
        description: assignmentJudgment.isValid ? "課題として認定されました！" : "課題として認定されませんでした",
        variant: assignmentJudgment.isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("OCR解析エラー:", error)
      toast({
        title: "エラー",
        description: "画像の解析に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
      setJudgment(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!judgment) {
      toast({
        title: "画像解析が必要です",
        description: "まず「画像を解析」ボタンを押して課題判定を行ってください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // 課題タイプを定義
    const assignmentType = judgment.isValid ? "valid" : "invalid";
    const imageSrc = assignmentImage || "";

    // 課題提出をAPIに送信
    const success = await submitAssignment(assignmentType, 10, imageSrc)

    if (success) {
      // 成功時の処理 - confettiを動的にインポート
      try {
        const confettiModule = await import("canvas-confetti")
        const confetti = confettiModule.default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      } catch (error) {
        console.error("Failed to load confetti:", error)
      }

      // 成功ページにリダイレクト
      router.push("/submit/success")
    } else {
      toast({
        title: "エラー",
        description: "課題の提出に失敗しました",
        variant: "destructive",
      })
    }
  }

  const clearImage = () => {
    setAssignmentImage(null)
    setJudgment(null)
  }

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
        <div className="container max-w-2xl mx-auto py-8 text-center">
          <h1 className="text-2xl text-green-800">読み込み中...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          ← ホームに戻る
        </Button>

        <div className="space-y-6">
          <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">課題を提出する</CardTitle>
              <CardDescription className="text-green-600">
                課題を完了した証拠の画像をアップロードしましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-green-700">課題の証拠画像</Label>

                  {assignmentImage ? (
                    <div className="relative rounded-md overflow-hidden border border-green-200">
                      <Image
                        src={assignmentImage || "/placeholder.svg"}
                        alt="課題の証拠"
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Label
                        htmlFor="camera-upload"
                        className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-green-300 rounded-md cursor-pointer hover:bg-green-50 transition-colors"
                      >
                        <Camera className="h-8 w-8 text-green-600" />
                        <span className="text-green-700 text-center">カメラで撮影</span>
                        <Input
                          id="camera-upload"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </Label>

                      <Label
                        htmlFor="gallery-upload"
                        className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-green-300 rounded-md cursor-pointer hover:bg-green-50 transition-colors"
                      >
                        <ImageIcon className="h-8 w-8 text-green-600" />
                        <span className="text-green-700 text-center">ギャラリーから選択</span>
                        <Input
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </Label>
                    </div>
                  )}
                </div>

                {/* 画像解析ボタン */}
                {assignmentImage && (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          画像を解析中...
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4 mr-2" />
                          画像を解析
                        </>
                      )}
                    </Button>

                    {courses.length === 0 && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800">講義が登録されていません</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                課題判定の精度を上げるために、履修している講義を登録することをお勧めします。
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="mt-2 bg-yellow-500 hover:bg-yellow-600"
                                onClick={() => router.push("/courses")}
                              >
                                講義を登録する
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-green-700">
                    コメント（任意）
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="課題についてのコメントを入力"
                    className="border-green-200 focus-visible:ring-green-500"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={!assignmentImage || !judgment || isLoading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isLoading ? "提出中..." : "課題を提出する"}
              </Button>
            </CardFooter>
          </Card>

          {/* 判定結果表示 */}
          {judgment && <AssignmentJudgmentDisplay judgment={judgment} />}
        </div>
      </div>
    </div>
  )
}