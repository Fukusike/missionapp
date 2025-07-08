
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'ファイルとユーザーIDが必要です' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下である必要があります' },
        { status: 400 }
      )
    }

    // ファイル拡張子チェック
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const fileExtension = path.extname(file.name).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: '対応していない画像形式です' },
        { status: 400 }
      )
    }

    // ファイル名を生成（ユーザーID + タイムスタンプ + 拡張子）
    const timestamp = Date.now()
    const fileName = `${userId}_${timestamp}${fileExtension}`
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'profile-images', fileName)

    // ファイルをバイナリデータに変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ファイルを保存
    await writeFile(filePath, buffer)

    // 保存されたファイルのパスを返す
    const relativePath = `/uploads/profile-images/${fileName}`
    
    return NextResponse.json({ 
      message: 'プロフィール画像がアップロードされました',
      imagePath: relativePath 
    })
  } catch (error) {
    console.error('画像アップロードエラー:', error)
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    )
  }
}
