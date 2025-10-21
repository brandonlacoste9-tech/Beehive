# Codex Scroll: LM Studio Bridge
id: scroll-lmstudio-bridge
status: draft
version: 0.1.0
last_updated: 2025-10-15

## Setup Ritual
- `npm install @lmstudio/sdk`
- Ensure LM Studio desktop is running with the OpenAI-compatible server enabled.

## Node Ritual — `@lmstudio/sdk`
```ts
import { Chat, LMStudioClient, tool } from "@lmstudio/sdk";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { createInterface } from "readline/promises";
import { z } from "zod";
 
const rl = createInterface({ input: process.stdin, output: process.stdout });
const client = new LMStudioClient();
const model = await client.llm.model("openai/gpt-oss-20b");
const chat = Chat.empty();
 
const createFileTool = tool({
  name: "createFile",
  description: "Create a file with the given name and content.",
  parameters: { name: z.string(), content: z.string() },
  implementation: async ({ name, content }) => {
    if (existsSync(name)) {
      return "Error: File already exists.";
    }
    await writeFile(name, content, "utf-8");
    return "File created.";
  },
});
 
while (true) {
  const input = await rl.question("User: ");
  chat.append("user", input);
 
  process.stdout.write("Assistant: ");
  await model.act(chat, [createFileTool], {
    onMessage: (message) => chat.append(message),
    onPredictionFragment: ({ content }) => {
      process.stdout.write(content);
    },
  });
  process.stdout.write("\n");
}
```

## Local MCP Manifest
Place the following in `~/.lmstudio/mcp.json` to activate the OpenAI bridge:
```json
{
  "servers": [
    {
      "command": "python",
      "args": ["-m", "openai_mcp_server"],
      "env": {
        "OPENAI_API_KEY": "not-needed",
        "OPENAI_BASE_URL": "http://localhost:1234/v1"
      }
    }
  ]
}
```

## Python Bridge Invocation
```python
from openai import OpenAI
 
client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="not-needed"
)
 
result = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain what MXFP4 quantization is."}
    ]
)
 
print(result.choices[0].message.content)
```

## CLI Rituals
```bash
lms chat openai/gpt-oss-20b
lms load openai/gpt-oss-20b
lms get openai/gpt-oss-20b
# swap `20b` with `120b` for the larger release
```

## Replay Metadata Handshake
The Netlify `ritual-ping` + `ritual-metrics` endpoints now emit `jobId`, `sizeBytes`, `artifactUrl`, and status payloads for CodexReplay overlays—keep these fields flowing when triggering exports.
