import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductInterface } from '../../model/interfaces/product.interface';
import { ShoppingCartConfigInterface } from '../../model/interfaces/shopping-cart-config.interface';
import { ShoppingCartService } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
})
export class ShoppingCartComponent implements OnInit {
  constructor(
    private shoppingCartService: ShoppingCartService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) {}

  cartConfig: ShoppingCartConfigInterface;
  amountLow: number = 0;
  amountHigh: number = 0;

  getAmountLow(): number {
    return this.amountLow;
  }
  getAmountHigh(): number {
    return this.amountHigh;
  }
  getAmountDiff(): number {
    return this.amountHigh - this.amountLow;
  }

  calculateAmountLow(): void {
    this.amountLow = 0;
    this.cartConfig.items.forEach((_cartItem) => {
      _cartItem.productsUnits.forEach((_productUnits) => {
        this.amountLow += _productUnits.units * _productUnits.minPrice;
      });
    });
  }

  calculateAmountHigh(): void {
    this.amountHigh = 0;
    this.cartConfig.items.forEach((_cartItem) => {
      _cartItem.productsUnits.forEach((_productUnits) => {
        this.amountHigh += _productUnits.units * _productUnits.maxPrice;
      });
    });
  }

  removeItem(product: ProductInterface): void {
    this.spinner.show();
    this.shoppingCartService.removeCartProduct(product);
  }

  removeCart(): void {
    if (confirm(this.translate.instant('shoppingCart.confirmEmpty'))) {
      this.spinner.show();
      this.shoppingCartService.removeCart();
    }
  }

  ngOnInit() {
    this.spinner.show();
    this.cartConfig = this.shoppingCartService.getShoppingCartConfig();

    this.shoppingCartService.cartConfig.subscribe(
      (_cartConfig) => {
        this.cartConfig = _cartConfig;
        this.calculateAmountLow();
        this.calculateAmountHigh();

        setTimeout(() => {
          this.spinner.hide();
        }, 500);
      },
      (error) => {
        this.spinner.hide();
      }
    );

    this.cartConfig = this.shoppingCartService._cartConfig;
    this.calculateAmountLow();
    this.calculateAmountHigh();

    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }
}
