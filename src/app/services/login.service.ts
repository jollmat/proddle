import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { APP_CONFIG } from 'src/config/app-config.constant';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { UserInterface } from '../model/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class LoginService {

  user: Subject<UserInterface> = new Subject<UserInterface>();

  clientIpData: any;

  constructor(private http:HttpClient) {
    if (APP_CONFIG.bannedIPs.length > 0) {
      this.getIpData().subscribe((ipData) => {
        console.log('IP data', ipData);
        this.clientIpData = ipData;
      });
    }
  }

  login(user: UserInterface): void {
    user.lastLogin = new Date().getTime();
    this.user.next(user);
    localStorage.setItem(
      STORE_KEYS_CONSTANTS.PS_LOGGED_USER,
      JSON.stringify(user)
    );
  }

  logout(): void {
    localStorage.removeItem(STORE_KEYS_CONSTANTS.PS_LOGGED_USER);
    this.user.next(undefined);
  }

  checkIsAdmin(user: UserInterface): boolean {
    return user?.email.startsWith('jollmat@') || user?.email.startsWith('joan.lloria@') || user?.email.startsWith('joanlloria@');
  }

  getLoggedUser(): UserInterface {
    let loggedUser = JSON.parse(
      localStorage.getItem(STORE_KEYS_CONSTANTS.PS_LOGGED_USER)
    );
    if (loggedUser) {
      loggedUser = loggedUser as UserInterface;
      loggedUser.admin = this.checkIsAdmin(loggedUser);
      return loggedUser;
    }
    return undefined;
  }

  isLoggedUser(): boolean {
    const loggedUser = this.getLoggedUser();
    return loggedUser !== undefined && loggedUser !== null;
  }

  getClientIp(): Observable<any> {
    return this.http.get("https://api.ipify.org/?format=json");
  }

  getIpData(ip?: string): Observable<any> {
    return this.http.get('https://ip-api.com/json/'+ (ip || ''));
  }
}
