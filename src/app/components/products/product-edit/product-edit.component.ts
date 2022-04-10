import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenFoodProductInterface } from 'src/app/model/interfaces/openfood-product.interface';
import { OpenFoodService } from 'src/app/services/openfood.service';
import { ShopService } from 'src/app/services/shop.service';
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

  loadingOpenFoodProduct: boolean = true;
  openFoodProduct: OpenFoodProductInterface;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private shopService: ShopService,
    private shopsProductsService: ShopProductService,
    private loginService: LoginService,
    private openfoodService: OpenFoodService
  ) {}

  exit() {
    this.router.navigateByUrl('');
  }

  canRemoveShopProduct(shopProduct: ShopProductInterface) {
    return (
      this.loggedUser.admin ||
      (shopProduct.createdBy &&
        shopProduct.createdBy.email === this.loggedUser.email)
    );
  }

  canEdit() {
    return (
      this.loggedUser.admin ||
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
        this.getShopProducts();
        if (this.historyShopProduct) {
          this.configHistory(shopProduct);
        }
      });
    }
  }

  getShopName(shopId: string) {
    const shop = this.shops.find((_shop) => {
      return _shop.id === shopId;
    });
    return shop?.name;
  }

  getShopImage(shopId: string) {
    return (
      this.shops.find((_shop) => {
        return _shop.id === shopId;
      })?.imageUrl || DEFAULT_IMAGE_URL
    );
  }

  showHistory(shopProduct: ShopProductInterface) {
    if (this.historyShopProduct && 
        this.historyShopProduct.productBarcode===shopProduct.productBarcode && 
        this.historyShopProduct.shopId===shopProduct.shopId) {
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
    if (this.productDetail) {
      this.shopsProductsService
      .getProductShopProducts(this.productDetail.barcode)
      .subscribe((_shopProducts) => {
        this.shopProducts = [];
        const shopIds = [];
        _shopProducts.forEach((_shopProduct) => {
          if (shopIds.indexOf(_shopProduct.shopId) === -1) {
            shopIds.push(_shopProduct.shopId);
          }
        });
        shopIds.forEach((_shopId) => {
          this.shopProducts.push(this.shopsProductsService.getShopProductLast(_shopId, this.productDetail.barcode));
        });
        this.shopProducts.sort((a, b) => (a.price > b.price ? 1 : -1));
      });
    }
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

  getAlergens(){
    console.log(this.openFoodProduct.product.allergens);
    let alergens = this.openFoodProduct.product.allergens.split(',');

    alergens = alergens.map((_alergen) => {
      const val = _alergen.substring(_alergen.indexOf(':') + 1);
      return val.charAt(0).toUpperCase() + val.slice(1);
    });

    return alergens.toString().replace(/,/g, ', ');
  }

  ngOnInit() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    this.loggedUser = this.loginService.getLoggedUser();

    const productBarcode = this.route.snapshot.params['barcode'];

    this.products = this.productService._products;
    this.shops = this.shopService._shops;

    this.productService.products.subscribe((_p) => {
      this.products = _p;
    });
    this.shopService.shops.subscribe((_s) => {
      this.shops = _s;
    });

    this.productDetail = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });

    this.loadingOpenFoodProduct = true;
    this.openfoodService.loadProduct(productBarcode).subscribe((_openFoodProduct) => {
      console.log(_openFoodProduct);
      if (_openFoodProduct?.product) {
        this.openFoodProduct = _openFoodProduct;
      }
      this.loadingOpenFoodProduct = false;
    });

    this.getShopProducts();
  }
}
