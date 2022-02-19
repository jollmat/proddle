import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from 'rxjs';

import { ShopInterface } from '../../../model/interfaces/shop.interface';

@Component({
  selector: 'app-shop-search',
  templateUrl: './shop-search.component.html',
  styleUrls: ['./shop-search.component.scss'],
})
export class ShopSearchComponent implements AfterViewInit {
  @Input() shops: ShopInterface[];

  @Output() createShop = new EventEmitter<boolean>();
  @Output() editShop = new EventEmitter<ShopInterface>();
  @Output() toggleFavourite = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  @ViewChild('shopSearchInput') shopSearchInput: ElementRef;

  onlyFavourites: boolean = false;
  searchText: string = '';

  constructor() {}

  doCreateShop() {
    this.createShop.emit(true);
  }

  doEditShop(shop: ShopInterface) {
    this.editShop.emit(JSON.parse(JSON.stringify(shop)));
  }

  doToggleFavourite(shopId: string) {
    this.toggleFavourite.emit(shopId);
  }

  doRemove(shopId: string) {
    this.remove.emit(shopId);
  }

  matchesFilter(shop: ShopInterface) {
    return shop.name.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0;
  }

  ngAfterViewInit(): void {
    fromEvent(this.shopSearchInput.nativeElement, 'keyup')
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
