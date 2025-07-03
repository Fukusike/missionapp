"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Home, Plus, BookOpen, User, Trash2, Edit, GraduationCap } from "lucide-react"
import { getCourses, addCourse, deleteCourse, updateCourse, courseColors, type Course } from "@/utils/course-store"
import { useToast } from "@/hooks/use-toast"

export default function CoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    color: courseColors[0],
  })

  useEffect(() => {
    setCourses(getCourses())
  }, [])

  const handleAddCourse = () => {
    if (!formData.name.trim()) {
      toast({
        title: "エラー",
        description: "講義名を入力してください",
        variant: "destructive",
      })
      return
    }

    const newCourse = addCourse({
      name: formData.name.trim(),
      instructor: formData.instructor.trim(),
      color: formData.color,
    })

    setCourses(getCourses())
    setFormData({ name: "", instructor: "", color: courseColors[0] })
    setIsAddDialogOpen(false)

    toast({
      title: "講義を追加しました",
      description: `「${newCourse.name}」を登録しました`,
    })
  }

  const handleUpdateCourse = () => {
    if (!editingCourse || !formData.name.trim()) {
      toast({
        title: "エラー",
        description: "講義名を入力してください",
        variant: "destructive",
      })
      return
    }

    const success = updateCourse(editingCourse.id, {
      name: formData.name.trim(),
      instructor: formData.instructor.trim(),
      color: formData.color,
    })

    if (success) {
      setCourses(getCourses())
      setEditingCourse(null)
      setFormData({ name: "", instructor: "", color: courseColors[0] })

      toast({
        title: "講義を更新しました",
        description: `「${formData.name}」の情報を更新しました`,
      })
    }
  }

  const handleDeleteCourse = (course: Course) => {
    const success = deleteCourse(course.id)
    if (success) {
      setCourses(getCourses())
      toast({
        title: "講義を削除しました",
        description: `「${course.name}」を削除しました`,
      })
    }
  }

  const startEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      instructor: course.instructor,
      color: course.color,
    })
  }

  const cancelEdit = () => {
    setEditingCourse(null)
    setFormData({ name: "", instructor: "", color: courseColors[0] })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="container max-w-4xl mx-auto py-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">講義管理</CardTitle>
              <p className="text-green-600">履修している講義を登録して、課題提出時の自動判定に使用します</p>
            </CardHeader>
          </Card>

          {/* Add Course Button */}
          <div className="flex justify-center">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  新しい講義を追加
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>新しい講義を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-name">講義名 *</Label>
                    <Input
                      id="course-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 数学I、英語コミュニケーション"
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
                        setIsAddDialogOpen(false)
                        setFormData({ name: "", instructor: "", color: courseColors[0] })
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
                        <div className="flex gap-1 flex-wrap">
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateCourse}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 bg-transparent">
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
                            <h3 className="font-semibold text-green-800 text-sm leading-tight">{course.name}</h3>
                          </div>
                        </div>

                        {course.instructor && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <User className="h-3 w-3" />
                            <span>{course.instructor}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-green-500">
                          <BookOpen className="h-3 w-3" />
                          <span>登録日: {new Date(course.createdAt).toLocaleDateString()}</span>
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
              <div className="col-span-full">
                <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">講義が登録されていません</h3>
                    <p className="text-green-600 mb-4">履修している講義を登録すると、課題提出時に自動で判定されます</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
                      <Plus className="mr-2 h-4 w-4" />
                      最初の講義を追加
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 使い方のヒント</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 講義名は課題用紙に書かれている通りに正確に入力してください</li>
                <li>• 担当教員名も登録すると、判定精度が向上します</li>
                <li>• 課題提出時に、登録した講義名が画像内で検出されるとポイントが付与されます</li>
                <li>• 講義名は後から編集・削除することができます</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
