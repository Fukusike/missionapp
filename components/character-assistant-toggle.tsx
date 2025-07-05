"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import CharacterAssistant from "./character-assistant"

export default function CharacterAssistantToggle() {
  const [showAssistant, setShowAssistant] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      {showAssistant && <CharacterAssistant />}

      {!showAssistant && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowAssistant(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full w-14 h-14 shadow-2xl"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  )
}
