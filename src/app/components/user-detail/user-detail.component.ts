import { Component, OnInit } from '@angular/core';
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
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.user = this.loginService.getLoggedUser();
  }
}
