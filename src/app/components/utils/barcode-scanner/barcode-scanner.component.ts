import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DEFAULT_IMAGE_URL } from '../../../model/constants/default-image.constant';
import { ProductScanModeEnum } from '../../../model/enums/product-scan-mode.enum';
import { OpenFoodProductInterface } from '../../../model/interfaces/openfood-product.interface';
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
import { STORE_KEYS_CONSTANTS } from 'src/app/model/constants/store-keys.constants';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss'],
})
export class BarcodeScannerComponent implements AfterViewInit {
  @Input() mode: ProductScanModeEnum;

  @Output()
  onSaveProduct = new EventEmitter<ProductInterface>();

  @Output()
  onCreateProduct = new EventEmitter<{
    product: ProductInterface;
    shopProduct?: ShopProductInterface;
  }>();

  @Output()
  onSaveShopProduct = new EventEmitter<ShopProductInterface>();

  @Output()
  onProductFound = new EventEmitter();

  @Output()
  onBarcodeRead = new EventEmitter();

  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner: BarcodeScannerLivestreamComponent;

  @ViewChild('priceInput') priceInput: ElementRef;

  DEFAULT_IMAGE_URL = DEFAULT_IMAGE_URL;

  loggedUser: UserInterface;

  barcodeScannerStarted: boolean = false;
  barcodeScannerError: boolean = false;

  barcodeValue: string;
  openFoodProduct: OpenFoodProductInterface;

  loadingOpenFoodProduct: boolean = false;
  openFoodProductFound: boolean = false;

  isSavedProduct: boolean = false;
  savedProduct: ProductInterface;
  saveProductPrices: ShopProductInterface[];
  productHasPrices: boolean = false;
  shopsProducts: ShopProductInterface[];
  products: ProductInterface[];
  shops: ShopInterface[];

  newProduct: ProductInterface;

  shopProduct: ShopProductInterface;

  barcodeChanged: Subject<any> = new Subject<any>();

  ProductScanModeEnum = ProductScanModeEnum;

  constructor(
    private openFoodService: OpenFoodService,
    private productService: ProductService,
    private shopService: ShopService,
    private shopProductService: ShopProductService,
    private loginService: LoginService,
    private translate: TranslateService
  ) {
    this.barcodeChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((barcodeResult) => {
        if (this.barcodeValue !== barcodeResult.codeResult.code) {
          this.onBarcodeRead.emit();
          this.barcodeValue = barcodeResult.codeResult.code;
          this.newProduct.barcode = this.barcodeValue;
          this.shopProduct.productBarcode = this.barcodeValue;

          this.savedProduct = undefined;
          this.productHasPrices = false;

          this.savedProduct = this.products.find((_product) => {
            return _product.barcode === this.barcodeValue;
          });

          this.isSavedProduct = this.savedProduct !== undefined;

          if (!this.isSavedProduct) {
            this.getOpenFoodProduct(this.barcodeValue);
          } else if (this.isSavedProduct) {
            this.onProductFound.emit();
            this.productHasPrices =
              this.shopsProducts.filter((_shopProduct) => {
                return _shopProduct.productBarcode === this.barcodeValue;
              }).length > 0;
          }
        }
      });
  }

  getOpenFoodProduct(barcode: string): void {
    this.openFoodProduct = undefined;
    this.loadingOpenFoodProduct = true;
    this.openFoodProductFound = false;

    setTimeout(() => {
      this.openFoodService
        .loadProduct(barcode)
        .subscribe((_openFoodProduct) => {
          this.openFoodProduct = _openFoodProduct;
          this.loadingOpenFoodProduct = false;
          this.openFoodProductFound = _openFoodProduct.product !== undefined;

          if (this.openFoodProductFound) {
            this.onProductFound.emit();
          }

          const existingProduct = this.products.find((_product) => {
            return _product.barcode === barcode;
          });
          if (existingProduct && this.openFoodProduct.product) {
            this.openFoodProduct.product.brands = existingProduct.brand;
            this.openFoodProduct.product.image_url = existingProduct.imageUrl;
            this.openFoodProduct.product.product_name = existingProduct.name;
          }
        });
    }, 300);
  }

