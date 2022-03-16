import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInterface } from '../../model/interfaces/user.interface';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  user: UserInterface = {
    email: '',
    username: '',
  };

  constructor(private loginService: LoginService, private router: Router) {}

  login() {
    if (this.canAccess()) {
      this.loginService.login(this.user);
      this.router.navigate(['home']);
    }
  }

  validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  isAdmin() {
    return this.user.email;
  }

  canAccess(): boolean {
    return (
      this.user.email.length > 0 &&
      this.validateEmail(this.user.email) &&
      this.user.username.length > 0
    );
  }

  ngOnInit() {}
}
