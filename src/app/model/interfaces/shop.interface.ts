import { UserInterface } from './user.interface';

export interface ShopInterface {
  id: string;
  name: string;
  favourite: boolean;
  imageUrl?: string;
  default: boolean;
  createdBy?: UserInterface;
}
