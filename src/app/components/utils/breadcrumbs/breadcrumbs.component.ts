import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private shopService: ShopService,
    private productService: ProductService,
    private translate: TranslateService
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
      return this.translate.instant('breadcrumb.products');
    } else if (routeUrl.match('/search-shops')) {
      return this.translate.instant('breadcrumb.shops');
    }
    return '';
  }

  ngOnInit() {
   
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

    if (steps.length === 0) {
      if (window.location.href.match('/edit-shop')) {
        const shopId = this.route.snapshot.params['id'];
        this.steps.push({
          label: this.shopService._shops.find((_shop) => { return _shop.id===shopId }).name,
          pathUrl: ''
        });
      } else if (window.location.href.match('/edit-product')) {
        const barcode = this.route.snapshot.params['barcode'];
        this.steps.push({
          label: this.productService._products.find((_product) => { return _product.barcode===barcode }).name,
          pathUrl: ''
        });
      }
    }

    if (this.steps.length > 1) {
      const lastStep = this.steps[this.steps.length - 1];
      const previousStep = this.steps[this.steps.length - 2];
      if (
        lastStep.pathUrl.indexOf('/edit-shop/') > -1 &&
        previousStep.pathUrl.indexOf('/edit-product/') > -1
      ) {
        this.steps[this.steps.length - 2] = {
          label: this.translate.instant('breadcrumb.shops'),
          pathUrl: '/search-shops',
        };
      }
    }
  }
}
