import { NextRequest, NextResponse } from 'next/server'
import { getUser, deleteUser, updateLastLogin, upsertUser } from '@/utils/db'
import { writeFile } from 'fs/promises'
import path from 'path'

// GET: 特定ユーザーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // タイムアウト処理を追加
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    )

    const user = await Promise.race([
      getUser(id),
      timeoutPromise
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 最後のログイン時間を更新（非同期で実行）
    updateLastLogin(id).catch(console.error)

    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'リクエストがタイムアウトしました' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ユーザー情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userData = await request.json()

    // IDが一致しているかチェック
    if (userData.id && userData.id !== id) {
      return NextResponse.json(
        { error: 'URLのIDとデータのIDが一致しません' },
        { status: 400 }
      )
    }

    // 既存のユーザー情報を取得
    const existingUser = await getUser(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
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
      const fileName = `${id}_${timestamp}.${fileExtension}`
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'profile-images', fileName)

      try {
        const fs = require('fs')


        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        // ファイルを保存
        await writeFile(filePath, buffer)
        profileImagePath = `/uploads/profile-images/${fileName}`

        // 古いプロフィール画像を削除（デフォルト画像でない場合）
        if (userData.profileImage && userData.profileImage.startsWith('/uploads/profile-images/')) {
          const oldFilePath = path.join(process.cwd(), 'public', userData.profileImage)
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath)
          }
        }
      } catch (error) {
        console.error('プロフィール画像保存エラー:', error)
        // エラーがあってもユーザー更新は続行
      }
    }

    // ユーザー情報を更新（既存の値を保持）
    const updatedUser = await upsertUser({
      id,
      name: userData.name || existingUser.name,
      email: userData.email !== undefined ? userData.email : existingUser.email,
      profileImage: profileImagePath !== undefined ? profileImagePath : existingUser.profileImage,
      points: userData.points !== undefined ? userData.points : existingUser.points,
      submissions: userData.submissions !== undefined ? userData.submissions : existingUser.submissions,
      badges: userData.badges || existingUser.badges
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('ユーザー更新エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: ユーザーを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteUser(id)
    return NextResponse.json({ message: 'ユーザーが削除されました' })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    )
  }
}