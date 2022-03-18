import { DataSourceOriginsEnum } from '../app/model/enums/data-source-origins.enum';
import { AppConfigInterface } from '../app/model/interfaces/app-config.interface';

export const APP_CONFIG: AppConfigInterface = {
  defaultLanguage: 'ca',
  source: DataSourceOriginsEnum.LOCAL
};
