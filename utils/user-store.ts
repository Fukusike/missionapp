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

// ユーザーデータを保存する
export function saveUser(user: User): void {
  if (isClient) {
    // 現在のユーザーとして保存
    localStorage.setItem("user", JSON.stringify(user))

    // 全ユーザーリストにも追加
    const allUsers = getAllRegisteredUsers()
    allUsers[user.id] = user
    localStorage.setItem("allUsers", JSON.stringify(allUsers))
  }
}

// ユーザーデータを取得する
export function getUser(): User | null {
  if (isClient) {
    const userData = localStorage.getItem("user")
    if (userData) {
      return JSON.parse(userData)
    }
  }
  return null
}

// 全ての登録ユーザーを取得する
export function getAllRegisteredUsers(): Record<string, User> {
  if (isClient) {
    const allUsersData = localStorage.getItem("allUsers")
    if (allUsersData) {
      return JSON.parse(allUsersData)
    }
  }
  return {}
}

// 特定のユーザーIDのユーザーを取得する
export function getUserById(userId: string): User | null {
  // 実際に登録されたユーザーから検索
  const allUsers = getAllRegisteredUsers()
  if (allUsers[userId]) {
    return allUsers[userId]
  }

  // 見つからない場合はモックデータから検索
  return getMockUser(userId)
}

// 友達リストを保存する
export function saveFriends(friends: Friend[]): void {
  if (isClient) {
    localStorage.setItem("friends", JSON.stringify(friends))
  }
}

// 友達リストを取得する
export function getFriends(): Friend[] {
  if (isClient) {
    const friendsData = localStorage.getItem("friends")
    if (friendsData) {
      return JSON.parse(friendsData)
    }
  }
  return []
}

// 友達を追加する
export function addFriend(friendId: string): boolean {
  const friends = getFriends()

  // 既に追加済みの場合は追加しない
  if (friends.some((friend) => friend.id === friendId)) {
    return false
  }

  // 自分自身は追加できない
  const user = getUser()
  if (user && user.id === friendId) {
    return false
  }

  // 友達のユーザーデータを確認
  const friendUser = getUserById(friendId)
  if (!friendUser) {
    return false
  }

  friends.push({
    id: friendId,
    addedAt: new Date().toISOString(),
  })

  saveFriends(friends)
  return true
}

// 友達のユーザーデータを取得する
export function getFriendsData(): User[] {
  const friends = getFriends()
  const friendsData: User[] = []

  friends.forEach((friend) => {
    const friendData = getUserById(friend.id)
    if (friendData) {
      friendsData.push(friendData)
    }
  })

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
