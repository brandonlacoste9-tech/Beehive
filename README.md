# 🐝 BeeSwarm Studio

BeeSwarm Studio is the Codex-native evolution of AdGenXAI. It fuses voice synthesis, rapid transcription, and collaborative ritual
ops into a single Next.js workspace that can be shipped to Netlify or any Node-friendly edge. The swarm now has a voice, a
memory, and a cadence you can track.

## ✨ Feature Highlights
- **Codex-ready AI voice stack** – Server-only `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` power text-to-speech via the
  `VoiceForge` module, with configurable model + voice identifiers stored in `.env.local`.
- **Secure caption pipeline** – `/api/audio/transcribe` proxies media to Whisper without ever leaking credentials to the
  browser. `WhisperWing` handles uploads and renders the returned captions.
- **Ritual heartbeat monitor** – `RenderPulse` visualises the current creative pipeline, animating every milestone as the
  swarm seals a ritual.
- **Async collaboration hub** – `StudioShare` spawns lightweight threads so collaborators can review renders, drop feedback,
  and track next steps.
- **Netlify-friendly by default** – Pre-configured scripts and a simple deployment story keep the hive shipping on schedule.

## 🚀 Quickstart

```bash
# Clone and install
git clone https://github.com/brandonlacoste9-tech/Beehive.git
cd Beehive
npm install

# Local environment secrets (never commit this file)
cp .env.local.example .env.local  # or create the file manually
```

Add the following keys to `.env.local`:

```bash
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="eleven-..."
ELEVENLABS_VOICE_ID="EXAVITQu4vr4xnSDxMaL"
ELEVENLABS_MODEL_ID="eleven_multilingual_v2"
ELEVENLABS_OUTPUT_FORMAT="mpeg"
```

Then start the Studio:

```bash
npm run dev
```

The hive boots on [http://localhost:3000](http://localhost:3000). All requests to ElevenLabs and OpenAI are proxied through the
Next.js API layer so your browser never sees the raw secrets.

## 🗂️ Project Structure

```
app/             # App Router pages (Next.js 14)
components/      # Swarm UI modules (HomeHero, RenderPulse, StudioShare, ...)
pages/           # Legacy Pages Router routes (kept for compatibility)
public/          # Static assets
styles/          # Tailwind base styles
```

## 🛠️ Studio Modules
- `HomeHero` – ceremonial landing sequence that orients visitors.
- `VoiceForge` – text-to-speech forge that calls ElevenLabs through `/api/voice/synthesize` (client helper: `synthesizeVoiceClient`).
- `WhisperWing` – caption capture module that uploads audio/video to `/api/audio/transcribe` (client helper: `transcribeViaApi`).
- `RenderPulse` – heartbeat feedback widget for ritual completion.
- `StudioShare` – collaborative threads and feedback loops for the swarm.

Drop these components into any page or layout inside the Studio grid to compose bespoke operator surfaces.

## 🧪 Ritual Instrumentation
`RenderPulse` and `StudioShare` are designed to work side-by-side. Trigger pulses as features deploy, then capture feedback
from the swarm with contextual tags. Both components are client-safe (annotated with `"use client"`) and can be imported from
`@/components/...`.

## 🧰 Tooling & Automation
### Codex CLI
The project is tuned for the [Codex CLI](https://developers.openai.com/codex/cli/):

```bash
# Install once
npm install -g @openai/codex

# Log in with your ChatGPT or API credentials
codex login

# Explore or automate tasks
codex "explain the render pipeline"
codex exec "npm run lint"
```

For rapid iteration, consider dropping an alias into your shell profile:

```bash
alias swarm-codex='cd /path/to/Beehive && codex'
```

This lets teammates boot an AI pair quickly, ask for copy tweaks, or even wire custom CI checks around `codex exec`.

## ☁️ Deployment
1. Push to GitHub (or your chosen Git remote).
2. In Netlify (or Vercel), connect the repository.
3. Set the build command to `npm run build` and publish directory to `.next`.
4. Add the environment variables above in the hosting dashboard.

## 🤝 Contributing
1. Fork the repo.
2. Create a branch (`git checkout -b feature/my-feature`).
3. Build or document your enhancement.
4. Run linting/tests if applicable.
5. Open a PR and describe the swarm rituals you modified.

## 📜 License
MIT — free to use, remix, and share with your hive.
