import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { ShopProductInterface } from '../../../model/interfaces/shop-product.interface';
import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-backoffice-layout',
  templateUrl: './backoffice-layout.component.html',
  styleUrls: ['./backoffice-layout.component.scss'],
})
export class BackofficeLayoutComponent implements OnInit, OnChanges {
  selectedTab: number = 0;

  @Input() shops: ShopInterface[] = [];
  @Input() products: ProductInterface[] = [];
  @Input() shopsProducts: ShopProductInterface[] = [];

  users: UserInterface[] = [];

  constructor(private loginService: LoginService) {}

  sortProducts(sortConfig: {sortBy: string, sortDir: 'ASC' | 'DESC'}) {
    console.log('sortProducts()', sortConfig);
    if (sortConfig) {
      this.products = this.products.sort((a, b) => {
        if (sortConfig.sortDir === 'DESC') {
          return a[sortConfig.sortBy].toUpperCase() > b[sortConfig.sortBy].toUpperCase() ? -1 : 1;
        } else {
          return a[sortConfig.sortBy].toUpperCase() > b[sortConfig.sortBy].toUpperCase() ? 1 : -1;
        }
        
      });
    }
  }

  refreshUsers() {
    let users: UserInterface[] = [this.loginService.getLoggedUser()];

    this.shops.forEach((_shop) => {
      if (
        _shop.createdBy &&
        !users.find((_user) => {
          return (
            _user.email === _shop.createdBy.email &&
            _user.username === _shop.createdBy.username
          );
        })
      ) {
        users.push(_shop.createdBy);
      }
    });
    this.products.forEach((_product) => {
      if (
        _product.createdBy &&
        !users.find((_user) => {
          return (
            _user.email === _product.createdBy.email &&
            _user.username === _product.createdBy.username
          );
        })
      ) {
        users.push(_product.createdBy);
      }
    });
    this.shopsProducts.forEach((_shopProduct) => {
      if (
        _shopProduct.createdBy &&
        !users.find((_user) => {
          return (
            _user.email === _shopProduct.createdBy.email &&
            _user.username === _shopProduct.createdBy.username
          );
        })
      ) {
        users.push(_shopProduct.createdBy);
      }
    });
    this.users = users;
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshUsers();
  }
}
