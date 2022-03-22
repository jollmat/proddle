import { UserInterface } from './user.interface';

export interface ProductInterface {
  id?: string,
  barcode: string;
  name: string;
  brand: string;
  favourite: boolean;
  imageUrl?: string;
  createdBy?: UserInterface;
}
