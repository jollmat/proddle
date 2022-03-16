import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from 'rxjs';

import { ShopInterface } from '../../../model/interfaces/shop.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';
import { ShopProductService } from '../../../services/shop-product.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-shop-search',
  templateUrl: './shop-search.component.html',
  styleUrls: ['./shop-search.component.scss'],
})
export class ShopSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('shopSearchInput') shopSearchInput: ElementRef;

  STORED_SEARCH_KEY = 'PS_SHOPS_SEARCH_TEXT';

  loggedUser: UserInterface;

  shops: ShopInterface[];

  onlyFavourites: boolean = false;
  searchText: string = localStorage.getItem(this.STORED_SEARCH_KEY) || '';

  constructor(
    private router: Router,
    private shopService: ShopService,
    private shopProductService: ShopProductService,
    private loginService: LoginService,
    private spinner: NgxSpinnerService
  ) {}

  doCreateShop() {
    this.router.navigate(['new-shop']);
  }

  doEditShop(shop: ShopInterface) {
    this.router.navigate(['edit-shop/' + shop.id]);
  }

  doToggleFavourite(shopId: string) {
    this.spinner.show();
    const shop = this.shops.find((_shop) => {
      return _shop.id === shopId;
    });
    shop.favourite = !shop.favourite;

    this.shopService.toggleFavourite(shop).subscribe(
      () => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  doRemove(shopId: string) {
    if (
      confirm(
        "Si esborres la botiga també s'esborraràn els preus dels seus productes. Continuar?"
      )
    ) {
      this.shopService.removeShop(shopId).subscribe(() => {
        this.spinner.show();
        this.shopProductService.removeShopShopProducts(shopId).subscribe(
          () => {
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
      });
    }
  }

  matchesFilter(shop: ShopInterface) {
    return shop.name.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0;
  }

  exit() {
    this.router.navigateByUrl('');
  }

  canRemoveShop(shop: ShopInterface) {
    return (
      this.loggedUser.isAdmin ||
      (shop.createdBy &&
        this.loggedUser.email === shop.createdBy.email &&
        this.loggedUser.username === shop.createdBy.username)
    );
  }

  getShopPrices(shop: ShopInterface) {
    let productsBarcodes: string[] = [];
    this.shopProductService._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.shopId === shop.id;
      })
      .forEach((_shopProduct) => {
        if (productsBarcodes.indexOf(_shopProduct.productBarcode) < 0) {
          productsBarcodes.push(_shopProduct.productBarcode);
        }
      });
    return productsBarcodes.length;
  }

  setSearchText(text?: string) {
    this.searchText = text || '';
    localStorage.setItem(this.STORED_SEARCH_KEY, this.searchText);
  }

  hasFavourites(): boolean {
    return this.shopService.getFavourites().length > 0;
  }

  ngOnInit(): void {
    this.spinner.show();

    this.onlyFavourites = this.shopService.getFavourites().length > 0;

    this.searchText = localStorage.getItem(this.STORED_SEARCH_KEY) || '';
    this.loggedUser = this.loginService.getLoggedUser();
    this.shopService.shops.subscribe(
      (_shops) => {
        this.shops = _shops.sort((a, b) => (a.name > b.name ? 1 : -1));
        setTimeout(() => {
          this.spinner.hide();
        }, 500);
      },
      () => {
        this.spinner.hide();
      }
    );

    this.shopService.getShops().subscribe((_shops) => {
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  ngAfterViewInit(): void {
    fromEvent(this.shopSearchInput.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(300),
        distinctUntilChanged(),
        tap((text: any) => {
          this.setSearchText(text?.target?.value);
        })
      )
      .subscribe();
  }
}
