import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bodoni-moda';
import '@fontsource-variable/inter';
import './styles.css';
import gsap from 'gsap';
import App from './App.jsx';

// The film keeps wall-clock time: a struggling device drops frames rather than
// playing the reveal in slow motion with the interface withheld.
gsap.ticker.lagSmoothing(0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
