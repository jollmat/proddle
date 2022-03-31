import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { APP_CONFIG } from 'src/config/app-config.constant';
import { DEFAULT_IMAGE_URL } from '../model/constants/default-image.constant';
import { DEFAULT_PRODUCTS } from '../model/constants/default-products.constant';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ProductInterface } from '../model/interfaces/product.interface';
import { FirestoreService } from './firestore.service';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  products: Subject<ProductInterface[]> = new Subject<ProductInterface[]>();

  _products: ProductInterface[] = [];

  _favouriteProductsBarcodes: string[] = [];

  constructor(
    private loginService: LoginService,
    private firestoreService: FirestoreService
  ) {

    // Favourites
    const favouriteProductsBarcodes = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_PRODUCTS
    );
    this._favouriteProductsBarcodes = favouriteProductsBarcodes
      ? eval(favouriteProductsBarcodes)
      : [];
    this.setFavourites(this._favouriteProductsBarcodes);

    this.products.subscribe((_products) => {
     this._products = _products;
    });

  }

  loadProducts(): Observable<ProductInterface[]> {
    console.log('ProductService.loadProducts()');

    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.getProducts().pipe(
        tap((products) => {
  
          if(!products || products.length === 0) {
            products = DEFAULT_PRODUCTS;
            this.firestoreService.addProducts(products);
          }
  
          this.setDefaultImages(products);
          this.checkFavourites(products);
          this.products.next(products);
        }));
    } else {
      return of(DEFAULT_PRODUCTS).pipe(
        tap((products) => {
  
          if(!products || products.length === 0) {
            products = DEFAULT_PRODUCTS;
            this.firestoreService.addProducts(products);
          }
  
          this.setDefaultImages(products);
          this.checkFavourites(products);
          this.products.next(products);
        })
      );
    }
    
  }

  getProducts(): Observable<ProductInterface[]> {
    return of(this._products);
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

  setDefaultImages(products: ProductInterface[]) {
    products.map((_product) => {
      if (!_product.imageUrl) {
        _product.imageUrl = DEFAULT_IMAGE_URL;
      }
      return _product;
    });
  }

  updateProduct(product: ProductInterface, avoidToggleFavourite?: boolean): Observable<boolean> {
    console.log('ProductService.updateProduct()', product);
    if (!avoidToggleFavourite) {
      this.toggleFavourite(product).subscribe();
    }
    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.updateProduct(product).pipe(tap(() => {}));
    }
    return of(true);
  }

  createProduct(product: ProductInterface): Observable<boolean> {
    console.log('ProductService.createProduct()', product);
    product.createdBy = this.loginService.getLoggedUser();
    product.createdOn = new Date().getTime();

    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.addProduct(product).pipe(tap(() => {
        this._products.push(product);
        this.products.next(this._products);
        }));
    } else {
      this._products.push(product);
      this.products.next(this._products);
    }
    return of(true);
  }

  removeProduct(id: string): Observable<boolean> {
    console.log('ProductService.removeProduct()', id);

    if (APP_CONFIG.cloudMode) {
    return this.firestoreService.deleteProduct(id).pipe(tap(() => {
      this._products = this._products.filter((_p) => {
        return _p.id !== id
      });
      this.products.next(this._products);
      }));
    } else {
      this._products = this._products.filter((_p) => {
        return _p.id !== id
      });
      this.products.next(this._products);
    }
    return of(true);
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
