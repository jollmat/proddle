import { Injectable } from '@angular/core';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { AlertInterface, UserAlerts } from '../model/interfaces/alert.interface';
import { LoginService } from './login.service';
import { ProductService } from './product.service';
import { ShopProductService } from './shop-product.service';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  userAlerts: UserAlerts;

  constructor(
    private shopProductService: ShopProductService,
    private productService: ProductService
  ) {
    this.userAlerts = this.loadUnreadAlerts();
    this.calculateAlerts(true);
  }

  loadUnreadAlerts(): UserAlerts {
    console.log('AlertsService.loadUnreadAlerts()');
    let userAlerts = {
      updateDate: 0,//new Date().getTime(),
      alerts: []
    }

    const storedUserAlerts = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS);
    if (storedUserAlerts) {
      const storedUserAlertsObj = (JSON.parse(storedUserAlerts)) as UserAlerts;
      return storedUserAlertsObj;
    }
    return userAlerts;
  }

  saveUnreadAlerts() {
    console.log('AlertsService.saveUnreadAlerts()');
    this.userAlerts.updateDate = 0,//new Date().getTime();
    localStorage.setItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS, JSON.stringify(this.userAlerts));
  }

  calculateAlerts(doSave: boolean) {
    console.log('AlertsService.calculateAlerts()');
    const lastCalculateDate = this.userAlerts.updateDate;
    const favouriteProductBarcodes = this.productService._products.filter((_product) => _product.favourite).map((_product) => _product.barcode);
    
    const newShopProducts = this.shopProductService._shopsProducts.filter((_shopProduct) => { 
      if (favouriteProductBarcodes.indexOf(_shopProduct.productBarcode) < 0) {
        return false;  
      }
      return _shopProduct.updateDate>=lastCalculateDate;      
    });

    // TODO For each new shopProduct, calculate if increase or not in the same shop

    console.log(newShopProducts);
    if (doSave) { this.saveUnreadAlerts(); }
  }
}
