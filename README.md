# 🐝 BeeHive: AdGenXAI

Welcome to BeeHive’s AdGenXAI—an AI-powered ad creative generator built for marketers, founders, and creators. Powered by GPT-4, styled with Tailwind CSS, and deployed with Netlify.

## ✨ Features
- Input product description or URL
- Generates headline, body copy, and image prompt
- Responsive design with custom BeeHive branding
- SEO-optimized for discoverability
- Easy deployment and scaling
- **🆕 Automated accessibility testing with Codex Pulse** - Every PR is tested for WCAG compliance

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/brandonlacoste9-tech/Beehive.git
cd Beehive

# Install dependencies
npm install

# Add your OpenAI key
echo "OPENAI_API_KEY=your-key-here" > .env.local

# Start the dev server
npm run dev
```

## 🐝 Deployment Instructions

This project is Netlify-ready:

- Push to GitHub
- Connect your repo to Netlify
- Add `OPENAI_API_KEY` to Netlify environment variables
- Set build command: `npm run build`
- Set publish directory: `.next`
- Set functions directory: `netlify/functions` (if using Netlify-style API)

## 🧠 Contributing

We welcome pull requests! Here's how to help:

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

**Accessibility:** All pull requests are automatically tested for accessibility compliance using Codex Pulse. Please address any critical or serious violations before merging. See [docs/CODEX_PULSE.md](docs/CODEX_PULSE.md) for details.

## 🐝 Bee Philosophy

BeeHive is built on the idea that creativity should be fast, collaborative, and sweet. Like bees, we work together to pollinate ideas and build something beautiful.

## 📄 License

MIT — free to use, remix, and share.
