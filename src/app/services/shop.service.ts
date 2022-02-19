import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { ShopInterface } from '../model/interfaces/shop.interface';

import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class ShopService {
  shops: Subject<ShopInterface[]> = new Subject<ShopInterface[]>();

  defaultShops: ShopInterface[] = [
    {
      id: 'bonpreu',
      name: 'Bonpreu Esclat',
      favourite: false,
    },
    {
      id: 'carrefour',
      name: 'Carrefour',
      favourite: false,
    },
    { id: 'condis', name: 'Condis', favourite: false },
    { id: 'dia', name: 'Dia', favourite: false },
    { id: 'lidl', name: 'Lidl', favourite: false },
    { id: 'aldi', name: 'ALDI', favourite: false },
    {
      id: 'ametller',
      name: 'Ametller Origen',
      favourite: false,
    },
    { id: 'veritas', name: 'Veritas', favourite: false },
  ];

  constructor() {}

  getShops(): Observable<ShopInterface[]> {
    const storedShops = localStorage.getItem(STORE_KEYS_CONSTANTS.PS_SHOPS);
    let shops = storedShops
      ? (eval(storedShops) as ShopInterface[])
      : JSON.parse(JSON.stringify(this.defaultShops));
    this.shops.next(shops);
    return of(shops);
  }

  setShops(shops: ShopInterface[]): Observable<boolean> {
    if (shops && shops.length > 0) {
      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS,
        JSON.stringify(shops)
      );
      console.log('setShops()', shops);
      this.shops.next(shops);
    } else {
      console.log('setShops()', this.defaultShops);
      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_SHOPS,
        JSON.stringify(this.defaultShops)
      );
      this.shops.next(JSON.parse(JSON.stringify(this.defaultShops)));
    }

    return of(true);
  }
}
