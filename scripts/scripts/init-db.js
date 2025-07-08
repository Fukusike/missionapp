"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../utils/db");
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
        ];
        for (const notification of mockNotifications) {
            await (0, db_1.createNotification)(notification);
        }
        console.log('モック通知データが挿入されました');
    }
    catch (error) {
        console.error('モック通知データ挿入エラー:', error);
        throw error;
    }
}
async function initializeDatabase() {
    try {
        console.log('データベースを初期化しています...');
        // テーブル作成
        await (0, db_1.createTables)();
        // モックデータ挿入
        await (0, db_1.insertMockUsers)();
        // モック通知データ挿入
        await insertMockNotifications();
        console.log('データベースの初期化が完了しました！');
    }
    catch (error) {
        console.error('データベース初期化エラー:', error);
        process.exit(1);
    }
}
initializeDatabase();
