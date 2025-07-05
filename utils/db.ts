
import { Client, Pool } from 'pg'

// コネクションプールを作成
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  query_timeout: 8000,
})

// データベース接続クライアントを作成
export async function createClient() {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('データベース接続エラー:', error)
    throw error
  }
}

// 全テーブルを作成する関数
export async function createTables() {
  const client = await createClient()

  try {
    // ユーザーテーブル（パスワードハッシュ列を含む）
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        password_hash VARCHAR(255),
        profile_image TEXT,
        points INTEGER DEFAULT 0,
        submissions INTEGER DEFAULT 0,
        badges TEXT[] DEFAULT '{}',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 既存のテーブルにpassword_hash列が存在しない場合は追加
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `)

    // 既存のテーブルにemail列が存在しない場合は追加
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `)

    // 既存のid列の文字数制限を拡張
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN id TYPE VARCHAR(50)
    `)

    // 既存のfriendshipsテーブルの外部キー列のサイズを拡張
    await client.query(`
      ALTER TABLE friendships 
      ALTER COLUMN user_id TYPE VARCHAR(50)
    `)

    await client.query(`
      ALTER TABLE friendships 
      ALTER COLUMN friend_id TYPE VARCHAR(50)
    `)

    // 既存のsubmissionsテーブルの外部キー列のサイズを拡張
    await client.query(`
      ALTER TABLE submissions 
      ALTER COLUMN user_id TYPE VARCHAR(50)
    `)

    // 友達関係テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        friend_id VARCHAR(50) NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, friend_id)
      )
    `)

    // 既存のfriendshipsテーブルにis_approved列を追加
    await client.query(`
      ALTER TABLE friendships 
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false
    `)

    // 課題提出履歴テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        assignment_name VARCHAR(255) NOT NULL,
        points_earned INTEGER DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_valid BOOLEAN DEFAULT true,
        image_url TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 通知管理テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        from_user_id VARCHAR(50),
        from_user_name VARCHAR(100),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    console.log('全テーブルが作成されました')
  } catch (error) {
    console.error('テーブル作成エラー:', error)
    throw error
  } finally {
    await client.end()
  }
}

