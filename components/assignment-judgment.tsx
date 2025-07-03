"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Eye, BookOpen } from "lucide-react"
import type { AssignmentJudgment } from "@/utils/course-store"

interface AssignmentJudgmentProps {
  judgment: AssignmentJudgment
}

export default function AssignmentJudgmentDisplay({ judgment }: AssignmentJudgmentProps) {
  const getStatusIcon = () => {
    if (judgment.isValid) {
      return <CheckCircle className="h-6 w-6 text-green-600" />
    }
    return <XCircle className="h-6 w-6 text-red-600" />
  }

  const getStatusBadge = () => {
    if (judgment.isValid) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          課題として認定
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        課題として認定されず
      </Badge>
    )
  }

  const getConfidenceColor = () => {
    if (judgment.confidence >= 70) return "text-green-600"
    if (judgment.confidence >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            {getStatusIcon()}
            判定結果
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 判定理由 */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            判定理由
          </h4>
          <p className="text-blue-700 text-sm">{judgment.reason}</p>
        </div>

        {/* 信頼度 */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
          <span className="text-blue-800 font-medium">信頼度</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  judgment.confidence >= 70
                    ? "bg-green-500"
                    : judgment.confidence >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${judgment.confidence}%` }}
              />
            </div>
            <span className={`font-bold ${getConfidenceColor()}`}>{judgment.confidence}%</span>
          </div>
        </div>

        {/* 検出された講義 */}
        {judgment.matchedCourses.length > 0 && (
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              検出された講義
            </h4>
            <div className="flex flex-wrap gap-2">
              {judgment.matchedCourses.map((course, index) => (
                <Badge key={index} className="bg-green-100 text-green-800">
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 検出されたテキスト */}
        {judgment.detectedText && (
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              検出されたテキスト
            </h4>
            <div className="max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded text-xs">
                {judgment.detectedText || "テキストが検出されませんでした"}
              </p>
            </div>
          </div>
        )}

        {/* タイムスタンプ */}
        <div className="text-xs text-blue-600 text-center">
          判定時刻: {new Date(judgment.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
