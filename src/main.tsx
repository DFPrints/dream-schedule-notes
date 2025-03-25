
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Load theme preference from localStorage before initial render
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply dark mode by default, or if system prefers dark, or if previously set
if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  // Default to dark if no preference is found
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}

createRoot(document.getElementById("root")!).render(<App />);
