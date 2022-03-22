import { Injectable } from '@angular/core';
import { Observable, of, Subject, tap } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ShopInterface } from '../model/interfaces/shop.interface';

import { JsonBinService } from './json-bin.service';
import { DataSourceOriginsEnum } from '../model/enums/data-source-origins.enum';
import { DEFAULT_SHOPS } from '../model/constants/default-shops.constant';
import { APP_CONFIG } from '../../config/app-config.constant';
import { LoginService } from './login.service';
import { DEFAULT_IMAGE_URL } from '../model/constants/default-image.constant';
import { ShopStandingsComponent } from '../components/data-analisis/shop-standings/shop-standings.component';
import { FirestoreService } from './firestore.service';

@Injectable({ providedIn: 'root' })
export class ShopService {
  shops: Subject<ShopInterface[]> = new Subject<ShopInterface[]>();

  _shops: ShopInterface[] = [];

  _favouriteShopsIds: string[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private loginService: LoginService
  ) {
    this.shops.subscribe((_shops) => {
      _shops.map((_s) => {
        _s.favourite = this._favouriteShopsIds.includes(_s.id);
      });
      this._shops = _shops;
    });

    // Favourites
    const favouriteShopsIds = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_SHOPS
    );
    this._favouriteShopsIds = favouriteShopsIds ? eval(favouriteShopsIds) : [];
    this.setFavourites(this._favouriteShopsIds);

    this.loadShops().subscribe((_shops) => {
      if(!_shops || _shops.length === 0) {
        _shops = DEFAULT_SHOPS;
      }
      this.shops.next(_shops);
    });
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

  loadShops(): Observable<ShopInterface[]> {
    console.log('ShopService.loadShops()');
    return this.firestoreService.getShops().pipe(
      tap((shops) => {
        this.setDefaultImages(shops);
        this.checkFavourites(shops);
        this.shops.next(shops);
      })
    );
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
    return this.firestoreService.updateShop(shop).pipe(tap(() => {
      const index = this._shops.findIndex((_s) => { return _s.id = shop.id; });
      this._shops[index] = shop;
      this.shops.next(this._shops);
    }));
  }

  createShop(shop: ShopInterface): Observable<boolean> {
    console.log('ShopService.createShop()', shop);
    shop.createdBy = this.loginService.getLoggedUser();
    return this.firestoreService.addShop(shop).pipe(tap(() => {
      this._shops.push(shop);
      this.shops.next(this._shops);
    }));
  }

  removeShop(shopId: string): Observable<boolean> {
    console.log('ShopService.removeShop()', shopId);
    this.shops.next(this._shops.filter((_shop) => { return _shop.id !== shopId }));
    return this.firestoreService.deleteShop(shopId).pipe(tap(() => {
      this._shops = this._shops.filter((_s) => { return _s.id !== shopId });
      this.shops.next(this._shops);
    }));
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
