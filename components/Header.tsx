import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Brandon's Portfolio
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
              Projects
            </Link>
            <Link href="/repositories" className="text-gray-700 hover:text-blue-600 transition-colors">
              Repositories
            </Link>
            <a 
              href="https://github.com/brandonlacoste9-tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
