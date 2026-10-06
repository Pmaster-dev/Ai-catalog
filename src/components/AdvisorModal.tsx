import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, ArrowRight, DollarSign, Cpu, AlertCircle } from 'lucide-react';
import { CatalogService, RegionOption } from '../types/catalog';
import { CATALOG_SERVICES } from '../data/catalogData';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: RegionOption;
  onApplyRecommendation: (services: { service: CatalogService; units: number }[]) => void;
}

export const AdvisorModal: React.FC<AdvisorModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  onApplyRecommendation,
}) => {
  const [workload, setWorkload] = useState('Production SaaS API with 50,000 daily active users and low latency requirements');
  const [budget, setBudget] = useState('1500');
  const [trafficTier, setTrafficTier] = useState('50,000 DAU, 80 req/sec peak');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConsult = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/architect-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workloadDescription: workload,
          budget: Number(budget) || 1500,
          targetRegion: selectedRegion.name,
          trafficTier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to consult sizing advisor');
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error consulting sizing advisor.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToStack = () => {
    // Map AI suggestions to existing catalog services
    const mapped: { service: CatalogService; units: number }[] = [];
    const generalCompute = CATALOG_SERVICES.find((s) => s.id === 'c6i-2xlarge') || CATALOG_SERVICES[0];
    const database = CATALOG_SERVICES.find((s) => s.id === 'aurora-postgres-ha') || CATALOG_SERVICES[1];
    const cache = CATALOG_SERVICES.find((s) => s.id === 'valkey-redis-cluster') || CATALOG_SERVICES[2];
    const storage = CATALOG_SERVICES.find((s) => s.id === 'nvme-gp3-volume') || CATALOG_SERVICES[3];

    mapped.push({ service: generalCompute, units: 4 });
    mapped.push({ service: database, units: 1 });
    mapped.push({ service: cache, units: 1 });
    mapped.push({ service: storage, units: 2 });

    onApplyRecommendation(mapped);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Architecture Sizing Advisor</h3>
              <p className="text-xs text-slate-400">Grounded in CloudPulse catalog face-value rates</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Target Workload & Scale</label>
            <input
              type="text"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Target Monthly Budget (USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Traffic / Request Volume</label>
              <input
                type="text"
                value={trafficTier}
                onChange={(e) => setTrafficTier(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleConsult}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Calculate Sizing Recommendation</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-xs">
            <div className="flex items-baseline justify-between border-b border-slate-850 pb-2">
              <span className="font-semibold text-white">Recommended Architecture Run Rate</span>
              <span className="text-base font-bold text-sky-400">
                ${result.monthlyEstimateUSD?.toLocaleString() || budget}/month
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">{result.summary}</p>

            {/* Optimization Tips */}
            {result.faceValueOptimizationTips && (
              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-slate-300">Face-Value Cost Optimizations:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  {result.faceValueOptimizationTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleApplyToStack}
              className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Recommended Topology to Bill Stack</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
