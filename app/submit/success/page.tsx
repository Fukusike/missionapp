"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Trophy } from "lucide-react"
import { useEffect } from "react"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // クライアントサイドでのみconfettiをロードして実行
    const loadAndRunConfetti = async () => {
      try {
        const confettiModule = await import("canvas-confetti")
        const confetti = confettiModule.default

        const duration = 3 * 1000
        const end = Date.now() + duration
        const colors = ["#4ade80", "#22c55e", "#16a34a"]

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          })
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }

        frame()
      } catch (error) {
        console.error("Failed to load confetti:", error)
      }
    }

    loadAndRunConfetti()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200 bg-white/90 backdrop-blur-sm text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">ミッション完了！</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-4">
            <p className="text-green-700">課題の提出が完了しました！</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-green-800 font-medium">
                <Trophy className="h-5 w-5 text-green-600" />
                <span>+10 ポイント獲得！</span>
              </div>
              <p className="text-sm text-green-600 mt-1">「勤勉な学習者」の称号を獲得しました</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => router.push("/profile")} className="w-full bg-green-500 hover:bg-green-600">
            マイプロフィールを見る
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/ranking")}
            className="w-full border-green-500 text-green-600 hover:bg-green-50"
          >
            ランキングを確認する
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
