import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  CheckCircle,
  Shield,
  Lock,
  ChevronRight,
  Search,
  Mail,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useApp, CONNECTION_STATES } from '../../context/AppContext';

const DEMO_BANKS = [
  // Australian Banks
  { id: 'nab', name: 'NAB', logo: '🔴', color: '#C8102E' },
  { id: 'commbank', name: 'Commonwealth Bank', logo: '🟡', color: '#FFCC00' },
  { id: 'anz', name: 'ANZ', logo: '🔵', color: '#007DBA' },
  { id: 'westpac', name: 'Westpac', logo: '🔴', color: '#D5002B' },
  { id: 'macquarie', name: 'Macquarie Bank', logo: '⚫', color: '#000000' },
  { id: 'ing', name: 'ING Australia', logo: '🟠', color: '#FF6200' },
  { id: 'bendigo', name: 'Bendigo Bank', logo: '🟤', color: '#8B0000' },
  { id: 'suncorp', name: 'Suncorp', logo: '🟢', color: '#008751' },
];

const FLOW_STEPS = {
  EMAIL_ENTRY: 'email_entry',
  SELECT_BANK: 'select_bank',
  CREDENTIALS: 'credentials',
  CONNECTING: 'connecting',
  SUCCESS: 'success',
};

export function BankLinkModal() {
  const {
    isBankModalOpen,
    cancelBankConnection,
    connectWithBasiq,
    connectDemoMode,
    connectionState,
    connectionError,
    useRealBanking
  } = useApp();

  const [step, setStep] = useState(useRealBanking ? FLOW_STEPS.EMAIL_ENTRY : FLOW_STEPS.SELECT_BANK);
  const [email, setEmail] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const filteredBanks = DEMO_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Real Basiq connection
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setStep(FLOW_STEPS.CONNECTING);
      await connectWithBasiq(email);
    }
  };

  // Demo mode handlers
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setStep(FLOW_STEPS.CREDENTIALS);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setStep(FLOW_STEPS.CONNECTING);

    await connectDemoMode({
      id: selectedBank.id,
      name: selectedBank.name,
      logo: selectedBank.logo,
      lastFour: '4832',
      accountType: 'Checking & Savings',
    });

    setStep(FLOW_STEPS.SUCCESS);

    setTimeout(() => {
      resetModal();
    }, 1500);
  };

  const resetModal = () => {
    setStep(useRealBanking ? FLOW_STEPS.EMAIL_ENTRY : FLOW_STEPS.SELECT_BANK);
    setSelectedBank(null);
    setSearchQuery('');
    setCredentials({ username: '', password: '' });
    setEmail('');
  };

  const handleClose = () => {
    cancelBankConnection();
    resetModal();
  };

  const renderStepContent = () => {
    // Real Basiq flow - just need email
    if (useRealBanking && step === FLOW_STEPS.EMAIL_ENTRY) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <p className="text-gray-300">
              Enter your email to securely connect your bank account via Basiq.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass w-full pl-12"
                required
              />
            </div>

            {connectionError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{connectionError}</p>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-emerald-growth/10 rounded-xl border border-emerald-growth/20">
              <Shield className="w-5 h-5 text-emerald-growth flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-emerald-growth">Secure Connection:</span> You'll be redirected
                to your bank's secure login page. We never see your banking credentials.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Connect My Bank
            </button>
          </form>
        </motion.div>
      );
    }

    // Demo mode - bank selection
    if (step === FLOW_STEPS.SELECT_BANK) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for your bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass w-full pl-12"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {filteredBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleBankSelect(bank)}
                className={clsx(
                  'w-full flex items-center gap-4 p-4 rounded-xl',
                  'bg-carbon-700/50 border border-carbon-600/50',
                  'hover:border-emerald-growth/50 hover:bg-carbon-700',
                  'transition-all duration-200 group'
                )}
              >
                <span className="text-2xl">{bank.logo}</span>
                <span className="flex-1 text-left font-medium">{bank.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-growth transition-colors" />
              </button>
            ))}
          </div>

          {!useRealBanking && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-yellow-400">Demo Mode:</span> Real bank connection
                is not configured. Using simulated data.
              </p>
            </div>
          )}
        </motion.div>
      );
    }

    // Demo mode - credentials
    if (step === FLOW_STEPS.CREDENTIALS) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-carbon-700/50 rounded-xl border border-carbon-600/50">
              <span className="text-3xl">{selectedBank?.logo}</span>
              <div>
                <p className="font-semibold">{selectedBank?.name}</p>
                <p className="text-sm text-gray-400">Enter any credentials for demo</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="input-glass w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="input-glass w-full"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(FLOW_STEPS.SELECT_BANK)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button type="submit" className="btn-primary flex-1">
                Connect
              </button>
            </div>
          </form>
        </motion.div>
      );
    }

    // Connecting state
    if (step === FLOW_STEPS.CONNECTING || connectionState === CONNECTION_STATES.CONNECTING || connectionState === CONNECTION_STATES.SYNCING) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto w-16 h-16 rounded-full border-4 border-emerald-growth/30 border-t-emerald-growth"
          />
          <div>
            <p className="text-lg font-semibold">
              {connectionState === CONNECTION_STATES.SYNCING
                ? 'Syncing your accounts...'
                : useRealBanking
                  ? 'Waiting for bank connection...'
                  : 'Connecting to ' + selectedBank?.name}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {connectionState === CONNECTION_STATES.SYNCING
                ? 'Importing your transaction history'
                : useRealBanking
                  ? 'Complete the connection in the popup window'
                  : 'This will only take a moment'}
            </p>
          </div>

          {connectionError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{connectionError}</p>
            </div>
          )}

          <div className="flex justify-center gap-2">
            {['Connect', 'Verify', 'Sync'].map((label, i) => {
              const isActive = connectionState === CONNECTION_STATES.CONNECTING
                ? i === 0
                : connectionState === CONNECTION_STATES.SYNCING
                  ? i <= 2
                  : false;
              const isComplete = connectionState === CONNECTION_STATES.SYNCING && i < 2;

              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isComplete ? 'bg-emerald-growth text-white' :
                      isActive ? 'bg-emerald-growth/50 text-white' :
                        'bg-carbon-600 text-gray-400'
                  )}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={clsx(
                    'text-sm',
                    isActive ? 'text-white' : 'text-gray-500'
                  )}>{label}</span>
                  {i < 2 && <div className="w-8 h-0.5 bg-carbon-600" />}
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    // Success
    if (step === FLOW_STEPS.SUCCESS) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mx-auto w-20 h-20 rounded-full bg-emerald-growth/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-emerald-growth" />
          </motion.div>
          <div>
            <p className="text-xl font-semibold text-emerald-growth">Connected!</p>
            <p className="text-gray-400 mt-1">
              {selectedBank
                ? `Your ${selectedBank.name} account is now linked`
                : 'Your bank account is now linked'}
            </p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isBankModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={step !== FLOW_STEPS.CONNECTING && connectionState === CONNECTION_STATES.DISCONNECTED ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-growth flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Link Your Bank</h2>
                  <p className="text-sm text-gray-400">
                    {useRealBanking ? 'Powered by Basiq' : 'Demo Mode'}
                  </p>
                </div>
              </div>
              {connectionState === CONNECTION_STATES.DISCONNECTED && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-carbon-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Security Footer */}
            {(step === FLOW_STEPS.EMAIL_ENTRY || step === FLOW_STEPS.SELECT_BANK) && (
              <div className="mt-6 pt-4 border-t border-carbon-600/50 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>256-bit encryption • Bank-level security</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BankLinkModal;
