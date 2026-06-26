import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
let root = (window as any).__reactRoot;
if (!root) {
  root = createRoot(container);
  (window as any).__reactRoot = root;
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
