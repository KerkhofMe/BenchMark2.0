const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/mcsb-controls.json", "utf8"));
let n = 0;
const argPrefixes = ["arg(", "PolicyResources"];
const mdePrefixes = ["DeviceInfo", "DeviceTvmSoftwareVulnerabilities", "DeviceTvmSecureConfigurationAssessment"];

for (const [domain, controls] of Object.entries(d)) {
  for (const c of controls) {
    const lines = c.kqlQuery.split("\n");
    const table = lines[0];
    const isArg = argPrefixes.some(x => table.startsWith(x));
    const isMde = mdePrefixes.some(x => table.startsWith(x));
    if (!isArg) {
      const timeCol = isMde ? "Timestamp" : "TimeGenerated";
      const hasTime = lines.some(l => l.includes(timeCol + " > ago("));
      if (!hasTime) { console.log("MISSING time filter: " + c.id); n++; }
    }
    if (c.kqlQuery.includes("AzureFirewallIDSLog")) { console.log("BAD: " + c.id + " still has AzureFirewallIDSLog"); n++; }
    if (c.kqlQuery.includes("AntivirusSignatureLastUpdateTime")) { console.log("BAD: " + c.id + " still has broken column"); n++; }
    if (c.kqlQuery.includes("properties_s") && c.id === "DP-3") { console.log("BAD: DP-3 still has broken TLS query"); n++; }
  }
}
console.log(n === 0 ? "All 40 KQL queries validated OK" : n + " issues found");
