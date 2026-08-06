import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import './styles/global.css';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Élément racine introuvable.');

// Le HTML est prérendu au build : on l'hydrate au lieu de le reconstruire.
// `createRoot` ici jetterait le balisage prérendu et rendrait tout côté
// client — le référencement fonctionnerait, mais l'affichage repartirait de
// zéro et le premier rendu coûterait deux fois.
hydrateRoot(
  container,
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>,
);
