import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-scan-result',
  templateUrl: './product-scan-result.component.html',
  styleUrls: ['./product-scan-result.component.scss'],
})
export class ProductScanResultComponent implements OnInit {
  @Input()
  name: string;
  @Input()
  brand: string;
  @Input()
  imageUrl: string;

  constructor() {}

  ngOnInit() {}
}
