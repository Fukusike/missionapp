
import { NextRequest, NextResponse } from 'next/server'
import { createCourse, getUserCourses, checkCourseDuplicate } from '../../../utils/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    const courses = await getUserCourses(userId)
    return NextResponse.json(courses)
  } catch (error) {
    console.error('講義取得エラー:', error)
    return NextResponse.json({ error: '講義の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    const { name, instructor, color } = await request.json()

    if (!name || !instructor || !color) {
      return NextResponse.json({ error: '講義名、担当教員、カラーは必須です' }, { status: 400 })
    }

    // 重複チェック
    const isDuplicate = await checkCourseDuplicate(userId, name.trim(), instructor.trim())
    if (isDuplicate) {
      return NextResponse.json({ 
        error: '同じ講義名と担当教員の講義が既に登録されています' 
      }, { status: 409 })
    }

    const course = await createCourse({
      userId,
      name: name.trim(),
      instructor: instructor.trim(),
      color
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('講義作成エラー:', error)
    return NextResponse.json({ error: '講義の作成に失敗しました' }, { status: 500 })
  }
}
