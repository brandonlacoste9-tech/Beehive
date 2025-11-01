/**
 * Creative Studio Page
 * Main interface for AI-powered ad generation
 */

'use client';

import { useState, useEffect } from 'react';
import { CreativeForm } from '@/components/CreativeStudio/CreativeForm';
import { AdPreview } from '@/components/CreativeStudio/AdPreview';
import type { GenerationRequest } from '@/components/CreativeStudio/CreativeForm';

interface GenerationOptions {
  personas: Array<{ id: string; name: string; description: string }>;
  adTypes: Array<{ id: string; name: string; lengthGuide: string }>;
  toneModifiers: Array<{ id: string; description: string }>;
}

interface GeneratedResult {
  ads: string[];
  metadata: {
    productName: string;
    persona: string;
    adType: string;
    toneModifier?: string;
    generatedAt: string;
  };
}

export default function CreativeStudioPage() {
  const [options, setOptions] = useState<GenerationOptions | null>(null);
  const [generatedAds, setGeneratedAds] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch generation options');
        }

        const data: GenerationOptions = await response.json();
        setOptions(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load options';
        setError(message);
        console.error('Failed to fetch options:', err);
      }
    };

    fetchOptions();
  }, []);

  const handleGenerate = async (formData: GenerationRequest) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          streaming: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const result: GeneratedResult = await response.json();
      setGeneratedAds(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async (ads: string[]) => {
    if (!generatedAds) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ads,
          productName: generatedAds.metadata.productName,
          targetAudience: 'General audience', // Would need to track this
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const result = await response.json();

      // TODO: Display evaluation results in a modal or panel
      console.log('Evaluation results:', result);
      alert(
        `Evaluation complete!\nAverage score: ${result.stats.avgScore}/100\nTop ad: #${result.stats.recommendation.match(/\d+/)?.[0] || 1}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Evaluation failed';
      setError(message);
      console.error('Evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateVariations = async (adIndex: number) => {
    if (!generatedAds) return;

    setIsGeneratingVariations(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalAd: generatedAds.ads[adIndex],
          personaId: generatedAds.metadata.persona,
          variationType: 'tone',
          variationCount: 3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Variation generation failed');
      }

      const result = await response.json();

      // TODO: Display variations in a modal
      console.log('Variations:', result);
      alert(`Generated 3 variations of ad ${adIndex + 1}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Variation generation failed';
      setError(message);
      console.error('Variation generation failed:', err);
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  if (!options) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Creative Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Creative Studio</h1>
          <p className="text-lg text-gray-600">
            Generate high-converting ad copy powered by AI and multi-persona targeting
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configure Generation</h2>
            <CreativeForm
              onGenerate={handleGenerate}
              isLoading={isGenerating}
              personas={options.personas}
              adTypes={options.adTypes}
              toneModifiers={options.toneModifiers}
            />
          </div>

          {/* Preview Section */}
          <div className="rounded-lg bg-white p-8 shadow-lg">
            {generatedAds ? (
              <AdPreview
                ads={generatedAds.ads}
                productName={generatedAds.metadata.productName}
                persona={generatedAds.metadata.persona}
                adType={generatedAds.metadata.adType}
                generatedAt={generatedAds.metadata.generatedAt}
                onEvaluate={handleEvaluate}
                onVariations={handleGenerateVariations}
                isEvaluating={isEvaluating}
                isGeneratingVariations={isGeneratingVariations}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads generated yet</h3>
                <p className="text-sm text-gray-600 text-center">
                  Configure your product details and select a persona to generate compelling ad variations.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Persona Targeting</h3>
            <p className="text-sm text-gray-600">
              Generate ads tailored to 5 distinct buyer personas with different tones and messaging strategies.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Evaluation</h3>
            <p className="text-sm text-gray-600">
              Get quality scores and actionable recommendations for each generated ad variation.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Variations</h3>
            <p className="text-sm text-gray-600">
              Create alternative versions with different tones, lengths, and approaches in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
