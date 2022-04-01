import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ProductInterface } from 'src/app/model/interfaces/product.interface';
import { ShopProductInterface } from 'src/app/model/interfaces/shop-product.interface';
import { ShopInterface } from 'src/app/model/interfaces/shop.interface';
import { ShopProductService } from 'src/app/services/shop-product.service';

@Component({
  selector: 'app-backoffice-shops-products',
  templateUrl: './backoffice-shops-products.component.html',
  styleUrls: ['./backoffice-shops-products.component.scss']
})
export class BackofficeShopsProductsComponent implements OnChanges {
  @Input() products: ProductInterface[] = [];
  @Input() shops: ShopInterface[] = [];
  @Input() shopsProducts: ShopProductInterface[] = [];

  @Output() onShopProductSortEmitter = new EventEmitter<{sortBy: string, sortDir: 'ASC' | 'DESC'}>();

  updatingShopProduct: ShopProductInterface;

  sortBy: string = 'updateDate';
  sortDir: 'ASC' | 'DESC' = 'ASC';

  constructor(private shopProductService: ShopProductService) { }
  
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

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.products?.firstChange){
      console.log(this.shopsProducts);
      this.sort('updateDate');
    } else {
      console.log(this.shopsProducts);
    }
  }

}
