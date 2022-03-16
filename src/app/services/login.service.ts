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

  getLoggedUser(): UserInterface {
    let loggedUser = JSON.parse(
      localStorage.getItem(STORE_KEYS_CONSTANTS.PS_LOGGED_USER)
    );
    if (loggedUser) {
      loggedUser = loggedUser as UserInterface;
      this.setIsAdmin(loggedUser);
      return loggedUser;
    }
    return undefined;
  }

  setIsAdmin(user: UserInterface) {
    if (user) {
      user.isAdmin = user.username === 'admin1234';
    }
  }

  refreshUser() {
    let loggedUser = JSON.parse(
      localStorage.getItem(STORE_KEYS_CONSTANTS.PS_LOGGED_USER)
    );
    if (loggedUser) {
      this.setIsAdmin(loggedUser);
      this.user.next(loggedUser);
    } else {
      this.user.next(undefined);
    }
  }

  isLoggedUser(): boolean {
    const loggedUser = this.getLoggedUser();
    return loggedUser !== undefined && loggedUser !== null;
  }

  isAdmin(): boolean {
    return this.getLoggedUser().isAdmin;
  }
}
