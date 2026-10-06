import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Cpu, 
  Zap, 
  Database, 
  HardDrive, 
  Radio, 
  Layers, 
  Plus, 
  Check, 
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { CatalogService, ServiceCategory, RegionOption } from '../types/catalog';
import { CATALOG_SERVICES } from '../data/catalogData';

interface CatalogGridProps {
  selectedRegion: RegionOption;
  onAddServiceToStack: (service: CatalogService, units: number) => void;
  selectedServiceId?: string | null;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  selectedRegion,
  onAddServiceToStack,
  selectedServiceId,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'benchmark-desc' | 'name'>('price-asc');
  const [addedServiceId, setAddedServiceId] = useState<string | null>(null);
  const [inspectModalService, setInspectModalService] = useState<CatalogService | null>(null);

  // If a selectedServiceId was passed from another view, open it in modal or scroll
  React.useEffect(() => {
    if (selectedServiceId) {
      const match = CATALOG_SERVICES.find((s) => s.id === selectedServiceId);
      if (match) setInspectModalService(match);
    }
  }, [selectedServiceId]);

  const categories: { id: ServiceCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Services', icon: Layers },
    { id: 'compute-general', label: 'General Compute', icon: Cpu },
    { id: 'compute-accelerated', label: 'AI & GPUs', icon: Zap },
    { id: 'compute-memory', label: 'High Memory', icon: Cpu },
    { id: 'serverless-containers', label: 'Serverless Runtimes', icon: Flame },
    { id: 'databases', label: 'Managed DBs', icon: Database },
    { id: 'storage', label: 'High-IOPS Storage', icon: HardDrive },
    { id: 'networking', label: 'Global Networking', icon: Radio },
  ];

  const filteredServices = useMemo(() => {
    return CATALOG_SERVICES.filter((service) => {
      const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.tagline.toLowerCase().includes(q) ||
        service.popularWorkload.toLowerCase().includes(q) ||
        service.shortCode.toLowerCase().includes(q) ||
        (service.specs.gpuType && service.specs.gpuType.toLowerCase().includes(q)) ||
        (service.specs.cpuModel && service.specs.cpuModel.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const aHourly = a.hourlyUSD * selectedRegion.priceMultiplier;
      const bHourly = b.hourlyUSD * selectedRegion.priceMultiplier;

      if (sortBy === 'price-asc') return aHourly - bHourly;
      if (sortBy === 'price-desc') return bHourly - aHourly;
      if (sortBy === 'benchmark-desc') return (b.benchmarkScore || 0) - (a.benchmarkScore || 0);
      return a.name.localeCompare(b.name);
    });
  }, [activeCategory, searchQuery, sortBy, selectedRegion]);

  const handleAddWithFeedback = (service: CatalogService) => {
    onAddServiceToStack(service, 1);
    setAddedServiceId(service.id);
    setTimeout(() => setAddedServiceId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter Bar and Sorting Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Customer Face-Value Catalog
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Showing honest on-demand unit pricing</span>
              <span aria-hidden="true">·</span>
              <span>Regional Hub: {selectedRegion.name} ({selectedRegion.priceMultiplier}x)</span>
              <span aria-hidden="true">·</span>
              <span>730-hr billing basis</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vCPU, H100, Postgres, NVMe..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Buttons (Functional segmented control as allowed by frontend-design) */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="price-asc">Face Value: Low to High</option>
              <option value="price-desc">Face Value: High to Low</option>
              <option value="benchmark-desc">Highest Benchmark Score</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const adjustedHourly = service.hourlyUSD * selectedRegion.priceMultiplier;
          const adjustedMonthly = service.monthlyUSD * selectedRegion.priceMultiplier;
          const adjustedCommitment = service.commitment1YrUSD * selectedRegion.priceMultiplier;
          const isAdded = addedServiceId === service.id;

          return (
            <div
              key={service.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-sky-500/5 group"
            >
              {/* Card Top: Title & Category Unboxed Metadata */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-mono text-[11px] text-sky-400">{service.shortCode}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span>{service.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{service.popularWorkload.split(',')[0]}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {service.tagline}
                </p>

                {/* Hardware Spec Unboxed Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  {service.specs.vCpu && (
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cores</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{service.specs.vCpu} vCPUs</div>
                    </div>
                  )}

                  {service.specs.ramGb && (
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Memory</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{service.specs.ramGb} GB RAM</div>
                    </div>
                  )}

                  {service.specs.gpuType && (
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850 col-span-2">
                      <div className="text-[10px] text-purple-400 uppercase font-semibold">Accelerator</div>
                      <div className="font-semibold text-purple-300 mt-0.5 truncate">
                        {service.specs.gpuCount}x {service.specs.gpuType}
                      </div>
                    </div>
                  )}

                  {service.specs.networkGbps && (
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Fabric</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{service.specs.networkGbps} Gbps</div>
                    </div>
                  )}

                  {service.specs.maxIops && (
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Max IOPS</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{service.specs.maxIops.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Benchmark Highlights */}
                {service.benchmarkScore && (
                  <div className="mt-3 p-2 bg-sky-950/30 border border-sky-800/40 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{service.benchmarkLabel}:</span>
                    <span className="font-bold text-sky-300">{service.benchmarkScore.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Card Bottom: Face-Value Pricing & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">On-Demand Face Value</div>
                    <div className="text-lg font-bold text-white tracking-tight">
                      ${adjustedHourly.toFixed(adjustedHourly < 0.1 ? 4 : 3)}
                      <span className="text-xs text-slate-400 font-normal ml-1">/hr</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Monthly Run Rate</div>
                    <div className="text-sm font-semibold text-sky-400">
                      ${adjustedMonthly.toFixed(2)}/mo
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>1-Yr Committed:</span>
                  <span className="text-emerald-400 font-medium">
                    ${adjustedCommitment.toFixed(2)}/mo
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setInspectModalService(service)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors text-center"
                  >
                    View Specs
                  </button>

                  <button
                    onClick={() => handleAddWithFeedback(service)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                      isAdded
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Stack</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Deep Spec Inspection */}
      {inspectModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-sky-400 font-mono">{inspectModalService.shortCode}</div>
                <h3 className="text-xl font-bold text-white mt-1">{inspectModalService.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">{inspectModalService.categoryLabel}</div>
              </div>
              <button
                onClick={() => setInspectModalService(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectModalService.description}
            </p>

            {/* Spec Breakdown */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-white">Full Architecture & Compute Parameters</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Target Region:</span>
                  <div className="text-slate-200 font-medium">{selectedRegion.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">Processor Model:</span>
                  <div className="text-slate-200 font-medium">{inspectModalService.specs.cpuModel || 'Standard Multi-Core'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Memory Bandwidth:</span>
                  <div className="text-slate-200 font-medium">{inspectModalService.specs.memoryBandwidthGBs ? `${inspectModalService.specs.memoryBandwidthGBs} GB/s` : 'Integrated High-Speed'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Network Interface:</span>
                  <div className="text-slate-200 font-medium">{inspectModalService.specs.networkGbps} Gbps Burst</div>
                </div>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Included Enterprise Guarantees</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {inspectModalService.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setInspectModalService(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddWithFeedback(inspectModalService);
                  setInspectModalService(null);
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Stack Calculator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
