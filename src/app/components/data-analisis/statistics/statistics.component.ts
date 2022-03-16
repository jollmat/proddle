import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  onlyFavourites: boolean = false;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private productService: ProductService
  ) {}

  exit() {
    this.router.navigate(['']);
  }

  ngOnInit() {
    this.spinner.show();

    this.onlyFavourites = this.productService.getFavourites().length > 0;

    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }
}
