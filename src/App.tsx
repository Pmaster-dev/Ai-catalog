import React, { useState } from 'react';
import { Header } from './components/Header';
import { BigPictureTopology } from './components/BigPictureTopology';
import { CatalogGrid } from './components/CatalogGrid';
import { StackCalculator } from './components/StackCalculator';
import { ImageStudio } from './components/ImageStudio';
import { VisionAnalyzer } from './components/VisionAnalyzer';
import { AdvisorModal } from './components/AdvisorModal';
import { REGIONS, CATALOG_SERVICES } from './data/catalogData';
import { CatalogService, RegionOption, StackItem } from './types/catalog';
import { Check, ShieldCheck, Globe, Zap, Network } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'topology' | 'catalog' | 'simulator' | 'image-studio' | 'vision-analyzer'
  >('topology');
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(REGIONS[0]);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState<string | null>(null);
  const [imageStudioPrompt, setImageStudioPrompt] = useState<string>('');
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial production stack seed
  const [stackItems, setStackItems] = useState<StackItem[]>([
    {
      service: CATALOG_SERVICES.find((s) => s.id === 'c6i-2xlarge') || CATALOG_SERVICES[0],
      units: 4,
    },
    {
      service: CATALOG_SERVICES.find((s) => s.id === 'aurora-postgres-ha') || CATALOG_SERVICES[1],
      units: 1,
    },
    {
      service: CATALOG_SERVICES.find((s) => s.id === 'valkey-redis-cluster') || CATALOG_SERVICES[2],
      units: 1,
    },
    {
      service: CATALOG_SERVICES.find((s) => s.id === 'anycast-global-lb') || CATALOG_SERVICES[3],
      units: 1,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddServiceToStack = (service: CatalogService, units: number = 1) => {
    setStackItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id ? { ...item, units: item.units + units } : item
        );
      }
      return [...prev, { service, units }];
    });
    showToast(`Added ${units}x ${service.name} to stack`);
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    setStackItems((prev) =>
      prev
        .map((item) => {
          if (item.service.id === serviceId) {
            const newUnits = item.units + delta;
            return newUnits > 0 ? { ...item, units: newUnits } : null;
          }
          return item;
        })
        .filter(Boolean) as StackItem[]
    );
  };

  const handleRemoveItem = (serviceId: string) => {
    setStackItems((prev) => prev.filter((item) => item.service.id !== serviceId));
    showToast('Removed item from stack');
  };

  const handleClearStack = () => {
    setStackItems([]);
    showToast('Cleared stack');
  };

  const handleNavigateToCatalogItem = (serviceId: string) => {
    setSelectedCatalogItemId(serviceId);
    setCurrentView('catalog');
  };

  const handleOpenImageStudioWithPreset = (prompt: string) => {
    setImageStudioPrompt(prompt);
    setCurrentView('image-studio');
  };

  const handleSendToVisionAnalyzer = (imageBase64: string) => {
    setVisionImage(imageBase64);
    setCurrentView('vision-analyzer');
  };

  const handleApplyAdvisorRecommendation = (
    recommendations: { service: CatalogService; units: number }[]
  ) => {
    setStackItems(recommendations);
    showToast('Applied AI sizing recommendation to stack');
    setCurrentView('simulator');
  };

  const totalMonthlyUSD = stackItems.reduce(
    (sum, item) => sum + item.service.monthlyUSD * item.units * selectedRegion.priceMultiplier,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/50 text-sky-200 px-4 py-2.5 rounded-xl shadow-2xl shadow-sky-500/20 text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        regions={REGIONS}
        stackItemCount={stackItems.reduce((acc, i) => acc + i.units, 0)}
        totalMonthlyUSD={totalMonthlyUSD}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'topology' && (
          <BigPictureTopology
            selectedRegion={selectedRegion}
            onAddServiceToStack={handleAddServiceToStack}
            onNavigateToCatalogItem={handleNavigateToCatalogItem}
            onOpenImageStudioWithPreset={handleOpenImageStudioWithPreset}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogGrid
            selectedRegion={selectedRegion}
            onAddServiceToStack={handleAddServiceToStack}
            selectedServiceId={selectedCatalogItemId}
          />
        )}

        {currentView === 'simulator' && (
          <StackCalculator
            stackItems={stackItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearStack={handleClearStack}
            selectedRegion={selectedRegion}
            onNavigateToCatalog={() => setCurrentView('catalog')}
            onOpenImageStudioWithStack={handleOpenImageStudioWithPreset}
          />
        )}

        {currentView === 'image-studio' && (
          <ImageStudio
            initialPrompt={imageStudioPrompt}
            onSendToVisionAnalyzer={handleSendToVisionAnalyzer}
          />
        )}

        {currentView === 'vision-analyzer' && (
          <VisionAnalyzer
            initialImageBase64={visionImage}
            selectedRegion={selectedRegion}
            onAddServiceToStack={handleAddServiceToStack}
            onNavigateToCatalog={() => setCurrentView('catalog')}
          />
        )}
      </main>

      {/* Architecture Advisor Modal */}
      <AdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        selectedRegion={selectedRegion}
        onApplyRecommendation={handleApplyAdvisorRecommendation}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CloudPulse Catalog</span>
            <span aria-hidden="true">·</span>
            <span>Face-Value Infrastructure Engine</span>
            <span aria-hidden="true">·</span>
            <span>Active Datacenter: {selectedRegion.name}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setCurrentView('topology')} className="hover:text-white transition-colors">
              Topology
            </button>
            <button onClick={() => setCurrentView('catalog')} className="hover:text-white transition-colors">
              Catalog
            </button>
            <button onClick={() => setCurrentView('simulator')} className="hover:text-white transition-colors">
              Bill Simulator
            </button>
            <button onClick={() => setCurrentView('image-studio')} className="hover:text-white transition-colors">
              Diagram Studio
            </button>
            <button onClick={() => setCurrentView('vision-analyzer')} className="hover:text-white transition-colors">
              Vision Blueprint
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
