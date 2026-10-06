import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  Sliders, 
  Layers, 
  ArrowRight, 
  Edit3, 
  Maximize2,
  ScanSearch,
  Check,
  AlertCircle
} from 'lucide-react';

interface ImageStudioProps {
  initialPrompt?: string;
  onSendToVisionAnalyzer: (imageBase64: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  initialPrompt = '',
  onSendToVisionAnalyzer,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '4:3' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [imageHistory, setImageHistory] = useState<{ url: string; prompt: string }[]>([]);

  // Sample prompt recommendations
  const promptSuggestions = [
    'Enterprise high-availability cloud architecture with Anycast load balancer, 4-node Kubernetes compute cluster, Redis cache, and Aurora PostgreSQL multi-AZ.',
    'NVIDIA H100 8-GPU Pod AI training cluster with 3.2 Tbps RoCE network fabric, GPUDirect NVMe storage, and continuous token batching pipeline.',
    'Global serverless microservices event mesh with edge worker runtimes, API gateway, DynamoDB single-table design, and S3 asset bucket.',
    'Fintech real-time trading engine architecture with FPGA acceleration, sub-millisecond in-memory cache, and immutable distributed ledger.',
  ];

  const handleGenerate = async (isEditing: boolean = false) => {
    const activePrompt = isEditing ? editInstruction : prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        prompt: activePrompt,
        aspectRatio,
      };

      if (isEditing && generatedImage) {
        payload.existingImageBase64 = generatedImage;
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setTextDescription(data.textDescription || '');
        setImageHistory((prev) => [{ url: data.imageUrl, prompt: activePrompt }, ...prev.slice(0, 5)]);
        if (isEditing) {
          setEditInstruction('');
          setEditMode(false);
        }
      } else {
        throw new Error('No image was returned by gemini-3.1-flash-image-preview');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `cloudpulse-architecture-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Architecture Diagram Studio</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Generate & Edit Technical Infrastructure Blueprints
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Powered by gemini-3.1-flash-image-preview</span>
            <span aria-hidden="true">·</span>
            <span>Natural language diagram authoring</span>
            <span aria-hidden="true">·</span>
            <span>Iterative image-to-image editing</span>
          </div>
        </div>

        {generatedImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendToVisionAnalyzer(generatedImage)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium rounded-xl transition-colors"
            >
              <ScanSearch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Analyze in Vision Blueprint</span>
            </button>
            <button
              onClick={downloadImage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt & Controls (Left) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Prompt Technical Architecture</span>
            </h3>

            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe your desired cloud infrastructure blueprint, compute topology, server cluster, or network mesh..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {(['16:9', '4:3', '1:1', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Architecture Blueprint...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Diagram with Gemini 3.1 Flash Image</span>
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

          {/* Edit Existing Image Section (Active when image exists) */}
          {generatedImage && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  <span>Edit This Architecture Image</span>
                </h3>
                <span className="text-[11px] text-sky-400">Image-to-Image AI</span>
              </div>

              <p className="text-xs text-slate-400">
                Provide an instruction to modify, expand, or restyle the current diagram without starting from scratch.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="e.g. Add a standby multi-AZ read replica, highlight network failover path in blue..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />

                <button
                  onClick={() => handleGenerate(true)}
                  disabled={loading || !editInstruction.trim()}
                  className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span>Apply Modification</span>
                </button>
              </div>
            </div>
          )}

          {/* Preset Prompts Recommendation List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">Architecture Prompt Presets</div>
            <div className="space-y-1.5">
              {promptSuggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sugg)}
                  className="w-full text-left p-2.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-[11px] text-slate-400 hover:text-slate-200 transition-colors line-clamp-2"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Image Preview Canvas (Right) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[480px] flex flex-col justify-center items-center relative overflow-hidden">
            {loading ? (
              <div className="text-center space-y-4 p-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Wand2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Generating System Blueprint</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Gemini 3.1 Flash Image Preview is rendering vector hardware nodes, interconnects, and cloud labels...
                  </p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col items-center">
                <img
                  src={generatedImage}
                  alt="Generated Architecture Blueprint"
                  className="max-h-[520px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800/80"
                />
                {textDescription && (
                  <p className="text-xs text-slate-400 mt-3 text-center max-w-lg leading-relaxed">
                    {textDescription}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3 p-8">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No Diagram Generated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a prompt preset or enter your infrastructure requirements on the left, then click Generate to create a custom architecture diagram.
                </p>
              </div>
            )}
          </div>

          {/* Generation History Thumbnails */}
          {imageHistory.length > 1 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Recent Variations</div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setGeneratedImage(item.url);
                      setPrompt(item.prompt);
                    }}
                    className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      generatedImage === item.url ? 'border-amber-400' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={item.url} alt="Thumbnail" className="w-24 h-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
