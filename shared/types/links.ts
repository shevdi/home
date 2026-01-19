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
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  priority?: number;
  private?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

