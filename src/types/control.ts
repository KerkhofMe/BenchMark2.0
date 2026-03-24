export type ControlStatus = 'compliant' | 'non-compliant' | 'partial' | 'manual' | 'unchecked';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface EvidenceLink {
  url: string;
  label: string;
}

export type DataSourceType = 'Microsoft Sentinel Data Lake' | 'Azure Resource Graph' | 'Log Analytics' | 'Microsoft Defender XDR';

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
  severity: Severity;
  kqlQuery: string;
  policyLink: string;
  remediation: string;
  dataSource: DataSource;
}
