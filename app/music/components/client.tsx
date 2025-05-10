import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import MusicPageContent from './page';

/**
 * This function creates and mounts the Music app component
 * It is designed to be imported and called only on the client side
 */
export default function mountMusicApp(container: HTMLElement) {
  // Create a React root and render the app
  const root = createRoot(container);
  root.render(createElement(MusicPageContent));
  
  return root;
}