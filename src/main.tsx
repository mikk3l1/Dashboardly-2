import React from 'react';
import { createRoot } from 'react-dom/client';
// Side-effect import: widgets self-register here before the app renders.
import './widgets';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
