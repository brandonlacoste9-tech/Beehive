'use client';

/**
 * CreativeForm Component
 * Main form for configuring and generating ad variations
 */

import { useState, FormEvent } from 'react';

export interface CreativeFormProps {
  onGenerate: (formData: GenerationRequest) => Promise<void>;
  isLoading?: boolean;
  personas: Array<{ id: string; name: string; description: string }>;
  adTypes: Array<{ id: string; name: string; lengthGuide: string }>;
  toneModifiers: Array<{ id: string; description: string }>;
}

export interface GenerationRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  personaId: string;
  adType: string;
  toneModifier?: string;
  variationCount: number;
  additionalContext?: string;
}

export function CreativeForm({
  onGenerate,
  isLoading = false,
  personas,
  adTypes,
  toneModifiers,
}: CreativeFormProps) {
  const [formData, setFormData] = useState<GenerationRequest>({
    productName: '',
    productDescription: '',
    targetAudience: '',
    personaId: personas[0]?.id || 'small_business',
    adType: adTypes[0]?.id || 'social_post',
    variationCount: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.productDescription.trim()) {
      newErrors.productDescription = 'Product description is required';
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = 'Target audience is required';
    }

    if (formData.variationCount < 1 || formData.variationCount > 10) {
      newErrors.variationCount = 'Variation count must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onGenerate(formData);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Generation failed',
      });
    }
  };

  const handleChange = (
    field: keyof GenerationRequest,
    value: string | number | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="productName"
          value={formData.productName}
          onChange={e => handleChange('productName', e.target.value)}
          placeholder="e.g., CloudSync Pro"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.productName ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.productName && (
          <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
        )}
      </div>

      {/* Product Description */}
      <div>
        <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
          Product Description
        </label>
        <textarea
          id="productDescription"
          value={formData.productDescription}
          onChange={e => handleChange('productDescription', e.target.value)}
          placeholder="Describe what your product does, its key features, and benefits..."
          rows={4}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.productDescription ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.productDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.productDescription}</p>
        )}
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
          Target Audience
        </label>
        <input
          type="text"
          id="targetAudience"
          value={formData.targetAudience}
          onChange={e => handleChange('targetAudience', e.target.value)}
          placeholder="e.g., Small business owners, enterprise IT teams"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.targetAudience ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.targetAudience && (
          <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>
        )}
      </div>

      {/* Persona Selection */}
      <div>
        <label htmlFor="persona" className="block text-sm font-medium text-gray-700">
          Buyer Persona
        </label>
        <select
          id="persona"
          value={formData.personaId}
          onChange={e => handleChange('personaId', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {personas.map(persona => (
            <option key={persona.id} value={persona.id}>
              {persona.name} - {persona.description}
            </option>
          ))}
        </select>
      </div>

      {/* Ad Type Selection */}
      <div>
        <label htmlFor="adType" className="block text-sm font-medium text-gray-700">
          Ad Type
        </label>
        <select
          id="adType"
          value={formData.adType}
          onChange={e => handleChange('adType', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {adTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {formData.adType && (
          <p className="mt-1 text-xs text-gray-500">
            {adTypes.find(t => t.id === formData.adType)?.lengthGuide}
          </p>
        )}
      </div>

      {/* Tone Modifier */}
      <div>
        <label htmlFor="toneModifier" className="block text-sm font-medium text-gray-700">
          Tone Modifier (Optional)
        </label>
        <select
          id="toneModifier"
          value={formData.toneModifier || ''}
          onChange={e =>
            handleChange('toneModifier', e.target.value ? e.target.value : undefined)
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="">None - Use persona's default tone</option>
          {toneModifiers.map(mod => (
            <option key={mod.id} value={mod.id}>
              {mod.id.charAt(0).toUpperCase() + mod.id.slice(1)} - {mod.description}
            </option>
          ))}
        </select>
      </div>

      {/* Variation Count */}
      <div>
        <label htmlFor="variationCount" className="block text-sm font-medium text-gray-700">
          Number of Variations
        </label>
        <input
          type="number"
          id="variationCount"
          min="1"
          max="10"
          value={formData.variationCount}
          onChange={e => handleChange('variationCount', parseInt(e.target.value, 10))}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.variationCount ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.variationCount && (
          <p className="mt-1 text-sm text-red-600">{errors.variationCount}</p>
        )}
      </div>

      {/* Additional Context */}
      <div>
        <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700">
          Additional Context (Optional)
        </label>
        <textarea
          id="additionalContext"
          value={formData.additionalContext || ''}
          onChange={e => handleChange('additionalContext', e.target.value)}
          placeholder="Any additional context, such as pricing, special offers, or unique selling points..."
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full px-4 py-2 font-medium text-white rounded-md transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? 'Generating...' : 'Generate Ad Variations'}
      </button>
    </form>
  );
}
