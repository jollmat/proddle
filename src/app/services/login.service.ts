import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { STORE_KEYS_CONSTANTS } from '../model/constants/store-keys.constants';
import { UserInterface } from '../model/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor() {}

  user: Subject<UserInterface> = new Subject<UserInterface>();

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
}
