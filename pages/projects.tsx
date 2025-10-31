import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { featuredProjects } from '../lib/repositories';

export default function Projects() {
  return (
    <Layout>
      <Head>
        <title>Projects - Brandon's Portfolio</title>
        <meta 
          name="description" 
          content="Explore my portfolio of AI-powered applications and modern web development projects" 
        />
      </Head>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">My Projects</h1>
          <p className="text-xl text-blue-100">
            A showcase of innovative solutions and cutting-edge technology
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-3xl font-bold text-blue-600">{project.name}</h2>
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    LIVE
                  </a>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 text-lg">{project.description}</p>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Features</h3>
                <ul className="space-y-2">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {project.highlights && project.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Highlights</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {project.highlights.map((highlight, i) => (
                      <div key={i} className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm font-medium">
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View Live Site
                  </a>
                )}
                <Link 
                  href={`/projects/${project.repo}`}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg text-center hover:bg-purple-700 transition-colors font-semibold"
                >
                  Project Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="card inline-block">
            <h3 className="text-2xl font-bold mb-4">Want to see more?</h3>
            <p className="text-gray-600 mb-6">
              Check out all my repositories on GitHub for more projects and code samples
            </p>
            <Link href="/repositories" className="btn-primary inline-block">
              Browse All Repositories
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
