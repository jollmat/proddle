import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAlerts } from 'src/app/model/interfaces/alert.interface';
import { ProductInterface } from 'src/app/model/interfaces/product.interface';
import { ShopInterface } from 'src/app/model/interfaces/shop.interface';
import { AlertsService } from 'src/app/services/alerts.service';
import { ProductService } from 'src/app/services/product.service';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {

  userAlerts: UserAlerts;

  constructor(
    private router: Router,
    private alertService: AlertsService,
    private shopService: ShopService,
    private productService: ProductService
  ) { }

  exit() {
    this.router.navigate(['']);
  }

  getProduct(barcode: string): ProductInterface{
    return this.productService._products.find((_product) => _product.barcode === barcode);
  }

  getShop(shopId): ShopInterface {
    return this.shopService._shops.find((_shop) => _shop.id === shopId);
  }


  sortAlerts() {
    this.userAlerts.alerts.sort((a, b) => {
      return a.date > b.date ? -1 : 1;
    });
  }

  ngOnInit(): void {
    this.userAlerts = this.alertService._userAlerts;
    this.sortAlerts();

    this.alertService.userAlerts.subscribe((_userAlerts) => {
      this.userAlerts = _userAlerts;
      this.sortAlerts();
    });
  }

}
