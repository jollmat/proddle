import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { OpenFoodProductInterface } from '../../../model/interfaces/openfood-product.interface';
import { ProductInterface } from '../../../model/interfaces/product.interface';
import { OpenFoodService } from '../../../services/openfood.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss'],
})
export class BarcodeScannerComponent implements AfterViewInit {
  @Output()
  onSaveProduct = new EventEmitter<ProductInterface>();

  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner: BarcodeScannerLivestreamComponent;

  barcodeValue: string;
  openFoodProduct: OpenFoodProductInterface;

  loadingOpenFoodProduct: boolean = false;
  openFoodProductFound: boolean = false;
  productExists: boolean = false;

  barcodeChanged: Subject<any> = new Subject<any>();

  constructor(
    private openFoodService: OpenFoodService,
    private productService: ProductService
  ) {
    this.barcodeChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((barcodeResult) => {
        this.barcodeValue = barcodeResult.codeResult.code;

        if (this.barcodeValue?.length > 0) {
          this.productService.getProducts().subscribe((_products) => {
            this.productExists = _products.some((_product) => {
              return _product.barcode === this.barcodeValue;
            });

            if (!this.productExists) {
              console.log('Producte nou!');
              this.openFoodProduct = undefined;
              this.loadingOpenFoodProduct = true;
              this.openFoodProductFound = false;

              setTimeout(() => {
                console.log('Busquem openFoodProduct');
                this.openFoodService
                  .loadProduct(this.barcodeValue)
                  .subscribe((_openFoodProduct) => {
                    console.log('_openFoodProduct', _openFoodProduct);
                    this.openFoodProduct = _openFoodProduct;
                    this.loadingOpenFoodProduct = false;
                    this.openFoodProductFound =
                      _openFoodProduct.product !== undefined;
                  });
              }, 300);
            } else {
              console.log('Producte existent!');
              setTimeout(() => {
                console.log('Busquem openFoodProduct');
                this.openFoodService
                  .loadProduct(this.barcodeValue)
                  .subscribe((_openFoodProduct) => {
                    console.log('_openFoodProduct', _openFoodProduct);
                    this.openFoodProduct = _openFoodProduct;
                    this.loadingOpenFoodProduct = false;
                    this.openFoodProductFound =
                      _openFoodProduct.product !== undefined;
                  });
              }, 300);
            }
          });
        }
      });
  }

  ngAfterViewInit() {
    this.barcodeScanner.start();
  }

  onValueChanges(result) {
    if (!this.openFoodProductFound && !this.loadingOpenFoodProduct) {
      this.barcodeChanged.next(result);
    } else {
      console.log(
        'No actualitzem barcode => openFoodProductFound: ' +
          this.openFoodProductFound +
          ' || loadingOpenFoodProduct: ' +
          this.loadingOpenFoodProduct
      );
    }
  }

  capitalizeFirstLetter(txt: string): string {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  saveProduct() {
    const product: ProductInterface = {
      barcode: this.barcodeValue,
      brand: this.openFoodProduct?.product?.brands
        ? this.capitalizeFirstLetter(this.openFoodProduct.product.brands)
        : '',
      favourite: false,
      name: this.openFoodProduct?.product?.product_name
        ? this.capitalizeFirstLetter(this.openFoodProduct.product.product_name)
        : '',
      imageUrl: this.openFoodProduct?.product?.image_url
        ? this.openFoodProduct.product.image_url
        : undefined,
    };
    this.onSaveProduct.emit(product);
  }

  onStarted(started) {}
}
