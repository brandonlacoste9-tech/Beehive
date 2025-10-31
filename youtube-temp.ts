// lib/platforms/youtube.ts
import fs from "fs";
import os from "os";
import path from "path";
import { google } from "googleapis";

export type YouTubeConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export async function publishVideo(
  config: YouTubeConfig,
  videoBuffer: Buffer,
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
    privacyStatus?: "public" | "private" | "unlisted";
  }
): Promise<{ videoId: string }> {
  const { clientId, clientSecret, refreshToken } = config;

  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2.setCredentials({ refresh_token: refreshToken });

  const youtube = google.youtube({ version: "v3", auth: oAuth2 });

  const tmpDir = os.tmpdir();
  const filename = `upload-${Date.now()}.mp4`;
  const filepath = path.join(tmpDir, filename);
  await fs.promises.writeFile(filepath, videoBuffer);

  try {
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description || "",
          tags: metadata.tags || [],
        },
        status: {
          privacyStatus: metadata.privacyStatus || "public",
        },
      },
      media: {
        body: fs.createReadStream(filepath),
      },
    });

    const videoId = res.data.id!;
    return { videoId };
  } finally {
    try { await fs.promises.unlink(filepath); } catch (e) { /* ignore */ }
  }
}
