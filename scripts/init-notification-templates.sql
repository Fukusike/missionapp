
-- 通知テンプレート初期データ登録用SQL
-- 使用方法: psql $DATABASE_URL -f scripts/init-notification-templates.sql

-- 友達申請通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'friend_request',
  '友達申請',
  '{{fromUserName}}さんから友達申請が届いています',
  '他ユーザーから友達申請を受けた時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 友達申請承認通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'friend_accepted',
  '友達申請承認',
  '{{fromUserName}}さんがあなたの友達申請を承認しました',
  '送った友達申請が承認された時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- ランキング変動通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'ranking_change',
  'ランキング変動',
  'あなたのランキングが{{rankChange}}位{{direction}}しました！現在{{currentRank}}位です',
  '友達ランキングの順位変動通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- ランキング追い越し通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'ranking_overtaken',
  'ランキング変動',
  '{{overtakerName}}さんにポイントで追い越されました！現在のスコア: あなた {{yourPoints}}pt, {{overtakerName}}さん {{overtakerPoints}}pt',
  '友達に追い越された時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- ミッションちゃんメッセージテンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'mission_message',
  'ミッションちゃんからのメッセージ',
  '{{message}}',
  'ミッションちゃんからの励ましメッセージ'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 課題提出完了通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'submission_completed',
  '課題提出完了',
  '「{{assignmentName}}」の課題提出が完了しました！{{points}}ポイントを獲得しました。',
  '課題提出完了時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- レベルアップ通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'level_up',
  'レベルアップ！',
  'おめでとうございます！レベル{{newLevel}}に到達しました！総ポイント: {{totalPoints}}pt',
  'レベルアップ時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- バッジ獲得通知テンプレート
INSERT INTO notification_templates (notification_type, title_template, message_template, description) VALUES
(
  'badge_earned',
  'バッジ獲得！',
  '新しいバッジ「{{badgeName}}」を獲得しました！{{description}}',
  'バッジ獲得時の通知'
)
ON CONFLICT (notification_type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 実行確認メッセージ
SELECT '通知テンプレート初期データの登録が完了しました。' AS status;
SELECT COUNT(*) AS template_count FROM notification_templates;
