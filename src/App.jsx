import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/layout/Dashboard';
import { WelcomeOverlay } from './components/layout/WelcomeOverlay';
import { PlaidLinkModal } from './components/modals/PlaidLinkModal';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-carbon-900 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Dashboard */}
        <Dashboard />

        {/* Welcome Overlay (shown when disconnected) */}
        <AnimatePresence>
          <WelcomeOverlay />
        </AnimatePresence>

        {/* Plaid Link Modal */}
        <PlaidLinkModal />

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-carbon-700/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
            <p>© 2024 Antigravity Finance. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
