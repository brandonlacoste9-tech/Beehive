// lib/renderer.ts
// Optional external renderer microservice client
// Use for server-side video generation (puppeteer + ffmpeg)

export type RenderInstruction = {
  style: "reel" | "square" | "story" | "landscape";
  script: string;
  visuals: Array<{
    type: "image" | "video" | "text";
    url?: string;
    content?: string;
    duration?: number;
  }>;
  audio?: {
    url: string;
    volume?: number;
  };
  transitions?: string[];
};

export type RenderResult = {
  filename: string;
  content_type: string;
  base64: string;
  duration_seconds?: number;
};

export async function renderVideo(
  serviceUrl: string,
  instruction: RenderInstruction
): Promise<RenderResult> {
  const res = await fetch(`${serviceUrl}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction }),
  });

  if (!res.ok) {
    throw new Error(`Render service failed: ${await res.text()}`);
  }

  return res.json();
}

// Example renderer microservice (Docker container):
/*
FROM node:20-alpine
RUN apk add --no-cache chromium ffmpeg
WORKDIR /app
COPY package.json .
RUN npm install puppeteer-core fluent-ffmpeg
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]
*/
