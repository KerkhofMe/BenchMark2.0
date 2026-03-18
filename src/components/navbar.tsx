import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">
              MS
            </div>
            <span className="text-lg font-semibold tracking-tight">
              MCSB v2 Security Dashboard
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
