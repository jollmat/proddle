import { Injectable } from '@angular/core';
import { ShopInterface } from '../model/interfaces/shop.interface';
import { ProductInterface } from '../model/interfaces/product.interface';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addShop(shop: ShopInterface): Observable<any> {
    const shopsRef = collection(this.firestore, 'shops');
    return from(addDoc(shopsRef, shop));
  }

  getShops(): Observable<ShopInterface[]> {
    const shopsRef = collection(this.firestore, 'shops');
    return collectionData(shopsRef, {idField: 'id'}) as Observable<ShopInterface[]>;
  }

  /*
  //Get shop
  public getShop(documentId: string) {
    return this.firestore.collection('shops').doc(documentId).snapshotChanges();
  }
  //Get all shops
  public getShops() {
    return this.firestore.collection('shops').snapshotChanges();
  }
  //Update shop
  public updateShop(documentId: string, shop: ShopInterface) {
    return this.firestore.collection('shops').doc(documentId).set(shop);
  }

  //Create product
  public createProduct(product: ProductInterface) {
    return this.firestore.collection('products').add(product);
  }
  //Get product
  public getProduct(documentId: string) {
    return this.firestore
      .collection('products')
      .doc(documentId)
      .snapshotChanges();
  }
  //Get all products
  public getProducts() {
    return this.firestore.collection('products').snapshotChanges();
  }
  //Update product
  public updateProduct(documentId: string, product: ProductInterface) {
    return this.firestore.collection('products').doc(documentId).set(product);
  }

  //Get shop product
  public getShopProduct(documentId: string) {
    return this.firestore
      .collection('shopsProducts')
      .doc(documentId)
      .snapshotChanges();
  }

  //Get all shops products
  public getShopsProducts() {
    return this.firestore.collection('shopsProducts').snapshotChanges();
  }

  //Get all shops products
  public getShopsProducts() {
    // return this.firestore.collection('shopsProducts').snapshotChanges();
  }
  */
}
