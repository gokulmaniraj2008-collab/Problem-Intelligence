import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Problem Intelligence entrypoint: keep all product UI in App.jsx.
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
