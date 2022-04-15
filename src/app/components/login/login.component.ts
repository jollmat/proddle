import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { async } from 'rxjs';
import { FirestoreAuthService } from 'src/app/services/firestore-auth.service';
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
    password: '',
  };

  loginError: boolean = false;

  constructor(
    private loginService: LoginService,
    private firestoreAuthService: FirestoreAuthService,
    private router: Router
    ) {}

  login() {
    if (this.canAccess()) {
      this.loginError = false;
      const {email, password} = this.user;
      this.firestoreAuthService.login(email, password).then((res) => {
        console.log(res);
        if(res) {
          const user = {
            email: this.user.email
          };
          this.loginService.login(user);
          this.router.navigate(['home']);
        } else {
          this.loginError = true;
        }
      });
    }
  }

  loginGoogle() {
    this.loginError = false;
      const {email, password} = this.user;
      this.firestoreAuthService.loginWithGoogle(email, password).then((res) => {
        if(res) {
          console.log(res);
          const user = {
            username: res.user.displayName,
            email: res.user.email,
            photoURL: res.user.photoURL
          }
          this.router.navigate(['home']);
          this.loginService.login(user);
        } else {
          this.loginError = true;
        }
      });
  }

  validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  canAccess(): boolean {
    return (
      this.user.email.length > 0 &&
      this.validateEmail(this.user.email) &&
      this.user.password.length > 0
    );
  }

  ngOnInit() {}
}
