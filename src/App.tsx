/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthGuard } from './components/AuthGuard';
import { BottomNav } from './components/BottomNav';
import { PageTransition } from './components/PageTransition';

import { Home } from './pages/Home';
import { History } from './pages/History';
import { Templates } from './pages/Templates';
import { Movements } from './pages/Movements';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <div className="mx-auto max-w-lg min-h-screen flex flex-col font-sans selection:bg-accent/30 selection:text-accent">
      <main className={showNav ? "flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24" : "flex-1"}>
        <PageTransition>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
            <Route path="/templates" element={<AuthGuard><Templates /></AuthGuard>} />
            <Route path="/movements" element={<AuthGuard><Movements /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          </Routes>
        </PageTransition>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

