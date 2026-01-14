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
  getTransactions,
  isFirebaseConfigured
} from '../services/firebase';

const AppContext = createContext(null);

export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  SYNCING: 'syncing',
  CONNECTED: 'connected',
};

export function AppProvider({ children }) {
  // Connection state
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [linkedBank, setLinkedBank] = useState(null);

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
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  // Simulate Plaid connection flow
  const startPlaidConnection = useCallback(() => {
    setIsPlaidModalOpen(true);
  }, []);

  const completePlaidConnection = useCallback(async (bankInfo) => {
    setConnectionState(CONNECTION_STATES.CONNECTING);

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setConnectionState(CONNECTION_STATES.SYNCING);
    setLinkedBank(bankInfo);

    // Generate mock data
    const mockTransactions = generateMockTransactions();

    // Simulate syncing animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try to authenticate and save to Firebase
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
      console.warn('Firebase save failed, using local storage:', error);
    }

    setTransactions(mockTransactions);
    setConnectionState(CONNECTION_STATES.CONNECTED);
    setIsPlaidModalOpen(false);
  }, [user]);

  const cancelPlaidConnection = useCallback(() => {
    setIsPlaidModalOpen(false);
    if (connectionState === CONNECTION_STATES.CONNECTING) {
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    }
  }, [connectionState]);

  const togglePredictions = useCallback(() => {
    setShowPredictions(prev => !prev);
  }, []);

  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;

  const value = {
    // Connection
    connectionState,
    linkedBank,
    isConnected,

    // Auth
    user,
    authLoading,

    // Data
    transactions,
    monthlyData,
    categoryData,
    subscriptions,
    predictions,
    insights,

    // UI State
    showPredictions,
    isPlaidModalOpen,

    // Actions
    startPlaidConnection,
    completePlaidConnection,
    cancelPlaidConnection,
    togglePredictions,
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
