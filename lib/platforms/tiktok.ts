// lib/platforms/tiktok.ts
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
  const { accessToken, openId } = config;

  if (!openId) {
    throw new Error("TikTok openId is required for publishing");
  }

  // Step 1: Initialize video upload
  const initRes = await fetch("https://open.tiktokapis.com/v1/video/upload/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_info: {
        source: "FILE_UPLOAD",
        file_name: `${title}-${Date.now()}.mp4`,
      },
      post_info: {
        title,
        privacy_level: "PUBLIC_TO_EVERYONE",
      },
    }),
  });

  const initData = await initRes.json();
  if (!initData.data?.upload_url || !initData.data?.publish_id) {
    throw new Error(
      `Failed to initialize TikTok upload: ${JSON.stringify(initData)}`
    );
  }

  // Step 2: Upload video chunk (in production, stream large files in chunks)
  const videoRes = await fetch(videoUrl);
  const videoBuffer = await videoRes.arrayBuffer();

  const uploadRes = await fetch(initData.data.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(
      `Failed to upload video to TikTok: ${uploadRes.statusText}`
    );
  }

  // Step 3: Publish the video
  const publishRes = await fetch(
    "https://open.tiktokapis.com/v1/video/publish/action/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          publish_id: initData.data.publish_id,
        },
      }),
    }
  );

  const publishData = await publishRes.json();
  if (!publishData.data?.item_id) {
    throw new Error(`Failed to publish TikTok video: ${JSON.stringify(publishData)}`);
  }

  return { shareId: publishData.data.item_id };
}
