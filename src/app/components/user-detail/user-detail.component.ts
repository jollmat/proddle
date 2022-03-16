import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserInterface } from '../../model/interfaces/user.interface';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user: UserInterface;

  constructor(
    private loginService: LoginService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.loginService.user.subscribe((_user) => {
      this.user = _user;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
    this.loginService.refreshUser();
  }
}
