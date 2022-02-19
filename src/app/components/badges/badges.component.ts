import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss'],
})
export class BadgesComponent implements OnInit {
  @Input() numShops: number;
  @Input() numProducts: number;
  @Input() numPrices: number;
  @Input() orientation: 'VERTICAL' | 'HORIZONTAL' = 'VERTICAL';

  constructor() {}

  ngOnInit() {
    console.log(this.numPrices);
  }
}
