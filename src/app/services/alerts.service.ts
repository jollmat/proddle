import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { AlertInterface, UserAlerts } from '../model/interfaces/alert.interface';
import { ProductInterface } from '../model/interfaces/product.interface';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';
import { ProductService } from './product.service';
import { ShopProductService } from './shop-product.service';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  userAlerts: Subject<UserAlerts> = new Subject<UserAlerts>();
  _userAlerts: UserAlerts;

  constructor(
    private shopProductService: ShopProductService,
    private productService: ProductService
  ) {
    this._userAlerts = this.loadUnreadAlerts();
    this.calculateAlerts(true);
  }

  loadUnreadAlerts(): UserAlerts {
    //console.log('AlertsService.loadUnreadAlerts()');
    let userAlerts: UserAlerts = {
      updateDate: new Date().getTime(),
      alerts: []
    }

    const storedUserAlerts = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS);
    if (storedUserAlerts) {
      const storedUserAlertsObj = (JSON.parse(storedUserAlerts)) as UserAlerts;
      // TODO Remove user alerts from unexisting products or shops
      storedUserAlertsObj.alerts.forEach((_alert) => {
        if (!this.productService._products.find((_product) => _product.barcode === _alert.productBarcode )) {
          this.removeObsoleteProductAlerts(_alert.productBarcode, storedUserAlertsObj.alerts);
        }
      });
      return storedUserAlertsObj;
    }
    return userAlerts;
  }

  updateAccessDateAlerts() {
    this._userAlerts.updateDate = new Date().getTime();
    this.saveAlerts();
  }

  saveAlerts() {
    // TODO Remove user alerts from unexisting products or shops
    localStorage.setItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS, JSON.stringify(this._userAlerts));
  }

  removeObsoleteProductAlerts(productBarcode: string, alerts: AlertInterface[]) {
    if (alerts && alerts.length > 0) {
      alerts = alerts.filter((_alert) => {
        return _alert.productBarcode !== productBarcode;
      });
    }
  }

  toggleReadAlert(alert: AlertInterface) {
    alert.read = !alert.read;
    const storedUserAlerts = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS);
    if (storedUserAlerts) {
      const storedUserAlertsObj = (JSON.parse(storedUserAlerts)) as UserAlerts;
      const storedAlert = storedUserAlertsObj.alerts.find((_alert) => {
        return _alert.date === alert.date &&
               _alert.productBarcode === alert.productBarcode &&
               _alert.shopId === alert.shopId &&
               _alert.currentPrice === alert.currentPrice &&
               _alert.lastPrice === alert.lastPrice
      });
      storedAlert.read = !storedAlert.read;
      localStorage.setItem(STORE_KEYS_CONSTANTS.PS_USER_ALERTS, JSON.stringify(storedUserAlertsObj));
      this._userAlerts = this.loadUnreadAlerts();
      this.userAlerts.next(this._userAlerts);
    }
  }

  getUnreadAlerts(): number {
    return this._userAlerts.alerts.filter((_alert) => { 
      return !_alert.read;
    }).length;
  }

  calculateAlerts(doSave: boolean) {
    console.log('AlertsService.calculateAlerts()');
    const lastCalculateDate = this._userAlerts.updateDate;
    const favouriteProductBarcodes = this.productService._products.filter((_product) => _product.favourite).map((_product) => _product.barcode);
    
    const newShopProducts: ShopProductInterface[] = this.shopProductService._shopsProducts.filter((_shopProduct) => { 
      if (favouriteProductBarcodes.indexOf(_shopProduct.productBarcode) < 0) {
        return false;  
      }
      return _shopProduct.updateDate>=lastCalculateDate;      
    });
    // console.log(newShopProducts);

    // For each new shopProduct, calculate if increase or not in the same shop
    const shopProducts: ShopProductInterface[] = [];
    newShopProducts.forEach((_shopProduct) => {
      if (!shopProducts.find((_sp) => { return _sp.productBarcode===_shopProduct.productBarcode && _sp.shopId===_shopProduct.shopId })) {
        shopProducts.push(_shopProduct);
      }
    });
    // console.log('Different shopProducts', shopProducts);
    
    const shopProductHistories: ShopProductInterface[][] = shopProducts.map((_shopProduct) => {
      return this.shopProductService.getShopProductHistory(_shopProduct).filter((_sp) => { return _sp.updateDate >= lastCalculateDate;  });
    });
    // console.log('Different histories', shopProductHistories);

    shopProductHistories.forEach((shopProductHistory) => {
      if (shopProductHistory.length > 1 && shopProductHistory[shopProductHistory.length-2].price !== shopProductHistory[shopProductHistory.length-1].price) {
        const existing = this._userAlerts.alerts.find((_alert) => { 
          return _alert.date===shopProductHistory[shopProductHistory.length -1].updateDate  &&
          _alert.shopId===shopProductHistory[shopProductHistory.length -1].shopId && 
          _alert.productBarcode===shopProductHistory[shopProductHistory.length -1].productBarcode
        });
        if (!existing) {
          this._userAlerts.alerts.push({
            currentPrice: shopProductHistory[shopProductHistory.length -1].price,
            date: shopProductHistory[shopProductHistory.length -1].updateDate,
            lastPrice: shopProductHistory[shopProductHistory.length -2].price,
            productBarcode: shopProductHistory[shopProductHistory.length -1].productBarcode,
            shopId: shopProductHistory[shopProductHistory.length -1].shopId,
            read: false
          });
        }        
      }
    });
    console.log(this._userAlerts);

    this.userAlerts.next(this._userAlerts);
    
    if (doSave) { 
      this.updateAccessDateAlerts(); 
    } else {
      this.saveAlerts();
    }
  }
}
