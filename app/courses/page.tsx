
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getCurrentUserId, getUser } from '@/utils/user-store'

// 講義の型定義
interface Course {
  id: number
  user_id: string
  name: string
  instructor: string
  color: string
  created_at: string
  updated_at: string
}

// 利用可能なカラーオプション
const courseColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
  "#6b7280", // gray
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    color: courseColors[0],
  })
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ユーザー情報を取得
  useEffect(() => {
    const loadUser = async () => {
      const userId = getCurrentUserId()
      if (userId) {
        const user = await getUser()
        setCurrentUser(user)
      }
    }
    loadUser()
  }, [])

  // 講義一覧を取得
  const fetchCourses = async () => {
    if (!currentUser?.id) return

    try {
      const response = await fetch('/api/courses', {
        headers: {
          'x-user-id': currentUser.id,
        },
      })

      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      } else {
        throw new Error('講義の取得に失敗しました')
      }
    } catch (error) {
      console.error('講義取得エラー:', error)
      toast({
        title: "エラー",
        description: "講義の取得に失敗しました",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (currentUser?.id) {
      fetchCourses()
    }
  }, [currentUser])

  // 講義を追加
  const handleAddCourse = async () => {
    if (!formData.name.trim() || !formData.instructor.trim()) {
      toast({
        title: "エラー",
        description: "講義名と担当教員を入力してください",
        variant: "destructive",
      })
      return
    }

    if (!currentUser?.id) {
      toast({
        title: "エラー",
        description: "ユーザー情報が取得できません",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCourses()
        setFormData({ name: "", instructor: "", color: courseColors[0] })
        setIsDialogOpen(false)
        toast({
          title: "成功",
          description: "講義を追加しました",
        })
      } else {
        throw new Error('講義の追加に失敗しました')
      }
    } catch (error) {
      console.error('講義追加エラー:', error)
      toast({
        title: "エラー",
        description: "講義の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 講義を更新
  const handleUpdateCourse = async () => {
    if (!editingCourse || !formData.name.trim() || !formData.instructor.trim()) {
      toast({
        title: "エラー",
        description: "講義名と担当教員を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCourses()
        setEditingCourse(null)
        setFormData({ name: "", instructor: "", color: courseColors[0] })
        toast({
          title: "成功",
          description: "講義を更新しました",
        })
      } else {
        throw new Error('講義の更新に失敗しました')
      }
    } catch (error) {
      console.error('講義更新エラー:', error)
      toast({
        title: "エラー",
        description: "講義の更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 講義を削除
  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`「${course.name}」を削除しますか？`)) return

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCourses()
        toast({
          title: "成功",
          description: "講義を削除しました",
        })
      } else {
        throw new Error('講義の削除に失敗しました')
      }
    } catch (error) {
      console.error('講義削除エラー:', error)
      toast({
        title: "エラー",
        description: "講義の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 編集モードを開始
  const startEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      instructor: course.instructor,
      color: course.color,
    })
  }

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingCourse(null)
    setFormData({ name: "", instructor: "", color: courseColors[0] })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl font-bold text-gray-800">講義管理</h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  新しい講義を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しい講義を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">講義名</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 数学I"
                      className="border-green-200 focus-visible:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">担当教員</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="例: 田中先生"
                      className="border-green-200 focus-visible:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>カラー</Label>
                    <div className="flex gap-2 flex-wrap">
                      {courseColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? "border-gray-800" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddCourse} className="flex-1 bg-green-500 hover:bg-green-600">
                      追加
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({ name: "", instructor: "", color: courseColors[0] })
                        setIsDialogOpen(false)
                      }}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.id} className="border-green-200 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {editingCourse?.id === course.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border-green-200 focus-visible:ring-green-500"
                        />
                        <Input
                          value={formData.instructor}
                          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                          placeholder="担当教員"
                          className="border-green-200 focus-visible:ring-green-500"
                        />
                        <div className="space-y-2">
                          <Label className="text-sm">カラー</Label>
                          <div className="flex gap-2 flex-wrap">
                            {courseColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded-full border ${
                                  formData.color === color ? "border-gray-800" : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setFormData({ ...formData, color })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateCourse}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1">
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: course.color }}
                          />
                          <h3 className="font-semibold text-gray-800 flex-1">{course.name}</h3>
                        </div>

                        {course.instructor && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>👨‍🏫</span>
                            <span>{course.instructor}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-green-500">
                          <BookOpen className="h-3 w-3" />
                          <span>登録日: {new Date(course.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(course)}
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCourse(course)}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">登録された講義がありません</p>
                <p className="text-gray-400">「新しい講義を追加」ボタンから講義を登録してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
