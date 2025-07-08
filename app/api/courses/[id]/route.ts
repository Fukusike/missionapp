
import { NextRequest, NextResponse } from 'next/server'
import { updateCourse, deleteCourse, getCourse } from '../../../../utils/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: '無効な講義IDです' }, { status: 400 })
    }

    const { name, instructor, color } = await request.json()

    if (!name || !instructor || !color) {
      return NextResponse.json({ error: '講義名、担当教員、カラーは必須です' }, { status: 400 })
    }

    const course = await updateCourse(courseId, { name, instructor, color })
    
    if (!course) {
      return NextResponse.json({ error: '講義が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('講義更新エラー:', error)
    return NextResponse.json({ error: '講義の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: '無効な講義IDです' }, { status: 400 })
    }

    await deleteCourse(courseId)
    return NextResponse.json({ message: '講義が削除されました' })
  } catch (error) {
    console.error('講義削除エラー:', error)
    return NextResponse.json({ error: '講義の削除に失敗しました' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: '無効な講義IDです' }, { status: 400 })
    }

    const course = await getCourse(courseId)
    
    if (!course) {
      return NextResponse.json({ error: '講義が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('講義取得エラー:', error)
    return NextResponse.json({ error: '講義の取得に失敗しました' }, { status: 500 })
  }
}
