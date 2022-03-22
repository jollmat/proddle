import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductInterface } from '../../model/interfaces/product.interface';
import { ShopInterface } from '../../model/interfaces/shop.interface';
import { FirestoreService } from '../../services/firestore.service';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  shops: ShopInterface[];
  products: ProductInterface[];

  constructor(
    private router: Router,
    private productService: ProductService,
    private shopService: ShopService,
    private spinner: NgxSpinnerService,
    private firestoreService: FirestoreService
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

  scan() {
    this.router.navigate(['scan']);
  }

  ngOnInit() {
    this.spinner.show();

    this.shopService.shops.subscribe((_shops) => {
      this.spinner.show();
      this.shops = _shops.sort((a, b) => (a.name > b.name ? 1 : -1));
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });

    this.productService.products.subscribe((_products) => {
      this.spinner.show();
      this.products = _products.sort((a, b) => (a.name > b.name ? 1 : -1));
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });

    this.shops = this.shopService._shops;
    this.products = this.productService._products;

    setTimeout(() => {
      this.spinner.hide();
    }, 500);
    
  }
}
