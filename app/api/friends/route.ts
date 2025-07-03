
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/db'

// 友達リスト取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
  }

  const client = await createClient()
  
  try {
    const result = await client.query(`
      SELECT u.id, u.name, u.profile_image, u.points, u.submissions, u.badges, u.created_at, f.added_at
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.added_at DESC
    `, [userId])
    
    const friends = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      profileImage: row.profile_image,
      points: row.points,
      submissions: row.submissions,
      badges: row.badges || [],
      createdAt: row.created_at,
      addedAt: row.added_at
    }))
    
    return NextResponse.json(friends)
  } catch (error) {
    console.error('友達リスト取得エラー:', error)
    return NextResponse.json({ error: '友達リスト取得に失敗しました' }, { status: 500 })
  } finally {
    await client.end()
  }
}

// 友達追加
export async function POST(request: NextRequest) {
  const { userId, friendId } = await request.json()
  
  if (!userId || !friendId) {
    return NextResponse.json({ error: 'ユーザーIDと友達IDが必要です' }, { status: 400 })
  }

  if (userId === friendId) {
    return NextResponse.json({ error: '自分自身は追加できません' }, { status: 400 })
  }

  const client = await createClient()
  
  try {
    // 友達のユーザーが存在するかチェック
    const friendCheck = await client.query('SELECT id FROM users WHERE id = $1', [friendId])
    if (friendCheck.rows.length === 0) {
      return NextResponse.json({ error: '指定されたユーザーが見つかりません' }, { status: 404 })
    }

    // 既に友達かどうかチェック
    const existingFriend = await client.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    )
    if (existingFriend.rows.length > 0) {
      return NextResponse.json({ error: '既に友達として追加済みです' }, { status: 400 })
    }

    // 友達を追加
    await client.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
      [userId, friendId]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('友達追加エラー:', error)
    return NextResponse.json({ error: '友達追加に失敗しました' }, { status: 500 })
  } finally {
    await client.end()
  }
}
