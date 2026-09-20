import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RatesProvider } from './context/RatesContext';
import './styles/tokens.css';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RatesProvider>
        <App />
      </RatesProvider>
    </AuthProvider>
  </React.StrictMode>
);
