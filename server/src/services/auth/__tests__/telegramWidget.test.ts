import { describe, it, expect } from '@jest/globals'
import { createHash, createHmac } from 'crypto'
import { verifyTelegramWidgetPayload } from '../telegramWidget.js'

function makeValidPayload(botToken: string, fields: Record<string, string | number>) {
  const keys = Object.keys(fields).sort()
  const dataCheckString = keys.map((k) => `${k}=${fields[k]}`).join('\n')
  const secretKey = createHash('sha256').update(botToken).digest()
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  return { ...fields, hash }
}

describe('verifyTelegramWidgetPayload', () => {
  const botToken = 'test-bot-token'
  const maxAge = 3600

  it('accepts a correctly signed payload', () => {
    const authDate = Math.floor(Date.now() / 1000)
    const payload = makeValidPayload(botToken, {
      id: 42,
      first_name: 'Test',
      username: 'testuser',
      auth_date: authDate,
    })
    const result = verifyTelegramWidgetPayload(
      payload as unknown as Record<string, unknown>,
      botToken,
      maxAge
    )
    expect(result).toEqual({ ok: true, telegramUserId: 42, username: 'testuser' })
  })

  it('rejects wrong hash', () => {
    const authDate = Math.floor(Date.now() / 1000)
    const payload = makeValidPayload(botToken, {
      id: 1,
      auth_date: authDate,
    })
    const result = verifyTelegramWidgetPayload(
      { ...payload, hash: 'deadbeef' } as unknown as Record<string, unknown>,
      botToken,
      maxAge
    )
    expect(result.ok).toBe(false)
  })

  it('rejects stale auth_date', () => {
    const old = Math.floor(Date.now() / 1000) - 99999
    const payload = makeValidPayload(botToken, {
      id: 1,
      auth_date: old,
    })
    const result = verifyTelegramWidgetPayload(
      payload as unknown as Record<string, unknown>,
      botToken,
      maxAge
    )
    expect(result).toEqual({ ok: false, reason: 'auth_date_expired' })
  })
})
