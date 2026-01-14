// Basiq API Service
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create a new Basiq user
export async function createBasiqUser(email, mobile = null) {
  const response = await fetch(`${API_BASE}/api/basiq/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mobile })
  });

  if (!response.ok) {
    throw new Error('Failed to create Basiq user');
  }

  return response.json();
}

// Get auth link/client token for Basiq Consent UI
export async function getBasiqAuthLink(userId) {
  const response = await fetch(`${API_BASE}/api/basiq/auth-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error('Failed to get auth link');
  }

  return response.json();
}

// Get user's connected banks
export async function getConnections(userId) {
  const response = await fetch(`${API_BASE}/api/basiq/users/${userId}/connections`);

  if (!response.ok) {
    throw new Error('Failed to get connections');
  }

  return response.json();
}

// Get user's bank accounts
export async function getAccounts(userId) {
  const response = await fetch(`${API_BASE}/api/basiq/users/${userId}/accounts`);

  if (!response.ok) {
    throw new Error('Failed to get accounts');
  }

  return response.json();
}

// Get user's transactions
export async function getTransactions(userId, limit = 500) {
  const response = await fetch(
    `${API_BASE}/api/basiq/users/${userId}/transactions?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to get transactions');
  }

  return response.json();
}

// Transform Basiq transactions to our app format
export function transformBasiqTransactions(basiqData) {
  if (!basiqData?.data) return [];

  return basiqData.data.map((txn, index) => {
    const amount = Math.abs(parseFloat(txn.amount));
    const isIncome = parseFloat(txn.amount) > 0;
    const isSubscription = detectSubscription(txn.description);

    return {
      id: txn.id || `txn_${index}`,
      merchant: txn.description || 'Unknown',
      category: mapBasiqCategory(txn.class, txn.subClass),
      amount,
      type: isIncome ? 'income' : isSubscription ? 'subscription' : 'expense',
      date: txn.postDate || txn.transactionDate,
      isRecurring: isSubscription,
      raw: txn
    };
  });
}

// Detect if transaction is a subscription
function detectSubscription(description) {
  if (!description) return false;

  const subscriptionKeywords = [
    'netflix', 'spotify', 'apple', 'google', 'amazon prime',
    'disney', 'hulu', 'adobe', 'microsoft', 'dropbox',
    'gym', 'fitness', 'subscription', 'monthly', 'recurring',
    'stan', 'binge', 'kayo', 'foxtel', 'audible'
  ];

  const lowerDesc = description.toLowerCase();
  return subscriptionKeywords.some(keyword => lowerDesc.includes(keyword));
}

// Map Basiq categories to our categories
function mapBasiqCategory(classType, subClass) {
  const categoryMap = {
    'income': 'Salary',
    'transfer': 'Transfer',
    'payment': 'Payment',
    'cash-withdrawal': 'Cash',
    'bank-fee': 'Fees',
    'food-and-drink': 'Dining',
    'groceries': 'Groceries',
    'transport': 'Transportation',
    'entertainment': 'Entertainment',
    'shopping': 'Shopping',
    'health': 'Health',
    'utilities': 'Utilities',
    'housing': 'Home',
    'insurance': 'Insurance',
    'education': 'Education',
  };

  if (subClass && categoryMap[subClass.code?.toLowerCase()]) {
    return categoryMap[subClass.code.toLowerCase()];
  }

  if (classType && categoryMap[classType.code?.toLowerCase()]) {
    return categoryMap[classType.code.toLowerCase()];
  }

  return 'Other';
}

// Open Basiq Consent UI in a popup
export function openBasiqConsentUI(clientToken, onSuccess, onError) {
  const consentUrl = `https://consent.basiq.io/home?token=${clientToken}`;

  const width = 450;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    consentUrl,
    'BasiqConsent',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if (!popup) {
    onError?.(new Error('Popup blocked. Please allow popups for this site.'));
    return null;
  }

  // Poll to check when popup closes
  const pollTimer = setInterval(() => {
    if (popup.closed) {
      clearInterval(pollTimer);
      onSuccess?.();
    }
  }, 500);

  return popup;
}
