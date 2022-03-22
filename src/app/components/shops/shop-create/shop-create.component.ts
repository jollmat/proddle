import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { ShopService } from '../../../services/shop.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-shop-create',
  templateUrl: './shop-create.component.html',
  styleUrls: ['./shop-create.component.scss'],
})
export class ShopCreateComponent implements OnInit {
  shops: ShopInterface[];

  shopDetail: ShopInterface = {
    id: uuidv4(),
    name: '',
    imageUrl: '',
    default: false,
    favourite: false,
  };

  constructor(private router: Router, private shopService: ShopService) {}

  createShop() {
    const existsShopName = this.shops.some((_shop) => {
      return (
        _shop.name.toUpperCase() === this.shopDetail.name.toUpperCase() &&
        _shop.id !== this.shopDetail.id
      );
    });
    if (!existsShopName) {
      this.shopService.createShop(this.shopDetail).subscribe(() => {
        this.router.navigateByUrl('search-shops');
      });
    } else {
      alert('Ja existeix una botiga amb aquest nom: ' + this.shopDetail.name);
    }
  }

  exit() {
    this.router.navigateByUrl('');
  }

  ngOnInit() {
    this.shopService.shops.subscribe((_shops) => {
      this.shops = _shops;
    });
    this.shops = this.shopService._shops;
  }
}
