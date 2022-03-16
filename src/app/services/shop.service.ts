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

@Injectable({ providedIn: 'root' })
export class ShopService {
  shops: Subject<ShopInterface[]> = new Subject<ShopInterface[]>();

  _shops: ShopInterface[] = [];

  _favouriteShopsIds: string[] = [];

  source: DataSourceOriginsEnum = APP_CONFIG.source;

  constructor(
    private jsonBinService: JsonBinService,
    private loginService: LoginService
  ) {
    this.shops.subscribe((_shops) => {
      this._shops = _shops;
    });

    // Favourites
    const favouriteShopsIds = localStorage.getItem(
      STORE_KEYS_CONSTANTS.PS_FAVOURITE_SHOPS
    );
    this._favouriteShopsIds = favouriteShopsIds ? eval(favouriteShopsIds) : [];
    this.setFavourites(this._favouriteShopsIds);

    this.getShops();
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

  getShops(): Observable<ShopInterface[]> {
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShops = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS);
      let shops: ShopInterface[] = storedShops
        ? (eval(storedShops) as ShopInterface[])
        : JSON.parse(JSON.stringify(DEFAULT_SHOPS));

      const defaultShops: ShopInterface[] = JSON.parse(
        JSON.stringify(DEFAULT_SHOPS)
      );

      if (storedShops) {
        shops = (eval(storedShops) as ShopInterface[]).filter((_shop) => {
          return _shop.default === false || _shop.favourite;
        });
        defaultShops.forEach((_shop) => {
          const existingShop = shops.find((__shop) => {
            return _shop.id === __shop.id;
          });
          if (!existingShop) {
            shops.push(_shop);
          } else {
            existingShop.imageUrl = _shop.imageUrl;
          }
        });
      } else {
        shops = defaultShops;
        this.setShops(shops);
      }

      this.setDefaultImages(shops);

      this.checkFavourites(shops);

      this.shops.next(shops);
      return of(shops);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      return this.jsonBinService.getShops().pipe(
        tap((shops) => {
          this.setDefaultImages(shops);
          this.checkFavourites(shops);
          this.shops.next(shops);
        })
      );
    }
  }

  setDefaultImages(shops: ShopInterface[]) {
    shops.map((_shop) => {
      if (!_shop.imageUrl) {
        _shop.imageUrl = DEFAULT_IMAGE_URL;
      }
      return _shop;
    });
  }

  setShops(shops: ShopInterface[]): Observable<boolean> {
    console.log('ShopService.setShops()', shops);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      if (shops && shops.length > 0) {
        localStorage.setItem(
          STORE_KEYS_CONSTANTS.PS_SHOPS,
          JSON.stringify(shops)
        );
        this.shops.next(shops);
      } else {
        localStorage.setItem(
          STORE_KEYS_CONSTANTS.PS_SHOPS,
          JSON.stringify(DEFAULT_SHOPS)
        );
        shops = DEFAULT_SHOPS;
        this.shops.next(JSON.parse(JSON.stringify(DEFAULT_SHOPS)));
      }
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      if (shops.length === 0) {
        shops = DEFAULT_SHOPS;
      }
      this.shops.next(shops);
      return this.jsonBinService.setShops(shops);
    }
  }

  updateShop(shop: ShopInterface): Observable<boolean> {
    console.log('ShopService.updateShop()', shop);
    this.toggleFavourite(shop).subscribe();
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      const storedShops = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS)
      ) as ShopInterface[];

      const shopIdx = storedShops.findIndex((_shop) => {
        return _shop.id === shop.id;
      });
      storedShops[shopIdx] = shop;

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS,
        JSON.stringify(storedShops)
      );
      this.shops.next(storedShops);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      const shops = this._shops;

      const shopIdx2 = shops.findIndex((_shop) => {
        return _shop.id === shop.id;
      });
      shops[shopIdx2] = shop;

      this.shops.next(shops);
      return this.jsonBinService.setShops(shops);
    }
  }

  createShop(shop: ShopInterface): Observable<boolean> {
    console.log('ShopService.createShop()', shop);
    shop.createdBy = this.loginService.getLoggedUser();
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      console.log('local');
      const storedShops = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS)
      ) as ShopInterface[];

      storedShops.push(shop);

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS,
        JSON.stringify(storedShops)
      );
      this.shops.next(storedShops);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      const shops = this._shops;
      shops.push(shop);
      this.shops.next(shops);
      return this.jsonBinService.setShops(shops);
    }
  }

  removeShop(shopId: string): Observable<boolean> {
    console.log('ShopService.removeShop()', shopId);
    if (this.source === DataSourceOriginsEnum.LOCAL) {
      let storedShops = eval(
        localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS)
      ) as ShopInterface[];

      storedShops = storedShops.filter((_shop) => {
        return _shop.id !== shopId;
      });

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS,
        JSON.stringify(storedShops)
      );
      this.shops.next(storedShops);
      return of(true);
    } else if (this.source === DataSourceOriginsEnum.JSON_BIN) {
      let shops = this._shops;

      shops = shops.filter((_shop) => {
        return _shop.id !== shopId;
      });

      this.shops.next(shops);
      return this.jsonBinService.setShops(shops);
    }
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
