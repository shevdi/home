import { Project } from '../models/link'

export async function listAllProjects() {
  try {
    return await Project.find({})
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}
