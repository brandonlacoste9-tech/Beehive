'use client';

/**
 * AdPreview Component
 * Displays generated ads with copy, sharing, and action options
 */

import { useState } from 'react';

export interface AdPreviewProps {
  ads: string[];
  productName: string;
  persona: string;
  adType: string;
  generatedAt: string;
  onEvaluate?: (ads: string[]) => Promise<void>;
  onVariations?: (adIndex: number) => Promise<void>;
  isEvaluating?: boolean;
  isGeneratingVariations?: boolean;
}

export function AdPreview({
  ads,
  productName,
  persona,
  adType,
  generatedAt,
  onEvaluate,
  onVariations,
  isEvaluating = false,
  isGeneratingVariations = false,
}: AdPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const selectedAd = ads[selectedIndex];

  const handleCopyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleEvaluate = async () => {
    if (onEvaluate) {
      try {
        await onEvaluate(ads);
      } catch (error) {
        console.error('Evaluation failed:', error);
      }
    }
  };

  const handleGenerateVariations = async () => {
    if (onVariations) {
      try {
        await onVariations(selectedIndex);
      } catch (error) {
        console.error('Variation generation failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Generated Ads</h2>
        <p className="mt-2 text-sm text-gray-600">
          {ads.length} variations generated for <strong>{productName}</strong> using the{' '}
          <strong>{persona}</strong> persona
        </p>
        <p className="mt-1 text-xs text-gray-500">Generated {new Date(generatedAt).toLocaleString()}</p>
      </div>

      {/* Main Ad Display */}
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Ad {selectedIndex + 1} of {ads.length}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {adType}
            </span>
          </div>

          {/* Ad Copy */}
          <div className="mb-4 rounded-md bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-base text-gray-900">{selectedAd}</p>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{selectedAd.length}</p>
              <p className="text-xs text-gray-500">Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{selectedAd.split(' ').length}</p>
              <p className="text-xs text-gray-500">Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{selectedAd.split('\n').length}</p>
              <p className="text-xs text-gray-500">Lines</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCopyToClipboard(selectedAd, selectedIndex)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {copiedIndex === selectedIndex ? '✓ Copied' : 'Copy to Clipboard'}
            </button>

            {onVariations && (
              <button
                onClick={handleGenerateVariations}
                disabled={isGeneratingVariations}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingVariations ? '⟳ Generating...' : '⟳ Generate Variations'}
              </button>
            )}

            <button
              onClick={() => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(selectedAd));
                element.setAttribute('download', `ad_${selectedIndex + 1}.txt`);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ⬇ Download
            </button>
          </div>
        </div>

        {/* Ad Thumbnails */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">All Variations</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`rounded-md border-2 p-3 text-left text-sm transition-all ${
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="line-clamp-3 text-gray-900">{ad}</p>
                <p className="mt-2 text-xs text-gray-500">{ad.length} chars</p>
              </button>
            ))}
          </div>
        </div>

        {/* Evaluate Button */}
        {onEvaluate && (
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEvaluating ? '⟳ Evaluating...' : '⭐ Evaluate All Ads'}
          </button>
        )}
      </div>
    </div>
  );
}
