import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreAuthService } from 'src/app/services/firestore-auth.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  user = {
    email: '',
    password: '',
    passwordRepeat: ''
  };

  registerError: boolean = false;

  constructor(
    private firestoreAuthService: FirestoreAuthService,
    private loginService: LoginService,
    private router: Router
  ) { }

  register() {
    if (this.canAccess()) {
      this.registerError = false;
      const {email, password} = this.user;
      
      this.firestoreAuthService.register(email, password).then((res) => {
        if(res) {
          console.log(res);
          const user = {
            email: this.user.email
          };
          alert('Register ok!');
          this.loginService.login(user);
          this.router.navigate(['home']);
        } else {
          this.registerError = true;
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

  validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  validatePasswords() {
    return (this.user?.password?.length > 0 && 
    this.user?.passwordRepeat?.length > 0 &&
    this.user?.password === this.user?.passwordRepeat);
  }

  canAccess(): boolean {
    return this.user.email.length > 0 && this.validateEmail(this.user.email)?.length > 0;
  }

}
