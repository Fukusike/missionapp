
import { createUserTable, insertMockUsers } from '../utils/db'

async function initializeDatabase() {
  try {
    console.log('データベースを初期化しています...')
    
    // テーブル作成
    await createUserTable()
    
    // モックユーザー挿入
    await insertMockUsers()
    
    console.log('データベースの初期化が完了しました！')
  } catch (error) {
    console.error('データベース初期化エラー:', error)
  }
}

initializeDatabase()
