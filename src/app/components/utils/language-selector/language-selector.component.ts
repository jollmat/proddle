import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { STORE_KEYS_CONSTANTS } from '../../../model/constants/store-keys.constants';
import { TranslationsService } from '../../../services/translations.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private translationsService: TranslationsService
  ) {}

  languages: string[];
  currentLanguage: string;
  languageImages: { language: string; imageUrl: string; name: string }[];

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem(STORE_KEYS_CONSTANTS.PS_APP_LANGUAGE, lang);
  }

  getImageUrl(lang: string): string {
    return this.languageImages.find((_langImage) => {
      return _langImage.language === lang;
    }).imageUrl;
  }

  getLabel(lang: string): string {
    return this.languageImages.find((_langImage) => {
      return _langImage.language === lang;
    }).name;
  }

  ngOnInit() {
    this.languages = this.translationsService.getLanguages();
    this.currentLanguage = this.translate.currentLang;
    this.languageImages = this.translationsService
      .getTranslationData()
      .map((_translationItem) => {
        return {
          language: _translationItem.language,
          imageUrl: _translationItem.imageUrl,
          name: _translationItem.name,
        };
      });
  }
}
