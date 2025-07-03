// 講義の型定義
export interface Course {
  id: string
  name: string
  instructor: string
  color: string
  createdAt: string
}

// 課題判定結果の型定義
export interface AssignmentJudgment {
  isValid: boolean
  confidence: number
  detectedText: string
  matchedCourses: string[]
  reason: string
  timestamp: string
}

// クライアントサイドかどうかをチェック
const isClient = typeof window !== "undefined"

// 講義データを保存する
export function saveCourses(courses: Course[]): void {
  if (isClient) {
    localStorage.setItem("courses", JSON.stringify(courses))
  }
}

// 講義データを取得する
export function getCourses(): Course[] {
  if (isClient) {
    const coursesData = localStorage.getItem("courses")
    if (coursesData) {
      return JSON.parse(coursesData)
    }
  }
  return []
}

// 講義を追加する
export function addCourse(course: Omit<Course, "id" | "createdAt">): Course {
  const courses = getCourses()
  const newCourse: Course = {
    ...course,
    id: generateCourseId(),
    createdAt: new Date().toISOString(),
  }
  courses.push(newCourse)
  saveCourses(courses)
  return newCourse
}

// 講義を削除する
export function deleteCourse(courseId: string): boolean {
  const courses = getCourses()
  const filteredCourses = courses.filter((course) => course.id !== courseId)
  if (filteredCourses.length !== courses.length) {
    saveCourses(filteredCourses)
    return true
  }
  return false
}

// 講義を更新する
export function updateCourse(courseId: string, updates: Partial<Course>): boolean {
  const courses = getCourses()
  const courseIndex = courses.findIndex((course) => course.id === courseId)
  if (courseIndex !== -1) {
    courses[courseIndex] = { ...courses[courseIndex], ...updates }
    saveCourses(courses)
    return true
  }
  return false
}

// ランダムな講義IDを生成する
function generateCourseId(): string {
  return "course_" + Math.random().toString(36).substr(2, 9)
}

// 課題判定を行う
export function judgeAssignment(detectedText: string, normalizedText?: string): AssignmentJudgment {
  const courses = getCourses()
  const matchedCourses: string[] = []
  let confidence = 0

  // 正規化されたテキストが提供されていない場合は、従来の方法で正規化
  const textToAnalyze = normalizedText || detectedText.toLowerCase().replace(/\s+/g, "")

  // 各講義名がテキストに含まれているかチェック
  courses.forEach((course) => {
    const normalizedCourseName = course.name.toLowerCase().replace(/\s+/g, "")
    const normalizedInstructor = course.instructor.toLowerCase().replace(/\s+/g, "")

    // 正規化されたテキストと元のテキストの両方でチェック
    const matchesNormalized = textToAnalyze.includes(normalizedCourseName) || 
                             textToAnalyze.includes(normalizedInstructor)
    const matchesOriginal = detectedText.includes(course.name) || 
                           detectedText.includes(course.instructor)

    if (matchesNormalized || matchesOriginal) {
      matchedCourses.push(course.name)
      confidence += 30 // 基本的なマッチで30ポイント
      
      // 正規化されたテキストでマッチした場合は追加ボーナス
      if (matchesNormalized) {
        confidence += 10
      }
    }
  })

  // 課題関連のキーワードをチェック（正規化されたテキストでも検索）
  const assignmentKeywords = [
    "課題",
    "宿題", 
    "レポート",
    "提出",
    "assignment",
    "homework",
    "report",
    "exercise",
    "問題",
    "解答",
    "回答",
    "テスト",
    "試験",
  ]

  let keywordMatches = 0
  assignmentKeywords.forEach((keyword) => {
    if (normalizedText.includes(keyword.toLowerCase())) {
      keywordMatches++
      confidence += 10 // キーワードマッチで10ポイント
    }
  })

  // 判定ロジック
  const isValid = matchedCourses.length > 0 && (confidence >= 40 || keywordMatches >= 2)

  // 理由を生成
  let reason = ""
  if (isValid) {
    reason = `登録済みの講義「${matchedCourses.join("、")}」が検出されました。`
    if (keywordMatches > 0) {
      reason += ` また、課題関連のキーワードが${keywordMatches}個見つかりました。`
    }
  } else {
    if (matchedCourses.length === 0) {
      reason = "登録済みの講義名が画像内で検出されませんでした。"
    } else {
      reason = "講義名は検出されましたが、課題関連のキーワードが不足しています。"
    }

    if (courses.length === 0) {
      reason += " まず講義を登録してください。"
    }
  }

  return {
    isValid,
    confidence: Math.min(confidence, 100),
    detectedText,
    matchedCourses,
    reason,
    timestamp: new Date().toISOString(),
  }
}

// デフォルトの講義カラー
export const courseColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]
