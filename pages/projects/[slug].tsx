import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { featuredProjects } from '../../lib/repositories';

export default function ProjectDetails() {
  const router = useRouter();
  const { slug } = router.query;

  const project = featuredProjects.find(p => p.repo === slug);

  if (!project) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
            <Link href="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{project.name} - Brandon's Portfolio</title>
        <meta name="description" content={project.description} />
      </Head>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/projects" className="text-blue-100 hover:text-white mb-4 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-5xl font-bold mb-4">{project.name}</h1>
          {project.liveUrl && (
            <a 
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Visit Live Site →
            </a>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card mb-8">
          <h2 className="text-3xl font-bold mb-4 text-blue-600">Overview</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{project.description}</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Key Features</h2>
          <div className="space-y-4">
            {project.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <p className="text-gray-700 text-lg">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {project.highlights && project.highlights.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-600">Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.highlights.map((highlight, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="font-semibold text-gray-800">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {project.techStack.map((tech, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg text-center border-2 border-purple-200">
                <p className="font-semibold text-purple-800">{tech}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">Interested in This Project?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Check out the source code and documentation on GitHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://github.com/brandonlacoste9-tech/${project.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-50 transition-colors"
            >
              View on GitHub
            </a>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
