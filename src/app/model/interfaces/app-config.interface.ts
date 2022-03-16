import { DataSourceOriginsEnum } from '../enums/data-source-origins.enum';
import { FirebaseConfig } from './firebase-config.interface';

export interface AppConfigInterface {
  defaultLanguage: string;
  source: DataSourceOriginsEnum;
  firebaseConfig: FirebaseConfig;
}
