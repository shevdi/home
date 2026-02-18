import { Page } from '../models/pages';
import { logError } from './logs';

export async function getPage(url: string) {
  try {
    return await Page.findOne({ url })
  } catch (error) {
    logError(error, { service: 'pages', action: 'getPage', url })
    throw new Error('Failed to fetch projects');
  }
}

export async function changePage(url: string, data: { title?: string; text?: string }) {
  try {
    const updatedPage = await Page.findOneAndUpdate(
      { url },
      { $set: data },
      { new: true, runValidators: true }
    )

    return updatedPage
  } catch (error) {
    logError(error, { service: 'pages', action: 'changePage', url })
    throw new Error('Failed to update page')
  }
}