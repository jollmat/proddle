import { Injectable } from '@angular/core';
import { ShopInterface } from '../model/interfaces/shop.interface';
import { ProductInterface } from '../model/interfaces/product.interface';
import { Firestore, collection, addDoc, collectionData, doc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { CollectionReference, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ShopProductInterface } from '../model/interfaces/shop-product.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  addShop(shop: ShopInterface): Observable<any> {
    console.log('FirestoreService.addShop()', shop);
    const shopsRef = collection(this.firestore, 'shops');
    return from(addDoc(shopsRef, shop));
  }

  deleteShop(shopId: string): Observable<any> {
    console.log('FirestoreService.deleteShop()', shopId);
    const shopDocRef = doc(this.firestore, `shops/${shopId}`);
    return from(deleteDoc(shopDocRef));
  }

  updateShop(shop: ShopInterface): Observable<any> {
    console.log('FirestoreService.updateShop()', shop);
    const shopDocRef = doc(this.firestore, `shops/${shop.id}`);
    return from(setDoc(shopDocRef, shop));
  }

  getShops(): Observable<ShopInterface[]> {
    console.log('FirestoreService.getShops()');
    const shopsRef = collection(this.firestore, 'shops');
    return collectionData(shopsRef, {idField: 'id'}) as Observable<ShopInterface[]>;
  }



  getProducts(): Observable<ProductInterface[]> {
    console.log('FirestoreService.getProducts()');
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, {idField: 'id'}) as Observable<ProductInterface[]>;
  }

  addProduct(product: ProductInterface): Observable<any> {
    console.log('FirestoreService.addProduct()', product);
    const productsRef = collection(this.firestore, 'products');
    return from(addDoc(productsRef, product));
  }

  deleteProduct(id: string): Observable<any> {
    console.log('FirestoreService.deleteProduct()', id);
    const productDocRef = doc(this.firestore, `products/${id}`);
    return from(deleteDoc(productDocRef));
  }

  updateProduct(product: ProductInterface): Observable<any> {
    console.log('FirestoreService.updateProduct()', product);
    const productDocRef = doc(this.firestore, `products/${product.barcode}`);
    return from(setDoc(productDocRef, product));
  }



  getShopsProducts(): Observable<ShopProductInterface[]> {
    console.log('FirestoreService.getShopsProducts()');
    const shopsProductsRef = collection(this.firestore, 'shopsProducts');
    return collectionData(shopsProductsRef) as Observable<ShopProductInterface[]>;
  }

  deleteShopProduct(shopProduct: ShopProductInterface): Observable<any> {
    console.log('FirestoreService.deleteShopProduct()', shopProduct);
    const shopProductDocRef = doc(this.firestore, `shopsProducts/${shopProduct.id}`);
    return from(deleteDoc(shopProductDocRef));
  }

  deleteShopProducts(shopProducts: ShopProductInterface[]): Observable<any> {
    console.log('FirestoreService.deleteShopProducts()', shopProducts);
    // const shopProductDocRef = doc(this.firestore, `shopsProducts/${shopProduct.id}`);
    // return from(deleteDoc(shopProductDocRef));
    return of(true);
  }

  addShopProduct(shopProduct: ShopProductInterface): Observable<any> {
    console.log('FirestoreService.addShopProduct()', shopProduct);
    const productsRef = collection(this.firestore, 'shopsProducts');
    return from(addDoc(productsRef, shopProduct));
  }

}
