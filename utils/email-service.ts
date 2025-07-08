
import nodemailer from 'nodemailer'
import { createClient } from './db'

interface EmailTemplate {
  id: number
  template_key: string
  subject: string
  content: string
  purpose: string
  is_html: boolean
}

interface EmailData {
  templateKey: string
  recipientEmail: string
  userId: string
  variables?: Record<string, string>
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }

  async getTemplate(templateKey: string): Promise<EmailTemplate | null> {
    try {
      const client = await createClient()
      const result = await client.query(
        'SELECT * FROM email_templates WHERE template_key = $1',
        [templateKey]
      )
      client.release()
      return result.rows[0] || null
    } catch (error) {
      console.error(`テンプレート取得エラー (${templateKey}):`, error)
      return null
    }
  }

  private replaceVariables(content: string, variables: Record<string, string> = {}): string {
    let replacedContent = content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      replacedContent = replacedContent.replace(regex, value)
    }
    return replacedContent
  }

  private async logEmail(
    userId: string,
    templateKey: string,
    recipientEmail: string,
    subject: string,
    status: 'sent' | 'failed',
    errorMessage?: string,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const client = await createClient()
      await client.query(
        `INSERT INTO email_logs (user_id, template_key, recipient_email, subject, status, error_message, retry_count, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          templateKey,
          recipientEmail,
          subject,
          status,
          errorMessage,
          retryCount,
          status === 'sent' ? new Date() : null
        ]
      )
      client.release()
    } catch (error) {
      console.error('メールログ保存エラー:', error)
    }
  }

  async sendEmail({ templateKey, recipientEmail, userId, variables = {} }: EmailData): Promise<boolean> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const template = await this.getTemplate(templateKey)
        if (!template) {
          throw new Error(`テンプレート "${templateKey}" が見つかりません`)
        }

        const subject = this.replaceVariables(template.subject, variables)
        const content = this.replaceVariables(template.content, variables)

        const mailOptions = {
          from: `"スタディクエスト 🎮" <${process.env.GMAIL_USER}>`,
          to: recipientEmail,
          subject: subject,
          html: content,
        }

        await this.transporter.sendMail(mailOptions)
        
        // 成功ログ
        await this.logEmail(userId, templateKey, recipientEmail, subject, 'sent', undefined, attempt - 1)
        console.log(`メール送信成功 (${attempt}回目): ${recipientEmail} - ${templateKey}`)
        return true

      } catch (error) {
        lastError = error as Error
        console.error(`メール送信失敗 (${attempt}/${maxRetries}回目):`, error)

        if (attempt === maxRetries) {
          // 最終失敗ログ
          const template = await this.getTemplate(templateKey)
          const subject = template ? this.replaceVariables(template.subject, variables) : 'メール送信失敗'
          await this.logEmail(
            userId,
            templateKey,
            recipientEmail,
            subject,
            'failed',
            lastError.message,
            maxRetries
          )
        } else {
          // リトライ前の待機時間（指数バックオフ）
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    return false
  }

  async sendAccountCreatedEmail(userId: string, userEmail: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      templateKey: 'account_created',
      recipientEmail: userEmail,
      userId: userId,
      variables: { userName }
    })
  }

  async sendFriendRequestEmail(
    recipientUserId: string, 
    recipientEmail: string, 
    fromUserId: string, 
    fromUserName: string
  ): Promise<boolean> {
    return this.sendEmail({
      templateKey: 'friend_request',
      recipientEmail: recipientEmail,
      userId: recipientUserId,
      variables: { fromUserName }
    })
  }

  async sendFriendAcceptedEmail(
    recipientUserId: string, 
    recipientEmail: string, 
    fromUserId: string, 
    fromUserName: string
  ): Promise<boolean> {
    return this.sendEmail({
      templateKey: 'friend_accepted',
      recipientEmail: recipientEmail,
      userId: recipientUserId,
      variables: { fromUserName }
    })
  }
}

export const emailService = new EmailService()