// モックユーザーデータを挿入
export async function insertMockUsers() {
  const client = await createClient()

  try {
    const mockUsers = [
      {
        id: 'ABC12345',
        name: 'たろう',
        profile_image: null,
        points: 250,
        submissions: 25,
        badges: ['課題マスター', '連続提出王']
      },
      {
        id: 'DEF67890',
        name: 'はなこ',
        profile_image: null,
        points: 210,
        submissions: 21,
        badges: ['勤勉な学習者']
      },
      {
        id: 'GHI13579',
        name: 'けんた',
        profile_image: null,
        points: 180,
        submissions: 18,
        badges: ['数学の達人']
      },
      {
        id: 'JKL24680',
        name: 'あやか',
        profile_image: null,
        points: 150,
        submissions: 15,
        badges: ['英語の達人']
      }
    ]

    for (const user of mockUsers) {
      await client.query(`
        INSERT INTO users (id, name, profile_image, points, submissions, badges, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          profile_image = EXCLUDED.profile_image,
          points = EXCLUDED.points,
          submissions = EXCLUDED.submissions,
          badges = EXCLUDED.badges,
          last_login = NOW(),
          updated_at = NOW()
      `, [user.id, user.name, user.profile_image, user.points, user.submissions, user.badges])
    }

    // モック課題提出履歴を追加
    const mockSubmissions = [
      { user_id: 'ABC12345', assignment_name: '数学課題1', points_earned: 10 },
      { user_id: 'ABC12345', assignment_name: '英語課題1', points_earned: 10 },
      { user_id: 'DEF67890', assignment_name: '数学課題1', points_earned: 10 },
      { user_id: 'GHI13579', assignment_name: '数学課題1', points_earned: 10 },
      { user_id: 'JKL24680', assignment_name: '英語課題1', points_earned: 10 }
    ]

    for (const submission of mockSubmissions) {
      await client.query(`
        INSERT INTO submissions (user_id, assignment_name, points_earned)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [submission.user_id, submission.assignment_name, submission.points_earned])
    }

    // モック友達関係を追加
    const mockFriendships = [
      { user_id: 'ABC12345', friend_id: 'DEF67890' },
      { user_id: 'ABC12345', friend_id: 'GHI13579' },
      { user_id: 'DEF67890', friend_id: 'ABC12345' },
      { user_id: 'GHI13579', friend_id: 'ABC12345' }
    ]

    for (const friendship of mockFriendships) {
      await client.query(`
        INSERT INTO friendships (user_id, friend_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, friend_id) DO NOTHING
      `, [friendship.user_id, friendship.friend_id])
    }

    console.log('モックデータが挿入されました')
  } catch (error) {
    console.error('モックデータ挿入エラー:', error)
    throw error
  } finally {
    await client.end()
  }
}

// ユーザー操作API関数

// ユーザーを作成/更新
export async function upsertUser(userData: {
  id: string
  name: string
  email?: string | null
  profileImage?: string | null
  points?: number
  submissions?: number
  badges?: string[]
  passwordHash?: string
}) {
  const client = await createClient()

  try {
    // 必須フィールドのバリデーション
    if (!userData.id || !userData.name) {
      throw new Error('IDと名前は必須です')
    }
    const result = await client.query(`
      INSERT INTO users (id, name, email, password_hash, profile_image, points, submissions, badges, last_login)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
        profile_image = EXCLUDED.profile_image,
        points = EXCLUDED.points,
        submissions = EXCLUDED.submissions,
        badges = EXCLUDED.badges,
        last_login = NOW(),
        updated_at = NOW()
      RETURNING *
    `, [
      userData.id,
      userData.name,
      userData.email || null,
      userData.passwordHash || null,
      userData.profileImage || null,
      userData.points || 0,
      userData.submissions || 0,
      userData.badges || []
    ])

    return result.rows[0]
  } finally {
    await client.end()
  }
}

// ユーザーを取得
export async function getUser(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
    return result.rows[0] || null
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return null
  } finally {
    try {
      await client.end()
    } catch (endError) {
      console.error('データベース接続終了エラー:', endError)
    }
  }
}

// 全ユーザーを取得
export async function getAllUsers() {
  const client = await createClient()

  try {
    const result = await client.query('SELECT * FROM users ORDER BY points DESC')
    return result.rows
  } finally {
    await client.end()
  }
}

// ユーザーを削除
export async function deleteUser(userId: string) {
  const client = await createClient()

  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId])
    return true
  } finally {
    await client.end()
  }
}

// 友達関係API関数

// 友達を追加（友達申請として）
export async function addFriend(userId: string, friendId: string) {
  if (userId === friendId) return false

  const client = await createClient()

  try {
    // 友達が存在するかチェック
    const friendExists = await client.query('SELECT id FROM users WHERE id = $1', [friendId])
    if (friendExists.rows.length === 0) return false

    // 既存の友達関係をチェック
    const existingFriendship = await client.query(`
      SELECT * FROM friendships 
      WHERE user_id = $1 AND friend_id = $2
    `, [userId, friendId])

    if (existingFriendship.rows.length > 0) return false

    // 友達申請を追加（未承認状態）
    await client.query(`
      INSERT INTO friendships (user_id, friend_id, is_approved)
      VALUES ($1, $2, false)
    `, [userId, friendId])

    return true
  } catch (error) {
    console.error('友達追加エラー:', error)
    return false
  } finally {
    await client.end()
  }
}

// 友達リストを取得（承認済みのみ）
export async function getFriends(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT u.*, f.added_at
      FROM users u
      JOIN friendships f ON u.id = f.friend_id
      WHERE f.user_id = $1 AND f.is_approved = true
      ORDER BY f.added_at DESC
    `, [userId])

    return result.rows
  } finally {
    await client.end()
  }
}

// 友達関係を削除
export async function removeFriend(userId: string, friendId: string) {
  const client = await createClient()

  try {
    await client.query('DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2', [userId, friendId])
    return true
  } finally {
    await client.end()
  }
}

// 課題提出履歴API関数

// 課題提出を記録
export async function addSubmission(submissionData: {
  userId: string
  assignmentName: string
  pointsEarned: number
  isValid: boolean
  imageUrl?: string
}) {
  const client = await createClient()

  try {
    const result = await client.query(`
      INSERT INTO submissions (user_id, assignment_name, points_earned, is_valid, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      submissionData.userId,
      submissionData.assignmentName,
      submissionData.pointsEarned,
      submissionData.isValid,
      submissionData.imageUrl || null
    ])

    // ユーザーのポイントと提出回数を更新
    if (submissionData.isValid) {
      await client.query(`
        UPDATE users 
        SET points = points + $1, submissions = submissions + 1, updated_at = NOW()
        WHERE id = $2
      `, [submissionData.pointsEarned, submissionData.userId])
    }

    return result.rows[0]
  } finally {
    await client.end()
  }
}

// ユーザーの提出履歴を取得
export async function getUserSubmissions(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT * FROM submissions 
      WHERE user_id = $1 
      ORDER BY submitted_at DESC
    `, [userId])

    return result.rows
  } finally {
    await client.end()
  }
}

// 最後のログイン時間を更新
export async function updateLastLogin(userId: string) {
  const client = await createClient()

  try {
    await client.query(`
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [userId])
    return true
  } finally {
    await client.end()
  }
}

// ユーザーIDでユーザーを取得（認証用）
export async function getUserForAuth(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query('SELECT id, name, password_hash FROM users WHERE id = $1', [userId])
    return result.rows[0] || null
  } finally {
    await client.end()
  }
}

// パスワードハッシュを更新
export async function updatePassword(userId: string, passwordHash: string) {
  const client = await createClient()

  try {
    await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, userId])
    return true
  } finally {
    await client.end()
  }
}

// 通知管理API関数

// 通知を作成
export async function createNotification(notificationData: {
  userId: string
  type: string
  title: string
  message: string
  fromUserId?: string
  fromUserName?: string
}) {
  const client = await createClient()

  try {
    const result = await client.query(`
      INSERT INTO notifications (user_id, type, title, message, from_user_id, from_user_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      notificationData.userId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.fromUserId || null,
      notificationData.fromUserName || null
    ])

    return result.rows[0]
  } finally {
    await client.end()
  }
}

// ユーザーの通知を取得
export async function getUserNotifications(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId])

    return result.rows
  } catch (error) {
    console.error('通知取得エラー:', error)
    return []
  } finally {
    try {
      await client.end()
    } catch (endError) {
      console.error('データベース接続終了エラー:', endError)
    }
  }
}

