const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'), 'utf8'));

const dataSources = {
  // --- Identity Management ---
  'IM-1': { type: 'Microsoft Sentinel Data Lake', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: SignInLogs', 'Data is ingested into Analytics tier and mirrored to the Data Lake tier for long-term retention', 'Configure retention: Defender portal \u2192 Settings \u2192 Data retention \u2192 set up to 12 years'] },
  'IM-2': { type: 'Microsoft Sentinel Data Lake', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: SignInLogs', 'Data is ingested into Analytics tier and mirrored to the Data Lake tier for long-term retention', 'Configure retention: Defender portal \u2192 Settings \u2192 Data retention \u2192 set up to 12 years'] },
  'IM-3': { type: 'Microsoft Sentinel Data Lake', table: 'AuditLogs', license: 'Microsoft Entra ID P1/P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: AuditLogs', 'Data is ingested into Analytics tier and mirrored to the Data Lake tier for long-term retention', 'Configure retention: Defender portal \u2192 Settings \u2192 Data retention \u2192 set up to 12 years'] },
  'IM-4': { type: 'Microsoft Sentinel Data Lake', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: SignInLogs', 'Data is ingested into Analytics tier and mirrored to the Data Lake tier for long-term retention', 'Configure retention: Defender portal \u2192 Settings \u2192 Data retention \u2192 set up to 12 years'] },

  // --- Network Security ---
  'NS-1': { type: 'Microsoft Sentinel Data Lake', table: 'AzureNetworkAnalytics_CL', license: 'Network Watcher + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Enable Network Watcher in each region', 'Enable NSG Flow Logs for each NSG \u2192 point to Sentinel workspace', 'Enable Traffic Analytics \u2192 point to Sentinel workspace', 'Data flows into Analytics tier and is mirrored to the Data Lake tier', 'Use Data Lake for long-term network forensics up to 12 years'] },
  'NS-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'NS-3': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Azure Firewall + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Azure Firewall \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable log category: AzureFirewallNetworkRule', 'Data flows into Analytics tier and is mirrored to the Data Lake tier'] },
  'NS-4': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Azure Firewall Premium + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Azure Firewall Premium \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable log category: AzureFirewallIDPSSignature', 'IDPS must be enabled on the Firewall Policy', 'Data flows into Analytics tier and is mirrored to the Data Lake tier'] },
  'NS-5': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Azure DDoS Protection Standard + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Public IP \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable log category: DDoSProtectionNotifications', 'DDoS Protection plan must be associated with the VNet', 'Data flows into Analytics tier and is mirrored to the Data Lake tier'] },

  // --- Data Protection ---
  'DP-1': { type: 'Microsoft Sentinel Data Lake', table: 'InformationProtectionLogs_CL', license: 'Microsoft 365 E5 or Purview Information Protection + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Purview compliance portal \u2192 Settings \u2192 Enable analytics', 'Configure export to Sentinel workspace', 'Custom log table (_CL suffix) \u2014 data flows into Analytics tier and is mirrored to the Data Lake tier', 'Use Data Lake for long-term data classification audit trail'] },
  'DP-2': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans for SQL, Storage, Cosmos DB', 'Defender for Cloud \u2192 Continuous export \u2192 Sentinel workspace', 'Alerts flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'DP-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'DP-4': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },

  // --- Asset Management ---
  'AM-1': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'AM-2': { type: 'Microsoft Sentinel Data Lake', table: 'AzureActivity', license: 'Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure Activity \u2192 Connect', 'Enable categories: Administrative, Security', 'Activity logs flow into Analytics tier and are mirrored to the Data Lake tier', 'Use Data Lake for long-term activity audit trail up to 12 years'] },
  'AM-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },

  // --- Logging & Threat Detection ---
  'LT-1': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans', 'Defender for Cloud \u2192 Continuous export \u2192 Sentinel workspace', 'Alerts flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'LT-2': { type: 'Microsoft Sentinel Data Lake', table: 'AADRiskyUsers', license: 'Microsoft Entra ID P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: RiskyUsers', 'Entra ID Protection must be enabled', 'Risk data flows into Analytics tier and is mirrored to the Data Lake tier'] },
  'LT-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'LT-4': { type: 'Microsoft Sentinel Data Lake', table: 'AzureNetworkAnalytics_CL', license: 'Network Watcher + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Enable Network Watcher in each region', 'Enable NSG Flow Logs \u2192 point to Sentinel workspace', 'Enable Traffic Analytics \u2192 point to Sentinel workspace', 'Network logs flow into Analytics tier and are mirrored to the Data Lake tier'] },

  // --- Incident Response ---
  'IR-1': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityIncident', license: 'Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Enable analytics rules to generate incidents from alerts', 'Incidents are stored in Analytics tier and mirrored to the Data Lake tier', 'Use Data Lake for long-term incident history and forensic analysis up to 12 years'] },
  'IR-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'IR-3': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans', 'Defender for Cloud \u2192 Continuous export \u2192 Sentinel workspace', 'Alerts flow into Analytics tier and are mirrored to the Data Lake tier'] },

  // --- Posture & Vulnerability Management ---
  'PV-1': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Continuous export \u2192 Sentinel workspace', 'Export category: Security recommendations', 'Recommendations flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'PV-2': { type: 'Azure Resource Graph', table: 'PolicyResources', license: 'None (always available)', setup: ['No setup required \u2014 Azure Policy is built-in'] },
  'PV-3': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Continuous export \u2192 Sentinel workspace', 'Export category: Security recommendations', 'Recommendations flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'PV-4': { type: 'Microsoft Sentinel Data Lake', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Defender for Cloud \u2192 Environment settings \u2192 Continuous export \u2192 Sentinel workspace', 'Export category: Security recommendations', 'Use Data Lake for long-term vulnerability trend analysis up to 12 years'] },

  // --- Endpoint Security ---
  'ES-1': { type: 'Microsoft Sentinel Data Lake', table: 'DeviceInfo', license: 'Microsoft Defender for Endpoint P2 (or M365 E5) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Defender XDR \u2192 Connect', 'Onboard devices via Intune, GPO, or manual script', 'MDE data flows into Analytics tier and is mirrored to the Data Lake tier', 'Query via Sentinel Data Lake KQL editor or Advanced Hunting'] },
  'ES-2': { type: 'Microsoft Sentinel Data Lake', table: 'DeviceTvmSecureConfigurationAssessment', license: 'Microsoft Defender for Endpoint P2 (or M365 E5) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Defender XDR \u2192 Connect', 'Onboard devices via Intune, GPO, or manual script', 'TVM data flows into Analytics tier and is mirrored to the Data Lake tier', 'Query via Sentinel Data Lake KQL editor or Advanced Hunting'] },
  'ES-3': { type: 'Microsoft Sentinel Data Lake', table: 'DeviceTvmSecureConfigurationAssessment', license: 'Microsoft Defender for Endpoint P2 (or M365 E5) + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Defender XDR \u2192 Connect', 'Onboard devices via Intune, GPO, or manual script', 'TVM data flows into Analytics tier and is mirrored to the Data Lake tier', 'Query via Sentinel Data Lake KQL editor or Advanced Hunting'] },

  // --- Backup & Recovery ---
  'BR-1': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Recovery Services vault + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Recovery Services vault \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable log category: AzureBackupReport', 'Backup data flows into Analytics tier and is mirrored to the Data Lake tier'] },
  'BR-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'BR-3': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Recovery Services vault + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Recovery Services vault \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable log category: AzureBackupReport', 'Backup data flows into Analytics tier and is mirrored to the Data Lake tier', 'Use Data Lake for long-term backup compliance history'] },

  // --- DevOps Security ---
  'DS-1': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions', 'DevOps audit logs flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'DS-2': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions', 'DevOps audit logs flow into Analytics tier and are mirrored to the Data Lake tier'] },
  'DS-3': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions', 'DevOps audit logs flow into Analytics tier and are mirrored to the Data Lake tier'] },

  // --- Governance & Strategy ---
  'GS-1': { type: 'Microsoft Sentinel Data Lake', table: 'AuditLogs', license: 'Microsoft Entra ID P1/P2 + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Microsoft Entra ID \u2192 Connect', 'Enable log category: AuditLogs', 'Audit data flows into Analytics tier and is mirrored to the Data Lake tier', 'Configure retention: Defender portal \u2192 Settings \u2192 Data retention \u2192 set up to 12 years'] },
  'GS-2': { type: 'Azure Resource Graph', table: 'resourcecontainers', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'GS-3': { type: 'Microsoft Sentinel Data Lake', table: 'InformationProtectionLogs_CL', license: 'Microsoft 365 E5 or Purview Information Protection + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Purview compliance portal \u2192 Settings \u2192 Enable analytics', 'Configure export to Sentinel workspace', 'Custom log table (_CL suffix) \u2014 data flows into Analytics tier and is mirrored to the Data Lake tier'] },

  // --- AI Security ---
  'AI-1': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'AI-2': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Cognitive Services + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Cognitive Services resource \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable all log categories (RequestResponse)', 'AI telemetry flows into Analytics tier and is mirrored to the Data Lake tier'] },
  'AI-3': { type: 'Microsoft Sentinel Data Lake', table: 'AzureDiagnostics', license: 'Cognitive Services + Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on a Log Analytics workspace', 'Cognitive Services resource \u2192 Diagnostic settings \u2192 Send to Sentinel workspace', 'Enable all log categories (RequestResponse)', 'AI telemetry flows into Analytics tier and is mirrored to the Data Lake tier'] },
};

let count = 0;
for (const [, controls] of Object.entries(data)) {
  for (const control of controls) {
    const ds = dataSources[control.id];
    if (ds) {
      control.dataSource = ds;
      count++;
    } else {
      console.error('Missing dataSource for ' + control.id);
      process.exit(1);
    }
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'),
  JSON.stringify(data, null, 2) + '\n'
);

console.log('Added dataSource to ' + count + ' controls');
