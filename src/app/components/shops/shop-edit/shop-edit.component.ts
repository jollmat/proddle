import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_IMAGE_URL } from '../../../model/constants/default-image.constant';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';
import { ShopProductService } from '../../../services/shop-product.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.scss'],
})
export class ShopEditComponent implements OnInit {
  loggedUser: UserInterface;

  shopDetail: ShopInterface;
  shopProducts: ShopProductInterface[];
  products: ProductInterface[];
  shops: ShopInterface[];

  historyShopProduct: ShopProductInterface;
  historyShopProductList: ShopProductInterface[] = [];

  selectedTab: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private shopService: ShopService,
    private shopsProductsService: ShopProductService,
    private loginService: LoginService
  ) {}

  updateShop() {
    const existsShopName = this.shops.some((_shop) => {
      return (
        _shop.name.toUpperCase() === this.shopDetail.name.toUpperCase() &&
        _shop.id !== this.shopDetail.id
      );
    });

    if (!existsShopName) {
      this.shopService.updateShop(this.shopDetail).subscribe(() => {
        this.router.navigateByUrl('search-shops');
      });
    } else {
      alert('Ja existeix una botiga amb aquest nom: ' + this.shopDetail.name);
      this.shopDetail.name = this.shops.find((_shop) => {
        return _shop.id === this.shopDetail.id;
      }).name;
    }
  }

  exit() {
    this.router.navigateByUrl('');
  }

  newShopProduct() {}

  removeShopProduct(shopProduct: ShopProductInterface) {
    if (confirm("Estàs apunt d'esborrar el preu en una botiga. Continuar?")) {
      this.shopsProductsService
        .removeShopProduct(shopProduct)
        .subscribe(() => {});
    }
  }

  canRemoveShopProduct(shopProduct: ShopProductInterface) {
    return (
      this.loggedUser.isAdmin ||
      (shopProduct.createdBy &&
        shopProduct.createdBy.email === this.loggedUser.email &&
        shopProduct.createdBy.username === this.loggedUser.username)
    );
  }

  doEditProduct(barcode: string) {}

  showHistory(shopProduct: ShopProductInterface) {
    console.log('showHistory()', shopProduct);
    if (this.historyShopProduct) {
      this.historyShopProduct = undefined;
      this.historyShopProductList = [];
    } else {
      this.historyShopProduct = shopProduct;
      this.configHistory(shopProduct);
    }
  }

  configHistory(shopProduct: ShopProductInterface) {
    this.shopsProductsService
      .getProductShopProducts(shopProduct.productBarcode)
      .subscribe((_productPrices) => {
        this.historyShopProductList = _productPrices
          .filter((_shopProduct) => {
            return (
              _shopProduct.productBarcode === shopProduct.productBarcode &&
              _shopProduct.shopId === this.shopDetail.id
            );
          })
          .sort((a, b) => {
            return a.updateDate < b.updateDate ? 1 : -1;
          });
      });
  }

  getProductName(productBarcode: string) {
    const product = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });
    return (
      '<span>' +
      product.name +
      '</span><span class="brand">' +
      product.brand +
      '</span>'
    );
  }

  getProductImage(productBarcode: string) {
    const product = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });
    return product.imageUrl || DEFAULT_IMAGE_URL;
  }

  getLastShopProducts() {
    this.shopsProductsService
      .getShopShopProducts(this.shopDetail.id)
      .subscribe((_shopProducts) => {
        this.shopProducts = [];
        const productsBarcodes = [];
        _shopProducts = _shopProducts.sort((a, b) =>
          a.updateDate < b.updateDate ? 1 : -1
        );
        _shopProducts.forEach((_shopProduct) => {
          if (productsBarcodes.indexOf(_shopProduct.productBarcode) === -1) {
            productsBarcodes.push(_shopProduct.productBarcode);
          }
        });
        productsBarcodes.forEach((_barcode) => {
          this.shopProducts.push(
            _shopProducts.find((_shopProduct) => {
              return _barcode === _shopProduct.productBarcode;
            })
          );
        });
        this.shopProducts.sort((a, b) =>
          this.getProductName(a.productBarcode) >
          this.getProductName(b.productBarcode)
            ? 1
            : -1
        );
      });
  }

  configShopsProducts() {
    this.shopsProductsService
      .getShopProducts(this.shopDetail.id)
      .subscribe((_products) => {
        this.products = _products;

        this.shopsProductsService
          .getShopShopProducts(this.shopDetail.id)
          .subscribe((_shopProducts) => {
            this.shopProducts = _shopProducts;
            this.getLastShopProducts();
          });
      });
  }

  canEdit() {
    return (
      this.loggedUser.isAdmin ||
      (!this.shopDetail?.default &&
        this.shopDetail.createdBy &&
        this.shopDetail.createdBy.email === this.loggedUser.email &&
        this.shopDetail.createdBy.username === this.loggedUser.username)
    );
  }

  hasHistory(shopProduct: ShopProductInterface): boolean {
    return (
      this.shopsProductsService._shopsProducts.filter((_shopProduct) => {
        return (
          _shopProduct.productBarcode === shopProduct.productBarcode &&
          _shopProduct.shopId === this.shopDetail.id
        );
      }).length > 1
    );
  }

  ngOnInit() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    this.loggedUser = this.loginService.getLoggedUser();

    const shopId = this.route.snapshot.params['id'];

    this.shops = this.shopService._shops;

    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops;

      this.shopDetail = _shops.find((_shop) => {
        return _shop.id === shopId;
      });

      this.configShopsProducts();
    });

    this.shopsProductsService.shopsProducts.subscribe((_shopsProducts) => {
      this.configShopsProducts();
    });

    this.shops = this.shopService._shops;
    this.shopDetail = this.shops.find((_shop) => {
      return _shop.id === shopId;
    });
    this.configShopsProducts();
  }
}
