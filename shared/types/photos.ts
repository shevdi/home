import { ILink } from "./links";

export interface IPhotos {
  name?: string;
  description?: string;
  src: string;
  links: ILink[]
}

export interface IPhotoSearch {
  private?: boolean;
  tags?: string[];
  $nor?: IPhotoSearch;
}
