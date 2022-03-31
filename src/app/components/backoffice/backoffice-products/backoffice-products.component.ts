import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from 'src/app/services/product.service';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { DEFAULT_IMAGE_URL } from 'src/app/model/constants/default-image.constant';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-backoffice-products',
  templateUrl: './backoffice-products.component.html',
  styleUrls: ['./backoffice-products.component.scss'],
})
export class BackofficeProductsComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() products: ProductInterface[] = [];

  @Output() onSortEmitter = new EventEmitter<{sortBy: string, sortDir: 'ASC' | 'DESC'}>();

  DEFAULT_IMAGE_URL = DEFAULT_IMAGE_URL;

  sortBy: string = 'name';
  sortDir: 'ASC' | 'DESC' = 'ASC';

  searchConfig: {name: string, brand: string, createdBy: string} = {name:'', brand: '', createdBy:''};

  constructor(private productService: ProductService, private spinner: NgxSpinnerService) {}
  
  updatingProduct: ProductInterface;

  @ViewChild('nameinput') nameinput: ElementRef;
  @ViewChild('brandinput') brandinput: ElementRef;
  @ViewChild('createdbyinput') createdbyinput: ElementRef;

  matchesSearch(product: ProductInterface) {
    if (this.searchConfig.name.length===0 && this.searchConfig.brand.length===0  && this.searchConfig.createdBy.length===0 ) {
      return true;
    } else {
      const matchesName = this.searchConfig.name.length > 0 && product.name.toUpperCase().indexOf(this.searchConfig.name.toUpperCase()) > -1;
      const matchesBrand = this.searchConfig.brand.length > 0 && product.brand.toUpperCase().indexOf(this.searchConfig.brand.toUpperCase()) > -1;
      const matchesUpdatedBy = product.createdBy && this.searchConfig.createdBy.length > 0 && 
       ((product.createdBy.username.length > 0 && product.createdBy.username.toUpperCase().indexOf(this.searchConfig.createdBy.toUpperCase()) > -1) || 
       (product.createdBy.email.length > 0 && product.createdBy.email.toUpperCase().indexOf(this.searchConfig.createdBy.toUpperCase()) > -1));
      return matchesName || matchesBrand || matchesUpdatedBy;
    }
  }

  sort(field: any) {
    this.sortDir = (field!==this.sortBy || this.sortDir === 'ASC') ? 'DESC' : 'ASC';
    this.sortBy = field;
    this.onSortEmitter.emit({
      sortBy: this.sortBy,
      sortDir: this.sortDir
    })
  }

  updateProduct(product: ProductInterface) {
    console.log('updateProduct()', product);
    if (product.brand.length > 0 && product.name.length > 0) {
      if (product.imageUrl.length===0) {
        product.imageUrl = DEFAULT_IMAGE_URL;
      }
      this.updatingProduct = product;
      this.spinner.show();
      this.productService.updateProduct(product, true).subscribe(() => {
        this.updatingProduct = undefined;
        this.spinner.hide();
      });
    }
  }

  checkProductsImages() {
    this.products.map((_product) => {
      _product.imageUrl = _product.imageUrl === DEFAULT_IMAGE_URL ? '' : _product.imageUrl;
    });
  }

  ngOnInit() {
    this.checkProductsImages();
  }

  ngAfterViewInit(): void {
    fromEvent(this.nameinput.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((event: KeyboardEvent) => {
                  this.searchConfig.name = event.target['value'];
                })
            )
            .subscribe();
    fromEvent(this.brandinput.nativeElement,'keyup')
    .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap((event: KeyboardEvent) => {
          this.searchConfig.brand = event.target['value'];
        })
    )
    .subscribe();
    fromEvent(this.createdbyinput.nativeElement,'keyup')
    .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap((event: KeyboardEvent) => {
          this.searchConfig.createdBy = event.target['value'];
        })
    )
    .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkProductsImages();
  }
}
