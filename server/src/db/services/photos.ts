import { ILink, IPhotoSearch } from '@/types';
import { SortOrder } from 'mongoose';
import { Photo } from '../models/link'
import { FilterQuery } from 'mongoose';

export async function getAllPhotos(filters: FilterQuery<IPhotoSearch>) {
  try {
    return await Photo.find({ ...filters })
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function getPhotosPaginated(
  page: number = 1,
  limit: number = 20,
  filters: FilterQuery<IPhotoSearch>,
  sort: Record<string, SortOrder> = { createdAt: -1 },
) {
  try {
    const skip = (page - 1) * limit
    return await Photo.find({ ...filters })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  } catch (error) {
    // console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function getPhotosCount(query: FilterQuery<IPhotoSearch>) {
  try {
    return await Photo.countDocuments(query)
  } catch (error) {
    // console.error('Error counting photos:', error);
    throw new Error('Failed to count photos');
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
