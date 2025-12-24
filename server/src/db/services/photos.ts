import { ILink } from '@/types';
import { Photo } from '../models/link'

export async function getAllPhotos() {
  try {
    return await Photo.find({})
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function getPhotoById(_id: string) {
  try {
    const photo = await Photo.findOne({ _id }).lean()
    return photo
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function updatePhotoById(_id: string, data: ILink) {
  try {
    const photo = await Photo.findByIdAndUpdate(_id, data, { new: true }).lean()
    return photo
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function deletePhotoById(_id: string) {
  try {
    const photo = await Photo.findByIdAndDelete(_id).lean()
    return photo
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function addNewPhoto(args: ILink) {
  try {
    return await Photo.create(args)
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}
