import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.constant';
import { DEFAULT_IMAGE_URL } from '../model/constants/default-image.constant';
import { DEFAULT_PRODUCTS } from '../model/constants/default-products.constant';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { DataSourceOriginsEnum } from '../model/enums/data-source-origins.enum';
import { ProductInterface } from '../model/interfaces/product.interface';
import { FirestoreService } from './firestore.service';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  products: Subject<ProductInterface[]> = new Subject<ProductInterface[]>();

  _products: ProductInterface[] = [];

  _favouriteProductsBarcodes: string[] = [];

  source: DataSourceOriginsEnum = APP_CONFIG.source;

  constructor(
    private loginService: LoginService,
    private firestoreService: FirestoreService
  ) {
    this.products.subscribe((_products) => {
      _products.map((_p) => {
        _p.favourite = this._favouriteProductsBarcodes.includes(_p.barcode);
      });
      this._products = _products;
    });

    this.loadProducts().subscribe((_products) => {
      if (!_products || _products.length === 0) {
        this.firestoreService.addProducts(DEFAULT_PRODUCTS);
        _products = DEFAULT_PRODUCTS;
      }

      this.products.next(_products);
    })

    // Favourites
    const favouriteProductsBarcodes = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_PRODUCTS
    );
    this._favouriteProductsBarcodes = favouriteProductsBarcodes
      ? eval(favouriteProductsBarcodes)
      : [];
    this.setFavourites(this._favouriteProductsBarcodes);
  }

  toggleFavourite(product: ProductInterface): Observable<boolean> {
    let favourites = this.getFavourites();
    if (product.favourite) {
      favourites.push(product.barcode);
    } else {
      favourites = favourites.filter((_productBarcode) => {
        return _productBarcode !== product.barcode;
      });
    }
    this.setFavourites(favourites);
    return of(true);
  }

  loadProducts(): Observable<ProductInterface[]> {
    console.log('ShopService.loadProducts()');
    return this.firestoreService.getProducts();
  }

  setDefaultImages(products: ProductInterface[]) {
    products.map((_product) => {
      if (!_product.imageUrl) {
        _product.imageUrl = DEFAULT_IMAGE_URL;
      }
      return _product;
    });
  }

  updateProduct(product: ProductInterface): Observable<boolean> {
    console.log('ProductService.updateProduct()', product);
    this.toggleFavourite(product).subscribe();
    return this.firestoreService.updateProduct(product).pipe(tap(() => {
      const index = this._products.findIndex((_p) => {
        return _p.barcode === product.barcode;
      });
      this._products[index] = product;
      this.products.next(this._products);
    }));
  }

  createProduct(product: ProductInterface): Observable<boolean> {
    console.log('ProductService.createProduct()', product);
    product.createdBy = this.loginService.getLoggedUser();
   return this.firestoreService.addProduct(product).pipe(tap(() => {
    this._products.push(product);
    this.products.next(this._products);
    }));
  }

  removeProduct(id: string): Observable<boolean> {
    console.log('ProductService.removeProduct()', id);
    return this.firestoreService.deleteProduct(id).pipe(tap(() => {
      this._products = this._products.filter((_p) => {
        return _p.id !== id
      });
      this.products.next(this._products);
      }));;
  }

  setFavourites(favourites: string[]) {
    localStorage.setItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_PRODUCTS,
      JSON.stringify(favourites)
    );
  }

  getFavourites(): string[] {
    const _favouriteProductsBarcodes = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_PRODUCTS
    );
    const favouriteProductsBarcodes = _favouriteProductsBarcodes
      ? eval(_favouriteProductsBarcodes)
      : [];
    return favouriteProductsBarcodes;
  }

  checkFavourites(products: ProductInterface[]) {
    const favouriteProductsBarcodes = this.getFavourites();

    products.map((_product) => {
      _product.favourite =
        favouriteProductsBarcodes.indexOf(_product.barcode) > -1;
    });
  }
}
