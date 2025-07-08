
import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, upsertUser } from '@/utils/db'
import { emailService } from '@/utils/email-service'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'

// GET: 全ユーザーを取得
export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: ユーザーを作成/更新
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    if (!userData.id || !userData.name) {
      return NextResponse.json(
        { error: 'ユーザーIDと名前は必須です' },
        { status: 400 }
      )
    }

    // パスワードがある場合はハッシュ化
    let passwordHash = undefined
    if (userData.password) {
      if (userData.password.length < 8) {
        return NextResponse.json(
          { error: 'パスワードは8文字以上である必要があります' },
          { status: 400 }
        )
      }
      passwordHash = await bcrypt.hash(userData.password, 12)
    }

    // プロフィール画像のアップロード処理
    let profileImagePath = userData.profileImage
    if (userData.profileImageFile) {
      // Base64画像データの場合の処理
      const base64Data = userData.profileImageFile.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      
      // ファイル拡張子を判定
      const mimeType = userData.profileImageFile.match(/data:image\/(\w+);base64,/)?.[1] || 'png'
      const fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType
      
      // ファイル名を生成
      const timestamp = Date.now()
      const fileName = `${userData.id}_${timestamp}.${fileExtension}`
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'profile-images', fileName)
      
      try {
        const fs = require('fs')
        const path = require('path')
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        
        // ファイルを保存
        await writeFile(filePath, buffer)
        profileImagePath = `/uploads/profile-images/${fileName}`
      } catch (error) {
        console.error('プロフィール画像保存エラー:', error)
        // エラーがあってもユーザー作成は続行
      }
    }

    const user = await upsertUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      profileImage: profileImagePath,
      points: userData.points,
      submissions: userData.submissions,
      badges: userData.badges,
      passwordHash: passwordHash
    })

    // アカウント作成ウェルカムメールを送信（メールアドレスがある場合のみ）
    if (userData.email) {
      try {
        await emailService.sendAccountCreatedEmail(userData.id, userData.email, userData.name)
        console.log(`ウェルカムメール送信成功: ${userData.email}`)
      } catch (error) {
        console.error('ウェルカムメール送信エラー:', error)
        // メール送信エラーはユーザー作成の成功に影響しない
      }
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    )
  }
}
