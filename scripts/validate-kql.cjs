const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/mcsb-controls.json", "utf8"));
let n = 0;
const argPrefixes = ["arg(", "PolicyResources", "resourcecontainers"];
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
    // Check for known bad patterns
    if (c.kqlQuery.includes("AzureFirewallIDSLog")) { console.log("BAD: " + c.id + " still has AzureFirewallIDSLog"); n++; }
    if (c.kqlQuery.includes("AntivirusSignatureLastUpdateTime")) { console.log("BAD: " + c.id + " still has broken column"); n++; }
    if (c.kqlQuery.includes("properties_s") && c.id === "DP-3") { console.log("BAD: DP-3 still has broken TLS query"); n++; }
    // Warn on missing take limits for non-ARG queries
    if (!isArg && !lines.some(l => l.trim().startsWith("| take "))) {
      console.log("WARN: " + c.id + " missing take limit");
    }
  }
}
const total = Object.values(d).flat().length;
console.log(n === 0 ? "All " + total + " KQL queries validated OK" : n + " issues found");
