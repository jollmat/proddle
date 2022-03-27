import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable()
export class AuthenticationNoneGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate() {
    // If the user is logged in we'll send them back to the home page
    if (this.loginService.isLoggedUser()) {
      this.router.navigate(['home']);
      return false;
    }

    return true;
  }
}
