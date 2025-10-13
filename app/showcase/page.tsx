// app/showcase/page.tsx
import Link from "next/link";

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">The Showcase</h1>
          <p className="text-xl text-gray-300">
            Witness the power of the swarm. See what creators are building with BeeHive.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">AI Ad Campaigns</h3>
              <p className="text-gray-300 text-sm">
                Revolutionary advertising campaigns generated with advanced AI models.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Creative Videos</h3>
              <p className="text-gray-300 text-sm">
                Dynamic video content powered by intelligent automation.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Brand Experiences</h3>
              <p className="text-gray-300 text-sm">
                Immersive brand experiences that connect with audiences.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-gray-300 mb-6">
            Join thousands of creators who are already building the future with BeeHive.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 mr-4">
            Get Started Now
          </button>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
