
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/db'

// 全ユーザー取得
export async function GET() {
  const client = await createClient()
  
  try {
    const result = await client.query('SELECT * FROM users ORDER BY points DESC')
    const users = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      profileImage: row.profile_image,
      points: row.points,
      submissions: row.submissions,
      badges: row.badges || [],
      createdAt: row.created_at
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json({ error: 'ユーザー取得に失敗しました' }, { status: 500 })
  } finally {
    await client.end()
  }
}

// ユーザー作成・更新
export async function POST(request: NextRequest) {
  const user = await request.json()
  const client = await createClient()
  
  try {
    await client.query(`
      INSERT INTO users (id, name, profile_image, points, submissions, badges, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        profile_image = EXCLUDED.profile_image,
        points = EXCLUDED.points,
        submissions = EXCLUDED.submissions,
        badges = EXCLUDED.badges,
        updated_at = CURRENT_TIMESTAMP
    `, [user.id, user.name, user.profileImage, user.points, user.submissions, user.badges, user.createdAt])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ユーザー保存エラー:', error)
    return NextResponse.json({ error: 'ユーザー保存に失敗しました' }, { status: 500 })
  } finally {
    await client.end()
  }
}
