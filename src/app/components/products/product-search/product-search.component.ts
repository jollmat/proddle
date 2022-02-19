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

import { ProductInterface } from '../../../model/interfaces/product.interface';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
})
export class ProductSearchComponent implements AfterViewInit {
  @Input() products: ProductInterface[];
  @Output() createProduct = new EventEmitter<boolean>();
  @Output() editProduct = new EventEmitter<ProductInterface>();
  @Output() toggleFavourite = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  @ViewChild('productSearchInput') productSearchInput: ElementRef;

  onlyFavourites: boolean = false;
  searchText: string = '';

  constructor() {}

  doCreateProduct() {
    this.createProduct.emit(true);
  }

  doEditProduct(product: ProductInterface) {
    this.editProduct.emit(JSON.parse(JSON.stringify(product)));
  }

  doToggleFavourite(productBarcode: string) {
    this.toggleFavourite.emit(productBarcode);
  }

  doRemove(productBarcode: string) {
    this.remove.emit(productBarcode);
  }

  matchesFilter(product: ProductInterface) {
    return (
      product.name.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0 ||
      product.brand.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0 ||
      product.barcode.toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0
    );
  }

  ngAfterViewInit(): void {
    fromEvent(this.productSearchInput.nativeElement, 'keyup')
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
