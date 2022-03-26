import { ProductInterface } from './product.interface';
import { ShopInterface } from './shop.interface';

export interface ShoppingCartConfigInterface {
  items: {
    shop: ShopInterface | undefined;
    productsUnits: {
      product: ProductInterface;
      units: number;
      minPrice?: number;
      maxPrice?: number;
      checked: boolean
    }[];
  }[];
}
