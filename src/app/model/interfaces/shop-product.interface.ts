import { UserInterface } from './user.interface';

export interface ShopProductInterface {
  id?: string;
  shopId: string;
  productBarcode: string;
  price: number;
  updateDate: number; // Milis
  createdBy?: UserInterface;
}
