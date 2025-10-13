// app/get-started/page.tsx
import Link from "next/link";

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Join the Swarm</h1>
          <p className="text-xl text-gray-300">
            Welcome to the BeeHive. Your journey into creative intelligence begins here.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4"> For Creators</h2>
            <p className="text-gray-300 mb-4">
              Transform your creative process with AI-powered tools designed for content creators, 
              marketers, and visionaries.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded transition duration-300">
              Start Creating
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4"> For Developers</h2>
            <p className="text-gray-300 mb-4">
              Build with our API, contribute to the swarm, and help shape the future 
              of creative intelligence.
            </p>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-300">
              View Documentation
            </button>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
