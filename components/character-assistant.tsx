"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX, Settings, X, MessageCircle, Sparkles } from "lucide-react"

interface CharacterAssistantProps {
  defaultMessage?: string
  characterName?: string
}

const defaultMessages = [
  "頑張って課題を提出しよう！📚",
  "今日も素晴らしい一日にしましょう！✨",
  "課題の締切を忘れずに！⏰",
  "新しいバッジを獲得するチャンス！🏆",
  "友達とランキングを競い合おう！🎯",
  "継続は力なり！今日も頑張って！💪",
]

export default function CharacterAssistant({
  defaultMessage = "こんにちは！課題の提出を忘れずに！",
  characterName = "ミッションちゃん",
}: CharacterAssistantProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentMessage, setCurrentMessage] = useState(defaultMessage)
  const [customMessage, setCustomMessage] = useState("")
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-cycle through messages
  useEffect(() => {
    if (!isCustomizing && isMounted) {
      const interval = setInterval(() => {
        const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
        setCurrentMessage(randomMessage)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 500)
      }, 8000) // Change message every 8 seconds

      return () => clearInterval(interval)
    }
  }, [isCustomizing, isMounted])

  const handlePlayVoice = () => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(currentMessage.replace(/[📚✨⏰🏆🎯💪]/gu, ""))
      utterance.lang = "ja-JP"
      utterance.rate = 0.9
      utterance.pitch = 1.2

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStopVoice = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleCustomMessage = () => {
    if (customMessage.trim()) {
      setCurrentMessage(customMessage.trim())
      setCustomMessage("")
      setIsCustomizing(false)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  if (!isVisible || !isMounted) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">{characterName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Character and Speech Bubble */}
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              {/* Character Avatar */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                  <div className="text-2xl">🌟</div>
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-1 -right-1 text-yellow-400 animate-bounce">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="flex-1 relative">
                <div
                  className={`bg-white rounded-2xl rounded-bl-sm p-3 shadow-md border border-pink-100 transition-all duration-300 ${
                    isAnimating ? "scale-105 shadow-lg" : ""
                  }`}
                >
                  <p className="text-gray-800 text-sm leading-relaxed font-medium">{currentMessage}</p>

                  {/* Speech bubble tail */}
                  <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent -translate-x-2"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Voice Controls */}
              <div className="flex gap-1">
                {!isSpeaking ? (
                  <Button
                    size="sm"
                    onClick={handlePlayVoice}
                    className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">音声</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleStopVoice}
                    className="bg-red-500 hover:bg-red-600 text-white h-8 px-3"
                  >
                    <VolumeX className="h-3 w-3 mr-1" />
                    <span className="text-xs">停止</span>
                  </Button>
                )}
              </div>

              {/* Customize Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="h-8 px-3 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Settings className="h-3 w-3 mr-1" />
                <span className="text-xs">カスタム</span>
              </Button>

              {/* Random Message Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
                  setCurrentMessage(randomMessage)
                  setIsAnimating(true)
                  setTimeout(() => setIsAnimating(false), 500)
                }}
                className="h-8 px-3 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="text-xs">ランダム</span>
              </Button>
            </div>

            {/* Custom Message Input */}
            {isCustomizing && (
              <div className="space-y-2 p-3 bg-pink-50 rounded-lg border border-pink-100">
                <Input
                  placeholder="カスタムメッセージを入力..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="text-sm border-pink-200 focus-visible:ring-pink-500"
                  onKeyPress={(e) => e.key === "Enter" && handleCustomMessage()}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCustomMessage}
                    disabled={!customMessage.trim()}
                    className="bg-pink-500 hover:bg-pink-600 text-white flex-1 h-8"
                  >
                    設定
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCustomizing(false)
                      setCustomMessage("")
                    }}
                    className="border-gray-300 flex-1 h-8"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Decorative bottom border */}
          <div className="h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400"></div>
        </CardContent>
      </Card>

      {/* Floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}