import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  generateMockTransactions,
  aggregateByMonth,
  aggregateByCategory,
  identifySubscriptions,
  generatePredictiveData,
  generateInsights
} from '../utils/mockDataGenerator';
import {
  signInAnonymousUser,
  onAuthChange,
  saveTransactions,
  getTransactions as getFirebaseTransactions,
  isFirebaseConfigured
} from '../services/firebase';
import {
  createBasiqUser,
  getBasiqAuthLink,
  getConnections,
  getAccounts,
  getTransactions as getBasiqTransactions,
  transformBasiqTransactions,
  openBasiqConsentUI
} from '../services/basiq';

const AppContext = createContext(null);

export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  SYNCING: 'syncing',
  CONNECTED: 'connected',
};

// Check if Basiq is configured
const isBasiqConfigured = () => {
  return import.meta.env.VITE_BASIQ_ENABLED === 'true';
};

export function AppProvider({ children }) {
  // Connection state
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [linkedBank, setLinkedBank] = useState(null);

  // Basiq state
  const [basiqUserId, setBasiqUserId] = useState(() =>
    localStorage.getItem('basiq_user_id')
  );

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);

  // UI state
  const [showPredictions, setShowPredictions] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Check for existing Basiq connection on mount
  useEffect(() => {
    if (basiqUserId && isBasiqConfigured()) {
      checkExistingConnection();
    }
  }, [basiqUserId]);

  // Check if user already has bank connections
  const checkExistingConnection = async () => {
    try {
      const connections = await getConnections(basiqUserId);
      if (connections.data && connections.data.length > 0) {
        const connection = connections.data[0];
        setLinkedBank({
          id: connection.id,
          name: connection.institution?.shortName || connection.institution?.name || 'Bank',
          logo: '🏦',
          accountType: 'Connected'
        });
        setConnectionState(CONNECTION_STATES.CONNECTED);
        await fetchTransactions();
      }
    } catch (error) {
      console.warn('No existing connection found');
    }
  };

  // Fetch transactions from Basiq
  const fetchTransactions = async () => {
    if (!basiqUserId) return;

    try {
      setConnectionState(CONNECTION_STATES.SYNCING);
      const basiqData = await getBasiqTransactions(basiqUserId);
      const transformed = transformBasiqTransactions(basiqData);
      setTransactions(transformed);
      setConnectionState(CONNECTION_STATES.CONNECTED);

      // Save to Firebase if configured
      if (isFirebaseConfigured() && user) {
        await saveTransactions(user.uid, transformed);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setConnectionError('Failed to fetch transactions');
    }
  };

  // Process transactions when they change
  useEffect(() => {
    if (transactions.length > 0) {
      const monthly = aggregateByMonth(transactions);
      const categories = aggregateByCategory(transactions);
      const subs = identifySubscriptions(transactions);
      const preds = generatePredictiveData(monthly);
      const ins = generateInsights(transactions, monthly, subs);

      setMonthlyData(monthly);
      setCategoryData(categories);
      setSubscriptions(subs);
      setPredictions(preds);
      setInsights(ins);
    }
  }, [transactions]);

  // Start bank connection flow
  const startBankConnection = useCallback(() => {
    setIsBankModalOpen(true);
    setConnectionError(null);
  }, []);

  // Connect with Basiq (real integration)
  const connectWithBasiq = useCallback(async (email) => {
    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setConnectionError(null);

      // Create or get Basiq user
      let userId = basiqUserId;
      if (!userId) {
        const userResponse = await createBasiqUser(email);
        userId = userResponse.id;
        setBasiqUserId(userId);
        localStorage.setItem('basiq_user_id', userId);
      }

      // Get client token for Consent UI
      const { clientToken } = await getBasiqAuthLink(userId);

      // Open Basiq Consent UI
      openBasiqConsentUI(
        clientToken,
        async () => {
          // On popup close, check for connections
          setConnectionState(CONNECTION_STATES.SYNCING);

          // Wait a moment for Basiq to process
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check for connections
          const connections = await getConnections(userId);
          if (connections.data && connections.data.length > 0) {
            const connection = connections.data[0];
            setLinkedBank({
              id: connection.id,
              name: connection.institution?.shortName || connection.institution?.name || 'Bank',
              logo: '🏦',
              accountType: 'Connected'
            });

            // Fetch transactions
            await fetchTransactions();
            setIsBankModalOpen(false);
          } else {
            setConnectionState(CONNECTION_STATES.DISCONNECTED);
            setConnectionError('No bank connection was made. Please try again.');
          }
        },
        (error) => {
          setConnectionState(CONNECTION_STATES.DISCONNECTED);
          setConnectionError(error.message);
        }
      );
    } catch (error) {
      console.error('Basiq connection failed:', error);
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
      setConnectionError('Failed to start bank connection. Please try again.');
    }
  }, [basiqUserId]);

  // Demo mode connection (when Basiq not configured)
  const connectDemoMode = useCallback(async (bankInfo) => {
    setConnectionState(CONNECTION_STATES.CONNECTING);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setConnectionState(CONNECTION_STATES.SYNCING);
    setLinkedBank(bankInfo);

    const mockTransactions = generateMockTransactions();

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      let currentUser = user;
      if (!currentUser && isFirebaseConfigured()) {
        currentUser = await signInAnonymousUser();
        setUser(currentUser);
      }

      if (currentUser && isFirebaseConfigured()) {
        await saveTransactions(currentUser.uid, mockTransactions);
      }
    } catch (error) {
      console.warn('Firebase save failed:', error);
    }

    setTransactions(mockTransactions);
    setConnectionState(CONNECTION_STATES.CONNECTED);
    setIsBankModalOpen(false);
  }, [user]);

  const cancelBankConnection = useCallback(() => {
    setIsBankModalOpen(false);
    if (connectionState === CONNECTION_STATES.CONNECTING) {
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    }
  }, [connectionState]);

  const togglePredictions = useCallback(() => {
    setShowPredictions(prev => !prev);
  }, []);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (basiqUserId && isBasiqConfigured()) {
      await fetchTransactions();
    }
  }, [basiqUserId]);

  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;
  const useRealBanking = isBasiqConfigured();

  const value = {
    // Connection
    connectionState,
    linkedBank,
    isConnected,
    connectionError,
    useRealBanking,

    // Auth
    user,
    authLoading,
    basiqUserId,

    // Data
    transactions,
    monthlyData,
    categoryData,
    subscriptions,
    predictions,
    insights,

    // UI State
    showPredictions,
    isBankModalOpen,

    // Actions
    startBankConnection,
    connectWithBasiq,
    connectDemoMode,
    cancelBankConnection,
    togglePredictions,
    refreshTransactions,

    // Legacy aliases
    isPlaidModalOpen: isBankModalOpen,
    startPlaidConnection: startBankConnection,
    completePlaidConnection: connectDemoMode,
    cancelPlaidConnection: cancelBankConnection,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
