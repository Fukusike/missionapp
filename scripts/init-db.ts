
import { createTables, insertMockUsers, createNotification, createClient } from '../utils/db'

async function insertMockNotifications() {
  try {
    // ダミー通知データを作成
    const mockNotifications = [
      {
        userId: 'ABC12345',
        type: 'friend_request',
        title: '友達申請',
        message: 'はなこさんから友達申請が届いています',
        fromUserId: 'DEF67890',
        fromUserName: 'はなこ'
      },
      {
        userId: 'ABC12345',
        type: 'friend_accepted',
        title: '友達申請承認',
        message: 'けんたさんがあなたの友達申請を承認しました',
        fromUserId: 'GHI13579',
        fromUserName: 'けんた'
      },
      {
        userId: 'DEF67890',
        type: 'friend_accepted',
        title: '友達申請承認',
        message: 'たろうさんがあなたの友達申請を承認しました',
        fromUserId: 'ABC12345',
        fromUserName: 'たろう'
      },
      {
        userId: 'GHI13579',
        type: 'friend_request',
        title: '友達申請',
        message: 'あやかさんから友達申請が届いています',
        fromUserId: 'JKL24680',
        fromUserName: 'あやか'
      },
      {
        userId: 'JKL24680',
        type: 'friend_accepted',
        title: '友達申請承認',
        message: 'はなこさんがあなたの友達申請を承認しました',
        fromUserId: 'DEF67890',
        fromUserName: 'はなこ'
      }
    ]

    for (const notification of mockNotifications) {
      await createNotification(notification)
    }

    console.log('モック通知データが挿入されました')
  } catch (error) {
    console.error('モック通知データ挿入エラー:', error)
    throw error
  }
}

async function initializeEmailTables() {
  try {
    const client = await createClient()
    
    // メールテンプレートテーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        template_key VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        purpose TEXT NOT NULL,
        is_html BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // メール送信ログテーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        template_key VARCHAR(50) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 初期メールテンプレートデータを挿入
    await client.query(`
      INSERT INTO email_templates (template_key, subject, content, purpose) VALUES
      (
        'account_created',
        '🎉 ようこそ、スタディクエストの冒険者へ！',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; overflow: hidden;">
          <div style="padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 28px;">🏆 冒険が始まった！</h1>
            <p style="font-size: 18px; margin: 20px 0;">おめでとう！君はついに<strong>スタディクエスト</strong>の世界に足を踏み入れた。</p>
            <p style="font-size: 16px; margin: 20px 0;">毎日の課題が<em>ワクワクするミッション</em>に変わる魔法の旅が、今始まる。</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="margin: 0; font-size: 16px;">✨ <strong>初心者ボーナス</strong>：最初の課題提出で<span style="color: #FFD700;">+50XP</span>ゲット！</p>
            </div>
            <p style="font-size: 14px; margin: 20px 0; opacity: 0.9;">ミッションちゃんが君を待ってるよ。準備はいい？</p>
          </div>
        </div>',
        'アカウント新規作成成功時の歓迎メール'
      ),
      (
        'friend_request',
        '👋 新しい冒険仲間から友達申請が届いたよ！',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; border-radius: 15px; overflow: hidden;">
          <div style="padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 26px; color: #d2691e;">🤝 友達申請が到着！</h1>
            <p style="font-size: 18px; margin: 20px 0;">やったね！<strong>{{fromUserName}}</strong>さんが君と一緒に学習したがってる。</p>
            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="margin: 0; font-size: 16px;">🔥 友達と一緒だと、やる気は<span style="color: #ff6b6b; font-weight: bold;">2倍</span>になるって知ってた？</p>
            </div>
            <p style="font-size: 16px; margin: 20px 0;">今すぐアプリで返事をして、一緒に<em>学習レベル</em>を上げていこう！</p>
            <p style="font-size: 14px; margin: 20px 0; opacity: 0.8;">💫 友達承認ボーナス：お互いに+25XPプレゼント！</p>
          </div>
        </div>',
        '他ユーザーから友達申請を受けた時の通知メール'
      ),
      (
        'friend_accepted',
        '🎊 友達申請が承認されました！一緒に頑張ろう！',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; border-radius: 15px; overflow: hidden;">
          <div style="padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 26px; color: #20b2aa;">🌟 新しい学習パートナー誕生！</h1>
            <p style="font-size: 18px; margin: 20px 0;">素晴らしい！<strong>{{fromUserName}}</strong>さんが君の友達申請を承認してくれた。</p>
            <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; font-size: 16px;">🏆 <strong>友達ボーナス獲得</strong></p>
              <p style="margin: 0; font-size: 16px; color: #ff6b6b;">+25XP ゲット！</p>
            </div>
            <p style="font-size: 16px; margin: 20px 0;">これで君たちは<em>学習戦士コンビ</em>だ。一緒にランキングを駆け上がろう！</p>
            <p style="font-size: 14px; margin: 20px 0; opacity: 0.8;">💡 友達と競争すると、課題完了率が85%アップするよ！</p>
          </div>
        </div>',
        '送った友達申請が承認された時の通知メール'
      )
      ON CONFLICT (template_key) DO NOTHING
    `)

    client.release()
    console.log('メールテンプレートが初期化されました')
  } catch (error) {
    console.error('メールテンプレート初期化エラー:', error)
    throw error
  }
}



async function initializeDatabase() {
  try {
    console.log('データベースを初期化しています...')
    
    // テーブル作成（coursesテーブルも含む）
    await createTables()
    
    // メールテンプレートテーブル初期化
    await initializeEmailTables()
    
    // モックデータ挿入
    await insertMockUsers()
    
    // モック通知データ挿入
    await insertMockNotifications()
    
    console.log('データベースの初期化が完了しました！')
  } catch (error) {
    console.error('データベース初期化エラー:', error)
    process.exit(1)
  }
}

initializeDatabase()
