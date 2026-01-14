import { motion } from 'framer-motion';
import { Rocket, Link2, Shield, Sparkles, TrendingUp, Lock } from 'lucide-react';
import { useApp, CONNECTION_STATES } from '../../context/AppContext';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Future Path Analysis',
    description: 'Predictive income vs spending projections'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Gemini analyzes your spending patterns'
  },
  {
    icon: Shield,
    title: 'Subscription Hunter',
    description: 'Find and eliminate zombie subscriptions'
  },
];

export function WelcomeOverlay() {
  const { connectionState, startPlaidConnection } = useApp();

  if (connectionState !== CONNECTION_STATES.DISCONNECTED) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-900/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-growth to-emerald-600 flex items-center justify-center mb-6 shadow-emerald-glow"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-3"
        >
          <span className="text-gradient">Antigravity</span>
          <span className="text-white ml-2">Finance</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg mb-8"
        >
          Your intelligent personal wealth tracker
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 gap-4 mb-8"
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4 p-4 glass-card text-left"
              >
                <div className="p-2 rounded-xl bg-emerald-growth/20">
                  <Icon className="w-5 h-5 text-emerald-growth" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            onClick={startPlaidConnection}
            className="btn-plaid w-full max-w-xs flex items-center justify-center gap-3 text-lg py-4"
          >
            <Link2 className="w-5 h-5" />
            <span>Connect Your Bank</span>
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>256-bit encryption • Bank-level security • Powered by Plaid</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default WelcomeOverlay;
