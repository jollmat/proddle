  import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../config/app-config.constant';
import { ProductInterface } from './model/interfaces/product.interface';
import { ShopProductInterface } from './model/interfaces/shop-product.interface';
import { ShopInterface } from './model/interfaces/shop.interface';
import { UserInterface } from './model/interfaces/user.interface';
import { LoginService } from './services/login.service';
import { ProductService } from './services/product.service';
import { ShopProductService } from './services/shop-product.service';
import { ShopService } from './services/shop.service';
import { ShoppingCartConfigInterface } from './model/interfaces/shopping-cart-config.interface';
import { ShoppingCartService } from './services/shopping-cart.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { STORE_KEYS_CONSTANTS } from './model/constants/store-keys.constants';
import { TranslationsService } from './services/translations.service';
import { FirestoreAuthService } from './services/firestore-auth.service';
import { AlertsService } from './services/alerts.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('appLayout') appLayoutComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkBackofficeMode();
  }

  APP_CONFIG = APP_CONFIG;
  
  shops: ShopInterface[];
  products: ProductInterface[];
  shopsProducts: ShopProductInterface[];

  doExport: boolean = false;

  loggedUser: UserInterface;
  backofficeMode: boolean = false;

  cartConfig: ShoppingCartConfigInterface;
  cartItemCount: number;

  translationsLoaded: boolean = false;

  shopsLoaded: boolean = false;
  productsLoaded: boolean = false;
  shopsProductsLoaded: boolean = false;

  alerts: number = 0;
  alerts_unread: number = 0;

  constructor(
    private router: Router,
    private shopService: ShopService,
    private productService: ProductService,
    private shopProductService: ShopProductService,
    private loginService: LoginService,
    private shoppingCartService: ShoppingCartService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private translationsService: TranslationsService,
    private firestoreAuthService: FirestoreAuthService,
    private alertService: AlertsService
  ) {

    this.translate.setDefaultLang(APP_CONFIG.defaultLanguage);

    console.log('Loading translations');

    this.translationsService.loadTranslations().subscribe(() => {
      let savedLanguage = localStorage.getItem(
        STORE_KEYS_CONSTANTS.PS_APP_LANGUAGE
      );
      if (savedLanguage) {
        this.translate.use(savedLanguage);
      } else {
        this.translate.use(APP_CONFIG.defaultLanguage);
        localStorage.setItem(
          STORE_KEYS_CONSTANTS.PS_APP_LANGUAGE,
          APP_CONFIG.defaultLanguage
        );
      }
      this.translationsLoaded = true;

      console.log(
        'Using language: ' +
          localStorage.getItem(STORE_KEYS_CONSTANTS.PS_APP_LANGUAGE)
      );

      console.log('Removing localStorage necessary data');
      localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_LAST_SHOP_ID);
      localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_SHOPS_SEARCH_TEXT);
      localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_PRODUCTS_SEARCH_TEXT);
    });
  }

  goToHome() {
    this.router.navigate(['']);
  }

  goToUserDetail() {
    this.router.navigate(['user']);
  }

  toggleExport() {
    this.copyToClipboard();
  }

  copyToClipboard() {
    const val =
      JSON.stringify(this.shops) +
      '' +
      JSON.stringify(this.products) +
      '' +
      JSON.stringify(this.shopsProducts);
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert('Dades copiades al porta papers!');
  }

  logout() {
    this.loginService.logout();
    this.firestoreAuthService.logout();
    this.router.navigate(['login']);
  }

  checkBackofficeMode() {
    if (this.loggedUser?.admin) {
      this.backofficeMode = window.innerWidth > 568;
    } else {
      this.backofficeMode = false;
    }
  }

  calcCartItems() {
    if (this.cartConfig?.items) {
      let itemCount = 0;
      this.cartConfig.items.forEach((_cartItem) => {
        _cartItem.productsUnits.forEach((_productUnits) => {
          itemCount += _productUnits.units;
        });
      });
      this.cartItemCount = itemCount;
    }
  }

  ngOnInit(): void {
    this.spinner.show();

    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
    });
    this.productService.products.subscribe((_products) => {
      this.products = _products.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
    });
    this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
      this.shopsProducts = _shopsProducts.sort((a, b) =>
        a.updateDate > b.updateDate ? 1 : -1
      );
    });

    this.shopService.loadShops().subscribe(() => {
      this.shopsLoaded = this.shopService._shops && this.shopService._shops.length > 0;
    });
    this.productService.loadProducts().subscribe(() => {
      this.productsLoaded = this.productService._products && this.productService._products.length > 0;
    });
    this.shopProductService.loadShopsProducts().subscribe(() => {
      this.shopsProductsLoaded = this.shopProductService._shopsProducts && this.shopProductService._shopsProducts.length > 0;
    });    

    // Shopping cart

    setTimeout(() => {
      this.shoppingCartService.loadShoppingCart();

      this.shoppingCartService.cartConfig.subscribe((_cartConfig) => {
        this.cartConfig = _cartConfig;
        this.calcCartItems();
      });
      this.shoppingCartService.buildCartConfig();
    }, 5000);

    // Logged user
    this.loggedUser = this.loginService.getLoggedUser();
    this.loginService.user.subscribe((_user) => {
      this.loggedUser = _user;
      if (this.loggedUser) {
        this.loggedUser.admin = this.loginService.checkIsAdmin(this.loggedUser);
      }      
    });

    // Alerts
    this.alertService.userAlerts.subscribe((_userAlerts) => {
      // console.log('userAlerts changed', _userAlerts);
      this.alerts = _userAlerts.alerts.length;
      this.alerts_unread = this.alertService.getUnreadAlerts();
    });
    this.alerts = this.alertService._userAlerts.alerts.length;
    this.alerts_unread = this.alertService.getUnreadAlerts();

    this.checkBackofficeMode();

    this.spinner.hide();
  }
}