  onValueChanges(result) {
    if (
      !this.openFoodProductFound &&
      !this.isSavedProduct &&
      !this.loadingOpenFoodProduct
    ) {
      this.barcodeChanged.next(result);
    }
  }

  capitalizeFirstLetter(txt: string): string {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  saveProduct() {
    if (!this.savedProduct) {
      const product: ProductInterface = {
        id: uuidv4(),
        barcode: this.barcodeValue,
        brand: this.openFoodProduct?.product?.brands
          ? this.capitalizeFirstLetter(this.openFoodProduct.product.brands)
          : '?',
        favourite: false,
        name: this.openFoodProduct?.product?.product_name
          ? this.capitalizeFirstLetter(
              this.openFoodProduct.product.product_name
            )
          : '?',
        imageUrl: this.openFoodProduct?.product?.image_url
          ? this.openFoodProduct.product.image_url
          : DEFAULT_IMAGE_URL,
      };
      this.onSaveProduct.emit(product);
    } else {
      this.onSaveProduct.emit(this.savedProduct);
    }
  }

  canCreateProductAndPrice(): boolean {
    return (
      this.newProduct &&
      this.shopProduct &&
      this.newProduct.name.length > 0 &&
      this.newProduct.brand.length > 0 &&
      this.shopProduct.price &&
      this.shopProduct.shopId &&
      this.shopProduct.shopId.length > 0
    );
  }

  createProduct() {
    this.onCreateProduct.emit({
      product: this.newProduct,
      shopProduct: this.shopProduct,
    });
  }

  saveShopProduct() {
    const product = this.products.find((_product) => {
      return _product.barcode === this.shopProduct.productBarcode;
    });
    if (product) {
      this.onSaveShopProduct.emit(this.shopProduct);
    } else {
      if (
        confirm(this.translate.instant('scanner.createUnknownProductConfirm'))
      ) {
        if (this.openFoodProductFound) {
          this.newProduct = {
            id: uuidv4(),
            barcode: this.shopProduct.productBarcode,
            brand: this.openFoodProduct?.product?.brands || '?',
            favourite: false,
            name:
              this.openFoodProduct?.product?.product_name || '?',
            imageUrl: this.openFoodProduct?.product?.image_url || DEFAULT_IMAGE_URL,
            createdBy: this.loggedUser,
          };
          this.products.push(this.newProduct);
        } else {
          this.newProduct.barcode = this.shopProduct.productBarcode;
          this.products.push(this.newProduct);
        }
        console.log(this.newProduct);
        this.productService.createProduct(this.newProduct).subscribe(() => {
          this.onSaveShopProduct.emit(this.shopProduct);
        });
      }
    }
  }

  selectPriceInput() {
    this.priceInput.nativeElement.select();
  }

  ngAfterViewInit() {
    this.loggedUser = this.loginService.getLoggedUser();
    this.barcodeScanner.start();

    const lastShopId = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_LAST_SHOP_ID);

    this.newProduct = {
      id: uuidv4(),
      barcode: '',
      name: '',
      brand: '',
      favourite: false,
      createdBy: this.loggedUser,
      imageUrl: DEFAULT_IMAGE_URL,
    };

    this.shopProduct = {
      price: 0,
      productBarcode: undefined,
      shopId: lastShopId || undefined,
      updateDate: new Date().getTime(),
      createdBy: this.loggedUser
    };

    this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
      this.shopsProducts = _shopsProducts;
    });
    this.productService.products.subscribe((_products) => {
      this.products = _products;
    });
    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops;
    });

    this.shopsProducts = this.shopProductService._shopsProducts;
    this.shops = this.shopService._shops;
    this.products = this.productService._products;
    
  }

  onStarted(started) {
    // console.log('BarcodeScannerComponent.onStarted()', started);
    this.barcodeScannerStarted = started;
  }
}
