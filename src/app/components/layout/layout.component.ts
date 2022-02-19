import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductInterface } from '../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../model/interfaces/shop.interface';
import { ProductService } from '../../services/product.service';
import { ShopProductService } from '../../services/shop-product.service';
import { ShopService } from '../../services/shop.service';

import { v4 as uuidv4 } from 'uuid';
import { OpenFoodProductInterface } from '../../model/interfaces/openfood-product.interface';
import { OpenFoodService } from '../../services/openfood.service';
import Highcharts = require('highcharts');

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  @Output() onAppStart = new EventEmitter();

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;

  showNewShop: boolean = false;
  showEditShop: boolean = false;
  shops: ShopInterface[];
  shopDetail: ShopInterface;
  doListShops: boolean = false;

  showNewProduct: boolean = false;
  showEditProduct: boolean = false;
  products: ProductInterface[];
  productDetail: ProductInterface;
  doListProducts: boolean = false;

  showEditShopProduct: boolean = false;
  shopProductDetail: ShopProductInterface;
  shopsProducts: ShopProductInterface[];

  editionShopsProducts: ShopProductInterface[];

  shopsProductsHistory: ShopProductInterface[] = [];
  historyShopName: string;
  historyProductName: string;
  historyView: 'CHART' | 'LIST' = 'CHART';

  openFoodProduct: OpenFoodProductInterface;

  showShops: boolean = false;
  showProducts: boolean = false;
  showStatistics: boolean = false;
  showBarcodeSearch: boolean = false;

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private shopProductService: ShopProductService,
    private openFoodService: OpenFoodService
  ) {}

  toggleShopList() {
    this.showShops = !this.showShops;
  }

  toggleProductList() {
    this.showProducts = !this.showProducts;
  }

  toggleStatistics() {
    this.showStatistics = !this.showStatistics;
  }

  toggleBarcodeSearch() {
    this.showBarcodeSearch = !this.showBarcodeSearch;
  }

  toggleNewShop() {
    this.shopDetail = {
      id: undefined,
      name: '',
      favourite: false,
    };
    this.showNewShop = !this.showNewShop;
  }

  createShop() {
    const existsShopName = this.shops.some((_shop) => {
      return _shop.name === this.shopDetail.name;
    });

    if (!existsShopName) {
      this.shopDetail.id = uuidv4();
      this.shops.push(this.shopDetail);
      this.shopService.setShops(this.shops).subscribe(() => {
        this.toggleNewShop();
      });
    } else {
      alert('Ja existeix una botiga amb aquest nom!');
    }
  }

  updateShop() {
    const existsShopName = this.shops.some((_shop) => {
      return (
        _shop.name === this.shopDetail.name && _shop.id !== this.shopDetail.id
      );
    });

    if (!existsShopName) {
      const shopIndex = this.shops.findIndex((_shop) => {
        return _shop.id === this.shopDetail.id;
      });
      this.shops[shopIndex] = this.shopDetail;
      this.shopService.setShops(this.shops).subscribe(() => {
        this.toggleEditShop();
      });
    } else {
      alert('Ja existeix una botiga amb aquest nom: ' + this.shopDetail.name);
      this.shopDetail.name = this.shops.find((_shop) => {
        return _shop.id === this.shopDetail.id;
      }).name;
    }
  }

  toggleFavouriteShop(shopId: string) {
    const shop = this.shops.find((_shop) => {
      return _shop.id === shopId;
    });
    shop.favourite = !shop.favourite;
    this.shopService.setShops(this.shops).subscribe(() => {});
  }

  removeShop(shopId: string) {
    if (
      confirm(
        "Si esborres la botiga també s'esborraràn els preus dels seus productes. Continuar?"
      )
    ) {
      this.shopService.setShops(
        this.shops.filter((_shop) => {
          return _shop.id !== shopId;
        })
      );

      this.shopProductService.setShopsProducts(
        this.shopsProducts.filter((_shopProduct) => {
          return _shopProduct.shopId !== shopId;
        })
      );
    }
  }

  doEditShop(shopId: string) {
    this.toggleEditShop(
      this.shops.find((_s) => {
        return _s.id === shopId;
      })
    );
  }

  toggleEditShop(shop?: ShopInterface) {
    this.shopDetail = undefined;
    this.productDetail = undefined;
    this.shopProductDetail = undefined;
    this.shopsProductsHistory = [];
    this.openFoodProduct = undefined;
    this.editionShopsProducts = [];
    if (shop) {
      this.shopDetail = shop;
      this.editionShopsProducts = this.removeShopProductsDuplicated(
        this.shopsProducts
          .filter((_shopProduct) => {
            return _shopProduct.shopId === shop.id;
          })
          .sort((a, b) => (a.price > b.price ? 1 : -1))
      );
      this.showEditShop = true;
    } else {
      this.showEditShop = false;
    }
  }

  toggleNewProduct() {
    this.openFoodProduct = undefined;
    this.productDetail = {
      barcode: '',
      brand: '',
      name: '',
      favourite: false,
    };

    if (this.shops.length === 0) {
      alert('Necessites tenir com a mínim una botiga!');
    } else {
      this.showNewProduct = !this.showNewProduct;
    }
  }

  createProduct() {
    const existsProduct = this.products.some((_product) => {
      return _product.barcode === this.productDetail.barcode;
    });

    if (existsProduct) {
      alert('Ja existeix un producte amb aquest codi de barres');
    } else {
      // Afegim el producte
      this.products.push(this.productDetail);
      this.productService.setProducts(this.products).subscribe(() => {
        this.toggleNewProduct();
      });
    }
  }

  fillProduct(product: ProductInterface) {
    this.productDetail.barcode = product.barcode;
    this.productDetail.brand = product.brand;
    this.productDetail.name = product.name;
    this.toggleBarcodeSearch();
  }

  updateProduct() {
    const productIndex = this.products.findIndex((_product) => {
      return _product.barcode === this.productDetail.barcode;
    });
    this.products[productIndex] = this.productDetail;
    this.productService.setProducts(this.products).subscribe(() => {
      this.toggleEditProduct();
    });
  }

  toggleFavouriteProduct(productBarcode: string) {
    const product = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });
    product.favourite = !product.favourite;
    this.productService.setProducts(this.products).subscribe(() => {});
  }

  removeProduct(productCodebar: string) {
    if (
      confirm(
        "Si esborres el producte també s'esborraràn els preus que tingui en les botigues. Continuar?"
      )
    ) {
      this.productService.setProducts(
        this.products.filter((_product) => {
          return _product.barcode !== productCodebar;
        })
      );
      this.shopProductService.setShopsProducts(
        this.shopsProducts.filter((_shopProduct) => {
          return _shopProduct.productBarcode !== productCodebar;
        })
      );
    }
  }

  doEditProduct(barcode: string) {
    this.toggleEditProduct(
      this.products.find((_p) => {
        return _p.barcode === barcode;
      })
    );
  }

  toggleEditProduct(product?: ProductInterface) {
    this.shopDetail = undefined;
    this.productDetail = undefined;
    this.shopProductDetail = undefined;
    this.shopsProductsHistory = [];
    this.openFoodProduct = undefined;
    this.editionShopsProducts = [];
    if (product) {
      this.productDetail = product;
      this.editionShopsProducts = this.removeShopProductsDuplicated(
        this.shopsProducts
          .filter((_shopProduct) => {
            return _shopProduct.productBarcode === product.barcode;
          })
          .sort((a, b) => (a.price > b.price ? 1 : -1))
      );
      // this.loadOpenFoodProduct(this.productDetail.barcode, false);
      this.showEditProduct = true;
    } else {
      this.showEditProduct = false;
      this.openFoodProduct = undefined;
    }
  }

  toggleNewShopProduct() {
    this.openFoodProduct = undefined;
    this.shopProductDetail = {
      price: 0,
      updateDate: new Date().getTime(),
      shopId: this.showEditShop ? this.shopDetail.id : undefined,
      productBarcode: this.showEditProduct
        ? this.productDetail.barcode
        : this.products[0].barcode,
    };
    this.showEditShopProduct = !this.showEditShopProduct;
  }

  saveShopProduct() {
    console.log('saveShopProduct()', this.shopProductDetail);
    const existsShopProduct = this.shopsProducts.some((_shopProduct) => {
      return (
        _shopProduct.productBarcode === this.shopProductDetail.productBarcode &&
        _shopProduct.shopId === this.shopProductDetail.shopId
      );
    });

    if (
      !existsShopProduct ||
      confirm(
        "Ja existeix el producte per a la botiga. Desitges actualitzar-lo amb data d'avui (el preu anterior s'afegirà a un historial)?"
      )
    ) {
      this.shopsProducts.push(this.shopProductDetail);
      this.shopProductService
        .setShopsProducts(this.shopsProducts)
        .subscribe(() => {
          if (this.showEditShop) {
            this.editionShopsProducts = this.removeShopProductsDuplicated(
              this.shopsProducts
                .filter((_shopProduct) => {
                  return _shopProduct.shopId === this.shopDetail.id;
                })
                .sort((a, b) => (a.price > b.price ? 1 : -1))
            );
          } else if (this.showEditProduct) {
            this.editionShopsProducts = this.removeShopProductsDuplicated(
              this.shopsProducts
                .filter((_shopProduct) => {
                  return (
                    _shopProduct.productBarcode === this.productDetail.barcode
                  );
                })
                .sort((a, b) => (a.price > b.price ? 1 : -1))
            );
          }

          this.toggleNewShopProduct();
        });
    }
  }

  getProductName(productBarcode: string) {
    const product = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });
    return product.name + ', <span class="brand">' + product.brand + '</span>';
  }

  getShopName(shopId: string) {
    return this.shops.find((_shop) => {
      return _shop.id === shopId;
    })?.name;
  }

  removeShopProduct(shopProduct: ShopProductInterface) {
    if (confirm("Estàs apunt d'esborrar el preu en una botiga. Continuar?")) {
      this.shopProductService
        .setShopsProducts(
          this.shopsProducts.filter((_shopProduct) => {
            return (
              _shopProduct.shopId !== shopProduct.shopId ||
              _shopProduct.productBarcode !== shopProduct.productBarcode
            );
          })
        )
        .subscribe(() => {
          if (this.showEditShop) {
            this.toggleEditShop(this.shopDetail);
          } else if (this.showEditProduct) {
            this.toggleEditProduct(this.productDetail);
          }
          this.calculateShopProductHistory(shopProduct);
        });
    }
  }

  removeShopProductHistory(shopProduct: ShopProductInterface) {
    if (
      confirm(
        "Estàs apunt d'esborrar el preu en una botiga en un moment concret. Continuar?"
      )
    ) {
      this.shopProductService
        .setShopsProducts(
          this.shopsProducts.filter((_shopProduct) => {
            return (
              _shopProduct.shopId !== shopProduct.shopId ||
              _shopProduct.productBarcode !== shopProduct.productBarcode ||
              _shopProduct.updateDate !== shopProduct.updateDate
            );
          })
        )
        .subscribe(() => {
          if (this.showEditShop) {
            this.toggleEditShop(this.shopDetail);
          } else if (this.showEditProduct) {
            this.toggleEditProduct(this.productDetail);
          }
          this.calculateShopProductHistory(shopProduct);
          this.showHistory(shopProduct);
        });
    }
  }

  removeShopProductsDuplicated(
    shopsProducts: ShopProductInterface[]
  ): ShopProductInterface[] {
    let res: ShopProductInterface[] = [];

    shopsProducts = shopsProducts.filter((_shopProduct) => {
      const duplicates = shopsProducts.filter((__shopProduct) => {
        return (
          __shopProduct.productBarcode === _shopProduct.productBarcode &&
          __shopProduct.shopId === _shopProduct.shopId &&
          __shopProduct.updateDate !== _shopProduct.updateDate
        );
      });
      return (
        duplicates.length === 0 ||
        duplicates.sort((a, b) => (a.updateDate > b.updateDate ? 1 : -1))[
          duplicates.length - 1
        ].updateDate < _shopProduct.updateDate
      );
    });

    return shopsProducts;
  }

  loadOpenFoodProduct(
    barcode?: string | undefined,
    overwriteData: boolean = false
  ) {
    this.openFoodProduct = undefined;

    if (!barcode) {
      barcode = this.productDetail.barcode;
    }

    if (this.productDetail.barcode.length > 0) {
      this.openFoodService
        .loadProduct(barcode)
        .subscribe((_openFoodProduct) => {
          console.log(_openFoodProduct);
          this.openFoodProduct = _openFoodProduct;
          if (this.openFoodProduct?.product && overwriteData) {
            function capitalizeFirstLetter(string) {
              return string.charAt(0).toUpperCase() + string.slice(1);
            }
            this.productDetail.name = _openFoodProduct.product
              ? capitalizeFirstLetter(_openFoodProduct.product.product_name)
              : '';
            this.productDetail.brand = _openFoodProduct.product
              ? capitalizeFirstLetter(_openFoodProduct.product.brands)
              : '';
            this.productDetail.imageUrl =
              _openFoodProduct.product.image_url || undefined;
          }
        });
    }
  }

  getHistoryCount(shopProduct: ShopProductInterface) {
    return this.shopsProducts.filter((_shopProduct) => {
      return (
        _shopProduct.productBarcode === shopProduct.productBarcode &&
        _shopProduct.shopId === shopProduct.shopId
      );
    }).length;
  }

  calculateShopProductHistory(shopProduct: ShopProductInterface) {
    this.shopsProductsHistory = this.shopsProducts.filter((_shopProduct) => {
      return (
        _shopProduct.productBarcode === shopProduct.productBarcode &&
        _shopProduct.shopId === shopProduct.shopId
      );
    });
    this.shopsProductsHistory = [...this.shopsProductsHistory].sort((a, b) =>
      a.updateDate > b.updateDate ? 1 : -1
    );
  }

  showHistory(shopProduct: ShopProductInterface) {
    this.chartOptions = undefined;

    this.historyShopName = this.shops.find((_shop) => {
      return _shop.id === shopProduct.shopId;
    }).name;
    this.historyProductName = this.products.find((_product) => {
      return _product.barcode === shopProduct.productBarcode;
    }).name;
    this.calculateShopProductHistory(shopProduct);
    this.chartOptions = this.getChartData(this.shopsProductsHistory);
  }

  hideHistory() {
    this.shopsProductsHistory = [];
    this.historyShopName = '';
    this.historyProductName = '';
  }

  getChartData(shopProductHistory: ShopProductInterface[]): any {
    return {
      chart: {
        type: 'line',
      },
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: shopProductHistory.map((_shopProduct) => {
          return _shopProduct.updateDate;
        }),
        labels: {
          formatter: function () {
            return Highcharts.dateFormat('%a %d %b %H:%M', this.value);
          },
        },
      },
      yAxis: {
        title: {
          text: 'Preu (€)',
        },
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
          },
          enableMouseTracking: false,
        },
      },
      series: [
        {
          name: '',
          data: shopProductHistory.map((_shopProduct) => {
            return _shopProduct.price;
          }),
        },
      ],
    };
  }

  doStart() {
    localStorage.setItem('proddle_started', 'true');
    this.onAppStart.emit();
  }

  ngOnInit() {
    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops.sort((a, b) => (a.name > b.name ? 1 : -1));
    });

    this.productService.products.subscribe((_products) => {
      this.products = _products.sort((a, b) => (a.name > b.name ? 1 : -1));
    });

    this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
      this.shopsProducts = _shopsProducts;
    });

    this.shopService.getShops().subscribe(() => {
      console.log('Shops loaded!');
    });
    this.productService.getProducts().subscribe(() => {
      console.log('Products loaded!');
    });
    this.shopProductService.getShopsProducts().subscribe(() => {
      console.log('ShopProducts loaded!');
    });
  }
}
