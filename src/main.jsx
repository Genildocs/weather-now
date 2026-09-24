import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.scss';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';

// Galeria de ícones: só em dev. Com o `lazy` + o if abaixo, o Vite
// descarta o arquivo do build de produção.
const IconsGallery = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/IconsGallery.jsx'))
  : null;

// Rotas do app. `App` é o layout (Header + área principal) e
// renderiza a página da rota filha no <Outlet />.
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      ...(IconsGallery
        ? [
            {
              path: 'dev/icons',
              element: (
                <Suspense>
                  <IconsGallery />
                </Suspense>
              ),
            },
          ]
        : []),
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
