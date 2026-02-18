import { Project } from '../models/link'
import { logError } from './logs'

export async function listAllProjects() {
  try {
    return await Project.find({})
  } catch (error) {
    logError(error, { service: 'projects', action: 'listAllProjects' })
    throw new Error('Failed to fetch projects');
  }
}
