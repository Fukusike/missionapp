
import { Client } from 'pg'

// データベース接続クライアントを作成
export async function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()
  return client
}

// ユーザーテーブルを作成する関数
export async function createUserTable() {
  const client = await createClient()
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(8) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        profile_image TEXT,
        points INTEGER DEFAULT 0,
        submissions INTEGER DEFAULT 0,
        badges TEXT[] DEFAULT '{}',
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
    
    console.log('ユーザーテーブルと友達テーブルが作成されました')
  } catch (error) {
    console.error('テーブル作成エラー:', error)
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
        INSERT INTO users (id, name, profile_image, points, submissions, badges)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.name, user.profile_image, user.points, user.submissions, user.badges])
    }
    
    console.log('モックユーザーデータが挿入されました')
  } catch (error) {
    console.error('モックデータ挿入エラー:', error)
  } finally {
    await client.end()
  }
}
