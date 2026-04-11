import { User } from '../models/user';
import { logError } from './logs';

export async function getUser(token: string) {
  try {
    return await User.findOne({ token })
  } catch (error) {
    logError(error, { service: 'users', action: 'getUser' })
    throw new Error('Failed to fetch projects');
  }
}

export async function getUserByName(name: string) {
  try {
    return await User.findOne({ name })
  } catch (error) {
    logError(error, { service: 'users', action: 'getUserByName', name })
    throw new Error('Failed to fetch projects');
  }
}

export async function getUserByTelegramUserId(telegramUserId: number) {
  try {
    return await User.findOne({ 'telegram.userId': telegramUserId })
  } catch (error) {
    logError(error, { service: 'users', action: 'getUserByTelegramUserId', telegramUserId })
    throw new Error('Failed to fetch projects')
  }
}

export async function isNameTaken(name: string) {
  try {
    const existing = await User.findOne({ name }).lean()
    return !!existing
  } catch (error) {
    logError(error, { service: 'users', action: 'isNameTaken', name })
    throw new Error('Failed to fetch projects')
  }
}