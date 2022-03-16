import { UserInterface } from './user.interface';

export interface ProductInterface {
  barcode: string;
  name: string;
  brand: string;
  favourite: boolean;
  imageUrl?: string;
  createdBy?: UserInterface;
}
