import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';
import { ShopInterface } from '../model/interfaces/shop.interface';

@Injectable({ providedIn: 'root' })
export class JsonBinService {
  constructor(private http: HttpClient) {}

  JSON_BIN_URL: string = 'https://api.jsonbin.io/b/';
  SHOPS_BIN_ID: string = '62212c4ca703bb6749211e15';
  PRODUCTS_BIN_ID: string = '6221bf9b7caf5d67835f1d46';
  SHOPS_PRODUCTS_BIN_ID: string = '6221cc117caf5d67835f2b73';

  getShops(): Observable<ShopInterface[]> {
    return this.http.get<ShopInterface[]>(
      this.JSON_BIN_URL + this.SHOPS_BIN_ID
    );
  }

  setShops(shops: ShopInterface[]): Observable<boolean> {
    return this.http.put<any>(this.JSON_BIN_URL + this.SHOPS_BIN_ID, shops);
  }

  getProducts(): Observable<ProductInterface[]> {
    return this.http.get<ProductInterface[]>(
      this.JSON_BIN_URL + this.PRODUCTS_BIN_ID
    );
  }

  setProducts(products: ProductInterface[]): Observable<boolean> {
    return this.http.put<any>(
      this.JSON_BIN_URL + this.PRODUCTS_BIN_ID,
      products
    );
  }

  getShopsProducts(): Observable<ShopProductInterface[]> {
    return this.http.get<ShopProductInterface[]>(
      this.JSON_BIN_URL + this.SHOPS_PRODUCTS_BIN_ID
    );
  }

  setShopsProducts(shopsproducts: ShopProductInterface[]): Observable<boolean> {
    return this.http.put<any>(
      this.JSON_BIN_URL + this.SHOPS_PRODUCTS_BIN_ID,
      shopsproducts
    );
  }
}
