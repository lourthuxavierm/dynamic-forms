import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@dynamic-form-engine/react-html/styles.css';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
