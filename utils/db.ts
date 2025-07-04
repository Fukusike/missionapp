
const { Client } = require('pg')

// データベース接続クライアントを作成
async function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()
  return client
}

// 全テーブルを作成する関数
async function createTables() {
  const client = await createClient()

  try {
    // ユーザーテーブル（最後のログイン時間を追加）
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(8) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
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

    // 友達関係テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(8) NOT NULL,
        friend_id VARCHAR(8) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, friend_id)
      )
    `)

    // 課題提出履歴テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(8) NOT NULL,
        assignment_name VARCHAR(255) NOT NULL,
        points_earned INTEGER DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_valid BOOLEAN DEFAULT true,
        image_url TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
async function insertMockUsers() {
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
async function upsertUser(userData) {
  const client = await createClient()

  try {
    const result = await client.query(`
      INSERT INTO users (id, name, password_hash, profile_image, points, submissions, badges, last_login)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
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
async function getUser(userId) {
  const client = await createClient()

  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
    return result.rows[0] || null
  } finally {
    await client.end()
  }
}

// 全ユーザーを取得
async function getAllUsers() {
  const client = await createClient()

  try {
    const result = await client.query('SELECT * FROM users ORDER BY points DESC')
    return result.rows
  } finally {
    await client.end()
  }
}

// ユーザーを削除
async function deleteUser(userId) {
  const client = await createClient()

  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId])
    return true
  } finally {
    await client.end()
  }
}

// 友達関係API関数

// 友達を追加
async function addFriend(userId, friendId) {
  if (userId === friendId) return false

  const client = await createClient()

  try {
    // 友達が存在するかチェック
    const friendExists = await client.query('SELECT id FROM users WHERE id = $1', [friendId])
    if (friendExists.rows.length === 0) return false

    // 友達関係を追加
    await client.query(`
      INSERT INTO friendships (user_id, friend_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, friend_id) DO NOTHING
    `, [userId, friendId])

    return true
  } catch (error) {
    console.error('友達追加エラー:', error)
    return false
  } finally {
    await client.end()
  }
}

// 友達リストを取得
async function getFriends(userId) {
  const client = await createClient()

  try {
    const result = await client.query(`
      SELECT u.*, f.added_at
      FROM users u
      JOIN friendships f ON u.id = f.friend_id
      WHERE f.user_id = $1
      ORDER BY f.added_at DESC
    `, [userId])

    return result.rows
  } finally {
    await client.end()
  }
}

// 友達関係を削除
async function removeFriend(userId, friendId) {
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
async function addSubmission(submissionData) {
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
async function getUserSubmissions(userId) {
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
async function updateLastLogin(userId) {
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
async function getUserForAuth(userId) {
  const client = await createClient()

  try {
    const result = await client.query('SELECT id, name, password_hash FROM users WHERE id = $1', [userId])
    return result.rows[0] || null
  } finally {
    await client.end()
  }
}

// パスワードハッシュを更新
async function updatePassword(userId, passwordHash) {
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

// CommonJS exports
module.exports = {
  createClient,
  createTables,
  insertMockUsers,
  upsertUser,
  getUser,
  getAllUsers,
  deleteUser,
  addFriend,
  getFriends,
  removeFriend,
  addSubmission,
  getUserSubmissions,
  updateLastLogin,
  getUserForAuth,
  updatePassword
}
