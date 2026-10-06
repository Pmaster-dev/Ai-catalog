export type ServiceCategory =
  | 'compute-general'
  | 'compute-accelerated'
  | 'compute-memory'
  | 'serverless-containers'
  | 'databases'
  | 'storage'
  | 'networking';

export interface ComputeSpecs {
  vCpu?: number;
  cpuModel?: string;
  ramGb?: number;
  gpuType?: string;
  gpuCount?: number;
  gpuVramGb?: number;
  networkGbps?: number;
  maxIops?: number;
  storageType?: string;
  storageGb?: number;
  geekbenchMultiCore?: number;
  memoryBandwidthGBs?: number;
}

export interface CatalogService {
  id: string;
  name: string;
  shortCode: string;
  category: ServiceCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  hourlyUSD: number;
  monthlyUSD: number;
  unitBasis: string;
  specs: ComputeSpecs;
  benchmarkScore?: number;
  benchmarkLabel?: string;
  commitment1YrUSD: number;
  commitment3YrUSD: number;
  regionMultipliers?: Record<string, number>;
  popularWorkload: string;
  features: string[];
}

export interface ArchitectureNode {
  id: string;
  serviceId: string;
  name: string;
  category: ServiceCategory;
  tier: 'edge' | 'gateway' | 'compute' | 'cache' | 'database' | 'storage' | 'ai';
  units: number;
  x: number;
  y: number;
  hourlyRate: number;
  metrics: {
    cpuLoadPercent: number;
    ramAllocatedGb: number;
    activeConnections: number;
    throughputMb: number;
  };
}

export interface ArchitectureLink {
  from: string;
  to: string;
  label: string;
  bandwidthMbps: number;
}

export interface ArchitecturePreset {
  id: string;
  name: string;
  tagline: string;
  category: string;
  monthlyBaseUSD: number;
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
}

export interface RegionOption {
  id: string;
  name: string;
  city: string;
  country: string;
  priceMultiplier: number;
  latencyMs: number;
  tier: string;
}

export interface StackItem {
  service: CatalogService;
  units: number;
  customStorageGb?: number;
  customBandwidthGb?: number;
  notes?: string;
}
