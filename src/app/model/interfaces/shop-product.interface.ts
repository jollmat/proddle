import { UserInterface } from './user.interface';

export interface ShopProductInterface {
  shopId: string;
  productBarcode: string;
  price: number;
  updateDate: number; // Milis
  createdBy?: UserInterface;
}
