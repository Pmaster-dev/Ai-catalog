import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  HardDrive, 
  Radio, 
  Activity, 
  Plus, 
  Minus, 
  ExternalLink, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { ArchitectureNode, ArchitecturePreset, ArchitectureLink, CatalogService, RegionOption } from '../types/catalog';
import { ARCHITECTURE_PRESETS, CATALOG_SERVICES } from '../data/catalogData';

interface BigPictureTopologyProps {
  selectedRegion: RegionOption;
  onAddServiceToStack: (service: CatalogService, units: number) => void;
  onNavigateToCatalogItem: (serviceId: string) => void;
  onOpenImageStudioWithPreset: (presetPrompt: string) => void;
}

export const BigPictureTopology: React.FC<BigPictureTopologyProps> = ({
  selectedRegion,
  onAddServiceToStack,
  onNavigateToCatalogItem,
  onOpenImageStudioWithPreset,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('enterprise-web');
  const activePreset = ARCHITECTURE_PRESETS.find((p) => p.id === selectedPresetId) || ARCHITECTURE_PRESETS[0];

  // Local state for interactive node modifications
  const [nodes, setNodes] = useState<ArchitectureNode[]>(activePreset.nodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[1]?.id || nodes[0]?.id || null);

  // When preset changes, reset nodes
  React.useEffect(() => {
    setNodes(activePreset.nodes);
    setSelectedNodeId(activePreset.nodes[1]?.id || activePreset.nodes[0]?.id || null);
  }, [selectedPresetId, activePreset]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const matchingCatalogService = selectedNode
    ? CATALOG_SERVICES.find((s) => s.id === selectedNode.serviceId)
    : null;

  // Handlers for adjusting node unit counts
  const handleScaleUnits = (nodeId: string, delta: number) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const newUnits = Math.max(1, node.units + delta);
          return {
            ...node,
            units: newUnits,
            metrics: {
              ...node.metrics,
              throughputMb: Math.round(node.metrics.throughputMb * (newUnits / node.units)),
              activeConnections: Math.round(node.metrics.activeConnections * (newUnits / node.units)),
            },
          };
        }
        return node;
      })
    );
  };

  // Calculate live aggregate totals taking into account region multiplier
  const totalHourly = nodes.reduce((sum, n) => sum + n.hourlyRate * n.units, 0) * selectedRegion.priceMultiplier;
  const totalMonthly = totalHourly * 730;

  const totalVcpu = nodes.reduce((sum, n) => {
    const service = CATALOG_SERVICES.find((s) => s.id === n.serviceId);
    return sum + (service?.specs.vCpu || 0) * n.units;
  }, 0);

  const totalRamGb = nodes.reduce((sum, n) => {
    const service = CATALOG_SERVICES.find((s) => s.id === n.serviceId);
    return sum + (service?.specs.ramGb || 0) * n.units;
  }, 0);

  const totalGpus = nodes.reduce((sum, n) => {
    const service = CATALOG_SERVICES.find((s) => s.id === n.serviceId);
    return sum + (service?.specs.gpuCount || 0) * n.units;
  }, 0);

  const getTierIcon = (tier: ArchitectureNode['tier']) => {
    switch (tier) {
      case 'edge':
      case 'gateway':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'compute':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'ai':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'database':
      case 'cache':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-cyan-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTierColor = (tier: ArchitectureNode['tier'], isSelected: boolean) => {
    if (isSelected) {
      return 'border-sky-400 bg-sky-950/60 ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/20';
    }
    switch (tier) {
      case 'edge':
        return 'border-sky-700/60 bg-slate-900/90 hover:border-sky-500';
      case 'compute':
        return 'border-emerald-700/60 bg-slate-900/90 hover:border-emerald-500';
      case 'ai':
        return 'border-purple-700/60 bg-slate-900/90 hover:border-purple-500';
      case 'database':
      case 'cache':
        return 'border-amber-700/60 bg-slate-900/90 hover:border-amber-500';
      case 'storage':
        return 'border-cyan-700/60 bg-slate-900/90 hover:border-cyan-500';
      default:
        return 'border-slate-800 bg-slate-900/90 hover:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Architecture Preset Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Big Picture Resource Architecture</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Customer-Facing System Topology & Compute Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Inspect real-time compute allocations, data flow connections, and transparent unit face-values across every layer of the infrastructure stack.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {ARCHITECTURE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left ${
                selectedPresetId === preset.id
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-200 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{preset.category} · ~${preset.monthlyBaseUSD.toLocaleString()}/mo</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Compute & Face-Value Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Face-Value Run Rate</div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            ${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
          </div>
          <div className="text-xs text-sky-400 mt-0.5">
            ${totalHourly.toFixed(3)}/hr ({selectedRegion.city})
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Aggregated Compute Cores</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {totalVcpu} <span className="text-xs text-slate-400 font-normal">vCPUs</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {totalGpus > 0 ? `${totalGpus} Dedicated GPUs` : 'Virtual Thread Matrix'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Cluster Memory (DDR5/HBM3)</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
            {totalRamGb} <span className="text-xs text-slate-400 font-normal">GB RAM</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            High-bandwidth multi-channel pool
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Regional Egress Multiplier</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {selectedRegion.priceMultiplier.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {selectedRegion.tier} · {selectedRegion.latencyMs}ms ping
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Topology Canvas (Left/Top) + Node Inspector & Compute Data (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Visualizer Canvas */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          {/* Subtle Grid Canvas Background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas Subheader & Flow Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">Live Traffic & Resource Connections</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{activePreset.name}</span>
            </div>

            <button
              onClick={() => onOpenImageStudioWithPreset(`Technical infrastructure architecture diagram of ${activePreset.name}: ${activePreset.tagline}. High clarity enterprise blueprint style with nodes for ${nodes.map(n => n.name).join(', ')}.`)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate 4K Blueprint Image</span>
            </button>
          </div>

          {/* Interactive Topology Graph */}
          <div className="py-6 min-h-[460px] relative">
            {/* Visual Flow Stages Header */}
            <div className="grid grid-cols-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-6 pb-2 border-b border-slate-900">
              <div>Tier 1: Global Edge & Ingress</div>
              <div>Tier 2: Compute & State Cache</div>
              <div>Tier 3: Database & Object Store</div>
            </div>

            {/* Nodes Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Column 1: Edge & Gateway */}
              <div className="space-y-4 flex flex-col justify-center">
                {nodes
                  .filter((n) => n.tier === 'edge' || n.tier === 'gateway')
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${getTierColor(
                          node.tier,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTierIcon(node.tier)}
                            <span className="text-xs font-semibold text-white">{node.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-sky-400">
                            {node.units}x
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Throughput: {node.metrics.throughputMb} Mbps</span>
                          <span className="text-slate-300 font-medium">${(node.hourlyRate * node.units * selectedRegion.priceMultiplier).toFixed(3)}/hr</span>
                        </div>

                        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-sky-400 h-full rounded-full transition-all"
                            style={{ width: `${node.metrics.cpuLoadPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Column 2: Compute & Cache */}
              <div className="space-y-4 flex flex-col justify-center">
                {nodes
                  .filter((n) => n.tier === 'compute' || n.tier === 'cache')
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${getTierColor(
                          node.tier,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTierIcon(node.tier)}
                            <div>
                              <div className="text-xs font-semibold text-white">{node.name}</div>
                              <div className="text-[10px] text-slate-400">{node.metrics.ramAllocatedGb} GB RAM pool</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400">
                            {node.units}x
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span>CPU Load: {node.metrics.cpuLoadPercent}%</span>
                          <span className="text-slate-300 font-medium">
                            ${(node.hourlyRate * node.units * selectedRegion.priceMultiplier).toFixed(3)}/hr
                          </span>
                        </div>

                        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              node.tier === 'cache' ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${node.metrics.cpuLoadPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Column 3: Database, Storage & AI */}
              <div className="space-y-4 flex flex-col justify-center">
                {nodes
                  .filter((n) => n.tier === 'database' || n.tier === 'storage' || n.tier === 'ai')
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${getTierColor(
                          node.tier,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTierIcon(node.tier)}
                            <div>
                              <div className="text-xs font-semibold text-white">{node.name}</div>
                              <div className="text-[10px] text-slate-400">Active Connections: {node.metrics.activeConnections}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-purple-400">
                            {node.units}x
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Load: {node.metrics.cpuLoadPercent}%</span>
                          <span className="text-slate-300 font-medium">
                            ${(node.hourlyRate * node.units * selectedRegion.priceMultiplier).toFixed(3)}/hr
                          </span>
                        </div>

                        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-400 h-full rounded-full transition-all"
                            style={{ width: `${node.metrics.cpuLoadPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Connection Link Legend */}
            <div className="mt-8 pt-4 border-t border-slate-900">
              <div className="text-[11px] text-slate-400 font-medium mb-2">Inter-Tier Mesh Links & Throughput:</div>
              <div className="flex flex-wrap gap-2">
                {activePreset.links.map((link, idx) => (
                  <div key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-sky-400" />
                    <span>{link.label}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-mono">{link.bandwidthMbps} Mbps</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node Inspector & Face-Value Compute Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode && matchingCatalogService ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTierIcon(selectedNode.tier)}
                    <span className="text-xs uppercase font-semibold text-sky-400 tracking-wider">
                      {matchingCatalogService.categoryLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToCatalogItem(matchingCatalogService.id)}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Full Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedNode.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{matchingCatalogService.tagline}</p>
              </div>

              {/* Face-Value Pricing Breakdown */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Face-Value Unit Pricing</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Hourly Rate (per instance)</span>
                  <span className="text-sm font-bold text-white">
                    ${(matchingCatalogService.hourlyUSD * selectedRegion.priceMultiplier).toFixed(4)}/hr
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Monthly Run Rate (730 hrs)</span>
                  <span className="text-base font-bold text-sky-400">
                    ${(matchingCatalogService.monthlyUSD * selectedRegion.priceMultiplier).toFixed(2)}/mo
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
                  <span>1-Year Reserved (Commitment)</span>
                  <span className="text-emerald-400 font-medium">
                    ${(matchingCatalogService.commitment1YrUSD * selectedRegion.priceMultiplier).toFixed(2)}/mo (35% off)
                  </span>
                </div>
              </div>

              {/* Hardware & Compute Specs Matrix */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hardware & Benchmark Specs</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {matchingCatalogService.specs.vCpu && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Processor Cores</div>
                      <div className="font-semibold text-white mt-0.5">{matchingCatalogService.specs.vCpu} vCPUs</div>
                      <div className="text-[10px] text-slate-400 truncate">{matchingCatalogService.specs.cpuModel}</div>
                    </div>
                  )}

                  {matchingCatalogService.specs.ramGb && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Physical Memory</div>
                      <div className="font-semibold text-white mt-0.5">{matchingCatalogService.specs.ramGb} GB RAM</div>
                      <div className="text-[10px] text-slate-400">{matchingCatalogService.specs.memoryBandwidthGBs ? `${matchingCatalogService.specs.memoryBandwidthGBs} GB/s bus` : 'High Bandwidth'}</div>
                    </div>
                  )}

                  {matchingCatalogService.specs.gpuType && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg col-span-2">
                      <div className="text-slate-400 text-[11px]">Accelerated Hardware</div>
                      <div className="font-semibold text-purple-400 mt-0.5">
                        {matchingCatalogService.specs.gpuCount}x {matchingCatalogService.specs.gpuType}
                      </div>
                      <div className="text-[10px] text-slate-400">{matchingCatalogService.specs.gpuVramGb} GB VRAM Framebuffer</div>
                    </div>
                  )}

                  {matchingCatalogService.specs.networkGbps && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Network Fabric</div>
                      <div className="font-semibold text-white mt-0.5">{matchingCatalogService.specs.networkGbps} Gbps</div>
                      <div className="text-[10px] text-slate-400">Zero packet drop</div>
                    </div>
                  )}

                  {matchingCatalogService.benchmarkScore && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
                      <div className="text-slate-400 text-[11px]">{matchingCatalogService.benchmarkLabel}</div>
                      <div className="font-semibold text-sky-400 mt-0.5">
                        {matchingCatalogService.benchmarkScore.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">Hardware verification</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Scaling Slider / Controls */}
              <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Topology Instance Scale</span>
                  <span className="text-xs font-bold text-sky-400">{selectedNode.units} Active Nodes</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleScaleUnits(selectedNode.id, -1)}
                    disabled={selectedNode.units <= 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 bg-slate-800 rounded-lg h-2 relative">
                    <div
                      className="bg-sky-500 h-2 rounded-lg"
                      style={{ width: `${Math.min(100, (selectedNode.units / 16) * 100)}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleScaleUnits(selectedNode.id, 1)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Subtotal for this tier:</span>
                  <span className="font-bold text-white">
                    ${(selectedNode.hourlyRate * selectedNode.units * selectedRegion.priceMultiplier * 730).toFixed(2)}/mo
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onAddServiceToStack(matchingCatalogService, selectedNode.units)}
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {selectedNode.units}x To Stack Calculator</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              <p className="text-xs">Click any node in the topology canvas to inspect its hardware compute specifications and live face-value cost.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
