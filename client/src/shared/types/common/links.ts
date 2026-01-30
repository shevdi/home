export interface IMeta {
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  make?: string;
  model?: string;
  takenAt?: string;
}

export interface ILink {
  _id?: string;
  url?: string;
  title?: string;
  fileName?: string;
  name?: string;
  description?: string;
  smSizeUrl?: string;
  mdSizeUrl?: string;
  fullSizeUrl?: string;
  smSizeEntryId?: string;
  mdSizeEntryId?: string;
  fullSizeEntryId?: string;
  takenAt?: string;
  page?: number;
  priority?: number;
  private?: boolean;
  createdAt?: string;
  updatedAt?: string;
  meta?: IMeta;
}

