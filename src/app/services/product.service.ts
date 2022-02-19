import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  products: Subject<ProductInterface[]> = new Subject<ProductInterface[]>();

  constructor() {}

  getProducts(): Observable<ProductInterface[]> {
    const storedProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_PRODUCTS
    );
    let products = storedProducts
      ? (eval(storedProducts) as ProductInterface[])
      : this.getDefaults();
    this.products.next(products);
    return of(products);
  }

  setProducts(products: ProductInterface[]): Observable<boolean> {
    localStorage.setItem(
      STORE_KEYS_CONSTANTS.PS_PRODUCTS,
      JSON.stringify(products)
    );
    this.products.next(products);
    return of(true);
  }

  getDefaults(): ProductInterface[] {
    return [];
  }

  /*
  getProduct(productBarcode: string): Observable<ProductInterface> {
    const storedProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_PRODUCTS
    );
    return of(
      (eval(storedProducts) as ProductInterface[]).find((_product) => {
        return _product.barcode === productBarcode;
      })
    );
  }
  */
}
