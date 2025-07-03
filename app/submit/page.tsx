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
import { getUser, saveUser } from "@/utils/user-store"
import { getCourses, judgeAssignment, type AssignmentJudgment } from "@/utils/course-store"
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

  useEffect(() => {
    // ユーザーデータを取得
    const userData = getUser()
    if (!userData) {
      // ユーザーデータがない場合は登録ページにリダイレクト
      router.push("/register")
      return
    }

    setUser(userData)
    setCourses(getCourses())
  }, [router])

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

  const analyzeImage = async () => {
    if (!assignmentImage) return

    setIsAnalyzing(true)

    try {
      // Tesseract.jsを動的にインポート
      const Tesseract = await import("tesseract.js")

      // OCR処理を実行
      const result = await Tesseract.recognize(assignmentImage, "jpn+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR進行状況: ${Math.round(m.progress * 100)}%`)
          }
        },
      })

      const detectedText = result.data.text
      console.log("検出されたテキスト:", detectedText)

      // 課題判定を実行
      const assignmentJudgment = judgeAssignment(detectedText)
      setJudgment(assignmentJudgment)

      toast({
        title: "画像解析完了",
        description: assignmentJudgment.isValid ? "課題として認定されました！" : "課題として認定されませんでした",
        variant: assignmentJudgment.isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("OCR処理エラー:", error)
      toast({
        title: "解析エラー",
        description: "画像の解析に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
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

    // ユーザーデータを更新
    if (user) {
      let updatedUser = { ...user }

      if (judgment.isValid) {
        // 課題として認定された場合のみポイント付与
        const points = 10
        updatedUser = {
          ...user,
          points: user.points + points,
          submissions: user.submissions + 1,
        }

        // 初めての提出の場合は称号を追加
        if (user.submissions === 0) {
          updatedUser.badges = [...(user.badges || []), "勤勉な学習者"]
        }

        toast({
          title: "課題提出完了！",
          description: `+${points}ポイント獲得しました！`,
        })
      } else {
        // 課題として認定されなかった場合はポイント付与なし
        toast({
          title: "提出完了",
          description: "課題として認定されなかったため、ポイントは付与されませんでした",
          variant: "destructive",
        })
      }

      // ユーザーデータを保存
      saveUser(updatedUser)
    }

    // 仮の処理（実際の実装では適切なデータ保存処理に置き換える）
    setTimeout(() => {
      setIsLoading(false)
      // 提出後は成功画面に遷移
      router.push("/submit/success")
    }, 1000)
  }

  const clearImage = () => {
    setAssignmentImage(null)
    setJudgment(null)
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
