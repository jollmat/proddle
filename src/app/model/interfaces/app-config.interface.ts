import { DataSourceTypeEnum } from "../enums/datasource-type.enum";

export interface AppConfigInterface {
  defaultLanguage: string;
  bannedIPs: string[];
  dataSourceType: DataSourceTypeEnum;
}
