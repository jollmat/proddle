import { Injectable } from "@angular/core";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';

@Injectable({ providedIn: 'root' })
export class FirestoreAuthService {
  constructor(private afauth: AngularFireAuth) {}

  async login(email: string, password: string) {
    try{
        return await this.afauth.signInWithEmailAndPassword(email, password);
    } catch(err) {
        console.log('Login error', err);
        return null;
    }
  }

  async loginWithGoogle(email: string, password: string) {
    try{
        return await this.afauth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch(err) {
        console.log('Logi with Google error', err);
        return null;
    }
  }
}