// 通知を既読にする
export async function markNotificationAsRead(notificationId: number) {
  const client = await createClient()

  try {
    await client.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1
    `, [notificationId])
    return true
  } finally {
    await client.end()
  }
}

// ユーザーのすべての通知を既読にする
export async function markAllNotificationsAsRead(userId: string) {
  const client = await createClient()

  try {
    await client.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
    `, [userId])
    return true
  } finally {
    await client.end()
  }
}

// 通知を削除
export async function deleteNotification(notificationId: number) {
  const client = await createClient()

  try {
    await client.query('DELETE FROM notifications WHERE id = $1', [notificationId])
    return true
  } finally {
    await client.end()
  }
}

// ユーザーの未読通知数を取得
export async function getUnreadNotificationCount(userId: string) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `, [userId])

    return parseInt(result.rows[0].count)
  } finally {
    await client.end()
  }
}

// 友達申請を承認
export async function approveFriendRequest(userId: string, requesterId: string) {
  const client = await createClient()

  try {
    // 友達申請を承認
    await client.query(`
      UPDATE friendships 
      SET is_approved = true 
      WHERE user_id = $1 AND friend_id = $2
    `, [requesterId, userId])

    // 逆方向の友達関係も作成（相互フォロー）
    await client.query(`
      INSERT INTO friendships (user_id, friend_id, is_approved)
      VALUES ($1, $2, true)
      ON CONFLICT (user_id, friend_id) DO UPDATE SET is_approved = true
    `, [userId, requesterId])

    return true
  } catch (error) {
    console.error('友達申請承認エラー:', error)
    return false
  } finally {
    await client.end()
  }
}

// 友達申請を取得
export async function getFriendRequest(userId: string, requesterId: string) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT * FROM friendships 
      WHERE user_id = $1 AND friend_id = $2 AND is_approved = false
    `, [requesterId, userId])

    return result.rows[0] || null
  } finally {
    await client.end()
  }
}
