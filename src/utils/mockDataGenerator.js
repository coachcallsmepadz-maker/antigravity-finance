// Mock Data Generator for Antigravity Finance
// Generates realistic financial data for demo purposes

const MERCHANTS = {
  income: [
    { name: 'Acme Corp Payroll', category: 'Salary' },
    { name: 'Freelance Payment', category: 'Freelance' },
    { name: 'Investment Dividend', category: 'Investment' },
    { name: 'Side Project Revenue', category: 'Business' },
  ],
  subscriptions: [
    { name: 'Netflix', category: 'Entertainment', amount: 15.99, logo: '🎬' },
    { name: 'Spotify', category: 'Entertainment', amount: 9.99, logo: '🎵' },
    { name: 'Adobe Creative Cloud', category: 'Software', amount: 54.99, logo: '🎨' },
    { name: 'Amazon Prime', category: 'Shopping', amount: 14.99, logo: '📦' },
    { name: 'Gym Membership', category: 'Health', amount: 49.99, logo: '🏋️' },
    { name: 'Cloud Storage Pro', category: 'Software', amount: 9.99, logo: '☁️' },
    { name: 'News Subscription', category: 'Media', amount: 12.99, logo: '📰' },
    { name: 'VPN Service', category: 'Software', amount: 11.99, logo: '🔐' },
    { name: 'Streaming Service+', category: 'Entertainment', amount: 8.99, logo: '📺' },
    { name: 'Password Manager', category: 'Software', amount: 4.99, logo: '🔑' },
  ],
  expenses: [
    { name: 'Whole Foods Market', category: 'Groceries' },
    { name: 'Shell Gas Station', category: 'Transportation' },
    { name: 'Uber', category: 'Transportation' },
    { name: 'Starbucks', category: 'Dining' },
    { name: 'Target', category: 'Shopping' },
    { name: 'Amazon', category: 'Shopping' },
    { name: 'Chipotle', category: 'Dining' },
    { name: 'CVS Pharmacy', category: 'Health' },
    { name: 'Home Depot', category: 'Home' },
    { name: 'Electric Company', category: 'Utilities' },
    { name: 'Water Utility', category: 'Utilities' },
    { name: 'Internet Provider', category: 'Utilities' },
    { name: 'Restaurant', category: 'Dining' },
    { name: 'Coffee Shop', category: 'Dining' },
    { name: 'Clothing Store', category: 'Shopping' },
  ]
};

const CATEGORY_COLORS = {
  Salary: '#10B981',
  Freelance: '#34D399',
  Investment: '#6EE7B7',
  Business: '#059669',
  Entertainment: '#8B5CF6',
  Software: '#6366F1',
  Shopping: '#EC4899',
  Health: '#F97316',
  Media: '#EAB308',
  Groceries: '#22C55E',
  Transportation: '#3B82F6',
  Dining: '#F59E0B',
  Home: '#A855F7',
  Utilities: '#64748B',
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max));

const generateDateInPastMonths = (monthsAgo) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(randomInt(1, 28));
  return date;
};

export const generateMockTransactions = () => {
  const transactions = [];
  let idCounter = 1;

  // Generate 6 months of data
  for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - monthsAgo);

    // Monthly income (1-2 salary deposits)
    const salaryMerchant = MERCHANTS.income[0];
    transactions.push({
      id: `txn_${idCounter++}`,
      merchant: salaryMerchant.name,
      category: salaryMerchant.category,
      amount: randomBetween(4500, 6500),
      type: 'income',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString(),
    });

    // Random additional income
    if (Math.random() > 0.5) {
      const extraIncome = MERCHANTS.income[randomInt(1, MERCHANTS.income.length)];
      transactions.push({
        id: `txn_${idCounter++}`,
        merchant: extraIncome.name,
        category: extraIncome.category,
        amount: randomBetween(200, 1500),
        type: 'income',
        date: generateDateInPastMonths(monthsAgo).toISOString(),
      });
    }

    // Subscription payments
    MERCHANTS.subscriptions.forEach(sub => {
      if (Math.random() > 0.15) { // 85% chance each subscription is active
        transactions.push({
          id: `txn_${idCounter++}`,
          merchant: sub.name,
          category: sub.category,
          amount: sub.amount,
          type: 'subscription',
          logo: sub.logo,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(1, 5)).toISOString(),
          isRecurring: true,
        });
      }
    });

    // Random expenses (15-30 per month)
    const expenseCount = randomInt(15, 30);
    for (let i = 0; i < expenseCount; i++) {
      const expense = MERCHANTS.expenses[randomInt(0, MERCHANTS.expenses.length)];
      transactions.push({
        id: `txn_${idCounter++}`,
        merchant: expense.name,
        category: expense.category,
        amount: expense.category === 'Utilities' ? randomBetween(50, 200) :
                expense.category === 'Groceries' ? randomBetween(30, 200) :
                expense.category === 'Dining' ? randomBetween(10, 80) :
                expense.category === 'Transportation' ? randomBetween(20, 100) :
                randomBetween(15, 150),
        type: 'expense',
        date: generateDateInPastMonths(monthsAgo).toISOString(),
      });
    }
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return transactions;
};

