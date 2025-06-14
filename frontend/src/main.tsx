import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

document.title = 'MoleMath - Calculadora Química';

const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute(
    'content', 
    'Calculadora química. Calcula masa molar, concentraciones y balancea ecuaciones químicas con explicaciones paso a paso.'
  );
} else {
  const meta = document.createElement('meta');
  meta.name = 'description';
  meta.content = 'Calculadora química. Calcula masa molar, concentraciones y balancea ecuaciones químicas con explicaciones paso a paso.';
  document.head.appendChild(meta);
}

const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('No se encontró el elemento root en el DOM');
  }

  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  
  if (import.meta.env.DEV) {
    console.error('Detalles del error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesa rechazada no manejada:', event.reason);
  
  if (import.meta.env.DEV) {
    console.error('Promise rejection details:', event);
  }
});

try {
  initializeApp();
} catch (error) {
  console.error('Error fatal al inicializar la aplicación:', error);
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f9fafb;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🧪⚠️</div>
        <h1 style="color: #1f2937; margin-bottom: 0.5rem;">Error al cargar MoleMath</h1>
        <p style="color: #6b7280; margin-bottom: 2rem;">
          No se pudo inicializar la aplicación. Por favor, recarga la página.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Recargar página
        </button>
      </div>
    `;
  }
}