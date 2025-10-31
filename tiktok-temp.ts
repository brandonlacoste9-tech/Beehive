// lib/platforms/tiktok.ts
// TikTok Content Posting API: stub

export type TikTokConfig = {
  clientKey: string;
  clientSecret: string;
  accessToken: string;
  openId?: string;
};

export async function publishVideo(
  config: TikTokConfig,
  videoUrl: string,
  title: string
): Promise<{ shareId: string }> {
  throw new Error("TikTok publishing not implemented. Add TikTok Content Posting API flow.");
}
