import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  CheckCircle,
  Loader2,
  Shield,
  Lock,
  ChevronRight,
  Search
} from 'lucide-react';
import clsx from 'clsx';
import { useApp, CONNECTION_STATES } from '../../context/AppContext';

const DEMO_BANKS = [
  { id: 'chase', name: 'Chase', logo: '🏦', color: '#117ACA' },
  { id: 'bofa', name: 'Bank of America', logo: '🏛️', color: '#012169' },
  { id: 'wells', name: 'Wells Fargo', logo: '🐴', color: '#D71E28' },
  { id: 'citi', name: 'Citibank', logo: '🌐', color: '#056DAE' },
  { id: 'capital', name: 'Capital One', logo: '💳', color: '#004879' },
  { id: 'usbank', name: 'US Bank', logo: '🇺🇸', color: '#0060A9' },
  { id: 'pnc', name: 'PNC Bank', logo: '🏢', color: '#FF6600' },
  { id: 'td', name: 'TD Bank', logo: '🍀', color: '#34A853' },
];

const FLOW_STEPS = {
  SELECT_BANK: 'select_bank',
  CREDENTIALS: 'credentials',
  CONNECTING: 'connecting',
  SUCCESS: 'success',
};

export function PlaidLinkModal() {
  const { isPlaidModalOpen, cancelPlaidConnection, completePlaidConnection, connectionState } = useApp();
  const [step, setStep] = useState(FLOW_STEPS.SELECT_BANK);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const filteredBanks = DEMO_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setStep(FLOW_STEPS.CREDENTIALS);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setStep(FLOW_STEPS.CONNECTING);

    // Simulate connection process
    await completePlaidConnection({
      id: selectedBank.id,
      name: selectedBank.name,
      logo: selectedBank.logo,
      lastFour: '4832',
      accountType: 'Checking & Savings',
    });

    setStep(FLOW_STEPS.SUCCESS);

    // Reset after success animation
    setTimeout(() => {
      setStep(FLOW_STEPS.SELECT_BANK);
      setSelectedBank(null);
      setCredentials({ username: '', password: '' });
    }, 1500);
  };

  const handleClose = () => {
    cancelPlaidConnection();
    setStep(FLOW_STEPS.SELECT_BANK);
    setSelectedBank(null);
    setSearchQuery('');
    setCredentials({ username: '', password: '' });
  };

  const renderStepContent = () => {
    switch (step) {
      case FLOW_STEPS.SELECT_BANK:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Search */}
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

            {/* Bank List */}
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-xl',
                    'bg-carbon-700/50 border border-carbon-600/50',
                    'hover:border-plaid-blue/50 hover:bg-carbon-700',
                    'transition-all duration-200 group'
                  )}
                >
                  <span className="text-2xl">{bank.logo}</span>
                  <span className="flex-1 text-left font-medium">{bank.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-plaid-blue transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        );

      case FLOW_STEPS.CREDENTIALS:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Bank Header */}
              <div className="flex items-center gap-4 p-4 bg-carbon-700/50 rounded-xl border border-carbon-600/50">
                <span className="text-3xl">{selectedBank?.logo}</span>
                <div>
                  <p className="font-semibold">{selectedBank?.name}</p>
                  <p className="text-sm text-gray-400">Enter your online banking credentials</p>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="flex items-start gap-3 p-3 bg-plaid-blue/10 rounded-xl border border-plaid-blue/20">
                <Shield className="w-5 h-5 text-plaid-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-plaid-blue">Demo Mode:</span> Enter any credentials
                  to simulate the connection. Real Plaid integration would securely connect to your bank.
                </p>
              </div>

              {/* Credential Fields */}
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

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(FLOW_STEPS.SELECT_BANK)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button type="submit" className="btn-plaid flex-1">
                  Connect
                </button>
              </div>
            </form>
          </motion.div>
        );

      case FLOW_STEPS.CONNECTING:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-16 h-16 rounded-full border-4 border-plaid-blue/30 border-t-plaid-blue"
            />
            <div>
              <p className="text-lg font-semibold">
                {connectionState === CONNECTION_STATES.SYNCING
                  ? 'Syncing your accounts...'
                  : 'Connecting to ' + selectedBank?.name}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {connectionState === CONNECTION_STATES.SYNCING
                  ? 'Importing your transaction history'
                  : 'This will only take a moment'}
              </p>
            </div>

            {/* Progress Steps */}
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
                        isActive ? 'bg-plaid-blue text-white' :
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

      case FLOW_STEPS.SUCCESS:
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
              <p className="text-gray-400 mt-1">Your {selectedBank?.name} account is now linked</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isPlaidModalOpen && (
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
            onClick={step !== FLOW_STEPS.CONNECTING ? handleClose : undefined}
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
                <div className="w-10 h-10 rounded-xl bg-plaid-blue flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Link Your Bank</h2>
                  <p className="text-sm text-gray-400">Powered by Plaid</p>
                </div>
              </div>
              {step !== FLOW_STEPS.CONNECTING && (
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
            {step === FLOW_STEPS.SELECT_BANK && (
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

export default PlaidLinkModal;
