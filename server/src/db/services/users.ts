import { User } from '../models/user';

export async function getUser(token: string) {
  try {
    return await User.findOne({ token })
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

export async function getUserByName(name: string) {
  try {
    return await User.findOne({ name })
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}