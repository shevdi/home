import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { User } from '../../db/models/user.js'
import { getUserByTelegramUserId, isNameTaken } from '../../db/services/users.js'
import { issueSessionForUser } from './issueSession.js'
import { verifyTelegramWidgetPayload } from './telegramWidget.js'

/** Pending-registration JWT: 10m TTL, signed with TELEGRAM_PENDING_SECRET. Claims: typ, telegramUserId, telegramUsername. */
const PENDING_TTL = '10m'
const PENDING_TYP = 'telegram_pending'

function telegramAuthConfigured(): boolean {
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_PENDING_SECRET)
}

function isMongoDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000
}

export async function telegramVerify(req: Request, res: Response) {
  if (!telegramAuthConfigured()) {
    return res.status(503).json({ message: 'Telegram вход не настроен' })
  }

  const body = req.body as Record<string, unknown>
  const result = verifyTelegramWidgetPayload(
    body,
    env.TELEGRAM_BOT_TOKEN!,
    env.TELEGRAM_AUTH_MAX_AGE_SECONDS
  )
  if (!result.ok) {
    return res.status(401).json({ message: 'Недействительные данные Telegram' })
  }

  const existing = await getUserByTelegramUserId(result.telegramUserId)
  if (existing?.active) {
    issueSessionForUser(res, {
      name: existing.name,
      roles: existing.roles,
      userId: existing._id?.toString(),
    })
    return
  }

  const pendingTicket = jwt.sign(
    {
      typ: PENDING_TYP,
      telegramUserId: result.telegramUserId,
      telegramUsername: result.username ?? null,
    },
    env.TELEGRAM_PENDING_SECRET!,
    { expiresIn: PENDING_TTL }
  )

  const suggestedName = result.username
    ? result.username.startsWith('@')
      ? result.username
      : `${result.username}`
    : undefined

  return res.json({ pendingTicket, suggestedName })
}

export async function telegramCompleteName(req: Request, res: Response) {
  if (!telegramAuthConfigured()) {
    return res.status(503).json({ message: 'Telegram вход не настроен' })
  }

  const { pendingTicket, name: rawName } = req.body as {
    pendingTicket?: unknown
    name?: unknown
  }

  if (typeof pendingTicket !== 'string' || !pendingTicket) {
    return res.status(400).json({ message: 'Токен регистрации обязателен' })
  }

  const name = typeof rawName === 'string' ? rawName.trim() : ''
  if (!name) {
    return res.status(400).json({ message: 'Имя пользователя обязательно' })
  }

  let decoded: jwt.JwtPayload
  try {
    decoded = jwt.verify(pendingTicket, env.TELEGRAM_PENDING_SECRET!) as jwt.JwtPayload
  } catch {
    return res.status(401).json({ message: 'Токен регистрации недействителен или истёк' })
  }

  if (decoded.typ !== PENDING_TYP) {
    return res.status(401).json({ message: 'Токен регистрации недействителен' })
  }

  const telegramUserId = Number(decoded.telegramUserId)
  if (!Number.isFinite(telegramUserId)) {
    return res.status(401).json({ message: 'Токен регистрации недействителен' })
  }

  const telegramUsername =
    typeof decoded.telegramUsername === 'string' && decoded.telegramUsername.length > 0
      ? decoded.telegramUsername
      : undefined

  const existingByTg = await getUserByTelegramUserId(telegramUserId)
  if (existingByTg?.active) {
    issueSessionForUser(res, {
      name: existingByTg.name,
      roles: existingByTg.roles,
      userId: existingByTg._id?.toString(),
    })
    return
  }

  if (await isNameTaken(name)) {
    return res.status(409).json({ code: 'NAME_CONFLICT', message: 'Это имя уже занято' })
  }

  try {
    const created = await User.create({
      name,
      telegram: { userId: telegramUserId, username: telegramUsername },
      roles: ['user'],
      active: true,
    })
    issueSessionForUser(res, {
      name: created.name,
      roles: created.roles,
      userId: created._id?.toString(),
    })
  } catch (err: unknown) {
    if (isMongoDuplicateKey(err)) {
      return res.status(409).json({ code: 'NAME_CONFLICT', message: 'Это имя уже занято' })
    }
    throw err
  }
}
