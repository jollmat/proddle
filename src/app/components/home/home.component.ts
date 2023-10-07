import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertsService } from 'src/app/services/alerts.service';
import { ShopProductService } from 'src/app/services/shop-product.service';
import { ProductInterface } from '../../model/interfaces/product.interface';
import { ShopInterface } from '../../model/interfaces/shop.interface';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { ShopProductInterface } from 'src/app/model/interfaces/shop-product.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  shops: ShopInterface[];
  products: ProductInterface[];
  shopsProducts: ShopProductInterface[];

  alerts: number = 0;
  alerts_unread: number = 0;

  constructor(
    private router: Router,
    private productService: ProductService,
    private shopService: ShopService,
    private shopProductService: ShopProductService,
    private spinner: NgxSpinnerService,
    private alertService: AlertsService
  ) {}

  toggleShopList() {
    this.router.navigate(['search-shops']);
  }

  toggleProductList() {
    this.router.navigate(['search-products']);
  }

  toggleStatistics() {
    this.router.navigate(['statistics']);
  }

  togglePurchases() {
    this.router.navigate(['purchases']);
  }

  toggleAlerts() {
    this.router.navigate(['alerts']);
  }

  scan() {
    this.router.navigate(['scan']);
  }

  ngOnInit() {
    this.spinner.show();

    this.shopService.shops.subscribe((_shops) => {
      this.spinner.show();
      this.shops = _shops.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });

    this.productService.products.subscribe((_products) => {
      this.spinner.show();
      this.products = _products.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });

    this.shopProductService.shopsProducts.subscribe((_shopsProducts) => {
      this.alertService.calculateAlerts(false);
      this.shopsProducts = _shopsProducts;
    });

    this.alertService.userAlerts.subscribe((_userAlerts) => {
      this.alerts = _userAlerts.alerts.length;
      this.alerts_unread = this.alertService.getUnreadAlerts();
    });

    this.shops = this.shopService._shops;
    this.products = this.productService._products;
    this.shopsProducts = this.shopProductService._shopsProducts;

    this.alerts = this.alertService._userAlerts.alerts.length;
    this.alerts_unread = this.alertService.getUnreadAlerts();

    setTimeout(() => {
      this.spinner.hide();
    }, 500);
    
  }
}
