import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, Subject, throwError } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { UserInterface } from '../model/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class LoginService {

  user: Subject<UserInterface> = new Subject<UserInterface>();

  constructor(
    private http:HttpClient,
    private router: Router,
    private deviceService: DeviceDetectorService
  ) {
    /*
    this.getInternetIp().subscribe((res) => {
      console.log(res);
    });
    this.getIpData().subscribe((res) => {
      console.log(res);
    });
    */
  }

  login(user: UserInterface): void {
    user.lastLogin = new Date().getTime();
    user.device = this.deviceService.deviceType;
    user.os = this.deviceService.os;
    user.browser = this.deviceService.browser;

    this.user.next(user);
    this.router.navigate(['home']);
    
    this.getIpData().subscribe((ipData) => {
      user.ip = ipData.ip;
      user.city = ipData.city;
      user.country = ipData.country;
      this.user.next(user);

      localStorage.setItem(
        STORE_KEYS_CONSTANTS.PS_LOGGED_USER,
        JSON.stringify(user)
      );
      this.router.navigate(['home']);
    });    
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

  getInternetIp(): Observable<{ip: string}> {
    return this.http.get<{ip: string}>("https://api.ipify.org/?format=json");
  }

  getIpData(): Observable<any> {
    return this.http.get('https://ipapi.co/json/');
  }

}
