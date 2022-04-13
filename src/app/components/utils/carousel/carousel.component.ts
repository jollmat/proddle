import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
  slides: { title: string; text: string; iconClass: string }[];

  constructor(config: NgbCarouselConfig, private translate: TranslateService) {
    // customize default values of carousels used by this component tree
    config.interval = 7000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = false;
    config.animation = true;
  }

  ngOnInit() {
    console.log('CarouselComponent.ngOnInit()');

    this.slides = [
      {
        title: 'carousel.step1.title',
        text: 'carousel.step1.text',
        iconClass: 'fa-brands fa-buromobelexperte',
      },
      {
        title: 'carousel.step2.title',
        text: 'carousel.step2.text',
        iconClass: 'fas fa-barcode',
      },
      {
        title: 'carousel.step3.title',
        text: 'carousel.step3.text',
        iconClass: 'fas fa-list-ol',
      },
      {
        title: 'carousel.step4.title',
        text: 'carousel.step4.text',
        iconClass: 'fas fa-pen-to-square',
      },
      {
        title: 'carousel.step5.title',
        text: 'carousel.step5.text',
        iconClass: 'fas fa-share-nodes',
      },
      {
        title: 'carousel.step6.title',
        text: 'carousel.step6.text',
        iconClass: 'fas fa-bell',
      }
    ];
  }
}
