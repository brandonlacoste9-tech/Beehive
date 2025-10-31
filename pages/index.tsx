import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { featuredProjects } from '../lib/repositories';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Brandon's Portfolio - Full-Stack Developer & AI Specialist</title>
        <meta 
          name="description" 
          content="Portfolio showcasing AI-powered SaaS applications, modern web development, and innovative solutions by Brandon LaCoste" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Building the Future with AI & Modern Web Tech
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Full-Stack Developer specializing in AI-powered SaaS applications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors">
                View Projects
              </Link>
              <Link href="/repositories" className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors border-2 border-white">
                Browse Repositories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
            Tech Stack & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">AI Integration</h3>
              <p className="text-gray-600 mb-4">
                Google Gemini AI, OpenAI, Anthropic Claude, Machine Learning APIs
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Gemini</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">OpenAI</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Claude</span>
              </div>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Modern Frameworks</h3>
              <p className="text-gray-600 mb-4">
                Next.js, React, TypeScript, Tailwind CSS, Node.js
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Next.js</span>
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">React</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">TypeScript</span>
              </div>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-3">SaaS & Payments</h3>
              <p className="text-gray-600 mb-4">
                Stripe, Supabase, Authentication, Database Management
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Stripe</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Supabase</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Auth</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <div key={index} className="card">
                <h3 className="text-2xl font-bold mb-3 text-blue-600">{project.name}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {project.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Live Demo
                    </a>
                  )}
                  <Link 
                    href={`/projects/${project.repo}`}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700 transition-colors text-sm font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/projects" className="btn-primary">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">18+</div>
              <div className="text-blue-100">Repositories</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Technologies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-blue-100">Major Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Passion</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Let's Build Something Amazing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Interested in collaboration or have a project in mind?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/brandonlacoste9-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View GitHub Profile
            </a>
            <a 
              href="mailto:support@adgenxai.pro"
              className="btn-secondary"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
