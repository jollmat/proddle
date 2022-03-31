import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { DEFAULT_IMAGE_URL } from 'src/app/model/constants/default-image.constant';
import { ShopInterface } from 'src/app/model/interfaces/shop.interface';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-backoffice-shops',
  templateUrl: './backoffice-shops.component.html',
  styleUrls: ['./backoffice-shops.component.scss']
})
export class BackofficeShopsComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() shops: ShopInterface[] = [];

  @Output() onShopSortEmitter = new EventEmitter<{sortBy: string, sortDir: 'ASC' | 'DESC'}>();

  searchConfig: {name: string} = {name:''};

  sortBy: string = 'name';
  sortDir: 'ASC' | 'DESC' = 'ASC';
  
  updatingShop: ShopInterface;

  @ViewChild('nameinput') nameinput: ElementRef;

  DEFAULT_IMAGE_URL = DEFAULT_IMAGE_URL;

  constructor(private shopService: ShopService, private spinner: NgxSpinnerService) { }
 
  matchesSearch(shop: ShopInterface) {
    return shop.name.toUpperCase().indexOf(this.searchConfig.name.toUpperCase()) >= 0;
  }

  sort(field: any) {
    this.sortDir = (field!==this.sortBy || this.sortDir === 'ASC') ? 'DESC' : 'ASC';
    this.sortBy = field;
    this.onShopSortEmitter.emit({
      sortBy: this.sortBy,
      sortDir: this.sortDir
    })
  }

  updateShop(shop: ShopInterface) {
    console.log('updateShop()', shop);
    if (shop.name.length > 0) {
      if (shop.imageUrl.length===0) {
        shop.imageUrl = DEFAULT_IMAGE_URL;
      }
      this.updatingShop = shop;
      this.spinner.show();
      this.shopService.updateShop(shop).subscribe(() => {
        this.updatingShop = undefined;
        this.spinner.hide();
      });
    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.nameinput.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((event: KeyboardEvent) => {
                  console.log(event);
                  this.searchConfig.name = event.target['value'];
                })
            )
            .subscribe();
  }

  checkShopsImages() {
    this.shops.map((_shop) => {
      _shop.imageUrl = _shop.imageUrl === DEFAULT_IMAGE_URL ? '' : _shop.imageUrl;
    });
  }

  ngOnInit(): void {
    this.checkShopsImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkShopsImages();
  }

}
