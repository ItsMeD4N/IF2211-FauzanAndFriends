import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components/macro';
import { GlobalStyle } from 'styles/global-styles';
import { HomePage } from './pages/HomePage/Loadable';
import { LCAPage } from './pages/LCAPage/Loadable';
import { NotFoundPage } from './pages/NotFoundPage/Loadable';

function NavBar() {
  const location = useLocation();
  return (
    <Nav>
      <NavInner>
        <NavBrand to="/">DOM Explorer</NavBrand>
        <NavLinks>
          <NavLink to="/" active={location.pathname === '/'}>
            Traversal
          </NavLink>
          <NavLink to="/lca" active={location.pathname === '/lca'}>
            LCA
          </NavLink>
        </NavLinks>
      </NavInner>
    </Nav>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - DOM Tree Explorer"
        defaultTitle="DOM Tree Explorer"
      >
        <meta
          name="description"
          content="Visualisasi traversal pohon DOM menggunakan BFS dan DFS"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lca" element={<LCAPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <GlobalStyle />
    </BrowserRouter>
  );
}

const Nav = styled.nav`
  background: #0a0a0a;
  border-bottom: 1px solid #222;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 56px;
`;

const NavBrand = styled(Link)`
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  text-decoration: none;
  margin-right: 32px;
  letter-spacing: -0.01em;

  &:hover {
    color: #ccc;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 4px;
`;

const NavLink = styled(Link) <{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  color: ${p => (p.active ? '#fff' : '#888')};
  background: ${p => (p.active ? '#222' : 'transparent')};

  &:hover {
    background: #1a1a1a;
    color: #fff;
  }
`;
