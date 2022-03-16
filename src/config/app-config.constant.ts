import { DataSourceOriginsEnum } from '../app/model/enums/data-source-origins.enum';
import { AppConfigInterface } from '../app/model/interfaces/app-config.interface';

export const APP_CONFIG: AppConfigInterface = {
  defaultLanguage: 'ca',
  source: DataSourceOriginsEnum.LOCAL,
  firebaseConfig: {
    apiKey: 'AIzaSyDR3QjCu6YuestW0oujyiLiAkzuX0N3tIo',
    authDomain: 'proddle.firebaseapp.com',
    projectId: 'proddle',
    storageBucket: 'proddle.appspot.com',
    messagingSenderId: '374263447281',
    appId: '1:374263447281:web:73cfe081647f70fabb7350',
  },
};
