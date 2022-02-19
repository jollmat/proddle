import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HighchartsChartModule } from 'highcharts-angular';

import { AppComponent } from './app.component';
import { ProductSearchComponent } from './components/products/product-search/product-search.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ShopSearchComponent } from './components/shops/shop-search/shop-search.component';
import { BadgesComponent } from './components/badges/badges.component';
import { HttpClientModule } from '@angular/common/http';
import { ShopStandingsComponent } from './components/data-analisis/shop-standings/shop-standings.component';

import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';
import { BarcodeScannerComponent } from './components/utils/barcode-scanner/barcode-scanner.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    HighchartsChartModule,
    BarcodeScannerLivestreamModule,
  ],
  declarations: [
    AppComponent,
    LayoutComponent,
    ProductSearchComponent,
    ShopSearchComponent,
    BadgesComponent,
    ShopStandingsComponent,
    BarcodeScannerComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
