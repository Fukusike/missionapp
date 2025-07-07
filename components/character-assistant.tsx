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

// 状況別メッセージ
const messagesByContext = {
  // 毎日の挨拶（アプリを開いたとき）
  dailyGreeting: [
    "おっ、やる気の君が来た！一緒にXP稼いでこ〜！",
    "今日の課題、ぼくと一緒に攻略しよう。まずはログインボーナス的なハイタッチから！✋",
    "その"やる気の火花"、見逃さないよ。燃えていこう🔥",
    "君がアプリを開いたってだけで、今日はちょっと勝ちかも。",
    "さあ、XPの旅へようこそ。ミッションは、まだ君を待ってるよ！",
  ],
  
  // 2日間未使用
  twoDaysAbsent: [
    "2日ぶりだね！寂しかったぞ～（XPたちも泣いてた）",
    "まさか…課題から逃げてた？ぼくは逃がさないよ🐥",
    "2日間で何があったのか、君のXPは全部聞きたがってる。",
    "そろそろ"やる気"の種を水やりしよっか☘️",
    "……おかえり。ぼくの記録によると、課題が君を呼んでたよ？",
  ],
  
  // 1週間未使用
  weekAbsent: [
    "お久しぶりです、旅人さん。…課題はずっとここにいましたよ。",
    "1週間ぶりの冒険者、復活。さあ、積みミッション、片付けようか。",
    "ぼく、夢の中で何度も君の"未提出マーク"を見たよ…",
    "1週間サボっても、1日で取り返せるのが君のすごさだって信じてる。",
    "XPゼロで1週間…その勇気、逆にすごい。でもそろそろ戻ってきて？",
  ],
  
  // 課題締切24時間前
  urgentDeadline: [
    "残り24時間…課題が迫る…鼓動が高鳴る…これはもはやRPGだよね？",
    ""あとでやろう"を卒業するタイミングが来たよ、今が。",
    "明日の今ごろ、"提出済み"の快感に包まれていたいなら…今！",
    "まさかとは思うけど、"提出しない"って選択肢はないよね？",
    "そろそろ"やればできる"じゃなくて、"やった"にしよう。",
  ],
  
  // 課題提出完了時
  submissionComplete: [
    "提出完了！その音、ぼくには祝砲に聞こえたよ！🎉",
    "おめでとう！この達成感、クセになるでしょ？",
    "提出した君は、もう今日のヒーローだよ。XPあげちゃう！",
    ""提出済み"って文字、なんでこんなにカッコイイんだろうね。",
    "ふぅ…一緒に戦った仲間って感じだね。次のミッションも待ってるよ！",
  ],
  
  // 連続ログイン5日目
  fiveDayStreak: [
    "5日連続！？君、もう"提出忍者"の称号に足突っ込んでるよ。",
    "すごい…この調子で"提出筋"鍛えていこう💪",
    "5日間の君に、ぼくは全力の称賛を送ります。XPもつけて！",
    "まさに"習慣の鬼"。ちょっと尊敬してる…ちょっとね。",
    "この連続記録、壊すのはもったいないよ？今日も一歩、積もう！",
  ],
  
  // 友達にランキングで抜かれたとき
  overtakenByFriend: [
    "○○くんに抜かれてる！？どうする？追い返す？それともぼくが泣く？",
    "ランキングで負けるって…ちょっと悔しいよね。ぼくならXP3倍モードで巻き返すけど？",
    "○○くんが今日ミッション3つこなしたって…聞きたくなかったよね？（煽り風）",
    "ぼくは君を信じてる。再逆転劇、始めよう？",
    "トップ争いって、燃えるでしょ？ぼくも応援モード入るよ！",
  ],
  
  // ランキング1位をキープ中
  rankingFirst: [
    "君、伝説になりつつある…"提出王のオーラ"見えてるよ。",
    "1位って孤独だけど、かっこいいんだよなあ…。ぼくはずっとそばにいるけどね！",
    "周囲がざわついてるよ。"君を超える者はいないのか"って…！",
    "守るの、大変だよ。でも君ならできるって分かってる。",
    "1位キープ、いいXP出てる。その背中、誰かが追ってるよ〜（ちらっ）",
  ],
  
  // 深夜（23:30頃）
  lateNight: [
    "夜ふかしXP獲得モード、ON！でも無理しすぎはダメだよ？",
    "この時間に課題って…逆に伝説じゃん。",
    ""深夜の勇者"称号、そろそろ解禁してもいい？",
    "あと30分で明日になる。今日を"提出済み"で終わらせよう。",
    "深夜の提出って、たまにクセになるんだよね。分かる、分かる。",
  ],
  
  // 週末
  weekend: [
    "週末こそチャンス！提出ボーナス、こっそりXP2倍にしちゃおうか？",
    "今動けば、月曜の君がめっちゃ楽になるよ。未来の自分にギフトを🎁",
    "週末のうちに提出済みにしとくと、余裕で遊べるぞ〜！",
    "この土日は、ランキング逆転チャンス。ぼくも応援するね！",
    "今週の締めくくりは…提出済みでキメようじゃないか！",
  ],
  
  // デフォルトメッセージ（従来のメッセージも残す）
  default: [
    "頑張って課題を提出しよう！📚",
    "今日も素晴らしい一日にしましょう！✨",
    "課題の締切を忘れずに！⏰",
    "新しいバッジを獲得するチャンス！🏆",
    "友達とランキングを競い合おう！🎯",
    "継続は力なり！今日も頑張って！💪",
  ]
}

// 状況に応じたメッセージを取得する関数
const getContextualMessage = () => {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0: 日曜日, 6: 土曜日
  
  // 深夜（23:30以降）
  if (hour === 23 && now.getMinutes() >= 30) {
    return getRandomMessage(messagesByContext.lateNight)
  }
  
  // 週末（土日）
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return getRandomMessage(messagesByContext.weekend)
  }
  
  // 朝の挨拶（6-11時）
  if (hour >= 6 && hour <= 11) {
    return getRandomMessage(messagesByContext.dailyGreeting)
  }
  
  // デフォルトメッセージ
  return getRandomMessage(messagesByContext.default)
}

const getRandomMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)]
}

const defaultMessages = messagesByContext.default

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
        const contextualMessage = getContextualMessage()
        setCurrentMessage(contextualMessage)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 500)
      }, 8000) // Change message every 8 seconds

      return () => clearInterval(interval)
    }
  }, [isCustomizing, isMounted])

  // 初回表示時もコンテキストに応じたメッセージを表示
  useEffect(() => {
    if (isMounted && currentMessage === defaultMessage) {
      const contextualMessage = getContextualMessage()
      setCurrentMessage(contextualMessage)
    }
  }, [isMounted, defaultMessage, currentMessage])

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
                  const contextualMessage = getContextualMessage()
                  setCurrentMessage(contextualMessage)
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