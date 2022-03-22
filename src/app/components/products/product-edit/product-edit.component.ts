import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_IMAGE_URL } from '../../../model/constants/default-image.constant';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';
import { ProductService } from '../../../services/product.service';
import { ShopProductService } from '../../../services/shop-product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
})
export class ProductEditComponent implements OnInit {
  loggedUser: UserInterface;

  productDetail: ProductInterface;
  shopProducts: ShopProductInterface[];
  products: ProductInterface[];
  shops: ShopInterface[];

  historyShopProduct: ShopProductInterface;
  historyShopProductList: ShopProductInterface[] = [];

  selectedTab: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private shopsProductsService: ShopProductService,
    private loginService: LoginService
  ) {}

  exit() {
    this.router.navigateByUrl('');
  }

  canRemoveShopProduct(shopProduct: ShopProductInterface) {
    return (
      this.loggedUser.isAdmin ||
      (shopProduct.createdBy &&
        shopProduct.createdBy.email === this.loggedUser.email &&
        shopProduct.createdBy.username === this.loggedUser.username)
    );
  }

  canEdit() {
    return (
      this.loggedUser.isAdmin ||
      (this.productDetail.createdBy?.email === this.loggedUser.email &&
        this.productDetail.createdBy?.username === this.loggedUser.username)
    );
  }

  updateProduct() {
    this.productService.updateProduct(this.productDetail).subscribe(() => {
      this.router.navigateByUrl('search-products');
    });
  }

  removeShopProduct(shopProduct: ShopProductInterface) {
    console.log(shopProduct);
    if (confirm("Estàs apunt d'esborrar el preu en una botiga. Continuar?")) {
      this.shopsProductsService.removeShopProduct(shopProduct).subscribe(() => {
        if (this.historyShopProduct) {
          this.configHistory(shopProduct);
        }
      });
    }
  }

  getShopName(shopId: string) {
    return this.shops.find((_shop) => {
      return _shop.id === shopId;
    })?.name;
  }

  getShopImage(shopId: string) {
    return (
      this.shops.find((_shop) => {
        return _shop.id === shopId;
      })?.imageUrl || DEFAULT_IMAGE_URL
    );
  }

  showHistory(shopProduct: ShopProductInterface) {
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
              _shopProduct.productBarcode === this.productDetail.barcode &&
              _shopProduct.shopId === shopProduct.shopId
            );
          })
          .sort((a, b) => {
            return a.updateDate < b.updateDate ? 1 : -1;
          });
      });
  }

  hasHistory(shopProduct: ShopProductInterface): boolean {
    return (
      this.shopsProductsService._shopsProducts.filter((_shopProduct) => {
        return (
          _shopProduct.productBarcode === this.productDetail.barcode &&
          _shopProduct.shopId === shopProduct.shopId
        );
      }).length > 1
    );
  }

  getShopProducts() {
    this.shopsProductsService
      .getProductShopProducts(this.productDetail.barcode)
      .subscribe((_shopProducts) => {
        this.shopProducts = [];
        const shopIds = [];
        _shopProducts = _shopProducts.sort((a, b) =>
          a.updateDate < b.updateDate ? 1 : -1
        );
        _shopProducts.forEach((_shopProduct) => {
          if (shopIds.indexOf(_shopProduct.shopId) === -1) {
            shopIds.push(_shopProduct.shopId);
          }
        });
        shopIds.forEach((_shopId) => {
          this.shopProducts.push(
            _shopProducts.find((_shopProduct) => {
              return _shopId === _shopProduct.shopId;
            })
          );
        });
        this.shopProducts.sort((a, b) => (a.price > b.price ? 1 : -1));
      });
  }

  getProductPriceRange(product: ProductInterface): {
    max: number;
    min: number;
  } {
    return this.shopsProductsService.getProductPriceRange(
      product,
      'product-edit'
    );
  }

  ngOnInit() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    this.loggedUser = this.loginService.getLoggedUser();

    const productBarcode = this.route.snapshot.params['barcode'];

    this.products = this.productService._products;

    console.log(this.products);

    this.productDetail = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });

    this.getShopProducts();

    this.shopsProductsService
      .getProductShops(this.productDetail.barcode)
      .subscribe((_shops) => {
        this.shops = _shops;
      });

    // Sincronize product prices
    this.shopsProductsService.shopsProducts.subscribe((_shopsProducts) => {
      this.shopsProductsService
        .getProductShopProducts(this.productDetail.barcode)
        .subscribe((_shopProducts) => {
          this.shopProducts = _shopProducts;
        });
    });
  }
}
