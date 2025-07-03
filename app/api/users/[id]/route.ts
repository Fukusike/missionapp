
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await createClient()
  
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [params.id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }
    
    const row = result.rows[0]
    const user = {
      id: row.id,
      name: row.name,
      profileImage: row.profile_image,
      points: row.points,
      submissions: row.submissions,
      badges: row.badges || [],
      createdAt: row.created_at
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json({ error: 'ユーザー取得に失敗しました' }, { status: 500 })
  } finally {
    await client.end()
  }
}
