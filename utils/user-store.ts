export interface UserData {
  id: string
  name: string
  email?: string | null
  profileImage?: string | null
  points: number
  submissions: number
  badges: string[]
  lastLogin?: Date | null
  createdAt: string
}

export interface Friend {
  id: string
  name: string
  profileImage?: string | null
  points: number
  addedAt: string
}

export interface Submission {
  id: number
  assignmentName: string
  pointsEarned: number
  submittedAt: string
  isValid: boolean
  imageUrl?: string
}

// ユーザーIDを生成
export function generateUserId(): string {
  // クライアント側でのみランダムID生成
  if (typeof window === 'undefined') {
    return '' // サーバー側では空文字を返す
  }
  return Math.random().toString(36).substr(2, 9).toUpperCase()
}

// 現在のユーザーIDをlocalStorageから取得
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('currentUserId')
}

// 現在のユーザーIDを設定
export function setCurrentUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserId', userId)
  }
}

// ユーザーデータを保存
export async function saveUser(userData: Omit<UserData, 'createdAt'> & { profileImageFile?: string }): Promise<UserData> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Failed to save user')
    }

    const savedUser = await response.json()
    setCurrentUserId(savedUser.id)
    return savedUser
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

// 現在のユーザーを取得
export async function getUser(): Promise<UserData | null> {
  try {
    const userId = getCurrentUserId()
    if (!userId) return null

    const response = await fetch(`/api/users/${userId}`)

    if (!response.ok) {
      if (response.status === 404) {
        // ユーザーが見つからない場合は localStorage をクリア
        localStorage.removeItem('currentUserId')
        return null
      }
      throw new Error('Failed to fetch user')
    }

    const user = await response.json()

    // 最後のログイン時間を更新
    await updateLastLogin(userId)

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// 最後のログイン時間を更新
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastLogin: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// ユーザーデータを更新
export async function updateUser(userData: Partial<UserData> & { profileImageFile?: string }): Promise<UserData | null> {
  try {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No current user')

    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// 友達を追加
export async function addFriend(friendId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No current user')

    const response = await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        friendId,
      }),
    })

    const data = await response.json()
    
    return {
      success: response.ok,
      message: data.message || data.error
    }
  } catch (error) {
    console.error('Error adding friend:', error)
    return { success: false, message: '友達申請に失敗しました' }
  }
}

// 友達リストを取得
export async function getFriends(): Promise<Friend[]> {
  try {
    const userId = getCurrentUserId()
    if (!userId) return []

    const response = await fetch(`/api/friends?userId=${userId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch friends')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching friends:', error)
    return []
  }
}

// 友達を削除
export async function removeFriend(friendId: string): Promise<boolean> {
  try {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No current user')

    const response = await fetch('/api/friends', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        friendId,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error removing friend:', error)
    return false
  }
}

// 課題提出を記録
export async function submitAssignment(assignmentName: string, pointsEarned: number, imageUrl?: string): Promise<boolean> {
  try {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No current user')

    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        assignmentName,
        pointsEarned,
        imageUrl,
      }),
    })

    if (response.ok) {
      // ユーザーのポイントと提出数を更新
      const currentUser = await getUser()
      if (currentUser) {
        await updateUser({
          points: currentUser.points + pointsEarned,
          submissions: currentUser.submissions + 1,
        })
      }
    }

    return response.ok
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return false
  }
}

// 提出履歴を取得
export async function getSubmissions(): Promise<Submission[]> {
  try {
    const userId = getCurrentUserId()
    if (!userId) return []

    const response = await fetch(`/api/submissions?userId=${userId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch submissions')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return []
  }
}

// ランキングデータを取得（全ユーザー）
export async function getRankingData(): Promise<UserData[]> {
  try {
    const response = await fetch('/api/users')

    if (!response.ok) {
      throw new Error('Failed to fetch ranking data')
    }

    const users = await response.json()
    return users.sort((a: UserData, b: UserData) => b.points - a.points)
  } catch (error) {
    console.error('Error fetching ranking data:', error)
    return []
  }
}

// ログアウト
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUserId')
  }
}