import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShoppingCartConfigInterface } from '../model/interfaces/shopping-cart-config.interface';
import { ShoppingCartInterface } from '../model/interfaces/shopping-cart.interface';
import { ProductService } from './product.service';
import { ShopProductService } from './shop-product.service';

@Injectable({ providedIn: 'root' })
export class ShoppingCartService {
  cart: Subject<ShoppingCartInterface> = new Subject<ShoppingCartInterface>();
  cartConfig: Subject<ShoppingCartConfigInterface> =
    new Subject<ShoppingCartConfigInterface>();
  _cart: ShoppingCartInterface;
  _cartConfig: ShoppingCartConfigInterface;

  constructor(
    private productService: ProductService,
    private shopProductService: ShopProductService
  ) {
    this.cart.subscribe((_cart) => {
      if (_cart && _cart.productsBarcodesUnits?.length > 0) {
        this._cart = _cart;
        localStorage.setItem(
          STORE_KEYS_CONSTANTS.PS_SHOPPING_CART,
          JSON.stringify(_cart)
        );
      } else {
        this._cart = undefined;
        localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_SHOPPING_CART);
      }

      this.buildCartConfig();
    });
    this.loadShoppingCart();
  }

  loadShoppingCart() {
    console.log('loadShoppingCart()');
    const shoppingCartStr = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_SHOPPING_CART
    );

    if (shoppingCartStr) {
      const shoppingCart: ShoppingCartInterface = JSON.parse(
        shoppingCartStr
      ) as ShoppingCartInterface;
      this.cart.next(shoppingCart);
    } else {
      this.cart.next(undefined);
    }
  }

  getShoppingCartConfig(): ShoppingCartConfigInterface {
    console.log('getShoppingCartConfig()');
    return this._cartConfig;
  }

  buildCartConfig(): void {
    console.log('buildCartConfig()', this._cart);

    this._cartConfig = {
      items: [],
    };

    this.productService.getProducts().subscribe((_products) => {
      if (this._cart?.productsBarcodesUnits?.length > 0) {
        this._cart.productsBarcodesUnits.forEach((_productBarcodeUnits) => {
          const product = _products.find((_product) => {
            return _product.barcode === _productBarcodeUnits.barcode;
          });
          if (!product) {
            console.error('Undefined product');
          }
          const cheaperShops =
            this.shopProductService.getProductCheaperShop(product);

          if (!cheaperShops) {
            const noShopsItem = this._cartConfig.items.find((_item) => {
              return !_item.shop;
            });
            if (noShopsItem) {
              noShopsItem.productsUnits.push({
                product: product,
                units: _productBarcodeUnits.units,
              });
            } else {
              this._cartConfig.items.push({
                shop: undefined,
                productsUnits: [
                  { product: product, units: _productBarcodeUnits.units },
                ],
              });
            }
          } else {
            const lowestPrice: number =
              this.shopProductService.getProductLowestPrice(product);
            const highestPrice: number =
              this.shopProductService.getProductHighestPrice(product);
            cheaperShops.forEach((_shop) => {
              const shopCartItem = this._cartConfig.items.find((_item) => {
                return _item.shop?.id === _shop.id;
              });
              const productUnits = {
                product: product,
                units: _productBarcodeUnits.units,
                minPrice: lowestPrice,
                maxPrice: highestPrice,
              };
              if (shopCartItem) {
                shopCartItem.productsUnits.push(productUnits);
              } else {
                this._cartConfig.items.push({
                  shop: _shop,
                  productsUnits: [productUnits],
                });
              }
            });
          }
        });
      }
      this.cartConfig.next(this._cartConfig);
    });
  }

  setCartProductUnits(product: ProductInterface, units: number) {
    console.log('setCartProductUnits()');
    this._cart.productsBarcodesUnits.find((productBarcodeUnits) => {
      return productBarcodeUnits.barcode === product.barcode;
    }).units = units;
    this._cart.updateDate = new Date().getTime();
    this.cart.next(this._cart);
  }

  removeCartProduct(product: ProductInterface) {
    console.log('removeCartProduct()', product);
    this._cart.productsBarcodesUnits = this._cart.productsBarcodesUnits.filter(
      (productBarcodeUnits) => {
        return productBarcodeUnits.barcode !== product.barcode;
      }
    );
    this._cart.updateDate = new Date().getTime();
    this.cart.next(this._cart);
  }

  removeCart() {
    console.log('removeCart()');
    localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_SHOPPING_CART);
    this.loadShoppingCart();
  }

  addToCart(product: ProductInterface) {
    console.log('addToCart()', product);
    let cart: ShoppingCartInterface = this._cart;
    if (cart) {
      const productBarcodeUnits = cart.productsBarcodesUnits.find(
        (_productBarcodeUnits) => {
          return _productBarcodeUnits.barcode === product.barcode;
        }
      );
      if (productBarcodeUnits) {
        productBarcodeUnits.units++;
      } else {
        cart.productsBarcodesUnits.push({
          barcode: product.barcode,
          units: 1,
        });
      }
    } else {
      cart = {
        productsBarcodesUnits: [
          {
            barcode: product.barcode,
            units: 1,
          },
        ],
        createDate: new Date().getTime(),
      };
    }
    cart.updateDate = new Date().getTime();
    this.cart.next(cart);
  }
}
