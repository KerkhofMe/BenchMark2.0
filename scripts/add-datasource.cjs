const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'), 'utf8'));

const dataSources = {
  'IM-1': { type: 'Log Analytics', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: SignInLogs'] },
  'IM-2': { type: 'Log Analytics', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: SignInLogs'] },
  'IM-3': { type: 'Log Analytics', table: 'AuditLogs', license: 'Microsoft Entra ID P1/P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AuditLogs'] },
  'IM-4': { type: 'Log Analytics', table: 'SigninLogs', license: 'Microsoft Entra ID P1/P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: SignInLogs'] },

  'NS-1': { type: 'Log Analytics', table: 'AzureNetworkAnalytics_CL', license: 'None (included with Network Watcher)', setup: ['Enable Network Watcher in each region', 'Enable NSG Flow Logs for each NSG', 'Enable Traffic Analytics \u2192 point to Log Analytics workspace', 'Storage account required for raw flow logs'] },
  'NS-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'NS-3': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'None (included with Azure Firewall)', setup: ['Azure Firewall \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AzureFirewallNetworkRule'] },
  'NS-4': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'Azure Firewall Premium', setup: ['Azure Firewall Premium \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AzureFirewallIDPSSignature', 'IDPS must be enabled on the Firewall Policy'] },
  'NS-5': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'Azure DDoS Protection Standard', setup: ['Public IP \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: DDoSProtectionNotifications', 'DDoS Protection plan must be associated with the VNet'] },

  'DP-1': { type: 'Log Analytics', table: 'InformationProtectionLogs_CL', license: 'Microsoft 365 E5 or Microsoft Purview Information Protection', setup: ['Purview compliance portal \u2192 Settings \u2192 Enable analytics', 'Configure Log Analytics workspace export', 'This is a custom log table (_CL suffix)'] },
  'DP-2': { type: 'Log Analytics', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans for SQL, Storage, Cosmos DB', 'Defender for Cloud \u2192 Continuous export \u2192 Log Analytics workspace'] },
  'DP-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'DP-4': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },

  'AM-1': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'AM-2': { type: 'Log Analytics', table: 'AzureActivity', license: 'None (included with subscription)', setup: ['Azure Monitor \u2192 Activity log \u2192 Diagnostic settings', 'Send to Log Analytics workspace', 'Enable categories: Administrative, Security'] },
  'AM-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },

  'LT-1': { type: 'Log Analytics', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans', 'Defender for Cloud \u2192 Continuous export \u2192 Log Analytics workspace'] },
  'LT-2': { type: 'Log Analytics', table: 'AADRiskyUsers', license: 'Microsoft Entra ID P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: RiskyUsers', 'Entra ID Protection must be enabled'] },
  'LT-3': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'LT-4': { type: 'Log Analytics', table: 'AzureNetworkAnalytics_CL', license: 'None (included with Network Watcher)', setup: ['Enable Network Watcher in each region', 'Enable NSG Flow Logs for each NSG', 'Enable Traffic Analytics \u2192 point to Log Analytics workspace'] },

  'IR-1': { type: 'Log Analytics', table: 'SecurityIncident', license: 'Microsoft Sentinel', setup: ['Enable Microsoft Sentinel on the Log Analytics workspace', 'Enable analytics rules to generate incidents from alerts'] },
  'IR-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'IR-3': { type: 'Log Analytics', table: 'SecurityAlert', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Enable Defender plans', 'Defender for Cloud \u2192 Continuous export \u2192 Log Analytics workspace'] },

  'PV-1': { type: 'Log Analytics', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Continuous export', 'Export category: Security recommendations', 'Select target Log Analytics workspace'] },
  'PV-2': { type: 'Azure Resource Graph', table: 'PolicyResources', license: 'None (always available)', setup: ['No setup required \u2014 Azure Policy is built-in'] },
  'PV-3': { type: 'Log Analytics', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Continuous export', 'Export category: Security recommendations', 'Select target Log Analytics workspace'] },
  'PV-4': { type: 'Log Analytics', table: 'SecurityRecommendation', license: 'Microsoft Defender for Cloud (Standard tier)', setup: ['Defender for Cloud \u2192 Environment settings \u2192 Continuous export', 'Export category: Security recommendations', 'Select target Log Analytics workspace'] },

  'ES-1': { type: 'Microsoft Defender XDR', table: 'DeviceInfo', license: 'Microsoft Defender for Endpoint P2 (or M365 E5)', setup: ['Onboard devices via Intune, GPO, or manual script', 'Query runs in security.microsoft.com \u2192 Advanced Hunting', 'To query in Log Analytics: connect Sentinel \u2192 M365 Defender data connector'] },
  'ES-2': { type: 'Microsoft Defender XDR', table: 'DeviceTvmSoftwareVulnerabilities', license: 'Microsoft Defender for Endpoint P2 (or M365 E5)', setup: ['Onboard devices via Intune, GPO, or manual script', 'Threat & Vulnerability Management is included with MDE P2', 'Query runs in security.microsoft.com \u2192 Advanced Hunting'] },
  'ES-3': { type: 'Microsoft Defender XDR', table: 'DeviceTvmSecureConfigurationAssessment', license: 'Microsoft Defender for Endpoint P2 (or M365 E5)', setup: ['Onboard devices via Intune, GPO, or manual script', 'Threat & Vulnerability Management is included with MDE P2', 'Query runs in security.microsoft.com \u2192 Advanced Hunting'] },

  'BR-1': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'None (included with Recovery Services vault)', setup: ['Recovery Services vault \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AzureBackupReport'] },
  'BR-2': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'BR-3': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'None (included with Recovery Services vault)', setup: ['Recovery Services vault \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AzureBackupReport'] },

  'DS-1': { type: 'Log Analytics', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions'] },
  'DS-2': { type: 'Log Analytics', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions'] },
  'DS-3': { type: 'Log Analytics', table: 'AzureDevOpsAuditing', license: 'Microsoft Sentinel + Azure DevOps', setup: ['Enable Microsoft Sentinel on Log Analytics workspace', 'Sentinel \u2192 Data connectors \u2192 Azure DevOps \u2192 Connect', 'Requires Azure DevOps Organization admin permissions'] },

  'GS-1': { type: 'Log Analytics', table: 'AuditLogs', license: 'Microsoft Entra ID P1/P2', setup: ['Entra ID \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable log category: AuditLogs'] },
  'GS-2': { type: 'Azure Resource Graph', table: 'arg("").managementgroups', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'GS-3': { type: 'Log Analytics', table: 'InformationProtectionLogs_CL', license: 'Microsoft 365 E5 or Microsoft Purview Information Protection', setup: ['Purview compliance portal \u2192 Settings \u2192 Enable analytics', 'Configure Log Analytics workspace export'] },

  'AI-1': { type: 'Azure Resource Graph', table: 'arg("").resources', license: 'None (always available)', setup: ['No setup required \u2014 runs against any Azure subscription'] },
  'AI-2': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'None (included with Cognitive Services)', setup: ['Cognitive Services resource \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable all log categories (RequestResponse)'] },
  'AI-3': { type: 'Log Analytics', table: 'AzureDiagnostics', license: 'None (included with Cognitive Services)', setup: ['Cognitive Services resource \u2192 Diagnostic settings \u2192 Send to Log Analytics workspace', 'Enable all log categories (RequestResponse)'] },
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
