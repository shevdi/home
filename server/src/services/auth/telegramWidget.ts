import { createHash, createHmac } from 'crypto'

export type TelegramVerifyResult =
  | { ok: false; reason: string }
  | { ok: true; telegramUserId: number; username?: string }

/**
 * Validates Telegram Login Widget payload per
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramWidgetPayload(
  input: Record<string, unknown>,
  botToken: string,
  maxAgeSeconds: number
): TelegramVerifyResult {
  const hash = input.hash
  if (typeof hash !== 'string' || !hash) {
    return { ok: false, reason: 'missing_hash' }
  }

  const idRaw = input.id
  if (idRaw === undefined || idRaw === null) {
    return { ok: false, reason: 'missing_id' }
  }
  const telegramUserId = typeof idRaw === 'number' ? idRaw : Number(idRaw)
  if (!Number.isFinite(telegramUserId)) {
    return { ok: false, reason: 'invalid_id' }
  }

  const authRaw = input.auth_date
  if (authRaw === undefined || authRaw === null) {
    return { ok: false, reason: 'missing_auth_date' }
  }
  const authDate = typeof authRaw === 'number' ? authRaw : Number(authRaw)
  if (!Number.isFinite(authDate)) {
    return { ok: false, reason: 'invalid_auth_date' }
  }
  const nowSec = Math.floor(Date.now() / 1000)
  if (nowSec - authDate > maxAgeSeconds) {
    return { ok: false, reason: 'auth_date_expired' }
  }

  const keys = Object.keys(input)
    .filter((k) => k !== 'hash')
    .sort()

  const pairs: string[] = []
  for (const key of keys) {
    const v = input[key]
    if (v === undefined || v === null) {
      continue
    }
    pairs.push(`${key}=${v}`)
  }
  const dataCheckString = pairs.join('\n')
  const secretKey = createHash('sha256').update(botToken).digest()
  const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  if (hmac !== hash) {
    return { ok: false, reason: 'hash_mismatch' }
  }

  const username = input.username
  const uname = typeof username === 'string' && username.length > 0 ? username : undefined

  return { ok: true, telegramUserId, username: uname }
}
