import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../../../services/navigation.service';
import { ProductService } from '../../../services/product.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  steps: { label: string; pathUrl: string }[] = [];

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private shopService: ShopService,
    private productService: ProductService
  ) {}

  exit() {
    this.router.navigateByUrl('');
  }

  getLabel(routeUrl: string): string {
    if (routeUrl.match('/edit-product')) {
      return this.productService._products.find((_product) => {
        return _product.barcode === routeUrl.replace('/edit-product/', '');
      }).name;
    } else if (routeUrl.match('/edit-shop')) {
      return this.shopService._shops.find((_shop) => {
        return _shop.id === routeUrl.replace('/edit-shop/', '');
      }).name;
    } else if (routeUrl.match('/search-products')) {
      return 'Productes';
    } else if (routeUrl.match('/search-shops')) {
      return 'Botigues';
    }
    return '';
  }

  ngOnInit() {
    const homeRouteIndex = this.navigationService.history.findIndex(
      (_route) => {
        return _route === '/' || _route === '/home';
      }
    );

    let steps = JSON.parse(JSON.stringify(this.navigationService.history));

    if (steps.length > 2) {
      steps = steps.slice(0, 2).reverse();
    }

    this.steps = steps.map((_step) => {
      return {
        label: this.getLabel(_step),
        pathUrl: _step,
      };
    });

    if (this.steps.length > 1) {
      const lastStep = this.steps[this.steps.length - 1];
      const previousStep = this.steps[this.steps.length - 2];
      if (
        lastStep.pathUrl.indexOf('/edit-shop/') > -1 &&
        previousStep.pathUrl.indexOf('/edit-product/') > -1
      ) {
        this.steps[this.steps.length - 2] = {
          label: 'Botigues',
          pathUrl: '/search-shops',
        };
      }
    }
  }
}
