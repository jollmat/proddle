import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { ProductInterface } from 'src/app/model/interfaces/product.interface';
import { ShopProductInterface } from 'src/app/model/interfaces/shop-product.interface';
import { ShopInterface } from 'src/app/model/interfaces/shop.interface';
import { ShopProductService } from 'src/app/services/shop-product.service';

@Component({
  selector: 'app-backoffice-shops-products',
  templateUrl: './backoffice-shops-products.component.html',
  styleUrls: ['./backoffice-shops-products.component.scss']
})
export class BackofficeShopsProductsComponent implements OnChanges, AfterViewInit {
  @Input() products: ProductInterface[] = [];
  @Input() shops: ShopInterface[] = [];
  @Input() shopsProducts: ShopProductInterface[] = [];

  shopsProductsFiltered: ShopProductInterface[] = [];

  @Output() onShopProductSortEmitter = new EventEmitter<{sortBy: string, sortDir: 'ASC' | 'DESC'}>();

  @ViewChild('searchInput') searchInput: ElementRef;

  updatingShopProduct: ShopProductInterface;

  sortBy: string = 'updateDate';
  sortDir: 'ASC' | 'DESC' = 'ASC';

  constructor(
    private shopProductService: ShopProductService,
    private translateService: TranslateService
  ) { }
  
  getShop(shopId: string): ShopInterface {
    return this.shops.find((_shop) => {
      return shopId === _shop.id;
    });
  }

  getProduct(barcode: string): ProductInterface {
    return this.products.find((_product) => {
      return barcode === _product.barcode;
    });
  }

  removeShopProduct(shopProduct: ShopProductInterface): void {
    this.shopProductService.removeShopProduct(shopProduct).subscribe(() => {});
  }

  sort(field: any) {
    this.sortDir = (field!==this.sortBy || this.sortDir === 'ASC') ? 'DESC' : 'ASC';
    this.sortBy = field;
    this.onShopProductSortEmitter.emit({
      sortBy: this.sortBy,
      sortDir: this.sortDir
    })
  }

  export() {
    const val = JSON.stringify(this.shopsProducts);
    navigator.clipboard.writeText(val);
    alert(this.translateService.instant('commons.copiedToClipboard'));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.products?.firstChange){
      this.sort('updateDate');
    }
    if(changes?.shopsProducts){
      console.log('shopsProducts changed!');
      this.shopsProductsFiltered = [...this.shopsProducts];
    }
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(1000),
            distinctUntilChanged(),
            tap((text) => {
              console.log(this.searchInput.nativeElement.value)
            })
        )
        .subscribe();
   }

}
