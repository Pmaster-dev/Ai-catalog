import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

function stripBase64Prefix(dataUriOrBase64: string): { data: string; mimeType: string } {
  if (dataUriOrBase64.startsWith('data:')) {
    const matches = dataUriOrBase64.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }
  return { mimeType: 'image/png', data: dataUriOrBase64 };
}

// 1. Image Analysis using gemini-3.1-pro-preview
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType: userMimeType, prompt: userPrompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const { data: cleanBase64, mimeType: detectedMimeType } = stripBase64Prefix(imageBase64);
    const mimeType = userMimeType || detectedMimeType || 'image/png';

    const ai = getAiClient();

    const promptText = userPrompt || `You are an elite Cloud Infrastructure & Systems Architect evaluating this system diagram, server architecture, cloud topology, or infrastructure screenshot.

Please provide a structured, high-value analysis for customers evaluating catalog compute, networking, and storage services:

1. System Architecture Overview: High-level summary of the topology, tiers, and data flow.
2. Component Breakdown & Specifications: List identified compute nodes (vCPU/RAM), databases, load balancers, caching, and storage volumes.
3. Face-Value Cost Estimates: Realistic unit pricing (per hour) and estimated monthly run-rate breakdown based on standard cloud face-value catalog pricing.
4. Redundancy & Reliability Assessment: Single points of failure, multi-zone/multi-region recommendations, failover mechanisms.
5. Catalog Mapping & Modernization: Specific catalog recommendations (e.g., General Purpose C6i compute instances, High-Memory MemoryStore caches, Distributed Block Storage, Global Load Balancers) to optimize compute-to-cost ratio.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-3.1-pro-preview error, attempting fallback:', primaryErr?.message);
      // Fallback if model preview alias needs alternative or rate limited
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      });
    }

    const analysisText = response.text || 'No analysis generated.';
    return res.json({ analysis: analysisText });
  } catch (err: any) {
    console.error('Image analysis error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to analyze infrastructure image',
    });
  }
});

// 2. Image Creation & Editing using gemini-3.1-flash-image-preview
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', existingImageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();

    const parts: any[] = [];

    if (existingImageBase64) {
      const { data: cleanBase64, mimeType } = stripBase64Prefix(existingImageBase64);
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      });
      parts.push({
        text: `Modify this cloud infrastructure architecture diagram according to the following instruction: ${prompt}. Maintain a clean, professional, isometric technical system blueprint style with precise cloud service icons, connection lines, data directions, and clear legible labeling.`,
      });
    } else {
      parts.push({
        text: `A clean, modern, ultra-high-clarity technical architecture diagram and infrastructure blueprint illustrating: ${prompt}. Clean enterprise vector style, crisp nodes for compute instances, databases, load balancers, and storage clusters, subtle directional flow lines, dark slate background, high contrast, professional AWS/GCP enterprise architecture aesthetic.`,
      });
    }

    const allowedRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = allowedRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    const config: any = {
      imageConfig: {
        aspectRatio: chosenRatio,
      },
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts },
        config,
      });
    } catch (primaryErr: any) {
      console.warn('Failed with gemini-3.1-flash-image-preview, trying gemini-3.1-flash-image:', primaryErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config,
      });
    }

    let imageUrl = '';
    let textDescription = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textDescription += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'The model responded without an image. Please refine your prompt.',
        textDescription,
      });
    }

    return res.json({ imageUrl, textDescription });
  } catch (err: any) {
    console.error('Image generation/edit error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate or edit infrastructure image',
    });
  }
});

// 3. Cloud Architect Catalog Assistant / Sizing Advisor
app.post('/api/architect-advice', async (req, res) => {
  try {
    const { workloadDescription, budget, targetRegion, trafficTier } = req.body;

    const ai = getAiClient();
    const prompt = `You are a Principal Cloud Infrastructure Architect helping an enterprise client configure their compute, storage, and networking stack from a face-value catalog.

Workload requirements:
- Workload Description: ${workloadDescription || 'High-availability customer-facing web application'}
- Monthly Target Budget: ${budget ? `$${budget}/month` : 'Flexible / Optimized'}
- Target Primary Region: ${targetRegion || 'us-east-1 (N. Virginia)'}
- Traffic / Scale: ${trafficTier || '100,000 Monthly Active Users, 50 req/sec peak'}

Respond in clean JSON format with these exact keys:
{
  "summary": "Brief executive strategy summary",
  "monthlyEstimateUSD": 1420,
  "computeAllocation": [
    { "service": "General Purpose Compute (c6i.2xlarge)", "units": 4, "vCpuPerUnit": 8, "ramGbPerUnit": 16, "unitHourlyUSD": 0.34, "monthlyUSD": 979.20, "purpose": "App tier auto-scaling group" }
  ],
  "storageAllocation": [
    { "service": "High-IOPS Distributed NVMe Volume", "capacityGb": 500, "unitPerGbUSD": 0.12, "monthlyUSD": 60, "purpose": "Primary transactional storage" }
  ],
  "networkAllocation": [
    { "service": "Global Anycast Load Balancer & Edge CDN", "bandwidthGb": 2000, "monthlyUSD": 120, "purpose": "Low latency ingress & SSL termination" }
  ],
  "databaseAllocation": [
    { "service": "Managed Aurora PostgreSQL HA Cluster", "nodes": 2, "monthlyUSD": 260.80, "purpose": "Multi-AZ transactional persistence" }
  ],
  "faceValueOptimizationTips": [
    "Tip 1 on reserved vs on-demand savings",
    "Tip 2 on egress bandwidth reduction via edge caching",
    "Tip 3 on right-sizing memory vs CPU ratios"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (err: any) {
    console.error('Advisor error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate architectural sizing' });
  }
});

// Setup Vite in Dev or Static Files in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`CloudPulse Infrastructure Catalog server running on port ${port}`);
  });
}

startServer();
