import { ILink } from "./links";

export interface IPhotos {
  name?: string;
  descriptopn?: string;
  src: string;
  links: ILink[]
}
