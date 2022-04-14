import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs';
import { APP_CONFIG } from 'src/config/app-config.constant';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class EnabledIpGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate() {
    if(APP_CONFIG.bannedIPs.length > 0){
      // If IP is no accepted, redirect to a specific page
      return this.loginService.getIpData().pipe(map((ipData) => {
        let isBannedIP = APP_CONFIG.bannedIPs.some((bannedIp) => { return bannedIp === ipData['query'] })
        if (isBannedIP) {
          this.router.navigate(['forbiddenIP']);
          return false;
        }
        return true;
      }));
    } else {
      return true
    }
  }
  
}
