
// ユーザーの型定義
export interface User {
  id: string
  name: string
  profile_image: string | null
  points: number
  submissions: number
  badges: string[]
  last_login: string | null
  created_at: string
  updated_at: string
}

// 友達の型定義
export interface Friend {
  id: string
  addedAt: string
}

// 課題提出履歴の型定義
export interface Submission {
  id: number
  user_id: string
  assignment_name: string
  points_earned: number
  submitted_at: string
  is_valid: boolean
  image_url: string | null
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
export async function saveUser(user: Omit<User, 'created_at' | 'updated_at' | 'last_login'>): Promise<void> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        profileImage: user.profile_image,
        points: user.points,
        submissions: user.submissions,
        badges: user.badges,
      }),
    })

    if (!response.ok) {
      throw new Error('ユーザー保存に失敗しました')
    }

    // 現在のユーザーとして設定
    setCurrentUserId(user.id)
  } catch (error) {
    console.error('ユーザー保存エラー:', error)
    throw error
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
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      throw new Error('ユーザー取得に失敗しました')
    }

    const users: User[] = await response.json()
    const usersRecord: Record<string, User> = {}

    for (const user of users) {
      usersRecord[user.id] = user
    }

    return usersRecord
  } catch (error) {
    console.error('全ユーザー取得エラー:', error)
    return {}
  }
}

// 特定のユーザーIDのユーザーを取得する
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('ユーザー取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return null
  }
}

// 友達リストを取得する
export async function getFriends(): Promise<Friend[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const response = await fetch(`/api/friends?userId=${userId}`)
    if (!response.ok) {
      throw new Error('友達リスト取得に失敗しました')
    }

    const friends: User[] = await response.json()
    return friends.map(friend => ({
      id: friend.id,
      addedAt: friend.created_at
    }))
  } catch (error) {
    console.error('友達リスト取得エラー:', error)
    return []
  }
}

// 友達を追加する
export async function addFriend(friendId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  try {
    const response = await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, friendId }),
    })

    return response.ok
  } catch (error) {
    console.error('友達追加エラー:', error)
    return false
  }
}

// 友達のユーザーデータを取得する
export async function getFriendsData(): Promise<User[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const response = await fetch(`/api/friends?userId=${userId}`)
    if (!response.ok) {
      throw new Error('友達データ取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('友達データ取得エラー:', error)
    return []
  }
}

// 課題提出履歴を取得する
export async function getUserSubmissions(): Promise<Submission[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const response = await fetch(`/api/submissions?userId=${userId}`)
    if (!response.ok) {
      throw new Error('提出履歴取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('提出履歴取得エラー:', error)
    return []
  }
}

// 課題提出を記録する
export async function submitAssignment(assignmentData: {
  assignmentName: string
  pointsEarned: number
  isValid: boolean
  imageUrl?: string
}): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...assignmentData
      }),
    })

    return response.ok
  } catch (error) {
    console.error('課題提出記録エラー:', error)
    return false
  }
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

// ユーザーからログアウト
export function logoutUser(): void {
  if (isClient) {
    localStorage.removeItem('currentUserId')
  }
}

// モックユーザーデータを生成する（デモ用）
export function generateMockUsers(): Record<string, User> {
  return {
    ABC12345: {
      id: "ABC12345",
      name: "たろう",
      profile_image: null,
      points: 250,
      submissions: 25,
      badges: ["課題マスター", "連続提出王"],
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    DEF67890: {
      id: "DEF67890",
      name: "はなこ",
      profile_image: null,
      points: 210,
      submissions: 21,
      badges: ["勤勉な学習者"],
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    GHI13579: {
      id: "GHI13579",
      name: "けんた",
      profile_image: null,
      points: 180,
      submissions: 18,
      badges: ["数学の達人"],
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    JKL24680: {
      id: "JKL24680",
      name: "あやか",
      profile_image: null,
      points: 150,
      submissions: 15,
      badges: ["英語の達人"],
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
