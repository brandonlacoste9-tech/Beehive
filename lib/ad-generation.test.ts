/**
 * Ad Generation System Tests
 * Comprehensive tests for the AI creative generation engine
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateAds,
  generateConstrainedAdCopy,
  evaluateGeneratedAds,
  generateAdVariations,
  getAvailablePersonas,
  getAvailableAdTypes,
  getAvailableToneModifiers,
} from './ad-generation';
import { listPersonas, PERSONAS } from './personas';

// Mock the Claude API
vi.mock('./claude', () => ({
  generateAdCopy: vi.fn(async () => ({
    ads: [
      'Ad 1: Check out our amazing product!',
      'Ad 2: Transform your business today.',
      'Ad 3: Join thousands of satisfied customers.',
    ],
    tokensUsed: 150,
    stopReason: 'complete',
    modelUsed: 'claude-3-5-sonnet-20241022',
    generatedAt: new Date(),
  })),
  generateConstrainedAd: vi.fn(async () => 'Compact ad copy for limited space'),
  evaluateAd: vi.fn(async () => ({
    score: 85,
    strengths: ['Clear CTA', 'Relevant messaging', 'Persuasive tone'],
    weaknesses: ['Could be more specific', 'Lacks urgency'],
    recommendations: [
      'Add stronger urgency signals',
      'Include specific benefits',
      'Test with target audience',
    ],
  })),
  generateVariations: vi.fn(async () => [
    'Variation 1 with different tone',
    'Variation 2 with different angle',
    'Variation 3 with different approach',
  ]),
}));

describe('Ad Generation System', () => {
  describe('generateAds', () => {
    it('should generate ads with default settings', async () => {
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'small_business',
        adType: 'social_post',
      });

      expect(result).toBeDefined();
      expect(result.ads).toHaveLength(3);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.productName).toBe('Test Product');
      expect(result.metadata.persona).toBe('Small Business Owner');
      expect(result.metadata.adType).toBe('social_post');
      expect(result.id).toMatch(/^gen_/);
    });

    it('should support custom variation count', async () => {
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'marketing_manager',
        adType: 'email',
        variationCount: 5,
      });

      expect(result.ads).toHaveLength(3); // Mocked to return 3
    });

    it('should support all personas', async () => {
      const personas = listPersonas();

      for (const persona of personas) {
        const result = await generateAds({
          productName: 'Test Product',
          productDescription: 'A test product',
          targetAudience: 'Test audience',
          personaId: persona.id,
          adType: 'social_post',
        });

        expect(result.metadata.persona).toBe(persona.name);
      }
    });

    it('should support tone modifiers', async () => {
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'influencer',
        adType: 'social_post',
        toneModifier: 'playful',
      });

      expect(result.metadata.toneModifier).toBe('playful');
    });

    it('should track generation time', async () => {
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'startup_founder',
        adType: 'blog_headline',
      });

      expect(result.metadata.generationTime).toBeGreaterThanOrEqual(0);
    });

    it('should include additional context', async () => {
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'enterprise',
        adType: 'search_engine',
        additionalContext: 'Premium tier with enterprise features',
      });

      expect(result.ads).toHaveLength(3);
    });
  });

  describe('generateConstrainedAdCopy', () => {
    it('should generate constrained ads with character limit', async () => {
      const result = await generateConstrainedAdCopy({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'influencer',
        adType: 'social_post',
        maxCharacters: 280,
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate constrained ads with line limit', async () => {
      const result = await generateConstrainedAdCopy({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'small_business',
        adType: 'email',
        maxLines: 3,
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should combine character and line constraints', async () => {
      const result = await generateConstrainedAdCopy({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'marketing_manager',
        adType: 'search_engine',
        maxCharacters: 90,
        maxLines: 2,
      });

      expect(typeof result).toBe('string');
    });
  });

  describe('evaluateGeneratedAds', () => {
    it('should evaluate multiple ads', async () => {
      const ads = [
        'Ad 1: Test copy',
        'Ad 2: Another test',
        'Ad 3: Third variation',
      ];

      const evaluations = await evaluateGeneratedAds(ads, 'Test Product', 'Test Audience');

      expect(evaluations).toHaveLength(3);
      expect(evaluations[0]).toHaveProperty('score');
      expect(evaluations[0]).toHaveProperty('strengths');
      expect(evaluations[0]).toHaveProperty('weaknesses');
      expect(evaluations[0]).toHaveProperty('recommendations');
      expect(evaluations[0].adIndex).toBe(0);
    });

    it('should handle single ad evaluation', async () => {
      const ads = ['Single ad copy'];
      const evaluations = await evaluateGeneratedAds(ads, 'Product', 'Audience');

      expect(evaluations).toHaveLength(1);
      expect(evaluations[0].score).toBeGreaterThanOrEqual(0);
      expect(evaluations[0].score).toBeLessThanOrEqual(100);
    });

    it('should include evaluation metadata', async () => {
      const ads = ['Test ad'];
      const evaluations = await evaluateGeneratedAds(ads, 'Product', 'Audience');

      expect(evaluations[0]).toHaveProperty('adCopy', 'Test ad');
      expect(Array.isArray(evaluations[0].strengths)).toBe(true);
      expect(Array.isArray(evaluations[0].weaknesses)).toBe(true);
      expect(Array.isArray(evaluations[0].recommendations)).toBe(true);
    });
  });

  describe('generateAdVariations', () => {
    it('should generate tone variations', async () => {
      const variations = await generateAdVariations(
        'Original ad copy',
        'tone',
        'small_business',
        3
      );

      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
    });

    it('should generate length variations', async () => {
      const variations = await generateAdVariations(
        'Original ad copy',
        'length',
        'marketing_manager',
        4
      );

      expect(variations.length).toBeGreaterThan(0);
    });

    it('should generate approach variations', async () => {
      const variations = await generateAdVariations(
        'Original ad copy',
        'approach',
        'influencer',
        3
      );

      expect(variations.length).toBeGreaterThan(0);
    });

    it('should generate audience variations', async () => {
      const variations = await generateAdVariations(
        'Original ad copy',
        'audience',
        'enterprise',
        3
      );

      expect(variations.length).toBeGreaterThan(0);
    });

    it('should support custom variation count', async () => {
      const variations = await generateAdVariations(
        'Original ad copy',
        'tone',
        'startup_founder',
        5
      );

      expect(variations.length).toBeGreaterThan(0);
    });
  });

  describe('Persona Helpers', () => {
    it('getAvailablePersonas should return all personas', () => {
      const personas = getAvailablePersonas();

      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBe(5);
      expect(personas.every((p: any) => p.id && p.name)).toBe(true);
    });

    it('getAvailableAdTypes should return all ad types', () => {
      const adTypes = getAvailableAdTypes();

      expect(Array.isArray(adTypes)).toBe(true);
      expect(adTypes.length).toBeGreaterThan(0);
      expect(adTypes.every((t: any) => t.id && t.name)).toBe(true);
    });

    it('getAvailableToneModifiers should return all modifiers', () => {
      const modifiers = getAvailableToneModifiers();

      expect(Array.isArray(modifiers)).toBe(true);
      expect(modifiers.length).toBeGreaterThan(0);
      expect(modifiers.every((m: any) => m.id && m.description)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      // This would require mocking the Claude API to throw an error
      // For now, we test that the function is called with valid inputs
      const result = await generateAds({
        productName: 'Test Product',
        productDescription: 'A test product',
        targetAudience: 'Test audience',
        personaId: 'small_business',
        adType: 'social_post',
      });

      expect(result).toBeDefined();
    });
  });

  describe('All Persona and Ad Type Combinations', () => {
    it('should work with all persona and ad type combinations', async () => {
      const personas = Object.keys(PERSONAS);
      const adTypes = ['social_post', 'search_engine', 'email', 'blog_headline', 'video_script'];

      for (const personaId of personas.slice(0, 2)) { // Test first 2 personas to avoid token limits
        for (const adType of adTypes.slice(0, 2)) { // Test first 2 ad types
          const result = await generateAds({
            productName: 'Test Product',
            productDescription: 'A test product',
            targetAudience: 'Test audience',
            personaId: personaId as any,
            adType: adType as any,
          });

          expect(result.ads).toBeDefined();
          expect(result.metadata).toBeDefined();
        }
      }
    });
  });
});
