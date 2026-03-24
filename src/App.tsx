import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import ErrorBoundary from './components/error-boundary';
import Dashboard from './pages/dashboard';
import DomainDetail from './pages/domain-detail';
import SearchPage from './pages/search';
import { StatusProvider } from './data/compute-scores';

function App() {
  return (
    <ErrorBoundary>
      <StatusProvider>
        <div className="h-screen flex flex-col bg-slate-900">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Dashboard />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/domain/:code" element={<DomainDetail />} />
              </Routes>
            </main>
          </div>
        </div>
      </StatusProvider>
    </ErrorBoundary>
  );
}

export default App;
