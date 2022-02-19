import { Component, OnInit, VERSION } from '@angular/core';
import { ProductService } from './services/product.service';
import { ShopProductService } from './services/shop-product.service';
import { ShopService } from './services/shop.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private shopService: ShopService,
    private productService: ProductService,
    private shopProductService: ShopProductService
  ) {}

  reset() {
    if (
      confirm(
        "S'esborraràn totes les dades excepte les botigues per defecte. Desitges continuar?"
      )
    ) {
      this.shopProductService.setShopsProducts([]);
      this.shopService.setShops([]);
      this.productService.setProducts([]);

      localStorage.removeItem('proddle_started');
    }
  }

  ngOnInit(): void {}
}
