import { motion } from 'framer-motion';
import { Rocket, Link2, Unlink, Settings, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useApp, CONNECTION_STATES } from '../../context/AppContext';

export function Header() {
  const { connectionState, linkedBank, startPlaidConnection } = useApp();

  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card border-t-0 rounded-t-none px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-emerald-growth to-emerald-600"
            >
              <Rocket className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-gradient">Antigravity</span>
                <span className="text-white ml-1">Finance</span>
              </h1>
              <p className="text-xs text-gray-500">Intelligent Wealth Tracking</p>
            </div>
          </div>

          {/* Connection Status & Actions */}
          <div className="flex items-center gap-4">
            {/* Bank Connection Status */}
            {linkedBank ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-growth/10 border border-emerald-growth/30"
              >
                <span className="text-xl">{linkedBank.logo}</span>
                <div>
                  <p className="text-sm font-medium text-emerald-growth">{linkedBank.name}</p>
                  <p className="text-xs text-gray-400">••••{linkedBank.lastFour} • {linkedBank.accountType}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-growth animate-pulse" />
              </motion.div>
            ) : (
              <button
                onClick={startPlaidConnection}
                className="btn-plaid flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                <span>Link Account</span>
              </button>
            )}

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-carbon-700 hover:bg-carbon-600 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              {isConnected && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-growth" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-xl bg-carbon-700 hover:bg-carbon-600 transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
