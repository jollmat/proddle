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

import { ProductInterface } from '../../../model/interfaces/product.interface';
import { UserInterface } from '../../../model/interfaces/user.interface';
import { LoginService } from '../../../services/login.service';
import { ProductService } from '../../../services/product.service';
import { ShopProductService } from '../../../services/shop-product.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
})
export class ProductSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('productSearchInput') productSearchInput: ElementRef;

  STORED_SEARCH_KEY = 'PS_PRODUCTS_SEARCH_TEXT';

  loggedUser: UserInterface;

  products: ProductInterface[];
  loading: boolean = true;

  onlyFavourites: boolean = false;
  searchText: string = localStorage.getItem(this.STORED_SEARCH_KEY) || '';

  constructor(
    private router: Router,
    private productService: ProductService,
    private shopProductService: ShopProductService, //private imageCacheService: ImageCacheService
    private loginService: LoginService,
    private shoppingCartService: ShoppingCartService,
    private spinner: NgxSpinnerService
  ) {}

  doCreateProduct() {
    this.router.navigate(['new-product']);
  }

  doEditProduct(product: ProductInterface) {
    this.router.navigate(['edit-product/' + product.barcode]);
  }

  doToggleFavourite(productBarcode: string) {
    const product = this.products.find((_product) => {
      return _product.barcode === productBarcode;
    });
    product.favourite = !product.favourite;

    this.productService.toggleFavourite(product).subscribe(() => {});
  }

  doRemove(product: ProductInterface) {
    if (
      confirm(
        "Si esborres el producte també s'esborraràn els preus que tingui en les botigues. Continuar?"
      )
    ) {
      this.productService.removeProduct(product.id).subscribe(() => {
        this.shopProductService
          .removeProductShopProducts(product.barcode)
          .subscribe(() => {});
      });
    }
  }

  matchesFilter(product: ProductInterface) {
    return (
      product.name.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0 ||
      product.brand.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0 ||
      product.barcode.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0
    );
  }

  /* TODO: Caching images
  getImageUrl(imageUrl: string) {
    return this.imageCacheService.getImageUrl(imageUrl);
  }
  */

  getProductPrices(product: ProductInterface) {
    let shopsIds: string[] = [];
    this.shopProductService._shopsProducts
      .filter((_shopProduct) => {
        return _shopProduct.productBarcode === product.barcode;
      })
      .forEach((_shopProduct) => {
        if (shopsIds.indexOf(_shopProduct.shopId) < 0) {
          shopsIds.push(_shopProduct.shopId);
        }
      });
    return shopsIds.length;
  }

  productHasPrices(product: ProductInterface): boolean {
    return this.getProductPrices(product) > 0;
  }

  getProductPriceRange(product: ProductInterface): {
    max: number;
    min: number;
  } {
    return this.shopProductService.getProductPriceRange(product);
  }

  productItemsInCart(product: ProductInterface): number {
    let itemsInCart = 0;
    let itemsCounted: boolean = false;
    if (this.shoppingCartService?._cartConfig?.items) {
      this.shoppingCartService._cartConfig.items.forEach(
        (_shoppingCartShopItems) => {
          if (!itemsCounted) {
            _shoppingCartShopItems.productsUnits.forEach((_productUnits) => {
              if (
                _productUnits.product.barcode === product.barcode &&
                _productUnits.units
              ) {
                itemsCounted = true;
                itemsInCart += _productUnits.units;
              }
            });
          }
        }
      );
    }
    return itemsInCart;
  }

  canRemoveProduct(product: ProductInterface) {
    return (
      this.loggedUser.admin ||
      (product.createdBy &&
        product.createdBy.email === this.loggedUser.email &&
        product.createdBy.username === this.loggedUser.username)
    );
  }

  addToCart(product: ProductInterface): void {
    this.shoppingCartService.addToCart(product);
  }

  /*
  removeFromCart(product: ProductInterface): void {
    this.shoppingCartService.addToCart(product);
  }
  */

  exit() {
    this.router.navigateByUrl('');
  }

  setSearchText(text?: string) {
    this.searchText = text || '';
    localStorage.setItem(this.STORED_SEARCH_KEY, this.searchText);
  }

  hasFavourites(): boolean {
    return this.productService.getFavourites().length > 0;
  }

  ngOnInit(): void {
    this.searchText = localStorage.getItem(this.STORED_SEARCH_KEY) || '';
    this.loggedUser = this.loginService.getLoggedUser();

    // this.onlyFavourites = this.productService.getFavourites().length > 0;

    this.productService.products.subscribe(
      (_products) => {
       this.products = _products.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
    );
    this.products = this.productService._products;
    this.loading = false;
  }

  ngAfterViewInit(): void {
    fromEvent(this.productSearchInput.nativeElement, 'keyup')
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
