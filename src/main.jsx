import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.scss';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';

// Rotas do app. `App` é o layout (Header + área principal) e
// renderiza a página da rota filha no <Outlet />.
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
