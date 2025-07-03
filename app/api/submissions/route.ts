
import { NextRequest, NextResponse } from 'next/server'
import { addSubmission, getUserSubmissions } from '@/utils/db'

// GET: ユーザーの提出履歴を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'ユーザーIDが必要です' },
      { status: 400 }
    )
  }

  try {
    const submissions = await getUserSubmissions(userId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('提出履歴取得エラー:', error)
    return NextResponse.json(
      { error: '提出履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 課題提出を記録
export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json()

    if (!submissionData.userId || !submissionData.assignmentName) {
      return NextResponse.json(
        { error: 'ユーザーIDと課題名が必要です' },
        { status: 400 }
      )
    }

    const submission = await addSubmission({
      userId: submissionData.userId,
      assignmentName: submissionData.assignmentName,
      pointsEarned: submissionData.pointsEarned || 10,
      isValid: submissionData.isValid !== false,
      imageUrl: submissionData.imageUrl
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('課題提出記録エラー:', error)
    return NextResponse.json(
      { error: '課題提出の記録に失敗しました' },
      { status: 500 }
    )
  }
}
