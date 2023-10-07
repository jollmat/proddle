import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { ProductInterface } from 'src/app/model/interfaces/product.interface';
import { ShopProductInterface } from 'src/app/model/interfaces/shop-product.interface';
import { ShopInterface } from 'src/app/model/interfaces/shop.interface';
import { ProductService } from 'src/app/services/product.service';
import { ShopProductService } from 'src/app/services/shop-product.service';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit, AfterViewInit {
  @ViewChild('purchaseSearchInput') purchaseSearchInput: ElementRef;

  searchText: string = '';

  purchases: ShopProductInterface[];
  purchasesSearch: ShopProductInterface[];

  isMobile: boolean;

  constructor(
    private router: Router,
    private shopsProductsService: ShopProductService,
    private shopService: ShopService,
    private productService: ProductService,
    private deviceDetector: DeviceDetectorService
  ) { }

  matchesFilter(purchase: ShopProductInterface) {
    const shop: ShopInterface = this.getShop(purchase.shopId);
    const product: ProductInterface = this.getProduct(purchase.productBarcode);
    return this.searchText.length===0 || 
      product.brand.toUpperCase().includes(this.searchText.toUpperCase()) ||
      product.name.toUpperCase().includes(this.searchText.toUpperCase()) ||
      shop.name.toUpperCase().includes(this.searchText.toUpperCase());
  }

  getShop(shopId: string): ShopInterface {
    return this.shopService._shops.find((_shop) => _shop.id === shopId);
  }

  getProduct(productBarcode: string): ProductInterface {
    return this.productService._products.find((_product) => _product.barcode === productBarcode);
  }

  exit() {
    this.router.navigateByUrl('');
  }

  ngOnInit(): void {

    this.isMobile = this.deviceDetector.isMobile();

    this.shopsProductsService.shopsProducts.subscribe((_purchases) => {
      this.purchases = _purchases;
    });
    
    this.purchases = this.shopsProductsService._shopsProducts;
    this.purchases.sort((a, b) => {
      return a.updateDate>=b.updateDate ? -1 : 1;
    }); 
    this.purchasesSearch = [...this.purchases];
    console.log(this.purchasesSearch);
  }

  ngAfterViewInit(): void {
    fromEvent(this.purchaseSearchInput.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(300),
        distinctUntilChanged(),
        tap((text: any) => {
          this.searchText = text?.target?.value;
        })
      )
      .subscribe();
  }

}
