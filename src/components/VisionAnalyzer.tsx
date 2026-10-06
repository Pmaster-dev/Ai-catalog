import React, { useState } from 'react';
import { 
  ScanSearch, 
  Upload, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  ArrowRight,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { CatalogService, RegionOption } from '../types/catalog';
import { CATALOG_SERVICES } from '../data/catalogData';

interface VisionAnalyzerProps {
  initialImageBase64?: string | null;
  selectedRegion: RegionOption;
  onAddServiceToStack: (service: CatalogService, units: number) => void;
  onNavigateToCatalog: () => void;
}

export const VisionAnalyzer: React.FC<VisionAnalyzerProps> = ({
  initialImageBase64 = null,
  selectedRegion,
  onAddServiceToStack,
  onNavigateToCatalog,
}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(initialImageBase64);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If initial image provided (e.g. from ImageStudio), set it
  React.useEffect(() => {
    if (initialImageBase64) {
      setImageBase64(initialImageBase64);
    }
  }, [initialImageBase64]);

  // Sample architecture drawings generated dynamically as SVG data URIs
  const sampleBlueprints = [
    {
      title: 'Enterprise Microservices & Aurora DB',
      subtitle: '3-tier Web + Worker + HA Postgres',
      svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23090d16"><rect width="600" height="400" fill="%230b1120"/><text x="30" y="40" fill="%2338bdf8" font-size="16" font-family="sans-serif" font-weight="bold">ENTERPRISE SYSTEM ARCHITECTURE</text><rect x="30" y="80" width="120" height="90" rx="8" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="45" y="125" fill="%23fff" font-size="12" font-family="sans-serif">Cloudflare CDN</text><text x="45" y="145" fill="%2394a3b8" font-size="10" font-family="sans-serif">Anycast Edge L7</text><line x1="150" y1="125" x2="230" y2="125" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="4"/><rect x="230" y="80" width="140" height="90" rx="8" fill="%231e293b" stroke="%2334d399" stroke-width="2"/><text x="245" y="125" fill="%23fff" font-size="12" font-family="sans-serif">Compute Cluster</text><text x="245" y="145" fill="%2394a3b8" font-size="10" font-family="sans-serif">c6i.2xlarge x 4</text><line x1="370" y1="125" x2="450" y2="125" stroke="%2334d399" stroke-width="2"/><rect x="450" y="80" width="130" height="90" rx="8" fill="%231e293b" stroke="%23f59e0b" stroke-width="2"/><text x="465" y="125" fill="%23fff" font-size="12" font-family="sans-serif">Aurora Postgres</text><text x="465" y="145" fill="%2394a3b8" font-size="10" font-family="sans-serif">Multi-AZ HA</text><rect x="230" y="230" width="140" height="90" rx="8" fill="%231e293b" stroke="%23a855f7" stroke-width="2"/><text x="245" y="275" fill="%23fff" font-size="12" font-family="sans-serif">Redis Cluster</text><text x="245" y="295" fill="%2394a3b8" font-size="10" font-family="sans-serif">3-Node 48GB</text><line x1="300" y1="170" x2="300" y2="230" stroke="%23a855f7" stroke-width="2"/><rect x="450" y="230" width="130" height="90" rx="8" fill="%231e293b" stroke="%2306b6d4" stroke-width="2"/><text x="465" y="275" fill="%23fff" font-size="12" font-family="sans-serif">Object Storage</text><text x="465" y="295" fill="%2394a3b8" font-size="10" font-family="sans-serif">S3 Standard TBs</text><line x1="370" y1="275" x2="450" y2="275" stroke="%2306b6d4" stroke-width="2"/></svg>`,
    },
    {
      title: 'High-Throughput AI GPU Inference Pod',
      subtitle: '8x NVIDIA H100 SXM5 with vLLM',
      svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23090d16"><rect width="600" height="400" fill="%230b1120"/><text x="30" y="40" fill="%23c084fc" font-size="16" font-family="sans-serif" font-weight="bold">AI SUPERCOMPUTER INFERENCE MESH</text><rect x="30" y="90" width="140" height="90" rx="8" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="45" y="135" fill="%23fff" font-size="12" font-family="sans-serif">Token Ingress</text><text x="45" y="155" fill="%2394a3b8" font-size="10" font-family="sans-serif">gRPC API Gateway</text><line x1="170" y1="135" x2="250" y2="135" stroke="%23c084fc" stroke-width="3"/><rect x="250" y="70" width="170" height="130" rx="8" fill="%231e293b" stroke="%23a855f7" stroke-width="2"/><text x="265" y="115" fill="%23fff" font-size="13" font-family="sans-serif" font-weight="bold">8x H100 SXM5</text><text x="265" y="135" fill="%2394a3b8" font-size="11" font-family="sans-serif">640GB HBM3 VRAM</text><text x="265" y="155" fill="%23c084fc" font-size="10" font-family="sans-serif">3.2 Tbps RoCE v2</text><line x1="420" y1="135" x2="480" y2="135" stroke="%2338bdf8" stroke-width="2"/><rect x="480" y="90" width="100" height="90" rx="8" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="495" y="135" fill="%23fff" font-size="11" font-family="sans-serif">NVMe Checkpoints</text><text x="495" y="155" fill="%2394a3b8" font-size="9" font-family="sans-serif">GPUDirect 100k IOPS</text></svg>`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      setAnalysisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          prompt: customPrompt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze infrastructure image');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred during image analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <ScanSearch className="w-3.5 h-3.5" />
            <span>AI Vision Architecture Inspector</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Analyze System Diagrams, Whiteboards & Cloud Topologies
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Powered by gemini-3.1-pro-preview</span>
            <span aria-hidden="true">·</span>
            <span>Multi-modal computer vision understanding</span>
            <span aria-hidden="true">·</span>
            <span>Face-value catalog component extraction</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Controls (Left) + Vision Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Preview Column (Left) */}
        <div className="lg:col-span-5 space-y-5">
          {/* File Upload Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Architecture Image or Photo</span>
            </h3>

            <label className="block border-2 border-dashed border-slate-850 hover:border-emerald-500/50 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mx-auto text-emerald-400 mb-2">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Click to browse photo or screenshot
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supports PNG, JPEG, WEBP, whiteboard photos, architecture diagrams
              </div>
            </label>

            {/* Quick Test Samples */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <span className="text-[11px] font-medium text-slate-400">Or test with pre-built diagram sample:</span>
              <div className="grid grid-cols-2 gap-2">
                {sampleBlueprints.map((samp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageBase64(samp.svgUri);
                      setMimeType('image/svg+xml');
                      setAnalysisResult(null);
                      setError(null);
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-200 text-[11px] line-clamp-1">{samp.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{samp.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Custom Inspection Focus */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Custom Question or Focus (Optional)</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Estimate monthly face-value cost and highlight single points of failure"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !imageBase64}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Architecture via Gemini 3.1 Pro...</span>
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4" />
                  <span>Analyze Diagram with Gemini 3.1 Pro</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
          </div>

          {/* Active Image Thumbnail Preview */}
          {imageBase64 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-300 mb-2">Image Scheduled for Vision Analysis</div>
              <img
                src={imageBase64}
                alt="Architecture to inspect"
                className="max-h-56 w-full object-contain rounded-xl border border-slate-800 bg-slate-900"
              />
            </div>
          )}
        </div>

        {/* Vision Analysis Report (Right) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 min-h-[480px]">
            {loading ? (
              <div className="text-center space-y-4 py-16">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                  <ScanSearch className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Gemini 3.1 Pro Preview is Analyzing Architecture</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Deconstructing network boundaries, compute clusters, persistent datastores, and face-value billing estimates...
                  </p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Architecture Vision Breakdown</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">gemini-3.1-pro-preview</span>
                </div>

                {/* Formatted Markdown Content */}
                <div className="prose prose-invert prose-xs max-w-none text-slate-300 space-y-4 text-xs leading-relaxed whitespace-pre-line font-sans">
                  {analysisResult}
                </div>

                {/* Quick Catalog Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ready to provision components from this diagram?</span>
                  <button
                    onClick={onNavigateToCatalog}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors"
                  >
                    <span>Browse Matching Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-16 text-slate-400">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mx-auto text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Ready to Inspect Architecture</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an architecture drawing or select one of the test presets on the left, then click Analyze Diagram to receive component sizing, high-availability reviews, and face-value pricing estimates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