export const aggregateByMonth = (transactions) => {
  const monthlyData = {};

  transactions.forEach(txn => {
    const date = new Date(txn.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        income: 0,
        outcome: 0,
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };
    }

    if (txn.type === 'income') {
      monthlyData[monthKey].income += txn.amount;
    } else {
      monthlyData[monthKey].outcome += txn.amount;
    }
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

export const aggregateByCategory = (transactions) => {
  const categoryData = {};

  transactions
    .filter(txn => txn.type !== 'income')
    .forEach(txn => {
      if (!categoryData[txn.category]) {
        categoryData[txn.category] = {
          category: txn.category,
          amount: 0,
          color: CATEGORY_COLORS[txn.category] || '#64748B',
          count: 0,
        };
      }
      categoryData[txn.category].amount += txn.amount;
      categoryData[txn.category].count += 1;
    });

  return Object.values(categoryData)
    .sort((a, b) => b.amount - a.amount);
};

export const identifySubscriptions = (transactions) => {
  const subscriptionMap = {};

  transactions
    .filter(txn => txn.type === 'subscription' || txn.isRecurring)
    .forEach(txn => {
      if (!subscriptionMap[txn.merchant]) {
        subscriptionMap[txn.merchant] = {
          merchant: txn.merchant,
          category: txn.category,
          amount: txn.amount,
          logo: txn.logo || '💳',
          occurrences: 0,
          dates: [],
        };
      }
      subscriptionMap[txn.merchant].occurrences += 1;
      subscriptionMap[txn.merchant].dates.push(txn.date);
    });

  // Calculate potential savings (subscriptions with low usage patterns)
  return Object.values(subscriptionMap)
    .map(sub => ({
      ...sub,
      monthlySpend: sub.amount,
      annualSpend: sub.amount * 12,
      potentialSavings: sub.occurrences < 4 ? sub.amount * 12 : 0,
      isZombie: sub.occurrences < 3 || (sub.category === 'Entertainment' && sub.amount > 20),
    }))
    .sort((a, b) => b.annualSpend - a.annualSpend);
};

export const generatePredictiveData = (monthlyData) => {
  if (monthlyData.length < 3) return [];

  // Calculate average trends
  const recentMonths = monthlyData.slice(-3);
  const avgIncomeGrowth = recentMonths.reduce((acc, m, i, arr) => {
    if (i === 0) return acc;
    return acc + (m.income - arr[i - 1].income) / arr[i - 1].income;
  }, 0) / (recentMonths.length - 1);

  const avgOutcomeGrowth = recentMonths.reduce((acc, m, i, arr) => {
    if (i === 0) return acc;
    return acc + (m.outcome - arr[i - 1].outcome) / arr[i - 1].outcome;
  }, 0) / (recentMonths.length - 1);

  const lastMonth = monthlyData[monthlyData.length - 1];
  const predictions = [];

  for (let i = 1; i <= 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const prevData = i === 1 ? lastMonth : predictions[i - 2];
    predictions.push({
      month: monthKey,
      income: prevData.income * (1 + Math.min(avgIncomeGrowth, 0.05)),
      outcome: prevData.outcome * (1 + Math.max(Math.min(avgOutcomeGrowth, 0.03), -0.02)),
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isPrediction: true,
    });
  }

  return predictions;
};

export const generateInsights = (transactions, monthlyData, subscriptions) => {
  const insights = [];
  const totalIncome = monthlyData.reduce((acc, m) => acc + m.income, 0);
  const totalOutcome = monthlyData.reduce((acc, m) => acc + m.outcome, 0);
  const savingsRate = ((totalIncome - totalOutcome) / totalIncome * 100).toFixed(1);

  // Savings insight
  if (savingsRate > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Savings Rate',
      message: `You're saving ${savingsRate}% of your income. This is above the recommended 20% threshold.`,
      icon: '💪',
    });
  } else if (savingsRate > 10) {
    insights.push({
      type: 'neutral',
      title: 'Moderate Savings',
      message: `Your savings rate is ${savingsRate}%. Consider small expense reductions to reach the 20% goal.`,
      icon: '📊',
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Low Savings Alert',
      message: `Your savings rate is only ${savingsRate}%. Review subscriptions and discretionary spending.`,
      icon: '⚠️',
    });
  }

  // Subscription insight
  const zombieSubscriptions = subscriptions.filter(s => s.isZombie);
  if (zombieSubscriptions.length > 0) {
    const potentialSavings = zombieSubscriptions.reduce((acc, s) => acc + s.annualSpend, 0);
    insights.push({
      type: 'suggestion',
      title: 'Subscription Optimization',
      message: `Found ${zombieSubscriptions.length} underutilized subscriptions. You could save up to $${potentialSavings.toFixed(2)}/year.`,
      icon: '🧟',
    });
  }

  // Spending trend
  if (monthlyData.length >= 2) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const spendingChange = ((lastMonth.outcome - prevMonth.outcome) / prevMonth.outcome * 100).toFixed(1);

    if (spendingChange > 10) {
      insights.push({
        type: 'warning',
        title: 'Spending Spike Detected',
        message: `Your spending increased ${spendingChange}% compared to last month. Check for unusual expenses.`,
        icon: '📈',
      });
    } else if (spendingChange < -5) {
      insights.push({
        type: 'positive',
        title: 'Spending Reduction',
        message: `Great job! You reduced spending by ${Math.abs(spendingChange)}% this month.`,
        icon: '🎯',
      });
    }
  }

  // Category insight
  const categoryData = aggregateByCategory(transactions);
  const topCategory = categoryData[0];
  if (topCategory) {
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      message: `${topCategory.category} accounts for $${topCategory.amount.toFixed(2)} of your expenses across ${topCategory.count} transactions.`,
      icon: '🏷️',
    });
  }

  return insights;
};

export { CATEGORY_COLORS };
