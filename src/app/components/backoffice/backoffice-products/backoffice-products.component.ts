import { Component, Input, OnInit } from '@angular/core';
import { ProductInterface } from '../../../model/interfaces/product.interface';

@Component({
  selector: 'app-backoffice-products',
  templateUrl: './backoffice-products.component.html',
  styleUrls: ['./backoffice-products.component.scss'],
})
export class BackofficeProductsComponent implements OnInit {
  @Input() products: ProductInterface[] = [];

  constructor() {}

  ngOnInit() {}
}
