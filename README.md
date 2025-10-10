# 🐝 BeeHive: AdGenXAI

Welcome to BeeHive’s AdGenXAI—an AI-powered ad creative generator built for marketers, founders, and creators. Powered by GPT-4, styled with Tailwind CSS, and deployed with Netlify.

## ✨ Features
- Input product description or URL
- Generates headline, body copy, and image prompt
- Responsive design with custom BeeHive branding
- SEO-optimized for discoverability
- Easy deployment and scaling

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

## 🔍 Accessibility Testing

This project includes automated accessibility testing on every pull request:

- **Automated Workflows**: GitHub Actions automatically deploy PRs to Netlify and run Playwright + axe-core accessibility tests
- **WCAG Compliance**: Tests ensure WCAG 2.1 Level A & AA compliance
- **Detailed Reports**: HTML reports are generated for each test run
- **PR Comments**: Results are automatically posted to pull requests

For more information, see [docs/ACCESSIBILITY_TESTING.md](docs/ACCESSIBILITY_TESTING.md).

### Running Tests Locally

```bash
# Run accessibility tests
npm run test:a11y

# View the report
npx playwright show-report a11y-report
```

## 🧠 Contributing

We welcome pull requests! Here's how to help:

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## 🐝 Bee Philosophy

BeeHive is built on the idea that creativity should be fast, collaborative, and sweet. Like bees, we work together to pollinate ideas and build something beautiful.

## 📄 License

MIT — free to use, remix, and share.
