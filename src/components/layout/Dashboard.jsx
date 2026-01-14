import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useApp, CONNECTION_STATES } from '../../context/AppContext';
import { FuturePathChart } from '../charts/FuturePathChart';
import { SpendingDonut } from '../charts/SpendingDonut';
import { GeminiInsightPanel } from '../panels/GeminiInsightPanel';
import { SubscriptionZombieCard } from '../cards/SubscriptionZombieCard';

export function Dashboard() {
  const { connectionState, isConnected } = useApp();

  const isLoading = connectionState === CONNECTION_STATES.CONNECTING ||
                    connectionState === CONNECTION_STATES.SYNCING;

  return (
    <main className="flex-1 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-emerald p-4 flex items-center justify-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-emerald-growth/30 border-t-emerald-growth rounded-full animate-spin" />
            <span className="text-emerald-growth font-medium">
              {connectionState === CONNECTION_STATES.SYNCING
                ? 'Syncing your financial data...'
                : 'Connecting to your bank...'}
            </span>
          </motion.div>
        )}

        {/* Main Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FuturePathChart />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SpendingDonut />
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GeminiInsightPanel />
          </motion.div>
        </div>

        {/* Subscription Hunter - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SubscriptionZombieCard />
        </motion.div>

        {/* Quick Stats Footer */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <QuickStat
              label="Last Updated"
              value="Just now"
              subtext="Real-time sync"
              color="emerald"
            />
            <QuickStat
              label="Accounts Linked"
              value="1"
              subtext="Bank account"
              color="blue"
            />
            <QuickStat
              label="Data Range"
              value="6 months"
              subtext="Transaction history"
              color="purple"
            />
            <QuickStat
              label="Security"
              value="Active"
              subtext="256-bit encrypted"
              color="green"
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}

function QuickStat({ label, value, subtext, color }) {
  const colorClasses = {
    emerald: 'text-emerald-growth',
    blue: 'text-plaid-blue',
    purple: 'text-purple-400',
    green: 'text-green-400',
  };

  return (
    <div className="glass-card p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={clsx('text-lg font-semibold', colorClasses[color])}>{value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  );
}

export default Dashboard;
