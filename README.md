# 🚀 Brandon's Portfolio - SaaS Portfolio Website

**Showcasing AI-powered applications and modern web development projects.**

This is a comprehensive portfolio website built with Next.js that aggregates and displays information from all repositories, featuring project showcases, technical details, and live demos.

🌐 **Portfolio Features**:
- Dynamic repository showcase from GitHub
- Featured project highlights with detailed pages
- Responsive design with Tailwind CSS
- SEO optimized with metadata
- Static site generation for fast performance

---

## ✨ Features

### 🏠 **Portfolio Homepage**
- Eye-catching hero section with gradient design
- Tech stack showcase with categorized expertise
- Featured projects with live demo links
- Statistics dashboard (18+ repositories, 10+ technologies)
- Responsive design that works on all devices

### 📂 **Repository Showcase**
- Dynamic fetching from GitHub API
- Real-time repository data display
- Search and filter functionality
- Language indicators and statistics
- Direct links to GitHub repositories

### 🎯 **Project Pages**
- Detailed project information pages
- Feature highlights and tech stack breakdowns
- Live demo and GitHub repository links
- Dynamic routing for each project
- SEO-optimized metadata

### 🎨 **Design & UX**
- Modern gradient color schemes
- Smooth transitions and hover effects
- Mobile-responsive navigation
- Accessible components
- Tailwind CSS for rapid styling

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/brandonlacoste9-tech/Beehive.git
cd Beehive
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

The static site will be generated in the `out` directory.

---

## 📖 Pages Structure

- **Homepage** (`/`) - Hero section, tech stack, featured projects, and statistics
- **Projects** (`/projects`) - Detailed showcase of all featured projects
- **Project Details** (`/projects/[slug]`) - Individual project pages with full details
- **Repositories** (`/repositories`) - Dynamic list of all GitHub repositories

---

## 🔧 Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Deployment**: Netlify (Static Export)
- **API Integration**: GitHub REST API
- **Icons**: SVG with Tailwind

---

## 📂 Project Structure

```
├── components/          # Reusable React components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── Layout.tsx      # Page layout wrapper
├── pages/              # Next.js pages
│   ├── index.tsx       # Homepage
│   ├── projects.tsx    # Projects listing
│   ├── repositories.tsx # Repositories showcase
│   ├── projects/
│   │   └── [slug].tsx  # Dynamic project pages
│   └── api/            # API routes (not used in static export)
├── lib/                # Utilities and data
│   └── repositories.ts # Repository types and featured projects
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS + custom styles
└── public/             # Static assets
```

---

## 🚢 Deployment

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Build settings are already configured in `netlify.toml`
3. Deploy with one click!

**Build Command**: `npm run build`  
**Publish Directory**: `out`

The site will automatically build and deploy on every push to the main branch.

---

## 🎨 Featured Projects

### AdGenXAI
AI-Powered Advertising Creative Platform with Google Gemini AI, Stripe payments, and Supabase authentication.

**Live Demo**: [www.adgenxai.pro](https://www.adgenxai.pro)

### Content Ops Starter
Netlify starter template with visual editing and Git Content Source integration.

### React + Vite TypeScript
Modern React application with Vite, TypeScript, and ESLint configuration.

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🆘 Support

- **GitHub**: [brandonlacoste9-tech](https://github.com/brandonlacoste9-tech)
- **Email**: support@adgenxai.pro
- **Issues**: [GitHub Issues](https://github.com/brandonlacoste9-tech/Beehive/issues)

---

**Built with ❤️ using Next.js and Tailwind CSS**

© 2025 Brandon LaCoste. All rights reserved.