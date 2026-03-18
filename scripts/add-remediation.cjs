const fs = require('fs');
const path = require('path');

const data = require('../src/data/mcsb-controls.json');

const remediations = {
  'IM-1': 'Register all applications in Microsoft Entra ID and configure SSO. Run: az ad app list to audit unregistered apps.',
  'IM-2': 'Create a Conditional Access policy to block legacy authentication. In Entra ID > Security > Conditional Access, create a policy targeting all users with client apps set to Exchange ActiveSync and Other clients, then set grant to Block access.',
  'IM-3': 'Migrate service principals using client secrets to managed identities. For each app run: az webapp identity assign --name <app> --resource-group <rg>',
  'IM-4': 'Enable MFA via Conditional Access for all users. In Entra ID > Security > Conditional Access, create policy for all users and all cloud apps with grant set to Require multifactor authentication.',
  'NS-1': 'Review NSG rules and ensure proper subnet segmentation. Use az network nsg rule list to audit. Deny all inbound by default, allow only required ports.',
  'NS-2': 'Create private endpoints for all PaaS services. Run: az network private-endpoint create with the appropriate vnet, subnet, and resource ID parameters.',
  'NS-3': 'Verify Azure Firewall is deployed and filtering traffic. Review firewall rules with: az network firewall rule list --resource-group <rg> --firewall-name <fw>',
  'NS-4': 'Manually verify Azure Firewall Premium IDPS is enabled. In Portal > Azure Firewall > IDPS tab, confirm signature-based detection is set to Alert and Deny.',
  'NS-5': 'Enable DDoS Protection Standard. Run: az network ddos-protection create --name <plan> --resource-group <rg>, then associate with VNets.',
  'DP-1': 'Configure Microsoft Purview auto-labeling policies. In Purview portal > Information protection > Auto-labeling, create policies for sensitive data types.',
  'DP-2': 'Enable Microsoft Defender for SQL, Storage, and Cosmos DB. Run: az security pricing create --name SqlServers --tier Standard',
  'DP-3': 'Enforce minimum TLS 1.2. For App Service: az webapp config set --min-tls-version 1.2. For Storage: az storage account update --min-tls-version TLS1_2',
  'DP-4': 'Verify encryption at rest is enabled. For Storage accounts: az storage account show --query encryption. All Azure PaaS services enable encryption at rest by default.',
  'AM-1': 'Enable Azure Resource Graph for continuous asset inventory. Use the KQL query in Log Analytics to verify all resources are tracked.',
  'AM-2': 'Assign the built-in policy Allowed resource types to restrict deployments. Run: az policy assignment create with the allowed-types policy definition.',
  'AM-3': 'Review resources older than 365 days using the KQL query. Create a periodic review process and decommission unused resources. Tag resources with owner and expiry date.',
  'LT-1': 'Enable all Defender for Cloud plans. Run: az security pricing create --name VirtualMachines --tier Standard. Repeat for Servers, AppServices, SqlServers, Storage, KeyVaults.',
  'LT-2': 'Verify Entra ID Protection is enabled. In Entra ID > Security > Identity Protection, configure user risk and sign-in risk policies.',
  'LT-3': 'Configure diagnostic settings for all resources. Run: az monitor diagnostic-settings create --resource <id> --workspace <workspace-id> with logs enabled.',
  'LT-4': 'Enable NSG flow logs manually. In Portal > Network Watcher > NSG Flow Logs, enable for all NSGs with Traffic Analytics.',
  'IR-1': 'Review and update the incident response plan quarterly. Ensure it covers: roles, escalation paths, communication templates, and post-incident review process.',
  'IR-2': 'Configure security contacts. Run: az security contact create --email security@company.com --alert-notifications on --alerts-to-admins on',
  'IR-3': 'Review Sentinel analytics rules. Ensure high-fidelity rules are enabled for common attack patterns: brute force, impossible travel, suspicious PowerShell.',
  'PV-1': 'Apply Azure Security Benchmark initiative via Azure Policy. Assign the built-in MCSB policy initiative at the subscription or management group level.',
  'PV-2': 'Review non-compliant policies in Defender for Cloud. Prioritize by severity and remediate using the built-in Remediate button for each recommendation.',
  'PV-3': 'Enable vulnerability assessment on VMs and SQL databases. Enable the Qualys or Microsoft Defender vulnerability scanner via Defender for Cloud.',
  'PV-4': 'Define SLA targets: Critical = 7 days, High = 30 days, Medium = 90 days. Track remediation age using the KQL query and escalate overdue items.',
  'ES-1': 'Verify all endpoints are onboarded to Defender for Endpoint. Use the KQL query to check onboarding status by OS platform.',
  'ES-2': 'Confirm Defender Antivirus real-time protection is enabled. Check via Intune compliance policies or PowerShell: Get-MpPreference.',
  'ES-3': 'Verify signature auto-update is configured. Devices with signatures older than 3 days should be investigated. Check Intune update rings.',
  'BR-1': 'Verify backup policies are assigned to all critical VMs. Run: az backup policy list --vault-name <vault> --resource-group <rg>',
  'BR-2': 'Enable soft delete for Recovery Services vaults. Run: az backup vault backup-properties set --soft-delete-feature-state Enable --name <vault> --resource-group <rg>',
  'BR-3': 'Configure Azure Monitor alerts for backup failures. In Portal > Recovery Services vault > Alerts, create action rules for failed backup jobs.',
  'DS-1': 'Adopt Microsoft Threat Modeling Tool or STRIDE methodology. Document threat models for each service in your architecture and review during sprint planning.',
  'DS-2': 'Enable GitHub Advanced Security or Azure DevOps Advanced Security for dependency scanning. Configure Dependabot or equivalent for automatic dependency updates.',
  'DS-3': 'Migrate pipeline secrets to Azure Key Vault. Use the Key Vault task in pipelines. Never store secrets in variable groups directly.',
  'GS-1': 'Assign security owners per subscription using Azure RBAC. Document the RACI matrix for security responsibilities.',
  'GS-2': 'Review management group hierarchy. Ensure separation between production, development, and sandbox environments.',
  'GS-3': 'Define data classification levels and map to Microsoft Purview sensitivity labels. Create auto-labeling policies for Public, Internal, Confidential, and Restricted data.',
  'AI-1': 'Run the Resource Graph query to inventory all Cognitive Services and ML workspaces. Tag each with owner, purpose, and data classification.',
  'AI-2': 'Enable network isolation for Cognitive Services. Configure private endpoints and disable public network access for all AI service instances.',
  'AI-3': 'Enable content filters in Azure OpenAI Studio. Configure severity thresholds for hate, sexual, violence, and self-harm categories. Monitor filtered requests.'
};

for (const [, controls] of Object.entries(data)) {
  for (const control of controls) {
    control.remediation = remediations[control.id] || 'Review the Azure Policy link and KQL query for specific guidance.';
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'mcsb-controls.json'),
  JSON.stringify(data, null, 2) + '\n'
);

console.log('Added remediation to ' + Object.values(data).flat().length + ' controls');
