import { Component, Input, OnInit } from '@angular/core';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';

@Component({
  selector: 'app-backoffice-dashboard',
  templateUrl: './backoffice-dashboard.component.html',
  styleUrls: ['./backoffice-dashboard.component.scss'],
})
export class BackofficeDashboardComponent implements OnInit {
  @Input() shops: ShopInterface[] = [];
  @Input() products: ProductInterface[] = [];
  @Input() shopsProducts: ShopProductInterface[] = [];

  constructor() {}

  ngOnInit() {}
}
