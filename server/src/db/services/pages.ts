import { Page } from '../models/pages';

export async function getPage(url: string) {
  try {
    return await Page.findOne({ url })
  } catch (error) {
    console.error('Error fetching projects:', error);
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
    console.error('Error updating page:', error)
    throw new Error('Failed to update page')
  }
}