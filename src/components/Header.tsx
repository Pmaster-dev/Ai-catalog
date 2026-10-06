import React from 'react';
import { 
  Network, 
  Layers, 
  Cpu, 
  Calculator, 
  Wand2, 
  ScanSearch, 
  Globe2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { RegionOption } from '../types/catalog';

interface HeaderProps {
  currentView: 'topology' | 'catalog' | 'simulator' | 'image-studio' | 'vision-analyzer';
  onViewChange: (view: 'topology' | 'catalog' | 'simulator' | 'image-studio' | 'vision-analyzer') => void;
  selectedRegion: RegionOption;
  onRegionChange: (region: RegionOption) => void;
  regions: RegionOption[];
  stackItemCount: number;
  totalMonthlyUSD: number;
  onOpenAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  selectedRegion,
  onRegionChange,
  regions,
  stackItemCount,
  totalMonthlyUSD,
  onOpenAdvisor,
}) => {
  const [regionDropdownOpen, setRegionDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Network className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base tracking-tight text-white">CloudPulse</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400 font-medium">Infrastructure Catalog</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Transparent Face-Value Compute</span>
                  <span>·</span>
                  <span>Zero Hidden Egress</span>
                </div>
              </div>
            </div>

            {/* Region picker on mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              >
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{selectedRegion.city}</span>
              </button>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => onViewChange('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'topology'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Big Picture Topology</span>
            </button>

            <button
              onClick={() => onViewChange('catalog')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'catalog'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Face-Value Catalog</span>
            </button>

            <button
              onClick={() => onViewChange('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'simulator'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Stack Calculator</span>
              {stackItemCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-sky-500 text-slate-950 font-bold rounded">
                  {stackItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('image-studio')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'image-studio'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagram Studio</span>
            </button>

            <button
              onClick={() => onViewChange('vision-analyzer')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'vision-analyzer'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ScanSearch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vision Blueprint</span>
            </button>
          </nav>

          {/* Right Controls: Region Selector, Advisor & Running Cost */}
          <div className="hidden md:flex items-center gap-3">
            {/* Region Selector */}
            <div className="relative">
              <button
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
              >
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                <div className="text-left">
                  <span className="font-medium text-slate-200">{selectedRegion.city}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({selectedRegion.latencyMs}ms)</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {regionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Data Center Hub
                  </div>
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        onRegionChange(region);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                        selectedRegion.id === region.id
                          ? 'bg-sky-500/20 text-sky-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{region.name}</div>
                        <div className="text-[11px] text-slate-400">{region.tier} · {region.latencyMs}ms edge ping</div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        {region.priceMultiplier === 1.0 ? '1.0x (Base)' : `${region.priceMultiplier}x`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Advisor Trigger */}
            <button
              onClick={onOpenAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sizing Advisor</span>
            </button>

            {/* Active Stack Ticker */}
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-400">Stack: </span>
              <span className="font-semibold text-sky-400">${totalMonthlyUSD.toFixed(2)}/mo</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
