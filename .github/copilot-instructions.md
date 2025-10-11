# GitHub Copilot Instructions for BeeHive

## Project Overview
BeeHive (AdGenXAI) is an AI-powered ad creative generator built for marketers, founders, and creators. The application uses GPT-4 to generate compelling ad copy, headlines, and image prompts.

## Technology Stack
- **Framework**: Next.js 14.2.3
- **Frontend**: React 18
- **Styling**: Tailwind CSS 3.4.1
- **Build Tools**: PostCSS, Autoprefixer
- **Deployment**: Netlify
- **AI Integration**: OpenAI GPT-4 (currently removed in placeholder)

## Project Structure
- `/pages` - Next.js pages and API routes
  - `/pages/api/generateAd.js` - Ad generation API endpoint
  - `/pages/index.js` or `/pages/index.tsx` - Main application page
- `/styles` - CSS and Tailwind styles
- `/wiki` - Project documentation (GettingStarted, OpenAI, Cookbook, Gemini)
- `/docs` - Additional documentation
- `tailwind.config.js` - Tailwind configuration with BeeHive branding
- `postcss.config.js` - PostCSS configuration

## Development Workflow

### Setup
```bash
npm install
echo "OPENAI_API_KEY=your-key-here" > .env.local
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Build Process
- Build command: `npm run build`
- Output directory: `.next`
- Ensure all dependencies are installed before building

## Coding Standards

### Style Guidelines
- Use functional React components with hooks
- Follow the existing code style in the repository
- Use Tailwind CSS utility classes for styling
- Maintain the BeeHive branding theme (colors: light: #A7F3D0, default: #10B981, dark: #065F46)
- Use Inter font family for consistency

### File Naming
- Use lowercase with hyphens for directories
- Use camelCase for JavaScript/TypeScript files
- Use PascalCase for React component files

### Code Quality
- Run `npm run lint` before committing
- Ensure builds complete successfully with `npm run build`
- Keep dependencies minimal and justified
- Avoid adding unnecessary libraries

## API and Environment Variables
- OpenAI API key required: `OPENAI_API_KEY` (set in `.env.local` for development)
- For Netlify deployment, add environment variables in Netlify dashboard

## Deployment
- Platform: Netlify
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables: Add `OPENAI_API_KEY` in Netlify settings

## Documentation
- Update relevant wiki pages when making significant changes
- Key documentation:
  - `wiki/GettingStarted.md` - Setup and development guide
  - `wiki/OpenAI.md` - OpenAI integration details
  - `wiki/Cookbook.md` - Prompt examples and use cases
  - `wiki/Gemini.md` - Video strategy information
  - `README.md` - Main project documentation

## Testing
- Currently no formal test suite configured
- Manual testing recommended after changes
- Test key flows: ad generation, UI responsiveness

## Contributing Guidelines
1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Make focused, minimal changes
4. Test thoroughly (build, lint, manual testing)
5. Commit with clear, descriptive messages
6. Open a pull request with detailed description

## Common Tasks

### Adding a New Feature
1. Check existing code patterns in `/pages`
2. Follow React and Next.js best practices
3. Use Tailwind for styling
4. Update relevant documentation
5. Test in development environment

### Fixing Bugs
1. Identify the affected component/API
2. Make minimal, surgical changes
3. Verify fix doesn't break existing functionality
4. Update tests if applicable

### Updating Dependencies
- Only update when necessary
- Test thoroughly after updates
- Check for breaking changes
- Update documentation if APIs change

## Important Notes
- The OpenAI integration is currently in placeholder mode (see `pages/api/generateAd.js`)
- Maintain the "Bee Philosophy" - fast, collaborative, and sweet
- Keep the BeeHive branding consistent across all changes
- SEO optimization is important for discoverability
