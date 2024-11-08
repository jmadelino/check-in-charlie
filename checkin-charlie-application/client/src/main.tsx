import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WebSocketContextProvider } from './hooks/WebSocketContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketContextProvider>
      <App />
    </WebSocketContextProvider>
  </React.StrictMode>,
);
