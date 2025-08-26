import { Page } from '../db/models/pages';

export async function getPage(url: string) {
  try {
    return await Page.findOne({ url })
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}