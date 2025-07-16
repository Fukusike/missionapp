
-- メールテンプレート初期データ登録用SQL
-- 使用方法: psql $DATABASE_URL -f scripts/init-email-templates.sql

-- アカウント作成成功時の歓迎メール
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
)
ON CONFLICT (template_key) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  purpose = EXCLUDED.purpose,
  updated_at = CURRENT_TIMESTAMP;

-- 友達申請通知メール
INSERT INTO email_templates (template_key, subject, content, purpose) VALUES
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
)
ON CONFLICT (template_key) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  purpose = EXCLUDED.purpose,
  updated_at = CURRENT_TIMESTAMP;

-- 友達申請承認通知メール
INSERT INTO email_templates (template_key, subject, content, purpose) VALUES
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
ON CONFLICT (template_key) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  purpose = EXCLUDED.purpose,
  updated_at = CURRENT_TIMESTAMP;

-- ランキング追い越し通知メール
INSERT INTO email_templates (template_key, subject, content, purpose) VALUES
(
  'ranking_overtaken',
  '🏃‍♂️ ランキング変動！追い越されちゃった！',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; border-radius: 15px; overflow: hidden;">
    <div style="padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 20px 0; font-size: 26px; color: #d63384;">🏆 ランキングバトル発生！</h1>
      <p style="font-size: 18px; margin: 20px 0;">おっと！<strong>{{overtakerName}}</strong>さんがあなたを追い越しました！</p>
      <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 16px;">📊 <strong>現在のスコア</strong></p>
        <p style="margin: 0 0 5px 0; font-size: 16px;">🥇 {{overtakerName}}さん: <span style="color: #198754; font-weight: bold;">{{overtakerPoints}}pt</span></p>
        <p style="margin: 0; font-size: 16px;">🥈 あなた: <span style="color: #fd7e14; font-weight: bold;">{{yourPoints}}pt</span></p>
      </div>
      <p style="font-size: 16px; margin: 20px 0;">でも大丈夫！逆転のチャンスはまだまだある。<em>今すぐ課題に取り組んで</em>、トップを奪い返そう！</p>
      <p style="font-size: 14px; margin: 20px 0; opacity: 0.8;">🔥 連続課題提出で一気に逆転できるよ！</p>
    </div>
  </div>',
  '友達に追い越された時のメール通知'
)
ON CONFLICT (template_key) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  purpose = EXCLUDED.purpose,
  updated_at = CURRENT_TIMESTAMP;

-- 実行確認メッセージ
SELECT 'メールテンプレート初期データの登録が完了しました。' AS status;
SELECT COUNT(*) AS template_count FROM email_templates;
