import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, AlertCircle, DollarSign, Calendar, ChevronDown, Trash2, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';

export function SubscriptionZombieCard() {
  const { subscriptions, isConnected } = useApp();
  const [expandedSub, setExpandedSub] = useState(null);
  const [cancelledSubs, setCancelledSubs] = useState(new Set());

  const zombies = subscriptions.filter(s => s.isZombie && !cancelledSubs.has(s.merchant));
  const totalPotentialSavings = zombies.reduce((acc, s) => acc + s.annualSpend, 0);
  const activeSubs = subscriptions.filter(s => !s.isZombie && !cancelledSubs.has(s.merchant));

  const handleCancelSub = (merchant) => {
    setCancelledSubs(prev => new Set([...prev, merchant]));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={clsx('glass-card p-6', !isConnected && 'blur-overlay')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Ghost className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Subscription Hunter</h2>
            <p className="text-sm text-gray-400">Find zombie subscriptions</p>
          </div>
        </div>

        {zombies.length > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
            <span className="text-sm font-semibold text-red-400">
              {zombies.length} found
            </span>
          </div>
        )}
      </div>

      {/* Potential Savings Banner */}
      {zombies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-growth/20 to-emerald-growth/5 border border-emerald-growth/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Potential Annual Savings</p>
              <p className="text-2xl font-bold text-emerald-growth">
                {formatCurrency(totalPotentialSavings)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-growth/20">
              <DollarSign className="w-6 h-6 text-emerald-growth" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Zombie Subscriptions */}
      {zombies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Underutilized Subscriptions
          </h3>
          <div className="space-y-2">
            {zombies.map((sub, index) => {
              const isExpanded = expandedSub === sub.merchant;

              return (
                <motion.div
                  key={sub.merchant}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={clsx(
                    'rounded-xl border transition-all overflow-hidden',
                    isExpanded
                      ? 'bg-carbon-700/80 border-red-500/40'
                      : 'bg-carbon-700/50 border-carbon-600/50 hover:border-red-500/30'
                  )}
                >
                  <button
                    onClick={() => setExpandedSub(isExpanded ? null : sub.merchant)}
                    className="w-full p-4 flex items-center gap-4"
                  >
                    <span className="text-2xl">{sub.logo}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{sub.merchant}</p>
                      <p className="text-sm text-gray-400">{sub.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-400">
                        {formatCurrency(sub.monthlySpend)}/mo
                      </p>
                      <p className="text-xs text-gray-500">
                        Used {sub.occurrences}x in 6 months
                      </p>
                    </div>
                    <ChevronDown
                      className={clsx(
                        'w-5 h-5 text-gray-500 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-carbon-600/50"
                      >
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-carbon-800/50">
                              <p className="text-xs text-gray-500 mb-1">Annual Cost</p>
                              <p className="font-semibold">{formatCurrency(sub.annualSpend)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-carbon-800/50">
                              <p className="text-xs text-gray-500 mb-1">Usage Rate</p>
                              <p className="font-semibold text-red-400">
                                {((sub.occurrences / 6) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <p className="text-sm text-yellow-200">
                              Low usage detected. Consider cancelling to save {formatCurrency(sub.annualSpend)}/year.
                            </p>
                          </div>

                          <button
                            onClick={() => handleCancelSub(sub.merchant)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Mark for Cancellation
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-growth" />
          Active Subscriptions
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {activeSubs.map((sub, index) => (
            <motion.div
              key={sub.merchant}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-carbon-700/30 border border-carbon-600/30"
            >
              <span className="text-xl">{sub.logo}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{sub.merchant}</p>
                <p className="text-xs text-gray-500">{sub.category}</p>
              </div>
              <p className="text-sm font-medium text-gray-300">
                {formatCurrency(sub.monthlySpend)}/mo
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cancelled Banner */}
      {cancelledSubs.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-emerald-growth/10 border border-emerald-growth/20"
        >
          <p className="text-sm text-emerald-growth text-center">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            {cancelledSubs.size} subscription{cancelledSubs.size > 1 ? 's' : ''} marked for cancellation
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {subscriptions.length === 0 && isConnected && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-carbon-700/50 flex items-center justify-center mb-3">
            <Ghost className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No subscriptions detected</p>
          <p className="text-gray-500 text-xs mt-1">Your recurring payments will appear here</p>
        </div>
      )}
    </div>
  );
}

export default SubscriptionZombieCard;
