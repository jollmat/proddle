import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.constant';
import { DataSourceOriginsEnum } from '../model/enums/data-source-origins.enum';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';
import { ShopInterface } from '../model/interfaces/shop.interface';
import { FirestoreService } from './firestore.service';
import { ProductService } from './product.service';
import { ShopService } from './shop.service';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SHOPS_PRODUCTS } from '../model/constants/default-shops-products.constant';

@Injectable({ providedIn: 'root' })
export class ShopProductService {
  shopsProducts: Subject<ShopProductInterface[]> = new Subject<
    ShopProductInterface[]
  >();

  source: DataSourceOriginsEnum = APP_CONFIG.source;

  _shopsProducts: ShopProductInterface[] = [];

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private firestoreService: FirestoreService
  ) {
    this.shopsProducts.subscribe((_shopsProducts) => {
      this._shopsProducts = _shopsProducts;
    });

    this.loadShopsProducts().subscribe((_shopsProducts) => {
      if(!_shopsProducts || _shopsProducts.length === 0){
        this.firestoreService.addShopProducts(DEFAULT_SHOPS_PRODUCTS);
      }
      this.shopsProducts.next(_shopsProducts);
    });
  }

  loadShopsProducts(): Observable<ShopProductInterface[]> {
    return this.firestoreService.getShopsProducts();
  }

  addShopProduct(shopProduct: ShopProductInterface) {
    if (!shopProduct.id) {
      shopProduct.id = uuidv4();
    }
    return this.firestoreService.addShopProduct(shopProduct).pipe(tap(() => {
      this._shopsProducts.push(shopProduct);
      this.shopsProducts.next(this._shopsProducts);
    }));
  }

  removeShopProduct(shopProduct: ShopProductInterface): Observable<boolean> {
    console.log('ShopProductService.removeShopProduct()', shopProduct);
    return this.firestoreService.deleteShopProduct(shopProduct).pipe(tap(() => {
      this._shopsProducts = this._shopsProducts.filter((_sp) => {
        return _sp.productBarcode !== shopProduct.productBarcode || _sp.shopId !== shopProduct.shopId;
      });
      this.shopsProducts.next(this._shopsProducts);
    }));
  }

  removeShopShopProducts(shopId: string): Observable<boolean> {
    console.log('ShopProductService.removeShopShopProducts()', shopId);
    const shopProductsToRemove: ShopProductInterface[] = [];
    const shopProductsToKeep: ShopProductInterface[] = [];
    this._shopsProducts.forEach((_shopProduct) => {
      if (_shopProduct.shopId === shopId) {
        shopProductsToRemove.push(_shopProduct);
      } else {
        shopProductsToKeep.push(_shopProduct);
      }
    });
    return this.firestoreService.deleteShopProducts(shopProductsToRemove).pipe(tap(() => {
      this._shopsProducts = shopProductsToKeep;
      this.shopsProducts.next(this._shopsProducts);
    }));
  }

  removeProductShopProducts(barcode: string): Observable<boolean> {
    console.log('ShopProductService.removeProductShopProducts()', barcode);
    const shopProductsToRemove: ShopProductInterface[] = [];
    const shopProductsToKeep: ShopProductInterface[] = [];
    this._shopsProducts.forEach((_shopProduct) => {
      if (_shopProduct.productBarcode === barcode) {
        shopProductsToRemove.push(_shopProduct);
      } else {
        shopProductsToKeep.push(_shopProduct);
      }
    });
    return this.firestoreService.deleteShopProducts(shopProductsToRemove).pipe(tap(() => {
      this._shopsProducts = shopProductsToKeep;
      this.shopsProducts.next(this._shopsProducts);
    }));
  }

  getShopProduct(
    shopId: string,
    productBarcode: string
  ): Observable<ShopProductInterface> {
    const shopProductList = this._shopsProducts
        .filter((_shopProduct) => {
          return (
            _shopProduct.productBarcode === productBarcode &&
            _shopProduct.shopId === shopId
          );
        })
        .sort((a, b) => (a.updateDate < b.updateDate ? 1 : -1));
      return of(shopProductList.length > 0 ? shopProductList[0] : undefined);
  }

  getShopProducts(shopId: string): Observable<ProductInterface[]> {
    const productBarcodes = this._shopsProducts
        .filter((_shopProduct) => {
          return _shopProduct.shopId === shopId;
        })
        .map((_shopProduct) => {
          return _shopProduct.productBarcode;
        });
      return of(
        this.productService._products.filter((_product) => {
          return productBarcodes.indexOf(_product.barcode) > -1;
        })
      );
  }

  getProductShops(barcode: string): Observable<ShopInterface[]> {
    const shopIds = this._shopsProducts
        .filter((_shopProduct) => {
          return _shopProduct.productBarcode === barcode;
        })
        .map((_shopProduct) => {
          return _shopProduct.shopId;
        });
      return of(
        this.shopService._shops.filter((_shop) => {
          return shopIds.indexOf(_shop.id) > -1;
        })
      );
  }

  getShopShopProducts(shopId: string): Observable<ShopProductInterface[]> {
    return of(
      this._shopsProducts.filter((_shopProduct) => {
        return _shopProduct.shopId === shopId;
      })
    );
  }

  getProductShopProducts(barcode: string): Observable<ShopProductInterface[]> {
    return of(
      this._shopsProducts.filter((_shopProduct) => {
        return _shopProduct.productBarcode === barcode;
      })
    );
  }

  getShopProductLast(shopId: string, barcode: string): ShopProductInterface {
    const shopProducts = this._shopsProducts
      .filter((_shopProduct) => {
        return (
          _shopProduct.shopId === shopId &&
          _shopProduct.productBarcode === barcode
        );
      })
      .sort((a, b) => {
        return a.updateDate < b.updateDate ? 1 : -1;
      });
    return shopProducts.length > 0 ? shopProducts[0] : undefined;
  }

  getProductCheaperShop(product: ProductInterface): ShopInterface[] {
    const productShopIds: string[] = [];
    if (!product) {
      return [];
    }
    this._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.productBarcode === product.barcode;
      })
      .forEach((_shopProduct) => {
        if (productShopIds.indexOf(_shopProduct.shopId) < 0) {
          productShopIds.push(_shopProduct.shopId);
        }
      });

    if (productShopIds.length === 0) {
      return undefined;
    }

    let productPrices: ShopProductInterface[] = [
      ...productShopIds
        .map((_shopId) => {
          return this.getShopProductLast(_shopId, product.barcode);
        })
        .sort((a, b) => {
          return a.price > b.price ? 1 : -1;
        }),
    ];

    const lowerPrice = productPrices[0].price;

    productPrices = productPrices.filter((_productPrice) => {
      return _productPrice.price === lowerPrice;
    });

    return productPrices.map((_shopProduct) => {
      return this.shopService._shops.find((_shop) => {
        return _shop.id === _shopProduct.shopId;
      });
    });
  }
  getProductLowestPrice(product: ProductInterface): number {
    const productShopIds: string[] = [];
    if (!product) {
      return undefined;
    }
    this._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.productBarcode === product.barcode;
      })
      .forEach((_shopProduct) => {
        if (productShopIds.indexOf(_shopProduct.shopId) < 0) {
          productShopIds.push(_shopProduct.shopId);
        }
      });

    if (productShopIds.length === 0) {
      return undefined;
    }

    let productPrices: ShopProductInterface[] = [
      ...productShopIds
        .map((_shopId) => {
          return this.getShopProductLast(_shopId, product.barcode);
        })
        .sort((a, b) => {
          return a.price < b.price ? 1 : -1;
        }),
    ];

    const lowerPrice =
      productPrices[0].price <= productPrices[productPrices.length - 1].price
        ? productPrices[0].price
        : productPrices[productPrices.length - 1].price;

    return lowerPrice;
  }

  getProductHighestPrice(product: ProductInterface): number {
    const productShopIds: string[] = [];

    if (!product) {
      return undefined;
    }

    this._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.productBarcode === product.barcode;
      })
      .forEach((_shopProduct) => {
        if (productShopIds.indexOf(_shopProduct.shopId) < 0) {
          productShopIds.push(_shopProduct.shopId);
        }
      });

    if (productShopIds.length === 0) {
      return undefined;
    }

    let productPrices: ShopProductInterface[] = productShopIds
      .map((_shopId) => {
        return this.getShopProductLast(_shopId, product.barcode);
      })
      .sort((a, b) => {
        return a.price < b.price ? 1 : -1;
      });

    const higherPrice =
      productPrices[0].price >= productPrices[productPrices.length - 1].price
        ? productPrices[0].price
        : productPrices[productPrices.length - 1].price;

    return higherPrice;
  }

  getProductPriceRange(
    product: ProductInterface,
    from?: string
  ): {
    max: number;
    min: number;
  } {
    const shopIds: string[] = [];
    this._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.productBarcode === product.barcode;
      })
      .forEach((_shopProduct) => {
        if (shopIds.indexOf(_shopProduct.shopId) < 0) {
          shopIds.push(_shopProduct.shopId);
        }
      });

    const prices = shopIds.map((_shopId) => {
      return this.getShopProductLast(_shopId, product.barcode).price;
    });

    prices.sort((a, b) => {
      return a < b ? 1 : -1; // Sort desc
    });

    return {
      max: prices[0],
      min: prices[prices.length - 1],
    };
  }
}
