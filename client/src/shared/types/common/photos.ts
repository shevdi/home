import { ILink } from "./links";

export interface IPhotos {
  name?: string;
  descriptopn?: string;
  src: string;
  links: ILink[]
}

export interface IPhotoSearch {
  dateFrom?: string;
  dateTo?: string;
  order?: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited';
  private?: boolean;
  tags?: string[];
  $nor?: IPhotoSearch;
}
