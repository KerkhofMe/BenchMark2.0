export type ControlStatus = 'compliant' | 'non-compliant' | 'manual' | 'unchecked';

export type DataSourceType = 'Azure Resource Graph' | 'Log Analytics' | 'Microsoft Defender XDR';

export interface DataSource {
  type: DataSourceType;
  table: string;
  license: string;
  setup: string[];
}

export interface Control {
  id: string;
  title: string;
  description: string;
  status: ControlStatus;
  kqlQuery: string;
  policyLink: string;
  remediation: string;
  dataSource: DataSource;
}
