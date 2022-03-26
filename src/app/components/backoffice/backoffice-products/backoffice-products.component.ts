import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from 'src/app/services/product.service';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { DEFAULT_IMAGE_URL } from 'src/app/model/constants/default-image.constant';

@Component({
  selector: 'app-backoffice-products',
  templateUrl: './backoffice-products.component.html',
  styleUrls: ['./backoffice-products.component.scss'],
})
export class BackofficeProductsComponent implements OnInit, OnChanges {
  @Input() products: ProductInterface[] = [];

  @Output() onSortEmitter = new EventEmitter<{sortBy: string, sortDir: 'ASC' | 'DESC'}>();

  DEFAULT_IMAGE_URL = DEFAULT_IMAGE_URL;

  sortBy: string = 'name';
  sortDir: 'ASC' | 'DESC' = 'ASC';

  constructor(private productService: ProductService, private spinner: NgxSpinnerService) {}
  
  updatingProduct: ProductInterface;

  sort(field: string) {
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

  ngOnChanges(changes: SimpleChanges): void {
    this.checkProductsImages();
  }
}
