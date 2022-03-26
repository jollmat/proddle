import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ShopInterface } from '../model/interfaces/shop.interface';

import { DEFAULT_SHOPS } from '../model/constants/default-shops.constant';
import { LoginService } from './login.service';
import { DEFAULT_IMAGE_URL } from '../model/constants/default-image.constant';
import { FirestoreService } from './firestore.service';
import { APP_CONFIG } from 'src/config/app-config.constant';

@Injectable({ providedIn: 'root' })
export class ShopService {
  shops: Subject<ShopInterface[]> = new Subject<ShopInterface[]>();

  _shops: ShopInterface[] = [];

  _favouriteShopsIds: string[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private loginService: LoginService
  ) {

    // Favourites
    const favouriteShopsIds = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_SHOPS
    );
    this._favouriteShopsIds = favouriteShopsIds ? eval(favouriteShopsIds) : [];
    this.setFavourites(this._favouriteShopsIds);

    this.shops.subscribe((_shops) => {
      this._shops = _shops;
    });

    this.loadShops().subscribe();
    
  }

  loadShops(): Observable<ShopInterface[]> {
    console.log('ShopService.loadShops()');
    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.getShops().pipe(
        tap((shops) => {
  
          if(!shops || shops.length === 0) {
            shops = DEFAULT_SHOPS;
            this.firestoreService.addShops(shops);          
          }
  
          this.setDefaultImages(shops);
          this.checkFavourites(shops);
          this.shops.next(shops);
        })
      );
    } else {
      return of(DEFAULT_SHOPS).pipe(
        tap((shops) => {
  
          if(!shops || shops.length === 0) {
            shops = DEFAULT_SHOPS;
            this.firestoreService.addShops(shops);          
          }
  
          this.setDefaultImages(shops);
          this.checkFavourites(shops);
          this.shops.next(shops);
        })
      );
    }
    
  }

  toggleFavourite(shop: ShopInterface): Observable<boolean> {
    let favourites = this.getFavourites();
    if (shop.favourite) {
      favourites.push(shop.id);
    } else {
      favourites = favourites.filter((_shopId) => {
        return _shopId !== shop.id;
      });
    }
    this.setFavourites(favourites);
    return of(true);
  }

  setDefaultImages(shops: ShopInterface[]) {
    shops.map((_shop) => {
      if (!_shop.imageUrl) {
        _shop.imageUrl = DEFAULT_IMAGE_URL;
      }
      return _shop;
    });
  }

  updateShop(shop: ShopInterface): Observable<boolean> {
    console.log('ShopService.updateShop()', shop);
    this.toggleFavourite(shop).subscribe();

    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.updateShop(shop).pipe(tap(() => {}));
    }
    return of (true);
  }

  createShop(shop: ShopInterface): Observable<boolean> {
    console.log('ShopService.createShop()', shop);
    shop.createdBy = this.loginService.getLoggedUser();

    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.addShop(shop).pipe(tap(() => {
        this._shops.push(shop);
        this.shops.next(this._shops);
      }));
    } else {
      this._shops.push(shop);
      this.shops.next(this._shops);
    }
    return of(true);
  }

  removeShop(shopId: string): Observable<boolean> {
    console.log('ShopService.removeShop()', shopId);
    if (APP_CONFIG.cloudMode) {
      return this.firestoreService.deleteShop(shopId).pipe(tap(() => {
        this._shops = this._shops.filter((_s) => { return _s.id !== shopId });
        this.shops.next(this._shops);
      }));
    } else {
      this._shops = this._shops.filter((_s) => { return _s.id !== shopId });
      this.shops.next(this._shops);
    }
    return of(true);
  }

  setFavourites(favourites: string[]) {
    localStorage.setItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_SHOPS,
      JSON.stringify(favourites)
    );
  }

  getFavourites(): string[] {
    const _favouriteShopsIds = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_SHOPS
    );
    const favouriteShopsIds = _favouriteShopsIds
      ? eval(_favouriteShopsIds)
      : [];

    return favouriteShopsIds;
  }

  checkFavourites(shops: ShopInterface[]) {
    const favouriteShopsIds = this.getFavourites();
    shops.map((_shop) => {
      _shop.favourite = favouriteShopsIds.indexOf(_shop.id) > -1;
    });
  }
}
