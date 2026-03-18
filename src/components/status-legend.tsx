export default function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
      <span><span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1.5" />Unchecked — not yet evaluated</span>
      <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />Compliant — verified as implemented</span>
      <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />Non-Compliant — known gap, needs remediation</span>
      <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />Manual — requires human verification</span>
    </div>
  );
}
