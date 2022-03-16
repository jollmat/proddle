import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable()
export class AuthenicationGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate() {
    // If the user is not logged in we'll send them back to the home page
    if (!this.loginService.isLoggedUser()) {
      this.router.navigate(['login']);
      return false;
    }

    return true;
  }
}
