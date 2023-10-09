import { DataSourceTypeEnum } from 'src/app/model/enums/datasource-type.enum';
import { AppConfigInterface } from '../app/model/interfaces/app-config.interface';

export const APP_CONFIG: AppConfigInterface = {
  defaultLanguage: 'ca',
  bannedIPs: [],
  dataSourceType: DataSourceTypeEnum.BASIC_DEFAULT
};
