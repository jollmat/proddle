import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { APP_CONFIG } from 'src/config/app-config.constant';
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

  cloudMode: boolean = APP_CONFIG.cloudMode;

  users: UserInterface[] = [];

  constructor(private loginService: LoginService) {}

  sortProducts(sortConfig: {sortBy: string, sortDir: 'ASC' | 'DESC'}) {
    console.log('sortProducts()', sortConfig);
    if (sortConfig) {
      this.products = this.products.sort((a, b) => {
        if (sortConfig.sortDir === 'DESC') {
          return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? -1 : 1;
        } else {
          return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? 1 : -1;
        }
        
      });
    }
  }

  sortShops(sortConfig: {sortBy: string, sortDir: 'ASC' | 'DESC'}) {
    console.log('sortShops()', sortConfig);
    if (sortConfig) {
      this.shops = this.shops.sort((a, b) => {
        if (sortConfig.sortDir === 'DESC') {
          return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? -1 : 1;
        } else {
          return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? 1 : -1;
        }
        
      });
    }
  }

  sortShopsProducts(sortConfig: {sortBy: string, sortDir: 'ASC' | 'DESC'}) {
    console.log('sortShopsProducts()', sortConfig);
    if (sortConfig) {
      this.shopsProducts = this.shopsProducts.sort((a, b) => {

        if (sortConfig.sortBy==='shop') {
          const nameA = this.shops.find((_shop) => _shop.id===a.shopId).name.toString().toUpperCase();
          const nameB = this.shops.find((_shop) => _shop.id===b.shopId).name.toString().toUpperCase();
          if (sortConfig.sortDir === 'DESC') {
            return nameA > nameB ? -1 : 1;
          } else {
            return nameA > nameB ? 1 : -1;
          }
        } else if(sortConfig.sortBy==='product') {
          const nameA = this.products.find((_product) => _product.barcode===a.productBarcode).name.toString().toUpperCase();
          const nameB = this.products.find((_product) => _product.barcode===b.productBarcode).name.toString().toUpperCase();
          if (sortConfig.sortDir === 'DESC') {
            return nameA > nameB ? -1 : 1;
          } else {
            return nameA > nameB ? 1 : -1;
          }
        } else {
          if (sortConfig.sortDir === 'DESC') {
            return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? -1 : 1;
          } else {
            return (a[sortConfig.sortBy] ? a[sortConfig.sortBy] : '').toString().toUpperCase() > (b[sortConfig.sortBy] ? b[sortConfig.sortBy] : '').toString().toUpperCase() ? 1 : -1;
          }
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
            _user.email === _shopProduct.createdBy.email
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
