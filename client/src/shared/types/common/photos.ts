import { ILink } from "./links";

export type PhotoOrder = "orderDownByTakenAt" | "orderUpByTakenAt" | "orderDownByEdited" | "";

export interface IPhotos {
  name?: string;
  descriptopn?: string;
  src: string;
  links: ILink[]
}

export interface IPhotoSearch {
  dateFrom?: string;
  dateTo?: string;
  order?: PhotoOrder;
  private?: boolean;
  tags?: string[];
  $nor?: IPhotoSearch;
}
