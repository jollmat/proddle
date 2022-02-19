import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { ShopProductService } from '../../../services/shop-product.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-shop-standings',
  templateUrl: './shop-standings.component.html',
  styleUrls: ['./shop-standings.component.scss'],
})
export class ShopStandingsComponent implements OnInit {
  shopsProducts: ShopProductInterface[];
  standings: { shopId: string; times: 0 }[] = [];

  shopsProductsSubscription: Subscription;

  @Input() target: 'CHEAP' | 'EXPENSIVE' = 'CHEAP';

  shops: ShopInterface[];

  constructor(
    private shopProductService: ShopProductService,
    private shopService: ShopService
  ) {}

  calculateStandings() {
    const productBarcodes = [];
    const shopsIds = [];
    const standings = [];

    // Save different product barcodes
    this.shopsProducts.forEach((_shopProduct) => {
      if (productBarcodes.indexOf(_shopProduct.productBarcode) < 0) {
        productBarcodes.push(_shopProduct.productBarcode);
      }
    });

    // Save different shopIds
    this.shopsProducts.forEach((_shopProduct) => {
      if (shopsIds.indexOf(_shopProduct.shopId) < 0) {
        shopsIds.push(_shopProduct.shopId);
      }
    });

    if (productBarcodes.length > 1 || shopsIds.length > 1) {
      productBarcodes.forEach((_productBarcode) => {
        // Get all shopProducts of a product
        const productShopProducts = this.shopsProducts.filter(
          (_shopProduct) => {
            return _shopProduct.productBarcode === _productBarcode;
          }
        );

        // For each product, get its different shopIds
        const productShopsIds: string[] = [];
        productShopProducts.forEach((_productShopProducts) => {
          if (productShopsIds.indexOf(_productShopProducts.shopId) < 0) {
            productShopsIds.push(_productShopProducts.shopId);
          }
        });

        // If product has more than one shop
        if (productShopsIds.length > 1) {
          // Get all shopProducts of a product
          const productShopProducts: ShopProductInterface[] =
            this.shopsProducts.filter((_shopProduct) => {
              return _shopProduct.productBarcode === _productBarcode;
            });
          // For each shop, get this product prices sorted by date DESC
          let lastShopsShopProducts: ShopProductInterface[] = [];
          productShopsIds.forEach((_productShopId) => {
            lastShopsShopProducts.push(
              productShopProducts.filter((_productShopProduct) => {
                return _productShopProduct.shopId === _productShopId;
              })[0]
            );
          });

          lastShopsShopProducts = lastShopsShopProducts.sort((a, b) =>
            a.updateDate > b.updateDate ? -1 : 1
          );

          const sortedByPrice = lastShopsShopProducts.sort((a, b) =>
            a.price > b.price
              ? this.target === 'CHEAP'
                ? 1
                : -1
              : this.target === 'CHEAP'
              ? -1
              : 1
          );
          const differentPrices =
            lastShopsShopProducts.length > 1 &&
            sortedByPrice[0].price !==
              sortedByPrice[sortedByPrice.length - 1].price;

          // If any price is different
          let lastShopsIds: string[] = [];
          if (differentPrices) {
            const lastShopPrice = lastShopsShopProducts[0].price;

            lastShopsIds = lastShopsShopProducts
              .filter((_lastShopsShopProduct) => {
                return _lastShopsShopProduct.price === lastShopPrice;
              })
              .map((_lastShopsShopProduct) => {
                return _lastShopsShopProduct.shopId;
              });

            lastShopsIds.forEach((_shopId) => {
              const standingsShopIndex = standings.findIndex((_standing) => {
                return _standing.shopId === _shopId;
              });
              if (standingsShopIndex >= 0) {
                standings[standingsShopIndex].times++;
              } else {
                standings.push({
                  shopId: _shopId,
                  times: 1,
                });
              }
            });
          }
        }
      });
    }

    this.standings = standings.sort((a, b) => (a.times > b.times ? -1 : 1));
  }

  getShopName(shopId: string) {
    return this.shops.find((_shop) => {
      return _shop.id === shopId;
    })?.name;
  }

  ngOnInit() {
    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops.sort((a, b) => (a.name > b.name ? 1 : -1));
    });
    this.shopService.getShops().subscribe(() => {});

    if (this.shopsProductsSubscription) {
      this.shopsProductsSubscription.unsubscribe();
    }

    this.shopsProductsSubscription =
      this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
        this.shopsProducts = _shopsProducts.sort((a, b) =>
          a.updateDate > b.updateDate ? -1 : 1
        );
        this.calculateStandings();
      });

    this.shopProductService
      .getShopsProducts()
      .subscribe((_shopsProducts) => {});
  }
}
