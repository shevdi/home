import { photoFolderNames } from '../../config'

export interface DrimeTokenApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  user?: {
    access_token: string
  }
  request: any
}

export interface DrimeFolder {
  id: 486993396,
  name: typeof photoFolderNames[keyof typeof photoFolderNames],
  description: string | null,
  file_name: typeof photoFolderNames[keyof typeof photoFolderNames],
  mime: string | null,
  color: string | null,
  backup: boolean,
  tracked: 0 | 1,
  file_size: number,
  user_id: string | null,
  parent_id: string | null,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null,
  is_deleted: 0 | 1,
  path: string,
  disk_prefix: string | null,
  type: 'folder',
  extension: null,
  file_hash: null,
  public: boolean,
  thumbnail: boolean,
  mux_status: null,
  thumbnail_url: null,
  workspace_id: number,
  is_encrypted: 0 | 1,
  iv: null,
  vault_id: number | null,
  owner_id: number,
  hash: string,
  url: null,
  users: Object
}

export interface DrimeFileEntry {
  name: string;
  file_name: string,
  mime: string,
  backup: boolean,
  file_size: number,
  parent_id: number,
  disk_prefix: string,
  type: string,
  extension: string,
  public: boolean,
  workspace_id: number,
  owner_id: number,
  is_encrypted: 0 | 1,
  vault_id: string | null,
  iv: string | null,
  file_hash: string | null,
  updated_at: Date,
  created_at: Date,
  id: number,
  path: string,
  hash: string,
  url: string,
  parent: DrimeFolder,
  users: Object
}
