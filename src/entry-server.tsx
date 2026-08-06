import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export { ROUTES, fileForRoute } from './routes';

export function render(path = '/'): string {
  return renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  );
}
