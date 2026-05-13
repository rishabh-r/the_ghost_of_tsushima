import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ProjectProvider } from './context/ProjectContext';
import './styles/global.css';
import './styles/agents.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
