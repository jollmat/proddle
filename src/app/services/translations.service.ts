import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { i18n_CA } from '../../config/i18n/i18n-ca';
import { i18n_EN } from '../../config/i18n/i18n-en';
import { i18n_ES } from '../../config/i18n/i18n-es';
import { i18n_PT } from '../../config/i18n/i18n-pt';

@Injectable({ providedIn: 'root' })
export class TranslationsService {
  languages: string[] = ['ca', 'es', 'en', 'pt'];
  translationData: {
    name: string;
    language: string;
    translations: any;
    imageUrl?: string;
  }[];

  constructor(private translate: TranslateService) {}

  getLanguages(): string[] {
    return this.languages;
  }

  getTranslationData(): {
    name: string;
    language: string;
    translations: any;
    imageUrl?: string;
  }[] {
    return this.translationData;
  }

  loadTranslations(): Observable<boolean> {
    this.translationData = [
      {
        name: 'Català',
        language: 'ca',
        translations: i18n_CA,
        imageUrl: 'https://www.buenacarta.com/images/idiomas/ca.png',
      },
      {
        name: 'Castellano',
        language: 'es',
        translations: i18n_ES,
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Spain_flag_icon.svg/1200px-Spain_flag_icon.svg.png',
      },
      {
        name: 'English',
        language: 'en',
        translations: i18n_EN,
        imageUrl: 'https://speechling.com/static/images/flags/uk.png',
      },
      {
        name: 'Portugués',
        language: 'pt',
        translations: i18n_PT,
        imageUrl:
          'https://intertradoc.com/wp-content/uploads/2015/05/portuguese.png',
      },
    ];

    this.translationData.forEach((_translationDataItem) => {
      let translations = _translationDataItem.translations;

      this.translate.setTranslation(
        _translationDataItem.language,
        translations
      );
    });

    return of(true);
  }
}
