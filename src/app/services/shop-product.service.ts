import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.constant';
import { DEFAULT_SHOPS_PRODUCTS } from '../model/constants/default-shops-products.constant';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { DataSourceOriginsEnum } from '../model/enums/data-source-origins.enum';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';
import { ShopInterface } from '../model/interfaces/shop.interface';
import { JsonBinService } from './json-bin.service';
import { ProductService } from './product.service';
import { ShopService } from './shop.service';

@Injectable({ providedIn: 'root' })
export class ShopProductService {
  shopsProducts: Subject<ShopProductInterface[]> = new Subject<
    ShopProductInterface[]
  >();

  source: DataSourceOriginsEnum = APP_CONFIG.source;

  _shopsProducts: ShopProductInterface[] = [];

  constructor(
    private jsonBinService: JsonBinService,
    private productService: ProductService,
    private shopService: ShopService
  ) {
    this.shopsProducts.subscribe((_shopsProducts) => {
      this._shopsProducts = _shopsProducts;
    });

    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[])
        : [];

      if (!shopsProducts || shopsProducts.length === 0) {
        shopsProducts = DEFAULT_SHOPS_PRODUCTS;
      }

      this.setShopsProducts(shopsProducts);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      this.getShopsProducts().subscribe((_shopsProducts) => {
        if (!_shopsProducts || _shopsProducts.length === 0) {
          this.setShopsProducts(DEFAULT_SHOPS_PRODUCTS);
        } else {
          this.setShopsProducts(_shopsProducts);
        }
      });
    }
  }

  getShopsProducts(): Observable<ShopProductInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[])
        : [];

      if (!shopsProducts || shopsProducts.length === 0) {
        shopsProducts = DEFAULT_SHOPS_PRODUCTS;
      }

      this._shopsProducts = shopsProducts;
      this.shopsProducts.next(shopsProducts);
      return of(shopsProducts);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return this.jsonBinService.getShopsProducts().pipe(
        tap((_shopsProducts) => {
          this._shopsProducts = _shopsProducts;
          this.shopsProducts.next(_shopsProducts);
        })
      );
    }
  }

  setShopsProducts(shopsProducts: ShopProductInterface[]): Observable<boolean> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS,
        JSON.stringify(shopsProducts)
      );
      this._shopsProducts = shopsProducts;
      this.shopsProducts.next(shopsProducts);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return this.jsonBinService.setShopsProducts(shopsProducts).pipe(
        tap(() => {
          this._shopsProducts = shopsProducts;
          this.shopsProducts.next(shopsProducts);
        })
      );
    }
  }

  getShopProduct(
    shopId: string,
    productBarcode: string
  ): Observable<ShopProductInterface> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[])
        : [];
      return of(
        shopsProducts.find((_shopProduct) => {
          return (
            _shopProduct.shopId === shopId &&
            _shopProduct.productBarcode === productBarcode
          );
        })
      );
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
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
  }

  getShopProducts(shopId: string): Observable<ProductInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
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
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
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
  }

  getProductShops(barcode: string): Observable<ShopInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      const storedShops = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS);

      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[]).filter(
            (_shopProduct) => {
              return _shopProduct.productBarcode === barcode;
            }
          )
        : [];
      let shops = storedShops ? (eval(storedShops) as ShopInterface[]) : [];

      let shopsIds = shopsProducts.map((_shopProduct) => {
        return _shopProduct.shopId;
      });

      return of(
        shops.filter((_shop) => {
          return shopsIds.indexOf(_shop.id) >= 0;
        })
      );
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
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
  }

  getShopShopProducts(shopId: string): Observable<ShopProductInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );

      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[]).filter(
            (_shopProduct) => {
              return _shopProduct.shopId === shopId;
            }
          )
        : [];

      return of(shopsProducts);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return of(
        this._shopsProducts.filter((_shopProduct) => {
          return _shopProduct.shopId === shopId;
        })
      );
    }
  }

  getProductShopProducts(barcode: string): Observable<ShopProductInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );

      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[]).filter(
            (_shopProduct) => {
              return _shopProduct.productBarcode === barcode;
            }
          )
        : [];
      return of(shopsProducts);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return of(
        this._shopsProducts.filter((_shopProduct) => {
          return _shopProduct.productBarcode === barcode;
        })
      );
    }
  }

  removeShopProduct(shopProduct: ShopProductInterface): Observable<boolean> {
    console.log('ShopProductService.removeShopProduct()', shopProduct);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (JSON.parse(storedShopsProducts) as ShopProductInterface[])
        : DEFAULT_SHOPS_PRODUCTS;

      shopsProducts = shopsProducts.filter((_shopProduct) => {
        return (
          _shopProduct.productBarcode !== shopProduct.productBarcode ||
          _shopProduct.shopId !== shopProduct.shopId
        );
      });

      this._shopsProducts = shopsProducts;
      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS,
        JSON.stringify(shopsProducts)
      );
      this.shopsProducts.next(shopsProducts);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      this.getShopsProducts().pipe(
        tap((_shopsProducts) => {
          this.setShopsProducts(
            _shopsProducts.filter((_shopProduct) => {
              return (
                _shopProduct.productBarcode !== shopProduct.productBarcode &&
                _shopProduct.shopId !== shopProduct.shopId
              );
            })
          );
        })
      );
    }
  }

  removeShopShopProducts(shopId: string): Observable<boolean> {
    console.log('ShopProductService.removeShopShopProducts()', shopId);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[])
        : DEFAULT_SHOPS_PRODUCTS;

      shopsProducts = shopsProducts.filter((_shopProduct) => {
        return _shopProduct.shopId !== shopId;
      });

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS,
        JSON.stringify(shopsProducts)
      );
      this.shopsProducts.next(shopsProducts);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      this.getShopsProducts().pipe(
        tap((_shopsProducts) => {
          this.setShopsProducts(
            _shopsProducts.filter((_shopProduct) => {
              return _shopProduct.shopId !== shopId;
            })
          );
        })
      );
    }
  }

  removeProductShopProducts(barcode: string): Observable<boolean> {
    console.log('ShopProductService.removeProductShopProducts()', barcode);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShopsProducts = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS
      );
      let shopsProducts = storedShopsProducts
        ? (eval(storedShopsProducts) as ShopProductInterface[])
        : DEFAULT_SHOPS_PRODUCTS;

      shopsProducts = shopsProducts.filter((_shopProduct) => {
        return _shopProduct.productBarcode !== barcode;
      });

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS_PRODUCTS,
        JSON.stringify(shopsProducts)
      );
      this.shopsProducts.next(shopsProducts);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      this.getShopsProducts().pipe(
        tap((_shopsProducts) => {
          this.setShopsProducts(
            _shopsProducts.filter((_shopProduct) => {
              return _shopProduct.productBarcode !== barcode;
            })
          );
        })
      );
    }
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
