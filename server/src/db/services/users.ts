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