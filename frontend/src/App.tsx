import React, { 
  useCallback, 
  useMemo, 
  useEffect, 
  useLayoutEffect 
} from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/home/HomePage';
import MolecularMassPage from './pages/molecular-mass/MolecularMassPage';
import ConcentrationsPage from './pages/concentrations/ConcentrationsPage';
import BalanceEquationsPage from './pages/balance-equations/BalanceEquationsPage';

const ROUTE_MAP = {
  'home': '/',
  'molar-mass': '/masa-molar',
  'concentrations': '/concentraciones',
  'balance': '/balance',
  'molecular-mass': '/masa-molar',
  'balance-equations': '/balance'
} as const;

const PAGE_CONFIGS = {
  '/': {
    title: 'MoleMath - Calculadora Química',
    description: 'Calculadora química para estudiantes. Masa molar, concentraciones y balance de ecuaciones con pasos detallados.',
    pageId: 'home' as const
  },
  '/masa-molar': {
    title: 'Masa Molar | MoleMath',
    description: 'Calcula masa molar de compuestos químicos con conversiones automáticas entre gramos, moles y moléculas.',
    pageId: 'molar-mass' as const
  },
  '/concentraciones': {
    title: 'Concentraciones | MoleMath',
    description: 'Calcula molaridad, molalidad y diluciones químicas. Preparación de soluciones con explicaciones paso a paso.',
    pageId: 'concentrations' as const
  },
  '/balance': {
    title: 'Balance Ecuaciones | MoleMath',
    description: 'Balancea ecuaciones químicas automáticamente. Métodos de tanteo y algebraico con verificación de elementos.',
    pageId: 'balance' as const
  }
} as const;

function useBasicSEO(pathname: string) {
  useLayoutEffect(() => {
    const config = PAGE_CONFIGS[pathname as keyof typeof PAGE_CONFIGS] || PAGE_CONFIGS['/'];
    
    document.title = config.title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);
    
    const updateOGMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOGMeta('og:title', config.title);
    updateOGMeta('og:description', config.description);
    updateOGMeta('og:url', window.location.href);
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    
  }, [pathname]);
}

function useBasicAnalytics(pathname: string) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname,
        app_name: 'MoleMath'
      });
    }
  }, [pathname]);
}

const NotFoundPage = React.memo(function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    document.title = 'Página no encontrada | MoleMath';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl font-bold text-gray-400 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe. Explora nuestras calculadoras químicas desde MoleMath.
        </p>
        <div className="space-y-3">
          <button 
            onClick={handleGoHome}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir a MoleMath
          </button>
          <div className="text-sm text-gray-500">
            O explora:&nbsp;
            <button 
              onClick={() => navigate('/masa-molar')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Masa Molar
            </button>
            {' • '}
            <button 
              onClick={() => navigate('/concentraciones')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Concentraciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const AppContent = React.memo(function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = useMemo(() => {
    const config = PAGE_CONFIGS[location.pathname as keyof typeof PAGE_CONFIGS];
    return config?.pageId || 'home';
  }, [location.pathname]);

  const handleNavigate = useCallback((pageId: string) => {
    const route = ROUTE_MAP[pageId as keyof typeof ROUTE_MAP];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  useBasicSEO(location.pathname);
  useBasicAnalytics(location.pathname);

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <Routes>
        <Route 
          path="/" 
          element={<HomePage onNavigate={handleNavigate} />} 
        />
        
        <Route 
          path="/masa-molar" 
          element={<MolecularMassPage onNavigate={handleNavigate} />} 
        />
        
        <Route 
          path="/concentraciones" 
          element={<ConcentrationsPage onNavigate={handleNavigate} />} 
        />
        
        <Route 
          path="/balance" 
          element={<BalanceEquationsPage onNavigate={handleNavigate} />} 
        />
        
        <Route path="/molar-mass" element={<Navigate to="/masa-molar" replace />} />
        <Route path="/concentrations" element={<Navigate to="/concentraciones" replace />} />
        <Route path="/balance-equations" element={<Navigate to="/balance" replace />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
});

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MoleMath error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Error en MoleMath
            </h1>
            <p className="text-gray-600 mb-6">
              Algo salió mal. Por favor, recarga la página.
            </p>
            
            <button
              onClick={this.handleReload}
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar MoleMath
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = React.memo(function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
});

const SimpleApp = React.memo(function SimpleApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
});

export default SimpleApp;