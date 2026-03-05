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

export interface ILocationValue {
  country: string[]
  city: string[]
}

/** Nominatim reverse geocode response shape; address contains location fields */
export interface INominatimAddress {
  address?: Record<string, string | undefined>
}

export interface ILocation {
  value?: ILocationValue
  dadata?: Record<string, string | undefined | null>
  nominatim?: INominatimAddress & Record<string, unknown>
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
  tags?: string[];
  private?: boolean;
  createdAt?: string;
  updatedAt?: string;
  meta?: IMeta;
  location: ILocation;
}

