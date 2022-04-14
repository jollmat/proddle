import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HighchartsChartModule } from 'highcharts-angular';

import { AppComponent } from './app.component';
import { ProductSearchComponent } from './components/products/product-search/product-search.component';
import { ShopSearchComponent } from './components/shops/shop-search/shop-search.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ShopStandingsComponent } from './components/data-analisis/shop-standings/shop-standings.component';

import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';
import { BarcodeScannerComponent } from './components/utils/barcode-scanner/barcode-scanner.component';
import { ProductScanResultComponent } from './components/products/product-scan-result/product-scan-result.component';
import { CarouselComponent } from './components/utils/carousel/carousel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddProductByBarcodeComponent } from './components/products/add-product-by-barcode/add-product-by-barcode.component';
import { StatisticsComponent } from './components/data-analisis/statistics/statistics.component';
import { ShopEditComponent } from './components/shops/shop-edit/shop-edit.component';
import { PageNotFoundComponent } from './components/utils/page-not-found/page-not-found.component';
import { ShopCreateComponent } from './components/shops/shop-create/shop-create.component';
import { ProductEditComponent } from './components/products/product-edit/product-edit.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthenticationNoneGuard } from './guards/authentication-none.guard';
import { ForbiddenComponent } from './components/utils/forbidden/forbidden.component';
import { LoginComponent } from './components/login/login.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { BreadcrumbsComponent } from './components/utils/breadcrumbs/breadcrumbs.component';

import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { BackofficeLayoutComponent } from './components/backoffice/backoffice-layout/backoffice-layout.component';
import { BackofficeDashboardComponent } from './components/backoffice/backoffice-dashboard/backoffice-dashboard.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { APP_ROUTES } from './model/constants/app-routes.constant';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_CONFIG } from '../config/app-config.constant';
import { BackofficeProductsComponent } from './components/backoffice/backoffice-products/backoffice-products.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './components/utils/language-selector/language-selector.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { RegisterComponent } from './components/register/register.component';
import { BackofficeShopsComponent } from './components/backoffice/backoffice-shops/backoffice-shops.component';
import { BackofficeShopsProductsComponent } from './components/backoffice/backoffice-shops-products/backoffice-shops-products.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { CustomHTTPInterceptor } from './interceptors/custom-http-interceptor';
import { EnabledIpGuard } from './guards/enabled-ip.guard';
import { BannedIpComponent } from './components/utils/banned-ip/banned-ip.component';

registerLocaleData(localeEs, 'es');

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    BarcodeScannerLivestreamModule,
    RouterModule.forRoot(APP_ROUTES),
    NgxSpinnerModule,
    TranslateModule.forRoot({
      defaultLanguage: APP_CONFIG.defaultLanguage,
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  declarations: [
    AppComponent,
    ProductSearchComponent,
    ShopSearchComponent,
    ShopStandingsComponent,
    BarcodeScannerComponent,
    ProductScanResultComponent,
    CarouselComponent,
    HomeComponent,
    AddProductByBarcodeComponent,
    StatisticsComponent,
    ShopSearchComponent,
    ProductSearchComponent,
    ShopEditComponent,
    ShopCreateComponent,
    ProductEditComponent,
    PageNotFoundComponent,
    ForbiddenComponent,
    LoginComponent,
    UserDetailComponent,
    BreadcrumbsComponent,
    BackofficeLayoutComponent,
    BackofficeDashboardComponent,
    ShoppingCartComponent,
    BackofficeProductsComponent,
    LanguageSelectorComponent,
    RegisterComponent,
    BackofficeShopsComponent,
    BackofficeShopsProductsComponent,
    AlertsComponent,
    BannedIpComponent,
  ],
  providers: [
    AuthenticationGuard,
    AuthenticationNoneGuard,
    EnabledIpGuard,
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    { provide: HTTP_INTERCEPTORS, useClass: CustomHTTPInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
