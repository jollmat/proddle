import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';

@Injectable({ providedIn: 'root' })
export class ShopProductService {
  shopsProducts: Subject<ShopProductInterface[]> = new Subject<
    ShopProductInterface[]
  >();

  constructor() {}

  getShopsProducts(): Observable<ShopProductInterface[]> {
    const storedShopsProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
    );
    let shopsProducts = storedShopsProducts
      ? (eval(storedShopsProducts) as ShopProductInterface[])
      : [];
    this.shopsProducts.next(shopsProducts);
    return of(shopsProducts);
  }

  setShopsProducts(shopsProducts: ShopProductInterface[]): Observable<boolean> {
    localStorage.setItem(
      STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS,
      JSON.stringify(shopsProducts)
    );
    this.shopsProducts.next(shopsProducts);
    return of(true);
  }

  getShopProduct(
    shopId: string,
    productBarcode: string
  ): Observable<ShopProductInterface> {
    const storedShopsProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
    );
    let shopsProducts = storedShopsProducts
      ? (eval(storedShopsProducts) as ShopProductInterface[])
      : [];
    return of(
      shopsProducts.find((_shopProduct) => {
        return;
        _shopProduct.shopId === shopId &&
          _shopProduct.productBarcode === productBarcode;
      })
    );
  }

  getShopProducts(shopId: string): Observable<ProductInterface[]> {
    const storedShopsProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
    );
    const storedProducts = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_PRODUCTS
    );

    let shopsProducts = storedShopsProducts
      ? (eval(storedShopsProducts) as ShopProductInterface[]).filter(
          (_shopProduct) => {
            return _shopProduct.shopId === shopId;
          }
        )
      : [];
    let products = storedProducts
      ? (eval(storedProducts) as ProductInterface[])
      : [];

    let productsBarcodes = shopsProducts.map((_shopProduct) => {
      return _shopProduct.productBarcode;
    });

    return of(
      products.filter((_product) => {
        return productsBarcodes.indexOf(_product.barcode) >= 0;
      })
    );
  }

  getDefaults(): ShopProductInterface[] {
    return [];
  }
}
