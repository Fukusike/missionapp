
import { NextRequest, NextResponse } from 'next/server'
import { createCourse, getUserCourses } from '../../../utils/db'

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

    const course = await createCourse({
      userId,
      name,
      instructor,
      color
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('講義作成エラー:', error)
    return NextResponse.json({ error: '講義の作成に失敗しました' }, { status: 500 })
  }
}
