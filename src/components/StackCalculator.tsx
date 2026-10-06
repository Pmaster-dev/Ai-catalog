import React from 'react';
import { 
  Calculator, 
  Trash2, 
  Plus, 
  Minus, 
  Download, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  PieChart,
  HardDrive,
  Cpu,
  Layers
} from 'lucide-react';
import { StackItem, RegionOption } from '../types/catalog';

interface StackCalculatorProps {
  stackItems: StackItem[];
  onUpdateQuantity: (serviceId: string, delta: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onClearStack: () => void;
  selectedRegion: RegionOption;
  onNavigateToCatalog: () => void;
  onOpenImageStudioWithStack: (prompt: string) => void;
}

export const StackCalculator: React.FC<StackCalculatorProps> = ({
  stackItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearStack,
  selectedRegion,
  onNavigateToCatalog,
  onOpenImageStudioWithStack,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Price calculations
  const totalHourlyOnDemand = stackItems.reduce(
    (sum, item) => sum + item.service.hourlyUSD * item.units * selectedRegion.priceMultiplier,
    0
  );

  const totalMonthlyOnDemand = totalHourlyOnDemand * 730;

  const totalMonthly1Yr = stackItems.reduce(
    (sum, item) => sum + item.service.commitment1YrUSD * item.units * selectedRegion.priceMultiplier,
    0
  );

  const totalMonthly3Yr = stackItems.reduce(
    (sum, item) => sum + item.service.commitment3YrUSD * item.units * selectedRegion.priceMultiplier,
    0
  );

  const totalVcpu = stackItems.reduce(
    (sum, item) => sum + (item.service.specs.vCpu || 0) * item.units,
    0
  );

  const totalRamGb = stackItems.reduce(
    (sum, item) => sum + (item.service.specs.ramGb || 0) * item.units,
    0
  );

  const totalGpus = stackItems.reduce(
    (sum, item) => sum + (item.service.specs.gpuCount || 0) * item.units,
    0
  );

  const copyConfigSummary = () => {
    const summary = `CloudPulse Infrastructure Stack Breakdown
Region: ${selectedRegion.name} (${selectedRegion.priceMultiplier}x)
Total Monthly Run Rate (On-Demand): $${totalMonthlyOnDemand.toFixed(2)}
1-Year Committed Rate: $${totalMonthly1Yr.toFixed(2)} (Save $${(totalMonthlyOnDemand - totalMonthly1Yr).toFixed(2)}/mo)
Total Cores: ${totalVcpu} vCPUs | RAM: ${totalRamGb} GB | GPUs: ${totalGpus}

Components:
${stackItems
  .map(
    (i) =>
      `- ${i.units}x ${i.service.name} (${i.service.shortCode}): $${(
        i.service.monthlyUSD *
        i.units *
        selectedRegion.priceMultiplier
      ).toFixed(2)}/mo`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            region: selectedRegion,
            totalMonthlyOnDemand,
            totalMonthly1Yr,
            totalMonthly3Yr,
            stackItems,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'cloudpulse-infrastructure-bill.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleGenerateStackDiagram = () => {
    const prompt = `Enterprise system architecture diagram showcasing our deployed cloud stack: ${stackItems
      .map((i) => `${i.units}x ${i.service.name}`)
      .join(', ')} located in ${selectedRegion.name}. Clean isometric vector blueprint, dark slate background, accurate service connections.`;
    onOpenImageStudioWithStack(prompt);
  };

  if (stackItems.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-sky-400">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Your Face-Value Stack is Empty</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Navigate the Service Catalog or the Big Picture Topology visualizer to add compute instances, databases, and storage nodes. See real-time unit math with zero hidden egress fees.
        </p>
        <button
          onClick={onNavigateToCatalog}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/10"
        >
          <span>Explore Service Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>Face-Value Bill Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Transparent Cost Breakdown & Resource Commitment
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Primary Region: {selectedRegion.name}</span>
            <span aria-hidden="true">·</span>
            <span>{stackItems.length} Configured Service Types</span>
            <span aria-hidden="true">·</span>
            <span>Total Units: {stackItems.reduce((acc, i) => acc + i.units, 0)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyConfigSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Spec'}</span>
          </button>

          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleGenerateStackDiagram}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Architecture Image</span>
          </button>

          <button
            onClick={onClearStack}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
            title="Clear Stack"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Savings Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* On-Demand */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">On-Demand (Flexible / Cancel Anytime)</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${totalMonthlyOnDemand.toFixed(2)}
            <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-400">
            ${totalHourlyOnDemand.toFixed(3)}/hr ({selectedRegion.city})
          </div>
        </div>

        {/* 1-Yr Commitment */}
        <div className="p-5 bg-slate-900/90 border border-emerald-900/60 rounded-2xl space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">1-Year Committed Saving</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Save ${(totalMonthlyOnDemand - totalMonthly1Yr).toFixed(0)}/mo
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ${totalMonthly1Yr.toFixed(2)}
            <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-400">
            ~35% discount for predictable production baselines
          </div>
        </div>

        {/* 3-Yr Commitment */}
        <div className="p-5 bg-slate-900/90 border border-sky-900/60 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-400 font-medium">3-Year Reserved Baseline</span>
            <span className="text-[10px] text-sky-400 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              Save ${(totalMonthlyOnDemand - totalMonthly3Yr).toFixed(0)}/mo
            </span>
          </div>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            ${totalMonthly3Yr.toFixed(2)}
            <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-400">
            ~55% maximum enterprise hardware savings
          </div>
        </div>
      </div>

      {/* Itemized Stack List Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Itemized Resource Matrix</h3>
          <div className="text-xs text-slate-400">
            {totalVcpu} vCPUs · {totalRamGb} GB RAM {totalGpus > 0 && `· ${totalGpus} GPUs`}
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {stackItems.map((item) => {
            const adjustedUnitHourly = item.service.hourlyUSD * selectedRegion.priceMultiplier;
            const subtotalHourly = adjustedUnitHourly * item.units;
            const subtotalMonthly = subtotalHourly * 730;

            return (
              <div key={item.service.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Service Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                    <span className="font-mono text-sky-400">{item.service.shortCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.service.categoryLabel}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.service.name}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.service.specs.vCpu && `${item.service.specs.vCpu} vCPUs · `}
                    {item.service.specs.ramGb && `${item.service.specs.ramGb} GB RAM · `}
                    {item.service.specs.gpuType && `${item.service.specs.gpuCount}x ${item.service.specs.gpuType} · `}
                    {item.service.specs.networkGbps && `${item.service.specs.networkGbps} Gbps`}
                  </div>
                </div>

                {/* Unit Stepper */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.service.id, -1)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-200">{item.units}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.service.id, 1)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[120px]">
                    <div className="text-sm font-bold text-white">${subtotalMonthly.toFixed(2)}/mo</div>
                    <div className="text-[11px] text-slate-400">${subtotalHourly.toFixed(3)}/hr</div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.service.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="px-5 py-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Formulas: Hourly rate × Units × 730 hrs/month × Regional multiplier ({selectedRegion.priceMultiplier.toFixed(2)}x)
          </div>
          <div className="text-right">
            <span className="text-slate-400">Total Monthly Face Value: </span>
            <span className="text-base font-bold text-sky-400">${totalMonthlyOnDemand.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
