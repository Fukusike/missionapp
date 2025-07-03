
import { createClient } from './db'

// ユーザーの型定義
export interface User {
  id: string
  name: string
  profileImage: string | null
  points: number
  submissions: number
  badges: string[]
  createdAt: string
}

// 友達の型定義
export interface Friend {
  id: string
  addedAt: string
}

// クライアントサイドかどうかをチェック
const isClient = typeof window !== "undefined"

// 現在のユーザーIDをlocalStorageから取得
function getCurrentUserId(): string | null {
  if (!isClient) return null
  return localStorage.getItem('currentUserId')
}

// 現在のユーザーIDをlocalStorageに保存
function setCurrentUserId(userId: string): void {
  if (isClient) {
    localStorage.setItem('currentUserId', userId)
  }
}

// ユーザーデータを保存する
export async function saveUser(user: User): Promise<void> {
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

    // 現在のユーザーとして設定
    setCurrentUserId(user.id)
  } catch (error) {
    console.error('ユーザー保存エラー:', error)
    throw error
  } finally {
    await client.end()
  }
}

// ユーザーデータを取得する
export async function getUser(): Promise<User | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  return await getUserById(userId)
}

// 全ての登録ユーザーを取得する
export async function getAllRegisteredUsers(): Promise<Record<string, User>> {
  const client = await createClient()
  
  try {
    const result = await client.query('SELECT * FROM users ORDER BY points DESC')
    const users: Record<string, User> = {}
    
    for (const row of result.rows) {
      users[row.id] = {
        id: row.id,
        name: row.name,
        profileImage: row.profile_image,
        points: row.points,
        submissions: row.submissions,
        badges: row.badges || [],
        createdAt: row.created_at
      }
    }
    
    return users
  } catch (error) {
    console.error('全ユーザー取得エラー:', error)
    return {}
  } finally {
    await client.end()
  }
}

// 特定のユーザーIDのユーザーを取得する
export async function getUserById(userId: string): Promise<User | null> {
  const client = await createClient()
  
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      profileImage: row.profile_image,
      points: row.points,
      submissions: row.submissions,
      badges: row.badges || [],
      createdAt: row.created_at
    }
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return null
  } finally {
    await client.end()
  }
}

// 友達リストを取得する
export async function getFriends(): Promise<Friend[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  const client = await createClient()
  
  try {
    const result = await client.query(
      'SELECT friend_id as id, added_at FROM friendships WHERE user_id = $1 ORDER BY added_at DESC',
      [userId]
    )
    
    return result.rows.map(row => ({
      id: row.id,
      addedAt: row.added_at
    }))
  } catch (error) {
    console.error('友達リスト取得エラー:', error)
    return []
  } finally {
    await client.end()
  }
}

// 友達を追加する
export async function addFriend(friendId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  // 自分自身は追加できない
  if (userId === friendId) return false

  const client = await createClient()
  
  try {
    // 友達のユーザーが存在するかチェック
    const friendCheck = await client.query('SELECT id FROM users WHERE id = $1', [friendId])
    if (friendCheck.rows.length === 0) {
      return false
    }

    // 既に友達かどうかチェック
    const existingFriend = await client.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    )
    if (existingFriend.rows.length > 0) {
      return false
    }

    // 友達を追加
    await client.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
      [userId, friendId]
    )
    
    return true
  } catch (error) {
    console.error('友達追加エラー:', error)
    return false
  } finally {
    await client.end()
  }
}

// 友達のユーザーデータを取得する
export async function getFriendsData(): Promise<User[]> {
  const friends = await getFriends()
  const friendsData: User[] = []

  for (const friend of friends) {
    const friendData = await getUserById(friend.id)
    if (friendData) {
      friendsData.push(friendData)
    }
  }

  return friendsData
}

// ランダムなユーザーIDを生成する
export function generateUserId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// モックユーザーデータを生成する（デモ用）
export function generateMockUsers(): Record<string, User> {
  return {
    ABC12345: {
      id: "ABC12345",
      name: "たろう",
      profileImage: null,
      points: 250,
      submissions: 25,
      badges: ["課題マスター", "連続提出王"],
      createdAt: new Date().toISOString(),
    },
    DEF67890: {
      id: "DEF67890",
      name: "はなこ",
      profileImage: null,
      points: 210,
      submissions: 21,
      badges: ["勤勉な学習者"],
      createdAt: new Date().toISOString(),
    },
    GHI13579: {
      id: "GHI13579",
      name: "けんた",
      profileImage: null,
      points: 180,
      submissions: 18,
      badges: ["数学の達人"],
      createdAt: new Date().toISOString(),
    },
    JKL24680: {
      id: "JKL24680",
      name: "あやか",
      profileImage: null,
      points: 150,
      submissions: 15,
      badges: ["英語の達人"],
      createdAt: new Date().toISOString(),
    },
  }
}

// モックユーザーデータを取得する（デモ用）
export function getMockUser(userId: string): User | null {
  const mockUsers = generateMockUsers()
  return mockUsers[userId] || null
}

// 全てのモックユーザーを取得する（デモ用）
export function getAllMockUsers(): User[] {
  return Object.values(generateMockUsers())
}

// ユーザーからログアウト
export function logoutUser(): void {
  if (isClient) {
    localStorage.removeItem('currentUserId')
  }
}
