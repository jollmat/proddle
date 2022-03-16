import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.constant';
import { DEFAULT_IMAGE_URL } from '../model/constants/default-image.constant';
import { DEFAULT_PRODUCTS } from '../model/constants/default-products.constant';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { DataSourceOriginsEnum } from '../model/enums/data-source-origins.enum';
import { ProductInterface } from '../model/interfaces/product.interface';
import { JsonBinService } from './json-bin.service';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  products: Subject<ProductInterface[]> = new Subject<ProductInterface[]>();

  _products: ProductInterface[] = [];

  _favouriteProductsBarcodes: string[] = [];

  source: DataSourceOriginsEnum = APP_CONFIG.source;

  constructor(
    private jsonBinService: JsonBinService,
    private loginService: LoginService
  ) {
    this.products.subscribe((_products) => {
      this._products = _products;
    });

    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS
      );
      if (
        !storedProducts ||
        (eval(storedProducts) as ProductInterface[]).length === 0
      ) {
        this.setProducts(DEFAULT_PRODUCTS);
      }
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      this.getProducts().subscribe((_products) => {
        if (!_products || _products.length === 0) {
          this.setProducts(DEFAULT_PRODUCTS);
        }
      });
    }

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

  getProducts(): Observable<ProductInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS
      );
      let products = storedProducts
        ? (eval(storedProducts) as ProductInterface[])
        : DEFAULT_PRODUCTS;

      products = this.mergeLocalAndDefaultProducts(products);

      this.setDefaultImages(products);
      this.checkFavourites(products);
      this.products.next(products);
      return of(products);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return this.jsonBinService.getProducts().pipe(
        tap((products) => {
          this.setDefaultImages(products);
          this.checkFavourites(products);
          this.products.next(products);
        })
      );
    }
  }

  private mergeLocalAndDefaultProducts(
    products: ProductInterface[]
  ): ProductInterface[] {
    console.log('Merging user local & default products');
    let merged = 0;
    DEFAULT_PRODUCTS.forEach((_product) => {
      const existingProduct = products.find((__product) => {
        return __product.barcode === _product.barcode;
      });
      if (!existingProduct) {
        console.log(' -> Product added', _product);
        products.push(_product);
      }
    });
    console.log(' -> Items merged:  ' + merged);
    return products;
  }

  setDefaultImages(products: ProductInterface[]) {
    products.map((_product) => {
      if (!_product.imageUrl) {
        _product.imageUrl = DEFAULT_IMAGE_URL;
      }
      return _product;
    });
  }

  setProducts(products: ProductInterface[]): Observable<boolean> {
    console.log('ProductService.setProducts()', products);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS,
        JSON.stringify(products)
      );
      this.products.next(products);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      if (products.length === 0) {
        products = DEFAULT_PRODUCTS;
      }
      this.products.next(products);
      return this.jsonBinService.setProducts(products);
    }
  }

  updateProduct(product: ProductInterface): Observable<boolean> {
    console.log('ProductService.updateProduct()', product);
    this.toggleFavourite(product).subscribe();
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedProducts = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_PRODUCTS)
      ) as ProductInterface[];

      const productIdx = storedProducts.findIndex((_product) => {
        return _product.barcode === product.barcode;
      });
      storedProducts[productIdx] = product;

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS,
        JSON.stringify(storedProducts)
      );
      this.products.next(storedProducts);

      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      const products = this._products;

      const productIdx = products.findIndex((_product) => {
        return _product.barcode === product.barcode;
      });
      products[productIdx] = product;

      this.products.next(products);
      return this.jsonBinService.setProducts(products);
    }
  }

  createProduct(product: ProductInterface): Observable<boolean> {
    console.log('ProductService.createProduct()', product);
    product.createdBy = this.loginService.getLoggedUser();
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedProducts = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_PRODUCTS)
      ) as ProductInterface[];

      storedProducts.push(product);

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS,
        JSON.stringify(storedProducts)
      );
      this.products.next(storedProducts);

      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      const products = this._products;
      products.push(product);
      this.products.next(products);
      return this.jsonBinService.setProducts(products);
    }
  }

  removeProduct(barcode: string): Observable<boolean> {
    console.log('ProductService.removeProduct()', barcode);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      let storedProducts = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_PRODUCTS)
      ) as ProductInterface[];

      storedProducts = storedProducts.filter((_product) => {
        return _product.barcode !== barcode;
      });

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_PRODUCTS,
        JSON.stringify(storedProducts)
      );
      this.products.next(storedProducts);

      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      let products = this._products;

      products = products.filter((_product) => {
        return _product.barcode !== barcode;
      });

      this.products.next(products);
      return this.jsonBinService.setProducts(products);
    }
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
