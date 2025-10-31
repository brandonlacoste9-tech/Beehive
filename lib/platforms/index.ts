// lib/platforms/index.ts
// Social media platform integration exports

export { publishImage, type InstagramConfig } from './instagram';
export { publishVideo as publishTikTokVideo, type TikTokConfig } from './tiktok';
export { publishVideo as publishYouTubeVideo, type YouTubeConfig } from './youtube';

// Platform registry for autonomous publishing
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
} as const;

export type Platform = (typeof PLATFORMS)[keyof typeof PLATFORMS];

// Configuration types for all platforms
export type PlatformConfig = {
  platform: Platform;
  config: InstagramConfig | TikTokConfig | YouTubeConfig;
};

// Publishing result types
export interface PublishResult {
  platform: Platform;
  success: boolean;
  externalId?: string;
  timestamp: string;
  error?: string;
}
