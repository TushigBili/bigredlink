import './styles/tailwind.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/tailwind.css'; // Import tailwind styles
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')  // This should match the id in index.html
);
