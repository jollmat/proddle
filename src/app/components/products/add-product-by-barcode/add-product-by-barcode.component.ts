import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Subscription,
} from 'rxjs';
import { DEFAULT_IMAGE_URL } from '../../../model/constants/default-image.constant';
import { ProductScanModeEnum } from '../../../model/enums/product-scan-mode.enum';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';
import { OpenFoodService } from '../../../services/openfood.service';
import { ProductService } from '../../../services/product.service';
import { ShopProductService } from '../../../services/shop-product.service';
import { ShopService } from '../../../services/shop.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-product-by-barcode',
  templateUrl: './add-product-by-barcode.component.html',
  styleUrls: ['./add-product-by-barcode.component.scss'],
})
export class AddProductByBarcodeComponent implements OnInit {
  loggedUser: UserInterface;

  @ViewChild('barcodeInput') barcodeInput: ElementRef;
  @ViewChild('priceInput') priceInput: ElementRef;

  ProductScanModeEnum = ProductScanModeEnum;

  shops: ShopInterface[];
  shopsProducts: ShopProductInterface[];

  productDetail: ProductInterface = {
    id: uuidv4(),
    barcode: '',
    brand: '',
    favourite: false,
    name: '',
  };
  shopProductDetail: ShopProductInterface = {
    price: 0,
    productBarcode: '',
    shopId: '',
    updateDate: new Date().getTime(),
  };

  productFound: boolean = false;
  barcodeRead: boolean = false;

  matchingBarcode: boolean = false;
  lockProductEdition: boolean = false;

  barcodeChangeSubscription: Subscription;
  openFoodProductLoadSubscription: Subscription;

  mode: 'SCANNER' | 'MANUAL' = 'SCANNER';

  constructor(
    private router: Router,
    private shopProductService: ShopProductService,
    private productService: ProductService,
    private loginService: LoginService,
    private shopService: ShopService,
    private openFoodService: OpenFoodService,
    private translate: TranslateService
  ) {}

  setMode(mode: 'SCANNER' | 'MANUAL') {
    this.mode = mode;
    if (mode === 'MANUAL') {
      this.productDetail = this.getNewProduct();
      this.shopProductDetail = this.getNewShopProduct();
      this.initBarcodeTextInput();
    }
  }

  getNewProduct(): ProductInterface {
    return {
      id: uuidv4(),
      barcode: '',
      brand: '',
      favourite: false,
      name: '',
      createdBy: this.loggedUser,
      imageUrl: DEFAULT_IMAGE_URL,
    };
  }

  getNewShopProduct(): ShopProductInterface {
    return {
      price: 0,
      productBarcode: '',
      shopId: '',
      updateDate: new Date().getTime(),
      createdBy: this.loggedUser,
    };
  }

  initBarcodeTextInput() {
    if (this.barcodeChangeSubscription) {
      this.barcodeChangeSubscription.unsubscribe();
    }
    const barcodeChangeSubscription = fromEvent(
      this.barcodeInput.nativeElement,
      'keyup'
    )
      .pipe(
        // get value
        map((event: any) => {
          return event.target.value;
        }),
        // if character length greater then 2
        filter((res) => res.length > 2),

        // Time in milliseconds between key events
        debounceTime(500),

        // If previous query is diffent from current
        distinctUntilChanged()

        // subscription for response
      )
      .subscribe((barcode: string) => {
        console.log('barcodeInput changed:', barcode);
        this.shopProductDetail.productBarcode = barcode;

        this.lockProductEdition = true;
        this.matchingBarcode = true;
        const savedProduct = this.productService._products.find((_product) => {
          return _product.barcode === barcode;
        });

        if (savedProduct) {
          this.productDetail.name = savedProduct.name;
          this.productDetail.barcode = savedProduct.barcode;
          this.productDetail.brand = savedProduct.brand;
          this.productDetail.favourite = savedProduct.favourite;
          this.productDetail.imageUrl = savedProduct.imageUrl;
          this.productDetail.createdBy = savedProduct.createdBy;
          this.matchingBarcode = false;
        } else {
          if (this.openFoodProductLoadSubscription) {
            this.openFoodProductLoadSubscription.unsubscribe();
          }
          this.openFoodProductLoadSubscription = this.openFoodService
            .loadProduct(barcode)
            .subscribe((_openFoodProductResult) => {
              console.log(_openFoodProductResult);
              if (_openFoodProductResult.product !== undefined) {
                this.productDetail.name =
                  _openFoodProductResult.product.product_name;
                this.productDetail.barcode = barcode;
                this.productDetail.brand =
                  _openFoodProductResult.product.brands;
                this.productDetail.favourite = false;
                this.productDetail.imageUrl =
                  _openFoodProductResult.product.image_url;
                this.productDetail.createdBy = this.loggedUser;
                this.matchingBarcode = false;
                this.lockProductEdition = false;
              } else {
                this.matchingBarcode = false;
                this.lockProductEdition = false;
                this.productDetail.name = '';
                this.productDetail.brand = '';
                this.productDetail.favourite = false;
                this.productDetail.imageUrl = DEFAULT_IMAGE_URL;
              }
            });
        }
      });
  }

  selectPriceInput() {
    this.priceInput.nativeElement.select();
  }

  canCreateProductAndPrice(): boolean {
    return (
      this.productDetail &&
      this.productDetail.barcode?.length > 0 &&
      this.productDetail.name?.length > 0 &&
      this.productDetail.brand?.length > 0 &&
      this.shopProductDetail &&
      this.shopProductDetail.productBarcode?.length > 0 &&
      this.shopProductDetail.price &&
      this.shopProductDetail.shopId &&
      this.shopProductDetail.shopId.length > 0
    );
  }

  saveShopProduct(shopProduct?: ShopProductInterface) {
    if (shopProduct) {
      console.log('saveShopProduct()', shopProduct);
      shopProduct.createdBy = this.loggedUser;
      this.shopProductService.addShopProduct(shopProduct).subscribe(() => {
        this.exit();
      });
    } else {
      console.log('saveShopProduct()', this.shopProductDetail);
      const existsShopProduct = this.shopsProducts.some((_shopProduct) => {
        return (
          _shopProduct.productBarcode ===
            this.shopProductDetail.productBarcode &&
          _shopProduct.shopId === this.shopProductDetail.shopId
        );
      });

      if (
        !existsShopProduct ||
        confirm(this.translate.instant('scanner.addExistingShopProductConfirm'))
      ) {
        this.shopsProducts.push(this.shopProductDetail);
        this.shopProductService.addShopProduct(shopProduct).subscribe(() => {
          this.exit();
        });
      } else {
        this.exit();
      }
    }
  }

  createProduct(data: {
    product: ProductInterface;
    shopProduct?: ShopProductInterface;
  }) {
    console.log('AddProductByBarcodeComponent.createProduct()', data);

    if (!this.lockProductEdition) {
      this.productService.createProduct(data.product).subscribe(() => {
        if (data.shopProduct) {
          this.shopProductService.addShopProduct(data.shopProduct).subscribe(() => {
            this.exit();
          });
        } else {
          this.exit();
        }
      });
    } else if (data.shopProduct) {
      this.shopProductService.addShopProduct(data.shopProduct).subscribe(() => {
        this.exit();
      });
    } else {
      this.exit();
    }
  }

  exit() {
    this.router.navigate(['']);
  }

  ngOnInit() {
    this.loggedUser = this.loginService.getLoggedUser();

    this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
      this.shopsProducts = _shopsProducts;
    });
    this.shopsProducts = this.shopProductService._shopsProducts;

    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops;
    });
    this.shops = this.shopService._shops;
  }
}
